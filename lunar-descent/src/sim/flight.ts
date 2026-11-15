// Flight rules on top of the physics: phases, the guidance cue, the attitude hold used
// during the braking burn, and the touchdown assessment. Pure functions, no rendering.

import { DT, MAX_THRUST_ACCEL, MOON_RADIUS, SURFACE_GRAVITY, gravityAt, step, type Control, type State } from './physics'
import { APOLLO_11, LIMITS } from '../data/facts'

export type Phase = 'braking' | 'approach' | 'ended'

/**
 * Where the computer hands over. Altitude and descent rate are Apollo 11's flown high
 * gate; range and ground speed are game tuning.
 */
export const HIGH_GATE = {
  range: 7_500,
  altitude: APOLLO_11.highGateAltitude.value,
  groundSpeed: 150,
  climbRate: -APOLLO_11.highGateDescentRate.value,
}
/** Game tuning: the computer-flown braking burn plays at this multiple of real time. Shown on the HUD. */
export const BRAKING_TIME_SCALE = 32
/** Game tuning: velocity change available at the start of the burn, m/s. */
export const START_DELTA_V = 2_000
/**
 * Game element, not terrain data: boulders lie within this distance of the target along
 * the track. The computer steers for the target and cannot see them.
 */
export const BOULDER_HALF_WIDTH = 30
const NOMINAL_BRAKING_DECEL = 3.1

export function startState(): State {
  // Start at Apollo 11's flown altitude, at the circular orbital speed for that altitude.
  const altitude = APOLLO_11.startAltitude.value
  const groundSpeed = Math.sqrt(gravityAt(altitude) * (MOON_RADIUS + altitude))
  const brakingDistance = (groundSpeed ** 2 - HIGH_GATE.groundSpeed ** 2) / (2 * NOMINAL_BRAKING_DECEL)
  return { range: HIGH_GATE.range + brakingDistance, altitude, groundSpeed, climbRate: 0, deltaV: START_DELTA_V, time: 0 }
}

/** State at the moment of takeover on a nominal burn. Used by "retry from takeover". */
export function takeoverState(): State {
  return { ...HIGH_GATE, deltaV: START_DELTA_V - 1_616, time: 0 }
}

/** Game rule: a retry starts this far from the target, m, just before the decision. */
export const RETRY_RANGE = 2_000

/** The state after the computer's own line is flown from `state` in to `range`. Used by "fly again". */
export function flyCueTo(state: State, range: number, heightAt: (range: number) => number): State {
  let s = state
  while (s.range > range && s.altitude > heightAt(s.range)) s = step(s, guidance(s, 'approach', heightAt(s.range)), DT)
  return s
}

/** Propellant as time: seconds the lander could hover at lunar surface gravity on what is left. */
export function hoverSeconds(deltaV: number): number {
  return deltaV / SURFACE_GRAVITY
}

/** Seconds until the takeover on the braking profile. */
export function timeToTakeover(state: State): number {
  return (2 * Math.max(0, state.range - HIGH_GATE.range)) / Math.max(1, state.groundSpeed + HIGH_GATE.groundSpeed)
}

interface Aim {
  range: number
  altitude: number
  groundSpeed: number
  climbRate: number
}

/** Game tuning: the approach loses height no faster than a steady sink at this net acceleration, m/s². */
const DROP_ACCEL = 0.6

/** Thrust acceleration (horizontal braking, vertical) that reaches `aim` on a smooth profile. */
function requiredThrust(state: State, aim: Aim, ownDropTime = false): { brake: number; up: number } {
  const distance = Math.max(1, state.range - aim.range)
  const timeToGo = Math.max(4, (2 * distance) / Math.max(1, state.groundSpeed + aim.groundSpeed))
  const brake = (state.groundSpeed - aim.groundSpeed) / timeToGo
  // With `ownDropTime`, height is lost no faster than DROP_ACCEL allows: with the spot
  // underfoot and height to lose, the time to the spot alone asked for a free fall (pitch 0)
  // that flipped to upright once the drift was gone. High up it changes nothing.
  const drop = Math.max(0, state.altitude - aim.altitude)
  const dropTime = ownDropTime ? Math.max(timeToGo, Math.sqrt((2 * drop) / DROP_ACCEL)) : timeToGo
  const vertical = (6 * (aim.altitude - state.altitude)) / dropTime ** 2 - (4 * state.climbRate + 2 * aim.climbRate) / dropTime
  const up = vertical + gravityAt(state.altitude) - state.groundSpeed ** 2 / (MOON_RADIUS + state.altitude)
  return { brake, up }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * What the flight computer would command now. Drawn on the HUD as the cue marks.
 * `aimRange` moves the touchdown point along the track, m from the target (negative is beyond).
 */
export function guidance(state: State, phase: Phase, groundHeight: number, aimRange = 0): Control {
  let need: { brake: number; up: number }
  if (phase === 'braking') {
    need = requiredThrust(state, HIGH_GATE)
  } else {
    state = { ...state, range: state.range - aimRange }
    const height = state.altitude - groundHeight
    // Terminal descent: null the drift, sink slowly, slower still near the ground. The pull
    // back to the spot fades out over the last 30 m, so a lander that overshot does not
    // touch down still drifting back toward it.
    const sink = -clamp(height / 12, 1, 6)
    const terminal = {
      brake: clamp(state.groundSpeed * 0.5 - state.range * 0.02 * clamp((height - 5) / 25, 0, 1), -1, 1),
      up: (sink - state.climbRate) * 0.8 + gravityAt(state.altitude),
    }
    // The computer hands over to the terminal descent across a band, not at a line: below
    // 40 m, or within 60 m of the spot and slower than 4 m/s, it is all terminal descent.
    const ramp = (v: number, from: number, to: number) => clamp((from - v) / (from - to), 0, 1)
    const w = Math.max(ramp(height, 70, 40), ramp(Math.abs(state.range), 120, 60) * ramp(Math.abs(state.groundSpeed), 16, 4))
    if (w >= 1) {
      need = terminal
    } else {
      const approach = requiredThrust(state, { range: 0, altitude: groundHeight + 45, groundSpeed: 0, climbRate: -3 }, true)
      need = { brake: approach.brake + (terminal.brake - approach.brake) * w, up: approach.up + (terminal.up - approach.up) * w }
    }
  }
  const pitchDeg = clamp((Math.atan2(need.up, need.brake) * 180) / Math.PI, 0, 120)
  return { pitchDeg, throttle: clamp(Math.hypot(need.brake, need.up) / MAX_THRUST_ACCEL, 0, 1) }
}

/**
 * Braking burn: the computer holds attitude, the player has the throttle. The pitch is
 * whatever keeps the descent on profile with the thrust the player is giving it.
 */
export function attitudeHold(state: State, throttle: number): number {
  const { up } = requiredThrust(state, HIGH_GATE)
  const thrust = Math.max(0.05, throttle) * MAX_THRUST_ACCEL
  return clamp((Math.asin(clamp(up / thrust, 0, 0.94)) * 180) / Math.PI, 0, 70)
}

export function reachedTakeover(state: State): boolean {
  return state.range <= HIGH_GATE.range || state.groundSpeed <= HIGH_GATE.groundSpeed
}

/** Range, m, from which the player can see the boulders and choose their own spot. */
export const CHOOSE_SPOT_RANGE = 1_800

/**
 * Where the cue aims, m from the target. It starts on the target. Once the boulders are in
 * view, a marker clear of the boulders moves the aim to that side: to the marker if it is
 * inside the ring, otherwise to the ring's edge, and never closer than MIN_CLEAR. The marker
 * swings hundreds of metres with small control changes, so the side is the player's choice
 * and the computer picks the spot. The side counts as chosen once the marker has stayed
 * clear on it for AIM_HOLD_SECONDS, so passing through on the way somewhere else does not
 * choose it. The choice is made once: after that the aim stays put.
 */
const MIN_CLEAR = 40
/** Game tuning: seconds the marker must stay clear on one side before that side is chosen. */
export const AIM_HOLD_SECONDS = 1

export interface AimChoice {
  /** Where the cue aims, m from the target. 0 until a side is chosen. */
  aim: number
  /** The side the marker sits clear on now: 1 short, -1 long, 0 in the rocks or unseen. */
  side: number
  /** Seconds it has sat clear on that side. */
  held: number
}

export function nextAim(choice: AimChoice, predictedRange: number | null, range: number, seconds: number): AimChoice {
  if (choice.aim !== 0 || range >= CHOOSE_SPOT_RANGE) return choice
  if (predictedRange === null || Math.abs(predictedRange) <= BOULDER_HALF_WIDTH) return { aim: 0, side: 0, held: 0 }
  const side = Math.sign(predictedRange)
  const held = (side === choice.side ? choice.held : 0) + seconds
  if (held < AIM_HOLD_SECONDS) return { aim: 0, side, held }
  return { aim: side * clamp(Math.abs(predictedRange), MIN_CLEAR, LIMITS.accuracy.value), side, held }
}

/** Game rule: this far past the target, in metres, the run is over. */
const OVERFLY_LIMIT = 3_000

export function overflew(state: State): boolean {
  return state.range < -OVERFLY_LIMIT
}

export interface Prediction {
  /** Range from the target at touchdown, m. Negative is past it. */
  range: number
  seconds: number
  /** Downward speed at touchdown, m/s. */
  verticalSpeed: number
  horizontalSpeed: number
  /** True when the lander stops in the air above this point instead of reaching the ground. */
  hover: boolean
}

const PREDICT_DT = 0.1
const PREDICT_HORIZON = 120
/** Game rule: slower than this over the ground, m/s, a lander that stops sinking has "stopped in the air". */
const HOVER_DRIFT = 5

/**
 * Where the lander ends up if the controls stay exactly as they are: where and how hard
 * it meets the ground, or the point it stops above when the braking wins first (`hover`).
 * Null when neither happens within the horizon (climbing away, or flying on level).
 */
export function predictTouchdown(state: State, control: Control, heightAt: (range: number) => number): Prediction | null {
  let s = state
  for (let t = 0; t < PREDICT_HORIZON; t += PREDICT_DT) {
    const next = step(s, control, PREDICT_DT)
    const ground = heightAt(next.range)
    if (next.altitude <= ground) {
      // Interpolate inside the last step so the figures do not jump by a whole step.
      const before = s.altitude - heightAt(s.range)
      const f = before / Math.max(1e-6, before - (next.altitude - ground))
      return {
        range: s.range + (next.range - s.range) * f,
        seconds: t + PREDICT_DT * f,
        verticalSpeed: -(s.climbRate + (next.climbRate - s.climbRate) * f),
        horizontalSpeed: Math.abs(s.groundSpeed + (next.groundSpeed - s.groundSpeed) * f),
        hover: false,
      }
    }
    // Judged after the step, so a lander at rest that is about to fall is not called a hover.
    // A few m/s of drift still counts: without it, a lander braking upright with a little
    // drift was predicted to burn out its propellant and fall, and Impact read the fall.
    if (next.groundSpeed <= HOVER_DRIFT && next.climbRate >= 0) {
      return { range: next.range, seconds: t + PREDICT_DT, verticalSpeed: 0, horizontalSpeed: Math.abs(next.groundSpeed), hover: true }
    }
    s = next
  }
  return null
}

export interface Touchdown {
  verticalSpeed: number
  horizontalSpeed: number
  /** Degrees between the lander's long axis and vertical after it settles on the slope. */
  tiltDeg: number
  missDistance: number
  deltaVLeft: number
  outcome: 'landed' | 'tilted' | 'hard' | 'boulders'
}

export function assessTouchdown(state: State, pitchDeg: number, slopeDeg: number): Touchdown {
  const verticalSpeed = Math.abs(state.climbRate)
  const horizontalSpeed = Math.abs(state.groundSpeed)
  const tiltDeg = Math.max(slopeDeg, Math.abs(90 - pitchDeg))
  const hard = verticalSpeed > LIMITS.verticalSpeed.value || horizontalSpeed > LIMITS.horizontalSpeed.value
  return {
    verticalSpeed,
    horizontalSpeed,
    tiltDeg,
    missDistance: Math.abs(state.range),
    deltaVLeft: state.deltaV,
    outcome: hard ? 'hard' : Math.abs(state.range) < BOULDER_HALF_WIDTH ? 'boulders' : tiltDeg > LIMITS.tilt.value ? 'tilted' : 'landed',
  }
}
