// The Assist marker: where the booster reaches the height of the arms if the controls are
// held as they are now. Off by default. It shows where you are going, never what to press.

import { TUNING, advance, type Flight, type Input, type Outcome } from './flight'

export interface Arrival {
  /** The booster stops and climbs before it reaches the arms. */
  hover: boolean
  /** Where it is when it reaches the arms' height; with `hover`, where it stops falling; otherwise where the look-ahead ended. */
  x: number
  y: number
  sink: number
  /** How the run would end, when it ends within the look-ahead. */
  outcome: Outcome | null
}

const STEP = 0.1
const LOOK_AHEAD = 90

export function predictArrival(flight: Flight, input: Input): Arrival {
  const ghost: Flight = { ...flight, state: { ...flight.state } }
  const held: Input = { ...input, ignite: false }
  let hover = false
  for (let t = 0; t < LOOK_AHEAD && !ghost.outcome && ghost.state.y > TUNING.catchHeight; t += STEP) {
    advance(ghost, held, STEP)
    if (ghost.state.vy > 0) {
      hover = true
      break
    }
  }
  const s = ghost.state
  return { hover, x: s.x, y: s.y, sink: -s.vy, outcome: ghost.outcome }
}
