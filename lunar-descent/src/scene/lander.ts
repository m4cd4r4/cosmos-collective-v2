// A plain model of SpaceX's Starship HLS, after NASA's November 2024 renders
// (nasa.gov/humans-in-space/nasa-spacex-illustrate-key-moments-of-artemis-lunar-lander-mission):
// a white stainless-steel cylinder about 50 m tall and 9 m wide, a strip of crew windows at the
// foot of the nose, landing thrusters set into a thin black band high on the body, an elevator
// rail down the side, black fairings at the base with four splayed black legs, no fins and no
// heat shield. No logos or livery. The weld seams follow Starship's steel rings. Proportions
// are read off the renders; none is published as a drawing.

import * as THREE from 'three'
import { STARSHIP_HLS } from '../data/facts'

const HEIGHT = STARSHIP_HLS.height.value
const RADIUS = 4.5
const BASE = 3 // the barrel starts above the legs
const NOSE = 16 // nose length, m
const RING = 1.83 // height of one steel ring, m
const SEGMENTS = 48

export interface Lander {
  group: THREE.Group
  /** 0 to 1. Scales the exhaust plume. */
  setThrottle(throttle: number): void
}

// Faint horizontal seams, one per steel ring. A texture rather than geometry, so the lines
// mipmap away at a distance instead of shimmering.
function seamTexture(rings: number): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 64
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.fillStyle = '#ebe9e4'
  ctx.fillRect(0, 0, 4, 64)
  ctx.fillStyle = '#dcd9d2'
  ctx.fillRect(0, 0, 4, 3)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, rings)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function createLander(): Lander {
  const group = new THREE.Group()
  const barrelHeight = HEIGHT - NOSE
  const white = new THREE.MeshStandardMaterial({ color: 0xe9e7e2, metalness: 0.25, roughness: 0.55 })
  const seamed = new THREE.MeshStandardMaterial({ map: seamTexture(Math.round(barrelHeight / RING)), metalness: 0.25, roughness: 0.55 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x14161b, metalness: 0.3, roughness: 0.6 })

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS, RADIUS, barrelHeight, SEGMENTS, 1, true), seamed)
  barrel.position.y = BASE + barrelHeight / 2
  group.add(barrel)

  // Tangent ogive nose, blunted to a small rounded tip like Starship's.
  const rho = (RADIUS * RADIUS + NOSE * NOSE) / (2 * RADIUS)
  const TIP = 0.7
  const profile: THREE.Vector2[] = []
  for (let i = 0; i <= 40; i++) {
    const z = (i / 40) * NOSE
    const r = Math.sqrt(rho * rho - z * z) + RADIUS - rho
    if (r < TIP) break
    profile.push(new THREE.Vector2(r, z))
  }
  const last = profile[profile.length - 1]
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2)
    profile.push(new THREE.Vector2(last.x * Math.cos(a), last.y + last.x * Math.sin(a)))
  }
  const nose = new THREE.Mesh(new THREE.LatheGeometry(profile, SEGMENTS), white)
  nose.position.y = BASE + barrelHeight
  group.add(nose)

  // Black ring round the base, above the engines.
  const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.04, RADIUS + 0.04, 0.8, SEGMENTS, 1, true), dark)
  baseRing.position.y = BASE + 0.4
  group.add(baseRing)

  // Landing thrusters: oval ports set into a thin black band high on the body.
  const bandY = 30.5
  const band = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.03, RADIUS + 0.03, 2, SEGMENTS, 1, true), dark)
  band.position.y = bandY
  group.add(band)
  const port = new THREE.MeshStandardMaterial({ color: 0x666b74, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide })
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2 + Math.PI / 16
    const oval = new THREE.Mesh(new THREE.CircleGeometry(0.42, 16), port)
    oval.scale.y = 1.6
    oval.position.set(Math.cos(angle) * (RADIUS + 0.06), bandY, Math.sin(angle) * (RADIUS + 0.06))
    oval.lookAt(Math.cos(angle) * 10, bandY, Math.sin(angle) * 10)
    group.add(oval)
  }

  // A strip of crew windows at the foot of the nose, on the side that faces the default camera.
  const noseRadius = (z: number) => Math.sqrt(rho * rho - z * z) + RADIUS - rho
  const windowZ = 1.5
  const windowY = BASE + barrelHeight + windowZ
  const strip = new THREE.Mesh(
    new THREE.CylinderGeometry(noseRadius(windowZ + 0.6) + 0.02, noseRadius(windowZ - 0.6) + 0.02, 1.2, SEGMENTS, 1, true, Math.PI - 0.9, 1.8),
    dark,
  )
  // CylinderGeometry measures theta from +z towards +x, so pi centres the strip on -z.
  strip.position.y = windowY
  group.add(strip)
  const lit = new THREE.MeshStandardMaterial({ color: 0xf1e8d2, emissive: 0x6e6450, roughness: 0.3 })
  for (let i = 0; i < 11; i++) {
    const angle = -Math.PI / 2 + (i - 5) * 0.15
    const r = noseRadius(windowZ) + 0.05
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.1), lit)
    pane.position.set(Math.cos(angle) * r, windowY, Math.sin(angle) * r)
    pane.rotation.y = -angle + Math.PI / 2
    group.add(pane)
  }

  // Airlock panel with a floodlight above it, between the windows and the band.
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 0.1), new THREE.MeshStandardMaterial({ color: 0xd2cfc8, roughness: 0.6 }))
  hatch.position.set(0, 34.3, -(RADIUS + 0.02))
  group.add(hatch)
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.12), lit)
  lamp.position.set(0, 35.3, -(RADIUS + 0.03))
  group.add(lamp)

  // Elevator rail from below the airlock to the base.
  const railTop = bandY - 1
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.22, railTop - BASE, 0.1), new THREE.MeshStandardMaterial({ color: 0xb9b6af, roughness: 0.5 }))
  rail.position.set(-0.7, (railTop + BASE) / 2, -(RADIUS + 0.03))
  group.add(rail)

  // Four black fairings at the base, each with a splayed leg and a brace down to its pad.
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1b1e24, metalness: 0.5, roughness: 0.5 })
  const strut = (from: THREE.Vector3, to: THREE.Vector3, radius: number) => {
    const dir = to.clone().sub(from)
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), 8), legMat)
    mesh.position.copy(from).add(to).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
    group.add(mesh)
  }
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
    const out = (r: number, y: number) => new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r)
    const fairing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 7, 0.7), dark)
    fairing.position.copy(out(RADIUS + 0.15, BASE + 3.5))
    fairing.rotation.y = Math.PI / 2 - angle
    group.add(fairing)
    const foot = out(RADIUS + 3.8, 0.3)
    strut(out(RADIUS + 0.4, BASE + 1), foot, 0.22)
    strut(out(RADIUS + 0.4, BASE + 5.5), out(RADIUS + 3.4, 0.8), 0.15)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.25, 12), legMat)
    pad.position.copy(out(RADIUS + 3.8, 0.12))
    group.add(pad)
  }

  // Six engines, Starship's layout: three small bells in the middle, three large ones outside.
  for (let i = 0; i < 6; i++) {
    const outer = i >= 3
    const angle = (i / 3) * Math.PI * 2 + (outer ? Math.PI / 3 : 0)
    const ring = outer ? 3 : 1.1
    const bell = new THREE.Mesh(
      outer ? new THREE.CylinderGeometry(0.6, 1.15, 2.6, 16, 1, true) : new THREE.CylinderGeometry(0.4, 0.65, 1.6, 14, 1, true),
      dark,
    )
    bell.position.set(Math.cos(angle) * ring, outer ? 3.1 : 3.6, Math.sin(angle) * ring)
    group.add(bell)
  }

  // Exhaust in vacuum: wide, faint and short-lived. The only glow in the app. It stands for the
  // throttle as a whole; how the lander splits thrust between engines and thrusters is not published.
  const plume = new THREE.Mesh(
    new THREE.ConeGeometry(7, 60, 32, 1, true),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { strength: { value: 0 } },
      vertexShader: 'varying float vAlong; void main() { vAlong = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader:
        'uniform float strength; varying float vAlong; void main() { float a = pow(vAlong, 2.2) * strength; gl_FragColor = vec4(vec3(0.62, 0.74, 1.0) * a, a); }',
    }),
  )
  plume.position.y = -28
  group.add(plume)

  return {
    group,
    setThrottle(throttle) {
      plume.visible = throttle > 0.01
      // The plume is the player's throttle feedback, so it runs from a stub to twice the old length.
      // Length carries the throttle; the brightness has a floor so a low throttle can still be seen.
      plume.scale.set(0.5 + throttle * 0.9, 0.15 + throttle * 1.35, 0.5 + throttle * 0.9)
      plume.position.y = 2 - 30 * plume.scale.y
      ;(plume.material as THREE.ShaderMaterial).uniforms.strength.value = 0.6 + throttle * 0.6
    },
  }
}
