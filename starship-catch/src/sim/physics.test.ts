import { describe, expect, it } from 'vitest'
import { DT, G0, step, type State } from './physics'

describe('physics step', () => {
  it('a booster falling through thick air settles at its terminal speed', () => {
    let state: State = { x: 0, y: 3_000, vx: 0, vy: 0, deltaV: 0, time: 0 }
    for (let i = 0; i < 60 * 20; i++) state = step(state, { accel: 0, angleDeg: 0 }, 60, DT)
    // Terminal speed is defined at sea-level density; at about 2 km the air is thinner, so slightly faster.
    expect(-state.vy).toBeGreaterThan(60)
    expect(-state.vy).toBeLessThan(72)
    expect(G0).toBeCloseTo(9.80665)
  })
})
