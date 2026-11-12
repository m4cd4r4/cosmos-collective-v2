import { describe, expect, it } from 'vitest'
import { DT, step, type State } from './physics'

describe('descent physics', () => {
  it('free fall for 10 s at lunar gravity gives 16.2 m/s and 81 m', () => {
    let state: State = { range: 0, altitude: 100, groundSpeed: 0, climbRate: 0, deltaV: 0, time: 0 }
    for (let i = 0; i < 600; i++) state = step(state, { throttle: 0, pitchDeg: 90 }, DT)

    expect(state.time).toBeCloseTo(10, 6)
    expect(state.climbRate).toBeCloseTo(-16.2, 2)
    expect(100 - state.altitude).toBeCloseTo(81, 1)
  })
})
