import { describe, expect, it } from 'vitest'
import { DT, step, type State } from './physics'
import { assessTouchdown, flyCueTo, guidance, takeoverState } from './flight'
import { PITCH_KEYS, THROTTLE_KEYS, keyStep, type KeyFeel } from './input'

// A person at the keys, not a controller: they see the needles and the cue `lag` seconds
// late, look again every 0.3 s, press when a needle is visibly off its cue, and let go only
// once they SEE it back on the cue, so every release is late too. Earlier simulated players
// let go the instant the needle arrived; they landed every time while people could not.
function flyLikeAPerson(start: State, aimRange: number, lag: number) {
  let state = start
  let { throttle, pitchDeg: pitch } = guidance(state, 'approach', 0, aimRange)
  const seen: { t: number; p: number; ct: number; cp: number }[] = []
  const lagSteps = Math.round(lag / DT)
  const lookSteps = Math.round(0.3 / DT)
  const channel = (feel: KeyFeel, pressAt: number, releaseAt: number) => ({ feel, pressAt, releaseAt, dir: 0, heldFor: 0 })
  const thr = channel(THROTTLE_KEYS, 0.03, 0.01)
  const pit = channel(PITCH_KEYS, 3, 1)
  const drive = (c: ReturnType<typeof channel>, error: number, look: boolean) => {
    if (c.dir === 0 && look && Math.abs(error) > c.pressAt) [c.dir, c.heldFor] = [Math.sign(error), 0]
    else if (c.dir !== 0 && error * c.dir < c.releaseAt) c.dir = 0
    if (c.dir === 0) return 0
    const move = c.dir * keyStep(c.feel, c.heldFor, DT)
    c.heldFor += DT
    return move
  }
  for (let i = 0; i < 60 * 600 && state.altitude > 0; i++) {
    const cue = guidance(state, 'approach', 0, aimRange)
    seen.push({ t: throttle, p: pitch, ct: cue.throttle, cp: cue.pitchDeg })
    const s = seen[Math.max(0, seen.length - 1 - lagSteps)]
    const look = i % lookSteps === 0
    throttle = Math.min(1, Math.max(0, throttle + drive(thr, s.ct - s.t, look)))
    pitch = Math.min(120, Math.max(0, pitch + drive(pit, s.cp - s.p, look)))
    state = step(state, { throttle, pitchDeg: pitch }, DT)
  }
  return assessTouchdown(state, pitch, 0)
}

describe('flying the cue like a person', () => {
  it.each([0.3, 0.45, 0.6])('a person %s s slow lands upright on the chosen side, with room to spare on the tilt', (lag) => {
    for (const [start, aim] of [[takeoverState(), -60], [flyCueTo(takeoverState(), 2_000, () => 0), 60]] as const) {
      const result = flyLikeAPerson(start, aim, lag)
      expect(result.outcome, JSON.stringify(result)).toBe('landed')
      // Half the 8 degree limit: the real ground under the spot is not level.
      expect(result.tiltDeg, JSON.stringify(result)).toBeLessThan(4)
    }
  })
})
