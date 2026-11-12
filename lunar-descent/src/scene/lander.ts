// A plain model of SpaceX's Starship HLS, after NASA's published renders: a white
// stainless-steel cylinder about 50 m tall with a dark solar band near the nose, no fins
// and no heat shield. No logos or livery. Leg and engine details are representative;
// neither is published.

import * as THREE from 'three'
import { STARSHIP_HLS } from '../data/facts'

const HEIGHT = STARSHIP_HLS.height.value
const RADIUS = 4.5

export interface Lander {
  group: THREE.Group
  /** 0 to 1. Scales the exhaust plume. */
  setThrottle(throttle: number): void
}

export function createLander(): Lander {
  const group = new THREE.Group()
  const white = new THREE.MeshStandardMaterial({ color: 0xe9e7e2, metalness: 0.25, roughness: 0.55 })
  const steel = new THREE.MeshStandardMaterial({ color: 0x8d9095, metalness: 0.8, roughness: 0.35 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x14161b, metalness: 0.3, roughness: 0.6 })

  // Body profile, base to nose tip: a straight barrel, then an ogive nose.
  const profile: THREE.Vector2[] = [new THREE.Vector2(RADIUS, 0), new THREE.Vector2(RADIUS, HEIGHT - 17)]
  for (let i = 1; i <= 16; i++) {
    const t = i / 16
    profile.push(new THREE.Vector2(RADIUS * Math.cos((t * Math.PI) / 2) ** 0.8, HEIGHT - 17 + 17 * Math.sin((t * Math.PI) / 2)))
  }
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), white)
  body.position.y = 3
  group.add(body)

  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.03, RADIUS + 0.03, 7, 48, 1, true), steel)
  skirt.position.y = 6.5
  group.add(skirt)

  const solarBand = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.04, RADIUS + 0.04, 5, 48, 1, true), dark)
  solarBand.position.y = HEIGHT - 20
  group.add(solarBand)

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 7.5, 8), steel)
    leg.position.set(Math.cos(angle) * (RADIUS + 1.2), 3.4, Math.sin(angle) * (RADIUS + 1.2))
    leg.rotation.z = -Math.cos(angle) * 0.38
    leg.rotation.x = Math.sin(angle) * 0.38
    group.add(leg)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.3, 12), steel)
    pad.position.set(Math.cos(angle) * (RADIUS + 2.6), 0.15, Math.sin(angle) * (RADIUS + 2.6))
    group.add(pad)
  }

  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.3, 2.4, 16, 1, true), dark)
    bell.position.set(Math.cos(angle) * 1.9, 2.2, Math.sin(angle) * 1.9)
    group.add(bell)
  }

  // Exhaust in vacuum: wide, faint and short-lived. The only glow in the app.
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
      plume.scale.set(0.6 + throttle * 0.6, 0.35 + throttle * 0.65, 0.6 + throttle * 0.6)
      plume.position.y = 2 - 30 * plume.scale.y
      ;(plume.material as THREE.ShaderMaterial).uniforms.strength.value = 0.25 + throttle * 0.5
    },
  }
}
