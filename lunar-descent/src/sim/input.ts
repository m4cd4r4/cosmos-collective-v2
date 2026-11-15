// How a held key moves a control. Pure, so the simulated players use the same rules as the game.
// A tap nudges by one step; held, the key waits, then ramps slowly. People see the needle late
// and let go late: at the old 70% a second, every release overshot the cue by about 20 points.

export interface KeyFeel {
  /** Moved at once on the press. */
  step: number
  /** Seconds a key must be held before it starts to ramp. */
  delay: number
  /** Moved per second while it ramps. */
  rate: number
}

export const THROTTLE_KEYS: KeyFeel = { step: 0.02, delay: 0.3, rate: 0.25 }
/** Throttle per mouse-wheel notch. */
export const THROTTLE_PER_NOTCH = THROTTLE_KEYS.step
export const PITCH_KEYS: KeyFeel = { step: 3, delay: 0.5, rate: 6 }

/** How far a key held for `heldFor` seconds (0 on the frame it went down) moves its control over the next `dt`. */
export function keyStep(feel: KeyFeel, heldFor: number, dt: number): number {
  return (heldFor === 0 ? feel.step : 0) + keyRamp(feel, heldFor, dt)
}

/** The ramp part alone: how far a key held for `heldFor` seconds moves its control over the next `dt`. */
export function keyRamp(feel: KeyFeel, heldFor: number, dt: number): number {
  return Math.max(0, Math.min(dt, heldFor + dt - feel.delay)) * feel.rate
}
