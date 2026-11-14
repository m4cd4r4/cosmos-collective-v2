import { describe, expect, it } from 'vitest'
import { DT, step, type State } from './physics'
import { assessTouchdown, guidance, nextAim, predictTouchdown, takeoverState } from './flight'

// The rates the keys move the controls at, as in ui/controls.ts.
const THROTTLE_PER_SECOND = 0.7
const PITCH_DEG_PER_SECOND = 15

// A simulated player flying from the takeover with the keys: they see the cue marks late
// (reaction time), hold a key while the needle is off the mark and let go once it is close.
// With `steerOff`, the aim starts on the target and the player pitches 15 degrees above the
// cue, flying long, until they see the marker clear of the boulders; then they follow the cue.
function flyByKeys(aimRange: number, steerOff = false, reaction = 0.3) {
  let state: State = takeoverState()
  let { throttle, pitchDeg: pitch } = guidance(state, 'approach', 0, aimRange)
  const seen: { throttle: number; pitchDeg: number }[] = []
  const delay = Math.round(reaction / DT)
  let tDir = 0
  let pDir = 0
  let markerClear = false
  for (let i = 0; i < 60 * 600 && state.altitude > 0; i++) {
    seen.push(guidance(state, 'approach', 0, aimRange))
    if (steerOff && i % 15 === 0) {
      const marker = predictTouchdown(state, { throttle, pitchDeg: pitch }, () => 0)?.range ?? null
      // The game only re-aims once the player has touched the controls; here, from 1.5 km.
      if (state.range < 1_500) aimRange = nextAim(aimRange, marker, state.range)
      if (marker !== null && state.range < 1_500 && Math.abs(marker) > 40) markerClear = true
    }
    const seen0 = seen[Math.max(0, seen.length - 1 - delay)]
    const cue = steerOff && !markerClear && state.range < 1_500 ? { ...seen0, pitchDeg: seen0.pitchDeg + 15 } : seen0
    // Press when more than 4 points or 3 degrees off; let go within 1 point or 1 degree.
    const tErr = cue.throttle - throttle
    tDir = Math.abs(tErr) > 0.04 ? Math.sign(tErr) : Math.abs(tErr) < 0.01 ? 0 : tDir
    const pErr = cue.pitchDeg - pitch
    pDir = Math.abs(pErr) > 3 ? Math.sign(pErr) : Math.abs(pErr) < 1 ? 0 : pDir
    throttle = Math.min(1, Math.max(0, throttle + tDir * THROTTLE_PER_SECOND * DT))
    pitch = Math.min(120, Math.max(0, pitch + pDir * PITCH_DEG_PER_SECOND * DT))
    state = step(state, { throttle, pitchDeg: pitch }, DT)
  }
  return assessTouchdown(state, pitch, 0)
}

describe('aim point', () => {
  it('a player following a cue aimed 60 m beyond the target lands there, clear of the boulders', () => {
    const result = flyByKeys(-60)
    expect(result.outcome, JSON.stringify(result)).toBe('landed')
    expect(Math.abs(result.missDistance - 60), JSON.stringify(result)).toBeLessThan(10)
  })

  it('a player who steers the marker off the rocks and then follows the cue lands softly on clear ground', () => {
    const result = flyByKeys(0, true)
    expect(result.outcome, JSON.stringify(result)).toBe('landed')
  })

  it('the cue keeps its aim until the player puts the marker clear of the boulders, then aims inside the ring on that side and keeps it', () => {
    expect(nextAim(0, 50, 2_500), 'too early: before the boulders tip').toBe(0)
    expect(nextAim(0, 12, 1_200), 'marker in the boulders').toBe(0)
    expect(nextAim(0, -55, 1_200), 'marker clear, beyond the rocks').toBe(-55)
    expect(nextAim(-55, 20, 600), 'drifted back into the rocks: keep the clear spot').toBe(-55)
    expect(nextAim(0, 400, 1_200), 'far short: the near side of the ring').toBe(100)
    expect(nextAim(-55, 400, 600), 'chosen once: the marker swinging to the other side does not move it').toBe(-55)
    expect(nextAim(0, -2_000, 1_200), 'far long: the far side of the ring').toBe(-100)
    expect(nextAim(0, 33, 1_200), 'just clear: at least 40 m out').toBe(40)
  })
})
