// The final approach: the booster falls from about 10 km and the player flies it into the
// catch arms by hand. Pure logic, no rendering. Every constant in TUNING is game tuning,
// not a mission figure: SpaceX publishes engine counts, not speeds, heights or limits.

import { ENGINES } from '../data/facts'
import { dynamicPressure, step, type State } from './physics'
import type { Scenario } from './scenario'

export type Outcome = 'caught' | 'hard-catch' | 'tower-strike' | 'ground' | 'sea' | 'no-propellant' | 'no-burn'

export const TUNING = {
  /** Drag along the booster: the speed at which it equals weight at sea level, m/s. */
  terminalSpeed: 230,
  /** Side drag: how hard the wind and sideways motion push on the long side of the booster. */
  sideDrag: 0.0025,
  /** Grid fins: the most sideways acceleration they give, m/s2, and the dynamic pressure that gives it, Pa. */
  finAccel: 6,
  finFullQ: 9_000,
  /** How far the booster can lean with the engines lit, and falling unlit, degrees, and how fast it turns, degrees a second. */
  tiltMaxDeg: 15,
  tiltUnlitDeg: 4,
  tiltRate: 16,
  /** Landing burn thrust acceleration on all 13 engines, then on the 3 centre engines, m/s2. */
  landingAccel13: 70,
  landingAccel3: 20,
  minThrottle: 0.4,
  /** Seconds for the engines to come up to thrust once lit. */
  spoolSeconds: 0.8,
  /** The burn drops to the 3 centre engines below this speed, m/s. */
  downselectSpeed: 50,
  /** Propellant at the start, as the change in speed it can deliver, m/s. */
  propellant: 650,
  /** Wind is this many times stronger at and above `windHigh` m than at the ground. */
  windAloft: 2.2,
  windHigh: 6_000,
  /** Height of the booster's base when its catch points meet the arms, m. */
  catchHeight: 46,
  /** The booster must be this close to the centre of the arms, m, and this slow and upright. */
  catchHalfGap: 3,
  catchSideSpeed: 2.5,
  catchSinkSpeed: 6,
  catchTiltDeg: 6,
  /** The tower's east face, m from the catch point; its width and height, m; the arms reach this far east. */
  towerFace: -9,
  towerWidth: 12,
  towerHeight: 146,
  armReach: 31,
  /** The launch mount beside the tower: radius and height, m. */
  mountRadius: 9,
  mountHeight: 18,
  boosterRadius: 4.5,
  boosterHeight: 71,
  /** The shoreline is about this far east of the tower, m. */
  shoreline: 400,
  /** A run that has not ended by now has burned its propellant hovering, s. */
  maxSeconds: 400,
}

export interface Input {
  /** Commanded throttle, 0 to 1. While lit, the engines run between `minThrottle` and full. */
  throttle: number
  /** -1 to 1. Positive pushes east: leans the engines and sets the grid fins. */
  steer: number
  /** Light the landing burn now. It lights once and cannot be shut down. */
  ignite: boolean
}

export interface Flight {
  state: State
  scenario: Scenario
  /** Lean from vertical, degrees. Positive leans the thrust east. */
  tiltDeg: number
  lit: boolean
  litAt: number | null
  /** 0 to 1 while the engines come up to thrust. */
  spool: number
  downselected: boolean
  /** Engines running now. */
  engines: number
  /** Thrust acceleration applied on the last step, m/s2, and the throttle it ran at. For the plume and the HUD. */
  thrustAccel: number
  throttle: number
  /** Grid fin acceleration on the last step, m/s2. */
  finAccel: number
  /** Wind at the booster on the last step, m/s towards the east. */
  windX: number
  /** The propellant ran out with the engines lit. */
  ranDry: boolean
  ranDryAt: number | null
  outcome: Outcome | null
  /** Why the run ended, in a short plain line. */
  reason: string
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smooth = (t: number) => {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

export function startFlight(scenario: Scenario): Flight {
  return {
    state: { x: scenario.x, y: scenario.y, vx: scenario.vx, vy: scenario.vy, deltaV: TUNING.propellant, time: 0 },
    scenario,
    tiltDeg: 0,
    lit: false,
    litAt: null,
    spool: 0,
    downselected: false,
    engines: 0,
    thrustAccel: 0,
    throttle: 0,
    finAccel: 0,
    windX: windAt(scenario, scenario.y, 0),
    ranDry: false,
    ranDryAt: null,
    outcome: null,
    reason: '',
  }
}

/** Wind at height `y` and time `t`, m/s towards the east: stronger aloft, with gusts. */
export function windAt(scenario: Scenario, y: number, t: number): number {
  const aloft = 1 + (TUNING.windAloft - 1) * smooth(y / TUNING.windHigh)
  let gust = 0
  for (const g of scenario.gusts) gust += g.amp * Math.sin(2 * Math.PI * g.freq * t + g.phase)
  return (scenario.wind + Math.sign(scenario.wind) * gust) * aloft
}

/** Full thrust acceleration with the engines lit now, m/s2. */
export function fullThrust(flight: Flight): number {
  return flight.downselected ? TUNING.landingAccel3 : (TUNING.landingAccel13 * flight.scenario.engines.landingLit) / ENGINES.centre
}

/** Height of the booster's base above the arms, m. Negative once it is below them. */
export const aboveArms = (flight: Flight) => flight.state.y - TUNING.catchHeight

const fmt1 = (v: number) => v.toFixed(1)

function end(flight: Flight, outcome: Outcome, reason: string): Flight {
  if (flight.ranDry && outcome !== 'caught') {
    outcome = 'no-propellant'
    reason = `The tanks ran dry ${Math.round(Math.max(0, (flight.ranDryAt ?? 0)))} m up, and the booster fell. ${reason}`
  }
  flight.outcome = outcome
  flight.reason = reason
  flight.thrustAccel = 0
  return flight
}

/** Advance the flight one fixed timestep. Mutates and returns `flight`. */
export function advance(flight: Flight, input: Input, dt: number): Flight {
  if (flight.outcome) return flight
  const t = TUNING
  const s = flight.state

  // The booster turns towards the commanded lean at a limited rate.
  const want = clamp(input.steer, -1, 1) * (flight.lit ? t.tiltMaxDeg : t.tiltUnlitDeg)
  const turn = t.tiltRate * dt
  flight.tiltDeg += clamp(want - flight.tiltDeg, -turn, turn)

  if (input.ignite && !flight.lit && s.deltaV > 0) {
    flight.lit = true
    flight.litAt = s.y
  }
  let accel = 0
  if (flight.lit && !flight.ranDry) {
    flight.spool = Math.min(1, flight.spool + dt / t.spoolSeconds)
    if (!flight.downselected && Math.hypot(s.vx, s.vy) < t.downselectSpeed) flight.downselected = true
    flight.engines = flight.downselected ? ENGINES.inner : flight.scenario.engines.landingLit
    flight.throttle = clamp(input.throttle, t.minThrottle, 1)
    accel = flight.throttle * fullThrust(flight) * flight.spool
  } else {
    flight.engines = 0
    flight.throttle = 0
  }

  // Grid fins need air: full authority only above `finFullQ`. They steer the way the booster leans.
  const authority = clamp(dynamicPressure(s) / t.finFullQ, 0, 1)
  flight.finAccel = clamp(input.steer, -1, 1) * t.finAccel * authority
  flight.windX = windAt(flight.scenario, s.y, s.time)

  const before = s
  const next = step(s, { accel, angleDeg: flight.tiltDeg, finAccel: flight.finAccel }, t.terminalSpeed, dt, { windX: flight.windX, sideDrag: t.sideDrag })
  flight.state = next
  flight.thrustAccel = accel
  if (flight.lit && !flight.ranDry && next.deltaV <= 0) {
    flight.ranDry = true
    flight.ranDryAt = next.y
    flight.engines = 0
  }

  // The tower: a column west of the catch point. The booster's side meets its east face.
  const r = t.boosterRadius
  if (next.x - r < t.towerFace && next.x + r > t.towerFace - t.towerWidth && next.y < t.towerHeight) {
    const side = next.x < t.towerFace - t.towerWidth / 2 ? 'came in from the west, below the top of the tower,' : `drifted ${fmt1(Math.abs(next.x))} m west of the arms`
    return end(flight, 'tower-strike', `It ${side} and struck the tower.`)
  }

  // The catch points reach the arms.
  if (before.y > t.catchHeight && next.y <= t.catchHeight) {
    const off = Math.abs(next.x)
    if (off <= t.catchHalfGap) {
      const sink = -next.vy
      const faults: string[] = []
      if (sink > t.catchSinkSpeed) faults.push(`sinking at ${fmt1(sink)} m/s (the game limit is ${t.catchSinkSpeed})`)
      if (Math.abs(next.vx) > t.catchSideSpeed) faults.push(`sliding sideways at ${fmt1(Math.abs(next.vx))} m/s (limit ${t.catchSideSpeed})`)
      if (Math.abs(flight.tiltDeg) > t.catchTiltDeg) faults.push(`leaning ${fmt1(Math.abs(flight.tiltDeg))}° (limit ${t.catchTiltDeg}°)`)
      if (!flight.lit) faults.push('with no landing burn')
      if (!faults.length) return end(flight, 'caught', `It reached the arms ${fmt1(off)} m from centre, sinking at ${fmt1(sink)} m/s.`)
      return end(flight, 'hard-catch', `It reached the arms ${faults.join(', ')}.`)
    }
    if (next.x > t.towerFace && next.x < t.armReach) {
      return end(flight, 'tower-strike', `It came down ${fmt1(off)} m ${next.x > 0 ? 'east' : 'west'} of centre and hit the arms. The gap is ${t.catchHalfGap} m either way.`)
    }
  }

  // The launch mount beside the tower, then the ground and the sea.
  const onMount = Math.abs(next.x) < t.mountRadius + r && next.y <= t.mountHeight
  if (onMount || next.y <= 0) {
    flight.state = { ...next, y: onMount ? t.mountHeight : 0 }
    const speed = Math.hypot(next.vx, next.vy)
    if (next.x > t.shoreline) return end(flight, 'sea', `It came down ${distance(next.x)} east of the tower, in the Gulf, at ${Math.round(speed)} m/s.`)
    if (!flight.lit) return end(flight, 'no-burn', `The landing burn was never lit. It hit the ground at ${Math.round(speed)} m/s.`)
    const where = onMount ? 'on the launch mount' : `${distance(Math.abs(next.x))} ${next.x >= 0 ? 'east' : 'west'} of the tower`
    return end(flight, 'ground', `It came down ${where} at ${Math.round(speed)} m/s, below the arms.`)
  }
  if (next.time > t.maxSeconds) return end(flight, 'no-propellant', 'It hovered until the propellant was gone.')
  return flight
}

function distance(metres: number): string {
  return metres >= 1_000 ? `${(metres / 1_000).toFixed(1)} km` : `${Math.round(metres)} m`
}
