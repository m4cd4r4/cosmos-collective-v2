// What the landing burn leads to if the controls are held as they are.
// Drawn as the off-white arrival marker, so the player sees what an input does before it lands.

import { TUNING, advance, type Flight, type Input, type Outcome } from './flight'

export interface Arrival {
  /** The booster stops and climbs before it reaches the target height. */
  hover: boolean
  /** Position, sink rate and sideways speed at the target height, or where it stops. */
  x: number
  y: number
  sink: number
  side: number
  /** How the run would end, when it ends within the look-ahead. */
  outcome: Outcome | null
}

const STEP = 0.05
const LOOK_AHEAD = 40

export function predictArrival(flight: Flight, input: Input): Arrival | null {
  if (flight.phase !== 'landing' || !flight.lit) return null
  const target = flight.committed ? TUNING.catchHeight : 0
  const ghost: Flight = { ...flight, events: { ...flight.events } }
  const held: Input = { ...input, ignite: false, shutdown: false, go: false }
  let hover = false
  for (let t = 0; t < LOOK_AHEAD && ghost.phase !== 'ended' && ghost.state.y > target; t += STEP) {
    advance(ghost, held, STEP)
    if (ghost.state.vy > 0) {
      hover = true
      break
    }
  }
  const s = ghost.state
  return { hover, x: s.x, y: s.y, sink: -s.vy, side: s.vx, outcome: ghost.outcome }
}
