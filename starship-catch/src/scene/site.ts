// The launch site: the ground from open data (terrain.ts) and the models of both pads, the
// tank farm and the build site (pads.ts), all placed at their real positions relative to the
// Pad 1 tower, which is the tower the game catches on.

import * as THREE from 'three'
import { TUNING } from '../sim/flight'
import { createGround } from './ground'
import { ARM_HEIGHT, createPads, PAD1_X } from './pads'
import { loadTerrain } from './terrain'

export { ARM_HEIGHT }

export interface Site {
  group: THREE.Group
  /** 0 = arms open, 1 = closed round the booster. */
  setArms(closed: number): void
  /** The date the newest ground photograph was flown, ISO, or null. */
  flown: string | null
  /** Receives the booster's shadow on the ground. */
  shadows: THREE.Mesh
}

export const TOWER_X = PAD1_X
/** Height of the top of the launch mount, m. The booster stands on it before liftoff. */
export const MOUNT_HEIGHT = TUNING.mountHeight

export async function loadSite(): Promise<Site> {
  const group = new THREE.Group()
  const terrain = await loadTerrain()
  // Beyond the photographs: land to the west and the Gulf to the east, at sea level.
  const ground = createGround()
  ground.position.y = terrain.seaLevel - 0.6
  group.add(ground, terrain.group)
  const pads = createPads()
  group.add(pads.group)
  return { group, setArms: pads.pad1.setArms, flown: terrain.flown, shadows: terrain.shadows }
}
