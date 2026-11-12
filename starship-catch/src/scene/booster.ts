// Plain models of the Super Heavy booster and the ship it carries until hot staging.
// Realistic proportions from published heights; no logos or livery. Grid fins, chines,
// engine bells and flaps are representative shapes.

import * as THREE from 'three'
import { ENGINES, VEHICLE } from '../data/facts'

const RADIUS = VEHICLE.diameter.value / 2
export const BOOSTER_HEIGHT = VEHICLE.boosterHeight.value
const SHIP_HEIGHT = VEHICLE.shipHeight.value

export interface Plume {
  group: THREE.Group
  /** `level` 0 to 1 is the throttle, `engines` how many are lit, `thin` 0 to 1 how thin the air is. */
  set(level: number, engines: number, thin: number, clock: number): void
}

/** Exhaust: a warm sheath round a white core. Drawn solid, not additive: the sky behind it is bright. */
function createPlume(): Plume {
  const cone = (colour: THREE.Color, power: number) =>
    new THREE.Mesh(
      new THREE.ConeGeometry(1, 1, 32, 1, true),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { strength: { value: 0 }, colour: { value: colour } },
        vertexShader: 'varying float vAlong; void main() { vAlong = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform float strength; uniform vec3 colour; varying float vAlong; void main() { float a = pow(1.0 - vAlong, ${power.toFixed(1)}) * strength; gl_FragColor = vec4(colour, min(1.0, a)); }`,
      }),
    )
  const sheath = cone(new THREE.Color(1.0, 0.62, 0.42), 1.6)
  const core = cone(new THREE.Color(1.0, 0.95, 0.9), 2.4)
  const group = new THREE.Group()
  group.add(sheath, core)
  // Wide and bright at the engines, tapering to a point below.
  sheath.rotation.x = core.rotation.x = Math.PI
  return {
    group,
    set(level, engines, thin, clock) {
      group.visible = level > 0.01 && engines > 0
      if (!group.visible) return
      const share = Math.sqrt(engines / ENGINES.liftoff)
      const flicker = 1 + Math.sin(clock * 53) * 0.04 + Math.sin(clock * 31) * 0.03
      // In thin air the exhaust spreads wide and faint; at sea level it is a tight bright column.
      const width = RADIUS * (0.55 + 0.75 * share) * (1 + thin * 2.5)
      const length = (40 + 150 * share) * (0.35 + 0.65 * level) * flicker
      sheath.scale.set(width, length, width)
      sheath.position.y = -length / 2
      core.scale.set(width * 0.45, length * 0.55, width * 0.45)
      core.position.y = (-length * 0.55) / 2
      const strength = (0.55 + 0.6 * level) * (1 - thin * 0.55)
      ;(sheath.material as THREE.ShaderMaterial).uniforms.strength.value = strength
      ;(core.material as THREE.ShaderMaterial).uniforms.strength.value = strength * 1.3
    },
  }
}

export interface Vehicle {
  group: THREE.Group
  plume: Plume
}

const steel = () => new THREE.MeshStandardMaterial({ color: 0xc6c9ce, metalness: 0.85, roughness: 0.32 })
const dark = () => new THREE.MeshStandardMaterial({ color: 0x17191e, metalness: 0.4, roughness: 0.6 })

/** Origin at the centre of the base, nose along +y. */
export function createBooster(): Vehicle {
  const group = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS, RADIUS, BOOSTER_HEIGHT, 48), steel())
  body.position.y = BOOSTER_HEIGHT / 2
  group.add(body)

  // Weld lines every ring, so the height reads.
  for (let y = 6; y < BOOSTER_HEIGHT - 4; y += 5.6) {
    const seam = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.02, RADIUS + 0.02, 0.12, 48, 1, true), dark())
    seam.position.y = y
    group.add(seam)
  }

  // Hot-staging ring: the vented band the ship's engines fire through.
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.05, RADIUS + 0.05, 1.8, 48, 1, true), dark())
  ring.position.y = BOOSTER_HEIGHT - 0.9
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.05, RADIUS + 0.05, 3, 48, 1, true), dark())
  skirt.position.y = 1.5
  group.add(ring, skirt)

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
    const fin = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.5, 4.2), dark())
    fin.position.set(Math.cos(angle) * (RADIUS + 3), BOOSTER_HEIGHT - 5, Math.sin(angle) * (RADIUS + 3))
    fin.rotation.y = -angle
    const chine = new THREE.Mesh(new THREE.BoxGeometry(0.9, 16, 1.6), steel())
    chine.position.set(Math.cos(angle) * (RADIUS + 0.4), 11, Math.sin(angle) * (RADIUS + 0.4))
    chine.rotation.y = -angle
    group.add(fin, chine)
  }

  // The 13 centre engines: 3 in the middle, 10 round them.
  const bell = new THREE.CylinderGeometry(0.45, 0.65, 1.4, 12, 1, true)
  const bells = new THREE.InstancedMesh(bell, dark(), ENGINES.centre)
  const at = new THREE.Object3D()
  for (let i = 0; i < ENGINES.centre; i++) {
    const inner = i < ENGINES.inner
    const angle = inner ? (i / ENGINES.inner) * Math.PI * 2 : ((i - ENGINES.inner) / (ENGINES.centre - ENGINES.inner)) * Math.PI * 2
    const radius = inner ? 0.9 : 2.6
    at.position.set(Math.cos(angle) * radius, -0.5, Math.sin(angle) * radius)
    at.updateMatrix()
    bells.setMatrixAt(i, at.matrix)
  }
  group.add(bells)

  const plume = createPlume()
  group.add(plume.group)
  return { group, plume }
}

/** The ship: drawn only from liftoff until it flies on after hot staging. Origin at its base. */
export function createShip(): Vehicle {
  const group = new THREE.Group()
  const barrel = SHIP_HEIGHT - 16
  const profile: THREE.Vector2[] = [new THREE.Vector2(RADIUS, 0), new THREE.Vector2(RADIUS, barrel)]
  for (let i = 1; i <= 16; i++) {
    const t = i / 16
    profile.push(new THREE.Vector2(RADIUS * Math.cos((t * Math.PI) / 2) ** 0.8, barrel + 16 * Math.sin((t * Math.PI) / 2)))
  }
  group.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 48), steel()))
  // Heat shield: dark tiles over the half that faces the air on the way back.
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.04, RADIUS + 0.04, barrel, 32, 1, true, 0, Math.PI), dark())
  shield.position.y = barrel / 2
  group.add(shield)
  for (const [y, length] of [
    [7, 9],
    [barrel + 5, 6],
  ]) {
    for (const side of [-1, 1]) {
      const flap = new THREE.Mesh(new THREE.BoxGeometry(0.5, length, 4), dark())
      flap.position.set(0, y, side * (RADIUS + 1.6))
      group.add(flap)
    }
  }
  const plume = createPlume()
  group.add(plume.group)
  return { group, plume }
}
