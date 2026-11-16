import { describe, expect, it } from 'vitest'
import { DT } from './physics'
import { TUNING, advance, startFlight } from './flight'
import { predictArrival } from './predict'
import { makeScenario } from './scenario'

describe('the Assist arrival marker', () => {
  it('predicts where a held input reaches the arms, without moving the real flight', () => {
    const flight = startFlight(makeScenario(12))
    const held = { throttle: 0, steer: 0, ignite: false }
    const before = { ...flight.state }
    const guess = predictArrival(flight, held)
    expect(flight.state).toEqual(before)
    expect(guess.hover).toBe(false)

    while (!flight.outcome && flight.state.y > TUNING.catchHeight) advance(flight, held, DT)
    expect(Math.abs(guess.x - flight.state.x)).toBeLessThan(15)
  })
})
