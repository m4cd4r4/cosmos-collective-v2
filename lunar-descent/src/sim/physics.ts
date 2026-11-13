// Powered descent in the vertical plane that contains the approach track.
//
// This is an acceleration model: the throttle commands thrust acceleration directly.
// No lander mass or engine thrust appears, because neither is published for Starship HLS.
// Gravity, the Moon's radius and the orbital (centrifugal) term are real.

/** Lunar surface gravity, m/s2 (NASA NSSDCA Moon Fact Sheet). */
export const SURFACE_GRAVITY = 1.62
/** Mean lunar radius, m. Also the reference sphere of the LOLA elevation model. */
export const MOON_RADIUS = 1_737_400
/** Fixed physics timestep, s. */
export const DT = 1 / 60
/** Game tuning, not a mission figure: thrust acceleration at full throttle, m/s2. */
export const MAX_THRUST_ACCEL = 4

export interface State {
  /** Distance to the target along the surface, m. Negative once past it. */
  range: number
  /** Height above the target's elevation, m. */
  altitude: number
  /** Horizontal speed towards the target, m/s. */
  groundSpeed: number
  /** Vertical speed, m/s. Negative is descending. */
  climbRate: number
  /** Velocity change the remaining propellant can still deliver, m/s. */
  deltaV: number
  /** Mission time since the start of the burn, s. */
  time: number
}

export interface Control {
  /** 0 to 1. */
  throttle: number
  /** Thrust direction above the horizon, degrees. 0 is pure braking, 90 is straight up. */
  pitchDeg: number
}

export function gravityAt(altitude: number): number {
  const r = MOON_RADIUS + altitude
  return SURFACE_GRAVITY * (MOON_RADIUS / r) ** 2
}

/** Advance one fixed timestep. Pure: returns a new state. */
export function step(state: State, control: Control, dt: number): State {
  const throttle = state.deltaV > 0 ? Math.min(1, Math.max(0, control.throttle)) : 0
  const thrust = throttle * MAX_THRUST_ACCEL
  const pitch = (control.pitchDeg * Math.PI) / 180
  const r = MOON_RADIUS + state.altitude

  // At orbital speed the centrifugal term cancels gravity; it fades as the lander slows.
  const vertical = thrust * Math.sin(pitch) - gravityAt(state.altitude) + state.groundSpeed ** 2 / r
  const horizontal = -thrust * Math.cos(pitch) - (state.groundSpeed * state.climbRate) / r

  return {
    range: state.range - (state.groundSpeed * dt + 0.5 * horizontal * dt * dt) * (MOON_RADIUS / r),
    altitude: state.altitude + state.climbRate * dt + 0.5 * vertical * dt * dt,
    groundSpeed: state.groundSpeed + horizontal * dt,
    climbRate: state.climbRate + vertical * dt,
    deltaV: Math.max(0, state.deltaV - thrust * dt),
    time: state.time + dt,
  }
}
