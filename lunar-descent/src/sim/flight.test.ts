import { describe, expect, it } from 'vitest'
import { DT, step, type State } from './physics'
import { assessTouchdown, attitudeHold, guidance, reachedTakeover, startState, type Phase } from './flight'

describe('flight guidance', () => {
  it('flying the cue from the start of the burn ends in a landing inside every limit', () => {
    let state: State = startState()
    let phase: Phase = 'braking'
    let pitchDeg = 0
    const log: string[] = []

    for (let i = 0; i < 60 * 60 * 20 && state.altitude > 0; i++) {
      const cue = guidance(state, phase, 0)
      pitchDeg = phase === 'braking' ? attitudeHold(state, cue.throttle) : cue.pitchDeg
      state = step(state, { throttle: cue.throttle, pitchDeg }, DT)
      if (phase === 'braking' && reachedTakeover(state)) {
        phase = 'approach'
        log.push(`takeover t=${state.time.toFixed(0)} range=${state.range.toFixed(0)} alt=${state.altitude.toFixed(0)} vs=${state.groundSpeed.toFixed(1)} vh=${state.climbRate.toFixed(1)} dv=${state.deltaV.toFixed(0)}`)
      }
    }

    const result = assessTouchdown(state, pitchDeg, 0)
    log.push(`touchdown t=${state.time.toFixed(0)} ${JSON.stringify(result)}`)
    expect(result.outcome, log.join('\n')).toBe('landed')
    expect(result.missDistance, log.join('\n')).toBeLessThan(100)
    expect(result.deltaVLeft, log.join('\n')).toBeGreaterThan(100)
  })
})
