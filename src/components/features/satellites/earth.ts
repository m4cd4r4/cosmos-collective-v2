/**
 * Three looks for the satellite globe's Earth. All share one frame: radius 1,
 * texture laid out by a stock SphereGeometry, Earth never rotated (the
 * satellites and the Sun move around it instead).
 *
 *  minimal  - dark ocean, slightly lighter land, graticule, faint city lights.
 *             Keeps the satellites the loudest thing on screen.
 *  hero     - the landing page's day/night look: day map, night map, soft terminator.
 *  realism  - lit, normal-mapped, specular ocean glint, clouds, real-time sun.
 */

import * as THREE from 'three'

export type EarthMode = 'minimal' | 'hero' | 'realism'

export interface EarthHandle {
  group: THREE.Group
  setSun: (dir: [number, number, number]) => void
  update: (now: Date, camera: THREE.Camera) => void
  dispose: () => void
}

const TEX = '/solar-system/textures/'

const VERT = /* glsl */ `
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

const HERO_FRAG = /* glsl */ `
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

const MINIMAL_FRAG = /* glsl */ `
  uniform sampler2D specTex;
  uniform sampler2D nightTex;
  uniform vec3 sunDir;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vec3 n = normalize(vNormalW);
    float sea = texture2D(specTex, vUv).r;
    float land = 1.0 - smoothstep(0.35, 0.65, sea);
    vec3 ocean = vec3(0.030, 0.065, 0.130);
    vec3 ground = vec3(0.150, 0.210, 0.300);
    vec3 base = mix(ocean, ground, land);

    // Graticule every 15 degrees, a hair brighter at the equator.
    vec2 g = vUv * vec2(24.0, 12.0);
    vec2 gl = abs(fract(g - 0.5) - 0.5) / fwidth(g);
    float line = 1.0 - min(min(gl.x, gl.y), 1.0);
    float equator = 1.0 - min(abs(vUv.y - 0.5) * 12.0 / fwidth(vUv.y * 12.0), 1.0);
    base += vec3(0.10, 0.16, 0.26) * line * 0.35 + vec3(0.30, 0.25, 0.10) * equator * 0.35;

    // Soft day side so the planet has a shape; the night side keeps faint city lights.
    float d = dot(n, normalize(sunDir));
    float day = smoothstep(-0.2, 0.5, d);
    base *= 0.45 + 0.95 * day;
    vec3 lights = pow(texture2D(nightTex, vUv).rgb, vec3(2.2)) * vec3(1.0, 0.72, 0.38) * 1.4;
    base += lights * (1.0 - day) * 0.5;

    float fres = pow(1.0 - max(dot(normalize(vViewDir), n), 0.0), 3.0);
    base += vec3(0.20, 0.38, 0.70) * fres * 0.55;
    gl_FragColor = vec4(base, 1.0);
  }
`

const GLOW_FRAG = /* glsl */ `
  uniform vec3 glowColor;
  uniform float strength;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir))), 2.5);
    gl_FragColor = vec4(glowColor, f * strength);
  }
`

function glowShell(color: number, strength: number, scale = 1.14): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(scale, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(color) }, strength: { value: strength } },
      vertexShader: VERT,
      fragmentShader: GLOW_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    }),
  )
}

export function buildEarth(mode: EarthMode, loader: THREE.TextureLoader, anisotropy: number): EarthHandle {
  const group = new THREE.Group()
  const disposables: Array<{ dispose: () => void }> = []
  const tex = (file: string, srgb: boolean) => {
    const t = loader.load(TEX + file)
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
    t.anisotropy = anisotropy
    disposables.push(t)
    return t
  }
  const track = <T extends { dispose: () => void }>(o: T) => { disposables.push(o); return o }

  const sunVec = new THREE.Vector3(1, 0, 0)
  let onUpdate: (now: Date, camera: THREE.Camera) => void = () => {}
  let onSun: (v: THREE.Vector3) => void = () => {}

  const sphere = track(new THREE.SphereGeometry(1, 96, 96))

  if (mode === 'hero') {
    // Same maths as the landing hero, but sampled as plain sRGB textures converted in the shader.
    const day = tex('4k_earth_daymap.jpg', false)
    const night = tex('4k_earth_nightmap.jpg', false)
    const mat = track(
      new THREE.ShaderMaterial({
        uniforms: {
          dayTex: { value: day },
          nightTex: { value: night },
          sunDir: { value: sunVec },
          atmColor: { value: new THREE.Color(0x2a5a9a) },
        },
        vertexShader: VERT,
        fragmentShader: HERO_FRAG,
      }),
    )
    group.add(new THREE.Mesh(sphere, mat))
    const glow = glowShell(0x3a78c8, 0.5)
    group.add(glow)
    disposables.push(glow.geometry, glow.material as THREE.Material)
  } else if (mode === 'minimal') {
    const mat = track(
      new THREE.ShaderMaterial({
        uniforms: {
          specTex: { value: tex('earth_specular.jpg', false) },
          nightTex: { value: tex('4k_earth_nightmap.jpg', false) },
          sunDir: { value: sunVec },
        },
        vertexShader: VERT,
        fragmentShader: MINIMAL_FRAG,
      }),
    )
    group.add(new THREE.Mesh(sphere, mat))
    const glow = glowShell(0x2f6bd0, 0.38)
    group.add(glow)
    disposables.push(glow.geometry, glow.material as THREE.Material)
  } else {
    const day = tex('4k_earth_daymap.jpg', true)
    const night = tex('4k_earth_nightmap.jpg', true)
    const normal = tex('earth_normal.jpg', false)
    const spec = tex('earth_specular.jpg', false)
    const clouds = tex('earth_clouds.jpg', false)

    const sunUniform = { value: new THREE.Vector3(1, 0, 0) } // view space, refreshed each frame
    const mat = track(
      new THREE.MeshStandardMaterial({
        map: day,
        normalMap: normal,
        normalScale: new THREE.Vector2(0.7, 0.7),
        roughness: 0.9,
        metalness: 0,
      }),
    )
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uSpec = { value: spec }
      shader.uniforms.uNight = { value: night }
      shader.uniforms.uSunView = sunUniform
      shader.fragmentShader = shader.fragmentShader
        .replace('void main() {', 'uniform sampler2D uSpec;\nuniform sampler2D uNight;\nuniform vec3 uSunView;\nvoid main() {')
        .replace(
          '#include <roughnessmap_fragment>',
          'float roughnessFactor = mix(0.92, 0.32, texture2D(uSpec, vMapUv).r);',
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          float sunFacing = dot(normalize(vNormal), normalize(uSunView));
          float nightF = 1.0 - smoothstep(-0.10, 0.16, sunFacing);
          totalEmissiveRadiance += texture2D(uNight, vMapUv).rgb * nightF * 1.5;`,
        )
    }
    const earthMesh = new THREE.Mesh(sphere, mat)
    group.add(earthMesh)

    const cloudMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        alphaMap: clouds,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        roughness: 1,
        metalness: 0,
      }),
    )
    const cloudMesh = new THREE.Mesh(track(new THREE.SphereGeometry(1.006, 96, 96)), cloudMat)
    group.add(cloudMesh)

    const sunLight = new THREE.DirectionalLight(0xfff4e6, 3.2)
    const fill = new THREE.AmbientLight(0x1a2238, 0.55)
    group.add(sunLight, fill)
    const glow = glowShell(0x4a90e2, 0.6)
    group.add(glow)
    disposables.push(glow.geometry, glow.material as THREE.Material)

    onSun = (v) => { sunLight.position.copy(v).multiplyScalar(10) }
    onUpdate = (now, camera) => {
      sunUniform.value.copy(sunVec).transformDirection(camera.matrixWorldInverse)
      cloudMesh.rotation.y = (now.getTime() / 1000) * 0.00004 // clouds drift very slowly
    }
  }

  return {
    group,
    setSun: (d) => { sunVec.set(d[0], d[1], d[2]).normalize(); onSun(sunVec) },
    update: (now, camera) => { onUpdate(now, camera) },
    dispose: () => {
      disposables.forEach((d) => d.dispose())
      group.clear()
    },
  }
}
