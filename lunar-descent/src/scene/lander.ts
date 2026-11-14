// A plain model of SpaceX's Starship HLS, after NASA's published renders: a white
// stainless-steel cylinder about 50 m tall and 9 m wide with a dark solar band below the nose,
// crew windows, landing thrusters high on the body, no fins and no heat shield. No logos or
// livery. The weld seams follow Starship's steel rings. Leg, thruster, window and engine
// details are representative; none is published as a drawing.

import * as THREE from 'three'
import { STARSHIP_HLS } from '../data/facts'

const HEIGHT = STARSHIP_HLS.height.value
const RADIUS = 4.5
const BASE = 3 // the barrel starts above the legs
const NOSE = 18 // nose length, m
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
  ctx.fillStyle = '#c9c6bf'
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
  const steel = new THREE.MeshStandardMaterial({ color: 0x8d9095, metalness: 0.8, roughness: 0.35 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x14161b, metalness: 0.3, roughness: 0.6 })
  const glass = new THREE.MeshStandardMaterial({ color: 0x0b0d12, metalness: 0.6, roughness: 0.2 })

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

  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.03, RADIUS + 0.03, 7, SEGMENTS, 1, true), steel)
  skirt.position.y = 6.5
  group.add(skirt)

  const bandY = HEIGHT - 20
  const solarBand = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.04, RADIUS + 0.04, 5, SEGMENTS, 1, true), dark)
  solarBand.position.y = bandY
  group.add(solarBand)

  // Crew windows in the lower nose, on the side that faces the default camera.
  for (let i = 0; i < 4; i++) {
    const angle = -Math.PI / 2 + (i - 1.5) * 0.17
    const windowRadius = Math.sqrt(rho * rho - 9) + RADIUS - rho - 0.06 // the nose's radius 3 m up
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.2), glass)
    pane.position.set(Math.cos(angle) * windowRadius, BASE + barrelHeight + 3, Math.sin(angle) * windowRadius)
    pane.rotation.y = -angle + Math.PI / 2
    group.add(pane)
  }
  // Airlock hatch below the solar band.
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.2), dark)
  hatch.position.set(0, bandY - 6, -(RADIUS + 0.02))
  group.add(hatch)

  // Landing thrusters: pods in a ring high on the body, below the solar band.
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8
    const pod = new THREE.Group()
    const housing = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 1.1), steel)
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.5, 10, 1, true), dark)
    nozzle.position.y = -1.3
    pod.add(housing, nozzle)
    pod.position.set(Math.cos(angle) * (RADIUS + 0.5), bandY - 4.5, Math.sin(angle) * (RADIUS + 0.5))
    group.add(pod)
  }

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 7.5, 8), steel)
    leg.position.set(Math.cos(angle) * (RADIUS + 1.2), 3.4, Math.sin(angle) * (RADIUS + 1.2))
    // Splay the foot outward, on to its pad.
    leg.rotation.z = Math.cos(angle) * 0.38
    leg.rotation.x = -Math.sin(angle) * 0.38
    group.add(leg)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.3, 12), steel)
    pad.position.set(Math.cos(angle) * (RADIUS + 2.6), 0.15, Math.sin(angle) * (RADIUS + 2.6))
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
    bell.position.set(Math.cos(angle) * ring, outer ? 2.1 : 2.6, Math.sin(angle) * ring)
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
