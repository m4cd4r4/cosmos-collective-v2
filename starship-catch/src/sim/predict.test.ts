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

  it('when the held controls stop the booster short of the arms, gives where it stops', () => {
    const flight = startFlight(makeScenario(12))
    while (flight.state.y > 3_000) advance(flight, { throttle: 0, steer: 0, ignite: false }, DT)
    const held = { throttle: 1, steer: 0.5, ignite: true }
    advance(flight, held, DT)
    const guess = predictArrival(flight, held)
    expect(guess.hover).toBe(true)
    expect(guess.y).toBeGreaterThan(TUNING.catchHeight + 1_000)

    while (!flight.outcome && flight.state.vy < 0) advance(flight, held, DT)
    expect(Math.abs(guess.y - flight.state.y)).toBeLessThan(30)
    expect(Math.abs(guess.x - flight.state.x)).toBeLessThan(15)
  })
})
