// Both launch pads at Starbase, the tank farm beside Pad 1, and the build site up the road.
//
// Positions are in metres east and north of the centre of the Pad 1 tower base, read off the
// USDA NAIP photograph flown on 14 October 2024 (see scripts/bake-site.py), to within a few
// metres. Sizes come from the same photograph unless a comment cites a published figure.
// Heights of the buildings come from their shadows in that photograph, scaled by the 146 m
// Pad 1 tower's shadow (228 m long, so the Sun stood about 33 degrees up).
//
// One knowing departure: the game catches the booster 15 m east of the Pad 1 tower's centre,
// where the sim puts the launch mount. In the photograph the mount stands about 30 m east of it.

import * as THREE from 'three'
import { TUNING } from '../sim/flight'
import { block, drum, horizontalTank, materials, member, merge, mesh } from './kit'
import { createTower, type Tower } from './tower'

/** Where the Pad 1 tower's centre sits in the game's frame: x east of the catch point. */
export const PAD1_X = TUNING.towerFace - TUNING.towerWidth / 2

/** Game frame from metres east and north of the Pad 1 tower. */
export const at = (east: number, north: number, y = 0): [number, number, number] => [PAD1_X + east, y, -north]

/** Height of the top of the catch rails above the pad, m. The arms meet the booster just below its grid fins. */
export const ARM_HEIGHT = TUNING.catchHeight + 62
/** Shadow length to height, from the Pad 1 tower: 146 m tall, 228 m of shadow. */
const SHADOW_TO_HEIGHT = 146 / 228

export interface Pads {
  group: THREE.Group
  pad1: Tower
}

/** Pad 1's launch mount: a ring table on six legs over a water-cooled steel deflector. Under the catch point. */
function pad1Mount(): THREE.Group {
  const group = new THREE.Group()
  const top = TUNING.mountHeight
  const outer = TUNING.mountRadius
  const inner = TUNING.boosterRadius + 0.6
  const parts: THREE.BufferGeometry[] = []
  // The table: a deep ring girder. Wikipedia (SpaceX Starbase) gives its mass as 370 t.
  const ring = new THREE.CylinderGeometry(outer, outer, 4, 40, 1, true)
  ring.translate(0, top - 2, 0)
  parts.push(ring)
  const deck = new THREE.RingGeometry(inner, outer, 40, 1)
  deck.rotateX(-Math.PI / 2)
  deck.translate(0, top, 0)
  parts.push(deck)
  const bore = new THREE.CylinderGeometry(inner, inner, 4, 40, 1, true)
  bore.translate(0, top - 2, 0)
  parts.push(bore)
  // Six legs (NASASpaceflight, "Major elements of Starship Orbital Launch Pad in place", 2021).
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6
    parts.push(member([Math.cos(angle) * (outer - 0.6), 0, Math.sin(angle) * (outer - 0.6)], [Math.cos(angle) * (outer - 1.4), top - 3.5, Math.sin(angle) * (outer - 1.4)], 2.4))
  }
  // Hold-down clamps round the bore.
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2
    const clamp = new THREE.BoxGeometry(1.2, 1.4, 0.8)
    clamp.rotateY(-angle)
    clamp.translate(Math.cos(angle) * (inner + 0.9), top + 0.7, Math.sin(angle) * (inner + 0.9))
    parts.push(clamp)
  }
  group.add(mesh(merge(parts), materials.pipe))
  // The booster quick-disconnect: a hooded box on the tower side of the table.
  group.add(mesh(block([-outer + 1.6, top + 2.6, 0], [3.4, 5.2, 5]), materials.tower))
  // The deflector plate under the bore, and the scorched pad round it.
  group.add(mesh(drum([0, 0, 0], inner + 2, 1.6, 32), materials.scorched))
  return group
}

/** Pad 2's mount: a ring table on a concrete base over a flame trench, with no tall legs. */
function pad2Mount(): THREE.Group {
  const group = new THREE.Group()
  const top = 14
  const outer = 9
  const inner = 5
  // The trench: an open concrete channel running out from under the table. 2024 photograph: about 30 m by 28 m.
  const walls: THREE.BufferGeometry[] = []
  const length = 30
  const width = 14
  for (const side of [-1, 1]) walls.push(block([length / 2 - 4, 1, side * (width / 2 + 1)], [length, 2, 2]))
  walls.push(block([length - 4, 1, 0], [2, 2, width + 4]))
  group.add(mesh(merge(walls), materials.concrete))
  group.add(mesh(block([length / 2 - 4, 0.05, 0], [length, 0.1, width]), materials.shadow))
  // The base the table stands on, either side of the trench mouth.
  const base: THREE.BufferGeometry[] = []
  for (const side of [-1, 1]) base.push(block([0, (top - 3) / 2, side * (outer - 2)], [outer * 2, top - 3, 4]))
  base.push(block([-(outer - 2), (top - 3) / 2, 0], [4, top - 3, outer * 2]))
  group.add(mesh(merge(base), materials.concrete))
  const ring = new THREE.CylinderGeometry(outer, outer, 3, 40, 1, true)
  ring.translate(0, top - 1.5, 0)
  const deck = new THREE.RingGeometry(inner, outer, 40, 1)
  deck.rotateX(-Math.PI / 2)
  deck.translate(0, top, 0)
  group.add(mesh(merge([ring, deck]), materials.pipe))
  return group
}

/** The Pad 1 tank farm: a row of large horizontal tanks lying north to south, with pipe racks along the road side. */
function tankFarm(): THREE.Group {
  const group = new THREE.Group()
  const tanks: THREE.BufferGeometry[] = []
  const add = (east: number, south: number, length: number, radius: number) => {
    const t = horizontalTank([0, 0, 0], radius, length)
    t.rotateY(Math.PI / 2)
    const [x, , z] = at(east, south + length / 2, radius + 1.6)
    t.translate(x, radius + 1.6, z)
    tanks.push(t)
  }
  // Fifteen tanks about 6.4 m across and 50 m long, their south ends stepping north to the west.
  for (let i = 0; i < 15; i++) {
    const east = -96 + i * 6.8
    add(east, 93 - (east + 96) * 0.16, 50, 3.2)
  }
  // Two longer, stouter tanks at the east end.
  add(16, 80, 44, 3.6)
  add(23.5, 80, 44, 3.6)
  // Shorter horizontal tanks south-east of the row and west of the tower.
  for (let i = 0; i < 4; i++) add(56 + i * 8, 62, 13, 2.6)
  for (let i = 0; i < 6; i++) add(-78 + i * 7.5, -12, 20, 2.3)
  group.add(mesh(merge(tanks), materials.white))

  // Saddles under the big row, and the racks: three pipes on bents, along the north side and the tank ends.
  const steel: THREE.BufferGeometry[] = []
  const rack = (e0: number, n0: number, e1: number, n1: number, height: number) => {
    const [x0, , z0] = at(e0, n0)
    const [x1, , z1] = at(e1, n1)
    const length = Math.hypot(x1 - x0, z1 - z0)
    const bents = Math.max(2, Math.round(length / 8))
    const nx = -(z1 - z0) / length
    const nz = (x1 - x0) / length
    for (let i = 0; i <= bents; i++) {
      const t = i / bents
      const x = x0 + (x1 - x0) * t
      const z = z0 + (z1 - z0) * t
      for (const s of [-1.5, 1.5]) steel.push(member([x + nx * s, 0, z + nz * s], [x + nx * s, height, z + nz * s], 0.4))
      steel.push(member([x - nx * 1.7, height, z - nz * 1.7], [x + nx * 1.7, height, z + nz * 1.7], 0.4))
    }
    for (const s of [-1, 0, 1]) steel.push(member([x0 + nx * s, height + 0.6, z0 + nz * s], [x1 + nx * s, height + 0.6, z1 + nz * s], 0.7))
  }
  rack(-100, 152, 95, 113, 6)
  rack(-100, 90, 30, 74, 4)
  rack(28, 74, 28, 10, 4)
  group.add(mesh(merge(steel), materials.pipe))

  // Pumps and vaporisers east of the row: low plant blocks.
  const plant: THREE.BufferGeometry[] = []
  for (const [e, n, w, d, h] of [
    [36, 112, 10, 22, 5],
    [48, 100, 8, 10, 7],
    [72, 118, 9, 16, 6],
  ]) {
    const [x, , z] = at(e, n)
    plant.push(block([x, h / 2, z], [w, h, d]))
  }
  group.add(mesh(merge(plant), materials.tower))
  return group
}

/**
 * The build site, 3.3 km west: the two Mega Bays where boosters and ships are stacked, beside the
 * Starfactory. Footprints and positions from the 2024 photograph; heights from their shadows.
 */
function buildSite(): THREE.LOD {
  const near = new THREE.Group()
  const far = new THREE.Group()
  const walls: THREE.BufferGeometry[] = []
  const simple: THREE.BufferGeometry[] = []
  for (const b of BUILDINGS) {
    const height = b.shadow * SHADOW_TO_HEIGHT
    const [x, , z] = at(b.east, b.north)
    const g = block([0, height / 2, 0], [b.long, height, b.wide])
    g.rotateY(b.turn)
    g.translate(x, 0, z)
    walls.push(g)
    simple.push(g.clone())
  }
  near.add(mesh(merge(walls), materials.white))
  far.add(mesh(merge(simple), materials.white))
  const lod = new THREE.LOD()
  lod.addLevel(near, 0)
  lod.addLevel(far, 6_000)
  return lod
}

interface Building {
  name: string
  east: number
  north: number
  /** Length and width of the footprint, m, and its turn from east, radians. */
  long: number
  wide: number
  turn: number
  /** Length of its shadow in the photograph, m. */
  shadow: number
}

/**
 * Measured on the photograph at the build site, 3.3 km west-south-west of Pad 1, to within about
 * 15 m: the buildings lean in the photograph, so their bases come from where their shadows start.
 * Both Mega Bays cast shadows about 120 m long, so about 77 m tall; a forum figure of 81 m
 * (266 ft) agrees, but SpaceX publishes none. The Starfactory's shadow is about 30 m.
 */
export const BUILDINGS: Building[] = [
  { name: 'Mega Bay 1', east: -3395, north: -1015, long: 60, wide: 50, turn: Math.PI / 4, shadow: 120 },
  { name: 'Mega Bay 2', east: -3360, north: -1100, long: 60, wide: 50, turn: Math.PI / 4, shadow: 120 },
  { name: 'Starfactory', east: -3230, north: -1010, long: 300, wide: 110, turn: Math.PI / 4, shadow: 30 },
]

export function createPads(): Pads {
  const group = new THREE.Group()

  const pad1 = createTower({
    height: TUNING.towerHeight,
    width: TUNING.towerWidth,
    armHeight: ARM_HEIGHT,
    armLength: TUNING.armReach - TUNING.towerFace,
    armHalfGap: TUNING.boosterRadius + 1.4,
  })
  pad1.group.position.set(...at(0, 0))
  group.add(pad1.group)

  const mount1 = pad1Mount()
  mount1.position.set(0, 0, 0)
  group.add(mount1)

  // Pad 2: tower base centre and the trench, from the photograph. The arms face the mount.
  const tower2At = at(-345, 106)
  const mount2At = at(-364, 82)
  const pad2 = createTower({
    height: TUNING.towerHeight,
    width: TUNING.towerWidth,
    armHeight: ARM_HEIGHT,
    armLength: TUNING.armReach - TUNING.towerFace - 10,
    armHalfGap: TUNING.boosterRadius + 1.4,
  })
  pad2.group.position.set(...tower2At)
  const facing = Math.atan2(-(mount2At[2] - tower2At[2]), mount2At[0] - tower2At[0])
  pad2.group.rotation.y = facing
  group.add(pad2.group)
  const mount2 = pad2Mount()
  mount2.position.set(...mount2At)
  mount2.rotation.y = facing
  group.add(mount2)

  group.add(tankFarm())
  if (BUILDINGS.length) group.add(buildSite())
  return { group, pad1 }
}
