// Flight rules on top of the physics: phases, the guidance cue, the attitude hold used
// during the braking burn, and the touchdown assessment. Pure functions, no rendering.

import { MAX_THRUST_ACCEL, MOON_RADIUS, gravityAt, step, type Control, type State } from './physics'
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

interface Aim {
  range: number
  altitude: number
  groundSpeed: number
  climbRate: number
}

/** Thrust acceleration (horizontal braking, vertical) that reaches `aim` on a smooth profile. */
function requiredThrust(state: State, aim: Aim): { brake: number; up: number } {
  const distance = Math.max(1, state.range - aim.range)
  const timeToGo = Math.max(4, (2 * distance) / Math.max(1, state.groundSpeed + aim.groundSpeed))
  const brake = (state.groundSpeed - aim.groundSpeed) / timeToGo
  const vertical = (6 * (aim.altitude - state.altitude)) / timeToGo ** 2 - (4 * state.climbRate + 2 * aim.climbRate) / timeToGo
  const up = vertical + gravityAt(state.altitude) - state.groundSpeed ** 2 / (MOON_RADIUS + state.altitude)
  return { brake, up }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** What the flight computer would command now. Drawn on the HUD as the cue marks. */
export function guidance(state: State, phase: Phase, groundHeight: number): Control {
  let need: { brake: number; up: number }
  if (phase === 'braking') {
    need = requiredThrust(state, HIGH_GATE)
  } else {
    const height = state.altitude - groundHeight
    const close = Math.abs(state.range) < 60 && Math.abs(state.groundSpeed) < 6
    if (close || height < 40) {
      // Terminal descent: null the drift, sink slowly, slower still near the ground.
      const sink = -clamp(height / 12, 1, 6)
      need = {
        brake: clamp(state.groundSpeed * 0.5 - state.range * 0.02, -1, 1),
        up: (sink - state.climbRate) * 0.8 + gravityAt(state.altitude),
      }
    } else {
      need = requiredThrust(state, { range: 0, altitude: groundHeight + 45, groundSpeed: 0, climbRate: -3 })
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
    if (next.groundSpeed <= 0.5 && next.climbRate >= 0) {
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
