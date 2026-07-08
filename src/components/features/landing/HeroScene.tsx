'use client'

/**
 * Live hero scene: Earth and Moon rendered for the current instant.
 *
 * - Earth is lit from the real sub-solar direction, so the day/night
 *   terminator tracks the actual time (city lights on the night side).
 * - The Moon is lit to the real current phase (illuminated fraction and
 *   bright-limb orientation from the true Sun-Moon geometry).
 *
 * Deliberately lightweight (two spheres over an equirectangular Milky Way
 * backdrop, ~1MB of textures) and desktop-only: mobile / reduced-motion /
 * no-WebGL keep the static poster in LandingHero. Honours
 * prefers-reduced-motion by rendering a single accurate frame with no loop.
 * The scene is built once on mount; a parent re-render must never rebuild it.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getSunDirection, getMoonIllumination } from '@/lib/celestial'

const EARTH_DAY = '/solar-system/textures/earth_daymap.jpg'
const EARTH_NIGHT = '/solar-system/textures/earth_nightmap.jpg'
const MOON_TEX = '/images/hero-moon.jpg'
const STAR_TEX = '/solar-system/textures/stars_milky_way.jpg'

const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const EARTH_FRAG = /* glsl */ `
  uniform sampler2D dayTex;
  uniform sampler2D nightTex;
  uniform vec3 sunDir;
  uniform vec3 atmColor;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
  void main() {
    vec3 n = normalize(vNormalW);
    float d = dot(n, normalize(sunDir));
    float day = smoothstep(-0.12, 0.30, d);
    vec3 dayC = toLinear(texture2D(dayTex, vUv).rgb);
    vec3 nightC = toLinear(texture2D(nightTex, vUv).rgb) * 1.6;
    vec3 base = mix(nightC, dayC, day);
    float fres = pow(1.0 - max(dot(normalize(vViewDir), n), 0.0), 3.0);
    vec3 atm = atmColor * fres * (0.35 + 0.65 * day);
    gl_FragColor = vec4(base + atm, 1.0);
  }
`

export function HeroScene({ onReady }: { onReady?: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  // Keep the latest onReady without making it an effect dependency, so a
  // parent re-render (the live UTC clock ticks every second) never tears the
  // whole WebGL scene down and rebuilds it - which read as a flicker.
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return // no WebGL - parent keeps the poster
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x0a0e1a, 1) // deep-space void, self-contained
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0.25, 8)
    camera.lookAt(0.7, 0.05, 0)
    camera.layers.enable(1)

    const now = new Date()
    const sun = getSunDirection(now)
    const sunVec = new THREE.Vector3(sun[0], sun[1], sun[2]).normalize()
    const illum = getMoonIllumination(now)

    const loader = new THREE.TextureLoader()
    const dayTex = loader.load(EARTH_DAY)
    const nightTex = loader.load(EARTH_NIGHT)
    const moonTex = loader.load(MOON_TEX, () => onReadyRef.current?.())
    ;[dayTex, nightTex].forEach((t) => (t.colorSpace = THREE.LinearSRGBColorSpace))
    moonTex.colorSpace = THREE.SRGBColorSpace

    // Rich, stable star background: an equirectangular Milky Way map behind
    // everything. Static, so it never shimmers, and far denser than the old
    // procedural points.
    const starTex = loader.load(STAR_TEX)
    starTex.colorSpace = THREE.SRGBColorSpace
    starTex.mapping = THREE.EquirectangularReflectionMapping
    scene.background = starTex

    // Earth (layer 0), lit by the real sub-solar direction
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.ShaderMaterial({
        uniforms: {
          dayTex: { value: dayTex },
          nightTex: { value: nightTex },
          sunDir: { value: sunVec },
          atmColor: { value: new THREE.Color(0x2a5a9a) },
        },
        vertexShader: EARTH_VERT,
        fragmentShader: EARTH_FRAG,
      }),
    )
    earth.position.set(-0.55, 0, 0)
    earth.rotation.z = 23.4 * (Math.PI / 180)
    earth.rotation.y = Math.PI // frame a populated hemisphere
    scene.add(earth)

    // Moon (layer 1), lit to the real current phase
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 48, 48),
      new THREE.MeshStandardMaterial({ map: moonTex, roughness: 1, metalness: 0 }),
    )
    moon.position.set(3.05, 0.5, -0.4)
    moon.layers.set(1)
    scene.add(moon)

    // Phase-accurate light for the Moon only (layer 1)
    const moonLight = new THREE.DirectionalLight(0xfff6ea, 2.4)
    moonLight.layers.set(1)
    const i = Math.acos(THREE.MathUtils.clamp(2 * illum.fraction - 1, -1, 1)) // phase angle
    const a = new THREE.Vector3().subVectors(camera.position, moon.position).normalize() // moon -> camera
    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
    const sScreen = new THREE.Vector2(sunVec.dot(camRight), sunVec.dot(camUp))
    if (sScreen.lengthSq() < 1e-6) sScreen.set(-1, 0)
    sScreen.normalize()
    const sWorld = new THREE.Vector3()
      .addScaledVector(camRight, sScreen.x)
      .addScaledVector(camUp, sScreen.y)
      .normalize()
    const subSolar = new THREE.Vector3()
      .addScaledVector(a, Math.cos(i))
      .addScaledVector(sWorld, Math.sin(i))
      .normalize()
    moonLight.position.copy(moon.position).addScaledVector(subSolar, 50)
    moonLight.target = moon
    scene.add(moonLight)

    const moonAmbient = new THREE.AmbientLight(0x222833, 0.6)
    moonAmbient.layers.set(1)
    scene.add(moonAmbient)

    let raf = 0
    const render = () => renderer.render(scene, camera)
    const animate = () => {
      earth.rotation.y += 0.0006 // gentle; terminator is sun-locked in the shader
      render()
      raf = requestAnimationFrame(animate)
    }

    const onResize = () => {
      if (!mount.clientWidth) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      if (reduced) render()
    }
    window.addEventListener('resize', onResize)

    if (reduced) { onReadyRef.current?.(); render() } else animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose?.()
        const mat = m.material as THREE.Material | THREE.Material[]
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose?.()
      })
      ;[dayTex, nightTex, moonTex, starTex].forEach((t) => t.dispose())
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
    // Build once on mount; onReady is read through onReadyRef so parent
    // re-renders (the ticking clock) don't rebuild the scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
}
