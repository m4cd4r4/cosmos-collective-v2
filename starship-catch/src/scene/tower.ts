// A launch and catch tower: a square steel lattice with heavy corner columns, the carriage
// that rides up its face, and the two catch arms ("chopsticks") hinged on the carriage.
//
// Sources for the numbers:
// - Height 146 m: the FAA's 2021 approval of the 146 m (479 ft) Starbase launch tower, as
//   reported on Wikipedia's SpaceX Starbase page; Guinness lists the same height.
// - Width 12 m: the game's tower (TUNING.towerWidth). The 2024 NAIP photograph puts the
//   lattice at 12 to 15 m across, so the game's figure is within what the imagery shows.
// - Pad 1 arms 40 m from the tower face (TUNING.towerFace to TUNING.armReach), Pad 2 arms about
//   10 m shorter (Space Explored, "The key differences between Starship's Pad A and B", July 2025).
// - Section and bracing pattern, carriage and crown: drawn from public photographs. SpaceX
//   publishes no drawings, so these are representative, not measured.
//
// Local frame: origin at the centre of the tower's base, the arms on the +x face.

import * as THREE from 'three'
import { block, materials, member, merge, mesh } from './kit'

export interface TowerOptions {
  height: number
  width: number
  /** Height of the top of the catch rails, m. */
  armHeight: number
  armLength: number
  /** Half the gap between the arms when closed, m, centre to centre. */
  armHalfGap: number
}

export interface Tower {
  group: THREE.Group
  /** 0 = arms open, 1 = closed. */
  setArms(closed: number): void
}

/** Height of one stacked section, and how many bays of bracing each holds. */
const SECTION = 16
const BAYS_PER_SECTION = 2
const LEG = 1.6
const GIRDER = 0.7
const BRACE = 0.42

function lattice(width: number, height: number): THREE.BufferGeometry {
  const h = width / 2
  const parts: THREE.BufferGeometry[] = []
  const corners: [number, number][] = [
    [h, h],
    [-h, h],
    [-h, -h],
    [h, -h],
  ]
  // Corner columns.
  for (const [x, z] of corners) parts.push(member([x, 0, z], [x, height, z], LEG))
  const bay = SECTION / BAYS_PER_SECTION
  const levels = Math.round(height / bay)
  for (let i = 0; i <= levels; i++) {
    const y = Math.min(height, i * bay)
    const heavy = i % BAYS_PER_SECTION === 0
    for (let c = 0; c < 4; c++) {
      const [x0, z0] = corners[c]
      const [x1, z1] = corners[(c + 1) % 4]
      parts.push(member([x0, y, z0], [x1, y, z1], heavy ? GIRDER * 1.4 : GIRDER))
    }
    if (i === levels) break
    const y1 = Math.min(height, (i + 1) * bay)
    // X bracing on each face.
    for (let c = 0; c < 4; c++) {
      const [x0, z0] = corners[c]
      const [x1, z1] = corners[(c + 1) % 4]
      parts.push(member([x0, y, z0], [x1, y1, z1], BRACE))
      parts.push(member([x1, y, z1], [x0, y1, z0], BRACE))
    }
    // A plan brace every section keeps the square square.
    if (heavy && i > 0) parts.push(member([h, y, h], [-h, y, -h], BRACE))
  }
  return merge(parts)
}

/** The far view: four solid faces with the same outline, so the tower stays a tower and does not shimmer. */
function solid(width: number, height: number): THREE.BufferGeometry {
  return merge([block([0, height / 2, 0], [width * 0.92, height, width * 0.92]), block([0, height + 1.5, 0], [width + 1, 3, width + 1])])
}

function crown(width: number, height: number): THREE.BufferGeometry {
  const h = width / 2
  const parts = [
    // Deck and the frame that carries the arm hoist sheaves.
    block([0, height + 1, 0], [width + 1.6, 2, width + 1.6]),
    block([h - 1.2, height + 5, 0], [2.4, 8, width * 0.7]),
    member([h - 1.2, height + 9, -h], [h - 1.2, height + 9, h], 1.2),
    // Lightning mast.
    member([0, height + 2, 0], [0, height + 17, 0], 0.5),
  ]
  return merge(parts)
}

/** One arm: a deep truss from the hinge out along +x, with a bright catch rail on top of its inner edge. */
function arm(length: number, inward: number): { truss: THREE.BufferGeometry; rail: THREE.BufferGeometry } {
  const parts: THREE.BufferGeometry[] = []
  const depthAt = (x: number) => 5.2 - 2.2 * (x / length)
  const w = 2.4
  // Two top chords and one bottom chord: a triangular section, deeper at the root.
  for (const z of [-w / 2, w / 2]) parts.push(member([0, 0, z], [length, 0, z], 0.8))
  parts.push(member([0, -depthAt(0), 0], [length, -depthAt(length), 0], 0.9))
  const panels = 8
  for (let i = 0; i <= panels; i++) {
    const x = (i / panels) * length
    const d = depthAt(x)
    for (const z of [-w / 2, w / 2]) parts.push(member([x, 0, z], [x, -d, 0], 0.45))
    parts.push(member([x, 0, -w / 2], [x, 0, w / 2], 0.4))
    if (i < panels) {
      const x1 = ((i + 1) / panels) * length
      for (const z of [-w / 2, w / 2]) parts.push(member([x, -d, 0], [x1, 0, z], 0.3))
    }
  }
  // Root block where the arm meets its hinge.
  parts.push(block([1.5, -2.2, 0], [3, 4.6, 3]))
  const rail = merge([block([length / 2 + 2, 0.55, inward * (w / 2 - 0.3)], [length - 4, 0.5, 0.9])])
  return { truss: merge(parts), rail }
}

export function createTower(options: TowerOptions): Tower {
  const { height, width, armHeight, armLength, armHalfGap } = options
  const group = new THREE.Group()

  const lod = new THREE.LOD()
  const near = new THREE.Group()
  near.add(mesh(lattice(width, height), materials.tower), mesh(crown(width, height), materials.tower))
  // Inside the lattice: the lift shaft and the cable runs, which darken the core seen from afar.
  near.add(mesh(block([-1.5, height / 2, -1.5], [3.2, height, 3.2]), materials.arms))
  const far = new THREE.Group()
  far.add(mesh(solid(width, height), materials.towerFar))
  lod.addLevel(near, 0)
  lod.addLevel(far, 1_800)
  group.add(lod)

  // The carriage: a frame round the tower that the arms hang from. It rides on the corner columns.
  const h = width / 2
  const carriageTop = armHeight + 1.5
  const carriageBottom = armHeight - 11
  const ring: THREE.BufferGeometry[] = []
  for (const y of [carriageBottom, armHeight - 4, carriageTop]) {
    ring.push(member([h + 1.4, y, -h - 1.4], [h + 1.4, y, h + 1.4], 1.3))
    ring.push(member([-h - 1.4, y, -h - 1.4], [-h - 1.4, y, h + 1.4], 0.9))
    for (const z of [-h - 1.4, h + 1.4]) ring.push(member([-h - 1.4, y, z], [h + 1.4, y, z], 0.9))
  }
  for (const [x, z] of [
    [h + 1.4, h + 1.4],
    [h + 1.4, -h - 1.4],
    [-h - 1.4, h + 1.4],
    [-h - 1.4, -h - 1.4],
  ])
    ring.push(member([x, carriageBottom, z], [x, carriageTop, z], 1.1))
  group.add(mesh(merge(ring), materials.arms))

  const arms = [-1, 1].map((side) => {
    const hinge = new THREE.Group()
    hinge.position.set(h + 2, armHeight - 0.8, side * armHalfGap)
    const { truss, rail } = arm(armLength - 2, -side)
    hinge.add(new THREE.Mesh(truss, materials.arms), new THREE.Mesh(rail, materials.stainless))
    group.add(hinge)
    return { hinge, side }
  })
  const setArms = (closed: number) => {
    for (const { hinge, side } of arms) hinge.rotation.y = -side * (1 - closed) * 0.42
  }
  setArms(0)

  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = false
  })
  return { group, setArms }
}
