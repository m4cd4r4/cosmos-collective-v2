// Booster flight in the vertical plane that runs east from the launch tower out over the Gulf.
//
// This is an acceleration model, as in lunar-descent (plan ruling 4): the engines command
// thrust acceleration directly. SpaceX publishes no dry mass for Super Heavy, so no mass
// appears. Gravity, the Earth's radius and the sea-level air density are real; the density
// profile is the usual single-scale-height approximation.

/** Standard gravity at sea level, m/s2. */
export const G0 = 9.80665
/** Mean Earth radius, m. */
export const EARTH_RADIUS = 6_371_000
/** Sea-level air density of the standard atmosphere, kg/m3. */
export const RHO0 = 1.225
/** Approximation: density falls by e every 8.5 km. */
export const SCALE_HEIGHT = 8_500
/** Fixed physics timestep, s. */
export const DT = 1 / 60

export interface State {
  /** Distance east of the catch point, m. */
  x: number
  /** Height of the booster's base above the ground, m. */
  y: number
  vx: number
  vy: number
  /** Velocity change the remaining propellant can still deliver, m/s. */
  deltaV: number
  /** Time since the run began, s. */
  time: number
}

export interface Thrust {
  /** Thrust acceleration, m/s2. */
  accel: number
  /** Thrust direction from vertical, degrees. Positive leans east. */
  angleDeg: number
  /** Extra sideways acceleration from the grid fins, m/s2. Costs no propellant. */
  finAccel?: number
}

/**
 * Moving air. Without it, drag acts along the velocity with one coefficient. With it, the
 * booster falls engines first: drag along its length uses `terminalSpeed`, and the much
 * larger side of the booster takes the wind, scaled by `sideDrag` (game tuning, 1/m).
 */
export interface Air {
  /** Wind speed towards the east, m/s. */
  windX: number
  sideDrag: number
}

export function gravityAt(y: number): number {
  return G0 * (EARTH_RADIUS / (EARTH_RADIUS + Math.max(0, y))) ** 2
}

export function densityAt(y: number): number {
  return RHO0 * Math.exp(-Math.max(0, y) / SCALE_HEIGHT)
}

/** Dynamic pressure, Pa. */
export function dynamicPressure(state: State): number {
  return 0.5 * densityAt(state.y) * (state.vx ** 2 + state.vy ** 2)
}

/**
 * Advance one fixed timestep. Pure: returns a new state.
 * `terminalSpeed` sets the drag: the speed at which drag equals weight at sea level.
 */
export function step(state: State, thrust: Thrust, terminalSpeed: number, dt: number, air?: Air): State {
  const accel = state.deltaV > 0 ? Math.max(0, thrust.accel) : 0
  const angle = (thrust.angleDeg * Math.PI) / 180
  const thick = densityAt(state.y) / RHO0
  let dragX: number
  let dragY: number
  if (air) {
    const side = state.vx - air.windX
    dragX = air.sideDrag * thick * Math.abs(side) * side
    dragY = ((G0 * thick * Math.abs(state.vy)) / terminalSpeed ** 2) * state.vy
  } else {
    const drag = (G0 * thick * Math.hypot(state.vx, state.vy)) / terminalSpeed ** 2
    dragX = drag * state.vx
    dragY = drag * state.vy
  }

  const ax = accel * Math.sin(angle) - dragX + (thrust.finAccel ?? 0)
  const ay = accel * Math.cos(angle) - dragY - gravityAt(state.y)

  return {
    x: state.x + state.vx * dt + 0.5 * ax * dt * dt,
    y: state.y + state.vy * dt + 0.5 * ay * dt * dt,
    vx: state.vx + ax * dt,
    vy: state.vy + ay * dt,
    deltaV: Math.max(0, state.deltaV - accel * dt),
    time: state.time + dt,
  }
}
