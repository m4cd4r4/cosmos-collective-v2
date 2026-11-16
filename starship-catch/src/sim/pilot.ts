// A simple feedback pilot, for the tests and for development screenshots. It reads the sim
// directly and is never shown to the player: the game has no cue.

import { G0 } from './physics'
import { TUNING, aboveArms, fullThrust, type Flight, type Input } from './flight'
import { ENGINES } from '../data/facts'

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const DEG = Math.PI / 180

/** Braking the pilot plans for on 13 engines and on 3, m/s2 net of gravity. */
const PLAN13 = 0.7
const PLAN3 = 3.5
/** Height above the arms at which the pilot expects to be on 3 engines. */
const HANDOVER = 260
/** The pilot comes in over a point this far east of the arms, m, clear of the tower. */
const EAST_AIM = 25

export function pilot(flight: Flight): Input {
  const t = TUNING
  const s = flight.state
  const h = aboveArms(flight)
  const fall = -s.vy

  if (!flight.lit) {
    // Grid fins: fly a sideways speed that brings the booster over a point just east of the arms,
    // the side away from the tower, before the burn.
    const tGo = Math.max(4, (h - 1_500) / Math.max(60, fall))
    const wantVx = clamp((EAST_AIM - s.x) / tGo, -80, 80)
    const steer = clamp((wantVx - s.vx) * 0.3, -1, 1)
    const full = (t.landingAccel13 * flight.scenario.engines.landingLit) / ENGINES.centre
    const net = PLAN13 * full - G0
    const stop = (fall ** 2 - t.downselectSpeed ** 2) / (2 * net)
    return { throttle: PLAN13, steer, ignite: h <= stop + HANDOVER }
  }

  // Vertical: follow a braking line down to a slow sink at the arms.
  let wantSink: number
  if (!flight.downselected) {
    const full = fullThrust(flight)
    wantSink = Math.sqrt(t.downselectSpeed ** 2 + 2 * (PLAN13 * full - G0) * Math.max(0, h - HANDOVER))
  } else {
    // Hold height until lined up: over the top of the tower when west of it, just above the arms when off centre.
    const floor = s.x < -4 ? TUNING.towerHeight + 30 - TUNING.catchHeight : Math.abs(s.x) > 2 || Math.abs(s.vx) > 1.5 ? 30 : 0
    const room = h - 4 - floor
    wantSink = room > 0 ? clamp(Math.sqrt(2 * PLAN3 * room), 2, 80) : floor > 0 ? room * 0.5 : 2
  }
  // Feed forward the braking the line asks for, while the pilot is on it.
  const onLine = flight.downselected ? wantSink > 2 : h > HANDOVER
  const ay = (fall - wantSink) * 1.6 + G0 + (onLine ? (flight.downselected ? PLAN3 : PLAN13 * fullThrust(flight) - G0) : 0)

  // Sideways: close on the arms gently, harder when far out.
  const wantVx = clamp(-s.x * 0.4, -16, 16)
  const ax = clamp((wantVx - s.vx) * 1.4, -6, 6)
  const thrust = Math.max(1, fullThrust(flight) * Math.max(t.minThrottle, Math.min(1, ay / fullThrust(flight))))
  let tilt = Math.atan2(ax, thrust) / DEG
  // Arrive upright.
  if (h < 25) tilt = clamp(tilt, -4, 4)
  const throttle = clamp(ay / Math.cos(flight.tiltDeg * DEG) / fullThrust(flight), 0, 1)
  return { throttle, steer: clamp(tilt / t.tiltMaxDeg, -1, 1), ignite: false }
}
