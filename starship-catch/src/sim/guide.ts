// Where the target is from the booster, for the edge arrow and the approach scope.
// This says WHERE to go. When and how hard stay the player's call.

import { TUNING, type Flight } from './flight'

export interface Target {
  /** The arms relative to the booster: m east (negative = west) and m above (negative = below). */
  dx: number
  dh: number
}

export function towerFromBooster(flight: Flight): Target {
  return { dx: -flight.state.x, dh: TUNING.catchHeight - flight.state.y }
}

/** Squeeze a distance so metres near the arms and kilometres far out both read on one small dial. 0 to 1. */
export function scopeScale(metres: number): number {
  const full = 12_000
  return Math.sign(metres) * Math.min(1, Math.log10(1 + Math.abs(metres) / 4) / Math.log10(1 + full / 4))
}

/**
 * The booster's dot on the approach scope, as a share of the scope radius from its centre,
 * which is the arms. Side on, like the main view: east right, up up.
 */
export function scopePoint(flight: Flight): { x: number; y: number } {
  const t = towerFromBooster(flight)
  // `+ 0` turns -0 into 0 for a booster exactly on the target.
  const x = scopeScale(-t.dx) + 0
  const y = scopeScale(-t.dh) + 0
  const r = Math.hypot(x, y)
  return r > 1 ? { x: x / r, y: y / r } : { x, y }
}

export type SinkBand = 'ok' | 'warn' | 'bad'

/** The sink rate against the game's catch limit. */
export function sinkBand(sink: number): SinkBand {
  if (sink <= TUNING.catchSinkSpeed) return 'ok'
  return sink <= TUNING.catchSinkSpeed * 2 ? 'warn' : 'bad'
}
