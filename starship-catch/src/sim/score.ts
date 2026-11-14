// The catch score: how close to perfect the arrival in the arms was. A game measure, not a
// SpaceX figure. Each part is a share of the catch limit the player stayed inside.

import { TUNING, type Flight } from './flight'

export interface ScorePart {
  label: string
  /** What was flown, for display. */
  value: string
  /** 0 to 1. */
  share: number
  /** Points out of `weight`. */
  points: number
  weight: number
}

export interface Score {
  total: number
  parts: ScorePart[]
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** Null unless the booster was caught. `landingDeltaV` is the propellant left when the landing began, m/s. */
export function scoreCatch(flight: Flight, landingDeltaV: number): Score | null {
  if (flight.outcome !== 'caught') return null
  const s = flight.state
  const part = (label: string, value: string, share: number, weight: number): ScorePart => {
    const clamped = clamp01(share)
    return { label, value, share: clamped, points: Math.round(clamped * weight), weight }
  }
  const parts = [
    part('Centred', `${Math.abs(s.x).toFixed(1)} m off`, 1 - Math.abs(s.x) / TUNING.catchHalfGap, 40),
    part('Soft', `${(-s.vy).toFixed(1)} m/s sink`, 1 - -s.vy / TUNING.catchSinkSpeed, 30),
    part('Upright', `${Math.abs(flight.thrustAngleDeg).toFixed(1)}° lean`, 1 - Math.abs(flight.thrustAngleDeg) / TUNING.catchTiltDeg, 15),
    part('Propellant', `${Math.round(s.deltaV)} m/s left`, landingDeltaV > 0 ? s.deltaV / landingDeltaV / 0.5 : 0, 15),
  ]
  return { total: parts.reduce((sum, p) => sum + p.points, 0), parts }
}
