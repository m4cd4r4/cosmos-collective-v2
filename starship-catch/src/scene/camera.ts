// The camera director: one shot per stretch of the flight, with a hard cut between them,
// the way a launch broadcast is cut. Fixed shots stand somewhere on the site and track the
// booster; following shots ride along with it at an offset.

import * as THREE from 'three'
import { TUNING, type Flight } from '../sim/flight'
import { BOOSTER_HEIGHT } from './booster'
import { ARM_HEIGHT, TOWER_X } from './site'

export type Shot = 'pad' | 'chase' | 'staging' | 'boostback' | 'coast' | 'tower' | 'landing' | 'arms' | 'replay'

export interface Framing {
  shot: Shot
  /** True: `eye` and `look` are world positions. False: offsets from the base of the booster. */
  fixed: boolean
  eye: THREE.Vector3
  look: THREE.Vector3
  /** Vertical field of view, degrees. 0 keeps the default. */
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
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Below this height the booster is close enough to the tower to fly by eye, so the tower shot hands over. */
const TOWER_SHOT_FLOOR = 1_100

export function pickShot(flight: Flight, sceneY: number, replay: boolean): Shot {
  if (replay) return 'replay'
  switch (flight.phase) {
    case 'ascent':
      return sceneY < 900 ? 'pad' : 'chase'
    case 'staging':
      // Close in just before the ship lights, for the separation and the flip.
      return flight.phaseTime > TUNING.stagingDelay - 2 ? 'staging' : 'chase'
    case 'boostback':
      return 'boostback'
    case 'coast':
      return 'coast'
    case 'landing':
      return flight.state.y > TOWER_SHOT_FLOOR ? 'tower' : 'landing'
    default:
      if (flight.outcome === 'caught') return 'arms'
      return flight.state.y < 2_500 ? 'landing' : 'chase'
  }
}

/** Field of view that shows `half` metres either side of the middle of the frame from `distance` away. */
const fit = (half: number, distance: number, lens: Lens) => Math.min(lens.fov, Math.max(3, (2 * Math.atan(half / lens.free / distance)) / DEG))

export function frameShot(shot: Shot, flight: Flight, sceneY: number, lens: Lens, out: Framing): Framing {
  const s = flight.state
  const phone = lens.aspect < 1
  const tanV = Math.tan((lens.fov * DEG) / 2)
  out.shot = shot
  out.fixed = true
  out.fov = 0
  const centre = sceneY + BOOSTER_HEIGHT / 2

  switch (shot) {
    case 'pad': {
      // On the ground south-east of the pad, looking up as the stack clears the tower.
      out.eye.set(phone ? 110 : 150, 4, phone ? 560 : 470)
      out.look.set(0, Math.max(60, sceneY + 55), 0)
      break
    }
    case 'chase': {
      // Riding with the stack close enough to read the booster while the ground drops away below.
      out.fixed = false
      const distance = phone ? 430 - Math.min(200, sceneY * 0.5) : 300 + Math.min(160, sceneY * 0.4)
      out.look.set(0, 50, 0)
      out.eye.set(-0.22 * distance, Math.max(8 - sceneY, 24 - Math.min(0.5 * sceneY, 140)), distance)
      break
    }
    case 'staging': {
      // Side on and close: the ship lights above the booster, pulls away, and the booster flips.
      out.fixed = false
      out.look.set(0, 45, 0)
      out.eye.set(60, -30, phone ? 300 : 210)
      break
    }
    case 'boostback': {
      // Behind the engines and above, looking west past the booster to the coast far below.
      out.fixed = false
      out.look.set(-160, -80, 0)
      out.eye.set(300, 120, phone ? 360 : 260)
      break
    }
    case 'coast': {
      // Above the falling booster, looking down past it at the ground and the cloud coming up.
      out.fixed = false
      out.look.set(0, -150, 0)
      out.eye.set(160, 240, phone ? 400 : 300)
      break
    }
    case 'tower': {
      // From the beach south-east of the tower, a long lens up at the booster coming home, side on,
      // so the grid fins and the burn read against the sky instead of an end-on cross.
      out.eye.set(TOWER_X + 900, 25, 1_400)
      out.look.set(s.x, centre, 0)
      out.fov = fit(phone ? 120 : 95, out.eye.distanceTo(out.look), lens)
      break
    }
    case 'landing': {
      // Hold the booster and the tower in one frame, closing in as it comes down.
      out.fixed = false
      const near = smooth(2_600, 900, s.y)
      const left = Math.min(s.x, TUNING.towerFace - 14) - 30
      const right = Math.max(s.x, 34) + 30
      const bottom = Math.min(sceneY, 0) - 6
      const top = Math.max(sceneY + BOOSTER_HEIGHT, TUNING.towerHeight + 16) + 12
      const room = Math.max((top - bottom) / (2 * tanV), (right - left) / (2 * tanV * lens.aspect)) * 1.25
      const distance = 430 + (room - 430) * near
      out.look.set(((left + right) / 2 - s.x) * near, 35 + ((top + bottom) / 2 - sceneY - 35) * near, 0)
      // Camera low, so the tower and the booster stand tall against the sky.
      out.eye.set(out.look.x - 0.12 * distance * near + 120 * (1 - near), Math.max(6 - sceneY, out.look.y - 0.16 * distance * near + 70 * (1 - near)), distance)
      break
    }
    case 'arms': {
      // Close on the arms and the booster hanging in them, drifting slowly round.
      const drift = lens.reducedMotion ? 0 : Math.sin(lens.clock * 0.25) * 10
      out.eye.set(TUNING.towerFace + 62 + drift, ARM_HEIGHT - 20, phone ? 170 : 105)
      out.look.set(s.x, ARM_HEIGHT - 12, 0)
      break
    }
    case 'replay': {
      // A long lens from the beach: the booster and the tower in one frame, closing in as it comes down.
      out.eye.set(760, 40, 980)
      out.look.set(s.x / 2, Math.max(80, (centre + 20) / 2), 0)
      const half = Math.max(95, (sceneY + BOOSTER_HEIGHT + 30) * 0.62)
      out.fov = fit(phone ? half * 1.6 : half, out.eye.distanceTo(out.look), lens)
      break
    }
  }
  return out
}
