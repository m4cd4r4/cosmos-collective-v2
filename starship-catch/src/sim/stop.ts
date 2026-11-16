// Physics shown to the player: how far the booster falls before the landing burn stops it,
// and how long the propellant lasts. Readouts only. They say what the engines can do at a
// throttle, never when to press.

import { ENGINES } from '../data/facts'
import { G0, step, type State } from './physics'
import { TUNING, type Flight } from './flight'

export type StopKind = 'stops' | 'no-stop-3' | 'dry'

export interface Stop {
  kind: StopKind
  /** Height lost before the sink reaches zero, m. For 'dry' and 'no-stop-3', the height lost when the run gives out. */
  distance: number
  /** The throttle the estimate runs at, after the minimum. */
  throttle: number
}

const STEP = 0.05
const LIMIT = 120

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** The throttle the engines actually run at for a command: never below `minThrottle`. */
export const runThrottle = (throttle: number) => clamp(throttle, TUNING.minThrottle, 1)

/**
 * Light the burn now (or keep it lit) at `throttle`: how far does the booster fall before it
 * stops? Runs the same vertical physics as `advance()`: the scenario's lit engines until the
 * speed drops below `downselectSpeed`, then the 3 centre engines, with spool-up, gravity and
 * the drag along the booster. It assumes the booster flies upright: a lean costs a little
 * lift (cos 15 degrees is 0.97), so a leaning booster falls slightly further than this says.
 * The sideways speed is held as it is now, for the downselect check only.
 */
export function stopDistance(flight: Flight, throttle: number): Stop {
  const thr = runThrottle(throttle)
  const s0 = flight.state
  if (flight.ranDry || s0.deltaV <= 0) return { kind: 'dry', distance: 0, throttle: thr }
  if (s0.vy >= 0) return { kind: 'stops', distance: 0, throttle: thr }

  let s: State = { ...s0, x: 0, vx: 0 }
  const vx = s0.vx
  let spool = flight.lit ? flight.spool : 0
  let downselected = flight.downselected
  const full13 = (TUNING.landingAccel13 * flight.scenario.engines.landingLit) / ENGINES.centre
  const air = { windX: 0, sideDrag: 0 }

  for (let t = 0; t < LIMIT; t += STEP) {
    spool = Math.min(1, spool + STEP / TUNING.spoolSeconds)
    if (!downselected && Math.hypot(vx, s.vy) < TUNING.downselectSpeed) downselected = true
    // On 3 engines below this throttle the thrust cannot hold the booster up: the fall never stops.
    if (downselected && thr * TUNING.landingAccel3 <= G0) return { kind: 'no-stop-3', distance: s0.y - s.y, throttle: thr }
    const accel = thr * (downselected ? TUNING.landingAccel3 : full13) * spool
    s = step(s, { accel, angleDeg: 0 }, TUNING.terminalSpeed, STEP, air)
    if (s.vy >= 0) return { kind: 'stops', distance: s0.y - s.y, throttle: thr }
    if (s.deltaV <= 0) return { kind: 'dry', distance: s0.y - s.y, throttle: thr }
  }
  return { kind: 'no-stop-3', distance: s0.y - s.y, throttle: thr }
}

/** Seconds of burn left at `throttle` on the engines that would run now. Before the burn, the engines that would light. */
export function propellantSeconds(flight: Flight, throttle: number): number {
  if (flight.ranDry) return 0
  const full = flight.downselected ? TUNING.landingAccel3 : (TUNING.landingAccel13 * flight.scenario.engines.landingLit) / ENGINES.centre
  return flight.state.deltaV / (runThrottle(throttle) * full)
}
