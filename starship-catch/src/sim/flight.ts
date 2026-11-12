// Flight rules on top of the physics: phases, engines, the catch call, and how a run ends.
// Pure logic, no rendering. Every constant in TUNING is game tuning, not a mission figure:
// SpaceX publishes times and engine counts, but no speeds, altitudes or limits.

import { ENGINES, type EventId } from '../data/facts'
import { G0, dynamicPressure, gravityAt, step, type State } from './physics'
import type { Scenario } from './scenario'

export type Phase = 'ascent' | 'staging' | 'boostback' | 'coast' | 'landing' | 'ended'

export type Outcome =
  | 'caught'
  | 'hard-catch'
  | 'missed'
  | 'tower-strike'
  | 'splashdown'
  | 'hard-splashdown'
  | 'on-land'
  | 'breakup'

export const TUNING = {
  /** Thrust acceleration of the full stack at liftoff, m/s2, and the burn time that sets how it grows. */
  liftoffAccel: 13.6,
  ascentBurnScale: 270,
  ascentMinThrottle: 0.5,
  /** The pitch-over: thrust leans east by up to this many degrees as the stack climbs. */
  pitchMaxDeg: 63,
  pitchStartAlt: 600,
  pitchFullAlt: 52_000,
  /** Most engines cut off at this speed, m/s. */
  mecoSpeed: 1_560,
  /** Structural limit on dynamic pressure, Pa, and how long it can be exceeded, s. */
  qLimit: 22_000,
  qTolerance: 2.5,
  /** The cue starts easing the throttle at this fraction of the limit. */
  qCue: 0.95,
  stackTerminalSpeed: 900,
  boosterTerminalSpeed: 230,
  /** Seconds from engine cutoff to hot staging, and from hot staging to the end of the flip. */
  stagingDelay: 8,
  flipDuration: 5,
  /** Boostback thrust acceleration with all 13 engines, m/s2. */
  boostbackAccel: 28,
  /** Grid fins: the most sideways acceleration they give, and the dynamic pressure that gives it. */
  finAccel: 5,
  finFullQ: 9_000,
  /** With no "go for catch" the booster flies itself to this point offshore, m east of the tower. */
  splashX: 1_500,
  /** The landing phase begins below this height, m. */
  landingGate: 4_000,
  /** Landing burn thrust acceleration: 13 engines, then the 3 centre engines. */
  landingAccel13: 70,
  landingAccel3: 20,
  landingMinThrottle: 0.4,
  /** Height above the target kept for the final descent on 3 engines, m, and the braking it is flown at, m/s2. */
  finalRoom: 330,
  finalDecel: 5,
  /** The burn drops to the 3 centre engines below this speed, m/s. */
  downselectSpeed: 55,
  tiltMaxDeg: 20,
  /** Height of the booster's base when its catch points meet the arms, m. */
  catchHeight: 46,
  /** The booster must be this close to the centre of the arms, m, and this slow, m/s. */
  catchHalfGap: 3,
  catchSideSpeed: 2.5,
  catchSinkSpeed: 6,
  catchTiltDeg: 6,
  /** The tower's east face, m from the catch point, and its height, m. */
  towerFace: -9,
  towerHeight: 146,
  splashSpeed: 8,
  startDeltaV: 6_000,
}

export interface Input {
  /** 0 to 1. */
  throttle: number
  /** Landing burn only: thrust lean from vertical, degrees. Positive pushes east. */
  tiltDeg: number
  /** Boostback: cut the engines now. */
  shutdown: boolean
  /** Boostback: the flight director's "go for catch" command. */
  go: boolean
  /** Landing: light the landing burn now. */
  ignite: boolean
}

export interface Flight {
  state: State
  phase: Phase
  scenario: Scenario
  /** Engines running now. */
  engines: number
  /** Thrust acceleration applied on the last step, m/s2, and its lean. For the plume and the HUD. */
  thrustAccel: number
  thrustAngleDeg: number
  /** Ascent: full-throttle seconds burned so far. */
  burn: number
  /** Seconds spent over the dynamic pressure limit. */
  overstress: number
  peakQ: number
  phaseTime: number
  goSent: boolean
  /** True once boostback ends with a go and a healthy tower: the booster is coming to the arms. */
  committed: boolean
  lit: boolean
  downselected: boolean
  /** Where the booster comes down if nothing else is done, m east of the tower. */
  impactX: number
  impactAge: number
  /** True once the booster has dropped past the arms without being caught. */
  pastArms: boolean
  events: Partial<Record<EventId, number>>
  outcome: Outcome | null
}

export function startFlight(scenario: Scenario): Flight {
  return {
    state: { x: 0, y: 0, vx: 0, vy: 0, deltaV: TUNING.startDeltaV, time: 0 },
    phase: 'ascent',
    scenario,
    engines: ENGINES.liftoff,
    thrustAccel: 0,
    thrustAngleDeg: 0,
    burn: 0,
    overstress: 0,
    peakQ: 0,
    phaseTime: 0,
    goSent: false,
    committed: false,
    lit: false,
    downselected: false,
    impactX: 0,
    impactAge: Infinity,
    pastArms: false,
    events: {},
    outcome: null,
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smooth = (t: number) => {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

/** Lean of the thrust from vertical during ascent, degrees. The computer flies this. */
export function ascentPitch(y: number): number {
  return TUNING.pitchMaxDeg * smooth((y - TUNING.pitchStartAlt) / (TUNING.pitchFullAlt - TUNING.pitchStartAlt))
}

/** Where the booster reaches the ground if it only falls from here. No thrust, no fins. */
export function predictImpact(state: State): number {
  let s = state
  for (let i = 0; i < 2_000 && s.y > 0; i++) s = step(s, { accel: 0, angleDeg: 0 }, TUNING.boosterTerminalSpeed, 0.5)
  return s.x
}

/** Where the booster is steering for after boostback. */
export function aimX(flight: Flight): number {
  return flight.committed ? 0 : TUNING.splashX
}

function setPhase(flight: Flight, phase: Phase) {
  flight.phase = phase
  flight.phaseTime = 0
}

function end(flight: Flight, outcome: Outcome) {
  flight.outcome = outcome
  flight.thrustAccel = 0
  setPhase(flight, 'ended')
}

/** Advance the flight one fixed timestep. Mutates and returns `flight`. */
export function advance(flight: Flight, input: Input, dt: number): Flight {
  if (flight.phase === 'ended') return flight
  const t = TUNING
  const s = flight.state
  let accel = 0
  let angleDeg = 0
  let finAccel = 0
  let terminal = t.boosterTerminalSpeed

  if (flight.phase === 'ascent') {
    const throttle = clamp(input.throttle, t.ascentMinThrottle, 1)
    accel = (throttle * t.liftoffAccel) / (1 - flight.burn / t.ascentBurnScale)
    angleDeg = ascentPitch(s.y)
    terminal = t.stackTerminalSpeed
    flight.burn += throttle * dt
    flight.engines = ENGINES.liftoff
  } else if (flight.phase === 'staging') {
    flight.engines = ENGINES.inner
  } else if (flight.phase === 'boostback') {
    flight.engines = flight.scenario.boostbackLit
    accel = (t.boostbackAccel * flight.engines) / ENGINES.centre
    angleDeg = -90
    if (input.go) flight.goSent = true
  } else if (flight.phase === 'coast' || (flight.phase === 'landing' && !flight.lit)) {
    flight.engines = 0
    const authority = t.finAccel * clamp(dynamicPressure(s) / t.finFullQ, 0, 1)
    finAccel = clamp(-(flight.impactX - aimX(flight)) * 0.004, -authority, authority)
  }
  if (flight.phase === 'landing') {
    if (input.ignite && !flight.lit) {
      flight.lit = true
      flight.events.landingStart = s.time
    }
    if (flight.lit) {
      if (!flight.downselected && Math.hypot(s.vx, s.vy) < t.downselectSpeed) flight.downselected = true
      flight.engines = flight.downselected ? ENGINES.inner : flight.scenario.landingLit
      const full = flight.downselected ? t.landingAccel3 : (t.landingAccel13 * flight.engines) / ENGINES.centre
      accel = clamp(input.throttle, t.landingMinThrottle, 1) * full
      angleDeg = clamp(input.tiltDeg, -t.tiltMaxDeg, t.tiltMaxDeg)
    }
  }

  const before = s
  const next = step(s, { accel, angleDeg, finAccel }, terminal, dt)
  flight.state = next
  flight.thrustAccel = next.deltaV > 0 ? accel : 0
  flight.thrustAngleDeg = angleDeg
  flight.phaseTime += dt

  if (flight.phase === 'ascent') {
    const q = dynamicPressure(next)
    if (q > flight.peakQ) {
      flight.peakQ = q
      flight.events.maxQ = next.time
    }
    if (q > t.qLimit) flight.overstress += dt
    if (flight.overstress > t.qTolerance) return end(flight, 'breakup')
    if (Math.hypot(next.vx, next.vy) >= t.mecoSpeed || next.deltaV <= 0) {
      flight.events.meco = next.time
      setPhase(flight, 'staging')
    }
  } else if (flight.phase === 'staging') {
    if (!flight.events.hotStaging && flight.phaseTime >= t.stagingDelay) flight.events.hotStaging = next.time
    if (flight.phaseTime >= t.stagingDelay + t.flipDuration) {
      flight.events.boostbackStart = next.time
      flight.impactX = predictImpact(next)
      setPhase(flight, 'boostback')
    }
  } else if (flight.phase === 'boostback') {
    flight.impactX = predictImpact(next)
    // A go sent against a failed tower check is overridden: the computer cuts the burn on the sea track itself.
    const overridden = flight.goSent && flight.scenario.towerFault !== null && flight.impactX <= t.splashX
    if (input.shutdown || overridden || next.deltaV <= 0) {
      flight.events.boostbackEnd = next.time
      flight.committed = flight.goSent && !flight.scenario.towerFault
      setPhase(flight, 'coast')
    }
  } else if (flight.phase === 'coast') {
    flight.impactAge += dt
    if (flight.impactAge > 0.5) {
      flight.impactX = predictImpact(next)
      flight.impactAge = 0
    }
    if (next.vy < 0 && next.y < t.landingGate) setPhase(flight, 'landing')
  } else if (flight.phase === 'landing') {
    if (!flight.lit) flight.impactX = predictImpact(next)
    if (flight.committed) {
      if (!flight.pastArms && before.y > t.catchHeight && next.y <= t.catchHeight) {
        const inArms = Math.abs(next.x) <= t.catchHalfGap
        const gentle =
          Math.abs(next.vx) <= t.catchSideSpeed && -next.vy <= t.catchSinkSpeed && Math.abs(angleDeg) <= t.catchTiltDeg && flight.lit
        if (inArms && gentle) {
          flight.events.catch = next.time
          return end(flight, 'caught')
        }
        if (inArms) return end(flight, 'hard-catch')
        flight.pastArms = true
      }
      if (next.x < t.towerFace && next.x > t.towerFace - 14 && next.y < t.towerHeight) return end(flight, 'tower-strike')
    }
  }
  if (flight.phase !== 'ended' && flight.phase !== 'ascent' && next.y <= 0) {
    flight.state = { ...next, y: 0 }
    if (flight.committed) return end(flight, 'missed')
    // The shoreline is about 400 m east of the tower.
    if (next.x < 400) return end(flight, 'on-land')
    const soft = flight.lit && Math.hypot(next.vx, next.vy) <= t.splashSpeed
    return end(flight, soft ? 'splashdown' : 'hard-splashdown')
  }
  return flight
}

/** Lean that points the thrust against the direction of travel, within the tilt limit, degrees. */
function retrogradeTilt(s: State): number {
  return clamp((Math.atan2(-s.vx, -s.vy) * 180) / Math.PI, -TUNING.tiltMaxDeg, TUNING.tiltMaxDeg)
}

/**
 * Height at which the landing burn must be lit, with the engines that are expected to relight.
 * Found by flying the burn ahead from here: drag does much of the braking, so no formula serves.
 */
export function igniteHeight(flight: Flight): number {
  const t = TUNING
  const full = (t.landingAccel13 * flight.scenario.landingLit) / ENGINES.centre
  const target = flight.committed ? t.catchHeight : 0
  let s = flight.state
  if (s.vy >= 0) return 0
  for (let i = 0; i < 400 && s.y > 0 && Math.hypot(s.vx, s.vy) > t.downselectSpeed; i++) {
    s = step(s, { accel: full, angleDeg: retrogradeTilt(s) }, t.boosterTerminalSpeed, 0.05)
  }
  // Lighting now would leave the booster at s.y when it drops to 3 engines. It needs finalRoom above the target.
  return flight.state.y - (s.y - target - t.finalRoom)
}

/** What the flight computer would command now. Drawn as the gold cue marks; flown by the tests. */
export function guidance(flight: Flight): Input {
  const t = TUNING
  const s = flight.state
  const cue: Input = { throttle: 1, tiltDeg: 0, shutdown: false, go: false, ignite: false }

  if (flight.phase === 'ascent') {
    cue.throttle = clamp(1 - 10 * (dynamicPressure(s) / t.qLimit - t.qCue), t.ascentMinThrottle, 1)
  } else if (flight.phase === 'boostback') {
    cue.go = !flight.scenario.towerFault
    cue.shutdown = flight.impactX <= (cue.go ? 0 : t.splashX)
  } else if (flight.phase === 'landing') {
    const target = flight.committed ? t.catchHeight : 0
    const targetX = flight.committed ? 0 : s.x
    cue.ignite = s.y <= igniteHeight(flight)
    const height = s.y - target
    // Close on the arms no faster than the 3 centre engines can stop sideways.
    const off = Math.abs(s.x - targetX)
    const closing = Math.min(flight.downselected ? 25 : 80, Math.sqrt(4 * off), off * 0.5)
    const wantVx = -Math.sign(s.x - targetX) * closing
    if (!flight.downselected) {
      // 13 engines: full thrust, leaned to kill the sideways speed the booster arrives with.
      const full = (t.landingAccel13 * flight.scenario.landingLit) / ENGINES.centre
      const side = clamp(((wantVx - s.vx) * 0.9) / full, -1, 1)
      cue.throttle = 1
      cue.tiltDeg = clamp((Math.asin(side) * 180) / Math.PI, -t.tiltMaxDeg, t.tiltMaxDeg)
    } else {
      // 3 engines: follow a steady braking line down to a slow final sink into the arms.
      const wantAx = clamp((wantVx - s.vx) * 2, -4.5, 4.5)
      // Hold just above the arms until the booster is lined up, then sink in.
      const aligned = off < 1.5 && Math.abs(s.vx) < 1
      const room = height - (aligned ? 0 : 10)
      const braking = room > 6
      const sink = braking ? Math.max(1.5, Math.sqrt(2 * t.finalDecel * (room - 5))) : room > 0 ? 1.5 : 0
      const wantAy = (-sink - s.vy) * 1.4 + gravityAt(s.y) + (braking && sink > 1.5 ? t.finalDecel : 0)
      const up = Math.max(t.landingMinThrottle * t.landingAccel3, wantAy)
      const settle = height < 12 ? 0.35 : 1
      cue.tiltDeg = clamp(((Math.atan2(wantAx, up) * 180) / Math.PI) * settle, -15, 15)
      cue.throttle = clamp(wantAy / Math.cos((cue.tiltDeg * Math.PI) / 180) / t.landingAccel3, t.landingMinThrottle, 1)
    }
  }
  return cue
}
