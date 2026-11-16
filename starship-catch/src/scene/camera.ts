// The camera: one continuous shot from the south, so east is always to the right and the
// offset reads directly. High up it rides beside the booster, looking down past it at the
// ground. On the final approach it pulls back to hold the booster and the tower in one frame.
// When the run ends it moves in close on what happened.

import * as THREE from 'three'
import { TUNING, type Flight } from '../sim/flight'
import { ARM_HEIGHT } from './site'

export interface Framing {
  eye: THREE.Vector3
  look: THREE.Vector3
  /** Vertical field of view, degrees. */
  fov: number
}

export interface Lens {
  aspect: number
  /** Default vertical field of view, degrees. */
  fov: number
  /** Share of the screen height the HUD leaves clear. */
  free: number
  clock: number
  reducedMotion: boolean
}

const DEG = Math.PI / 180
const H = TUNING.boosterHeight
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Above this height over the arms the camera rides with the booster; below `NEAR` it holds the tower too. */
const FAR = 3_600
const NEAR = 3_000

const follow = new THREE.Vector3()
const followLook = new THREE.Vector3()

/** Where the camera wants to be this frame. `sceneY` is the height of the booster's base in the scene. */
export function frameShot(flight: Flight, sceneY: number, lens: Lens, out: Framing): Framing {
  const s = flight.state
  const phone = lens.aspect < 1
  const tanV = Math.tan((lens.fov * DEG) / 2) * lens.free
  const centre = sceneY + H / 2
  out.fov = lens.fov

  if (flight.outcome) return outcomeShot(flight, sceneY, lens, out)

  // Riding beside the booster, above it, looking down past it at the ground it is falling to.
  const ride = phone ? 300 : 220
  follow.set(s.x + ride * 0.25, centre + ride * 0.3, ride)
  followLook.set(s.x, centre - ride * 0.12, 0)

  const h = s.y - TUNING.catchHeight
  const near = smooth(FAR, NEAR, h)
  if (near <= 0) {
    out.eye.copy(follow)
    out.look.copy(followLook)
    return out
  }

  // The booster and the tower in one frame, with some sky above and ground below.
  const left = Math.min(s.x - 8, TUNING.towerFace - TUNING.towerWidth - 6)
  const right = Math.max(s.x + 8, TUNING.armReach + 6)
  const bottom = -4
  const top = Math.max(sceneY + H, TUNING.towerHeight + 12) + 10
  const halfH = (top - bottom) / 2
  const halfW = (right - left) / 2
  const distance = Math.max(halfH / tanV, halfW / (tanV * lens.aspect)) * 1.18 + 40
  const midX = (left + right) / 2
  const midY = (top + bottom) / 2
  // A little east of square on, and a little low, so the tower and the booster stand against the sky.
  const eye = new THREE.Vector3(midX + distance * 0.12, Math.max(8, midY - distance * 0.06), distance)
  const look = new THREE.Vector3(midX, midY, 0)
  out.eye.copy(follow).lerp(eye, near)
  out.look.copy(followLook).lerp(look, near)
  return out
}

function outcomeShot(flight: Flight, sceneY: number, lens: Lens, out: Framing): Framing {
  const s = flight.state
  const phone = lens.aspect < 1
  const drift = lens.reducedMotion ? 0 : Math.sin(lens.clock * 0.25) * 8
  if (flight.outcome === 'caught') {
    // Close on the arms and the booster hanging in them.
    out.eye.set(TUNING.towerFace + 70 + drift, ARM_HEIGHT - 26, phone ? 190 : 120)
    out.look.set(s.x - 4, ARM_HEIGHT - 18, 0)
    return out
  }
  // Close on the wreck: low, from the south-east, with the tower in the frame when it is near.
  const nearTower = Math.abs(s.x) < 200
  const lookX = nearTower ? (s.x + TUNING.towerFace) / 2 : s.x
  const lookY = Math.max(25, Math.min(sceneY + 20, 90))
  const back = (phone ? 1.6 : 1) * (nearTower ? 230 : 130)
  out.eye.set(lookX + back * 0.35 + drift, Math.max(10, lookY * 0.6), back)
  out.look.set(lookX, lookY, 0)
  return out
}
