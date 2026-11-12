import { describe, expect, it } from 'vitest'
import { DT, step, type State } from './physics'
import { assessTouchdown, attitudeHold, guidance, predictTouchdown, reachedTakeover, startState, type Phase } from './flight'

describe('flight guidance', () => {
  // The computer cannot see the boulders at the target: its landing is gentle, upright and in the rocks.
  it('flying the cue from the start of the burn comes down softly on the target, in the boulders', () => {
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
    expect(result.outcome, log.join('\n')).toBe('boulders')
    expect(result.verticalSpeed, log.join('\n')).toBeLessThan(3.05)
    expect(result.missDistance, log.join('\n')).toBeLessThan(30)
    expect(result.deltaVLeft, log.join('\n')).toBeGreaterThan(60)
  })
})

describe('touchdown prediction', () => {
  it('free fall from 100 m at rest predicts the known time and speed', () => {
    const state: State = { range: 500, altitude: 100, groundSpeed: 0, climbRate: 0, deltaV: 300, time: 0 }
    const hit = predictTouchdown(state, { throttle: 0, pitchDeg: 90 }, () => 0)
    // t = sqrt(2h/g) = 11.1 s, v = g t = 18.0 m/s
    expect(hit?.seconds).toBeCloseTo(11.1, 0)
    expect(hit?.verticalSpeed).toBeCloseTo(18.0, 0)
    expect(hit?.range).toBeCloseTo(500, 0)
  })

  // On a braking approach the lander stops in the air before it reaches the ground. The
  // marker must still show where: that is the moment the player is choosing a spot.
  it('a braking approach that stops above the ground predicts the hover point', () => {
    const state: State = { range: 296, altitude: 166, groundSpeed: 30.4, climbRate: -13.4, deltaV: 195, time: 0 }
    const hit = predictTouchdown(state, { throttle: 0.79, pitchDeg: 53 }, () => 0)
    // Braking at 0.79 x 4 x cos 53 = 1.9 m/s2 stops 30.4 m/s in about 243 m.
    expect(hit?.hover).toBe(true)
    expect(hit?.range).toBeGreaterThan(20)
    expect(hit?.range).toBeLessThan(90)
  })
})
