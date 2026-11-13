import { describe, expect, it } from 'vitest'
import { DT } from './physics'
import { advance, guidance, startFlight } from './flight'
import { predictArrival } from './predict'
import { SCENARIOS } from './scenario'

describe('the arrival prediction', () => {
  it('shows a held throttle leading to a hover, a crash or a catch', () => {
    const flight = startFlight(SCENARIOS[0])
    while (!flight.downselected && flight.phase !== 'ended') advance(flight, guidance(flight), DT)
    expect(flight.downselected).toBe(true)

    const cue = guidance(flight)
    expect(predictArrival(flight, { ...cue, throttle: 1, tiltDeg: 0 })?.hover).toBe(true)
    const low = predictArrival(flight, { ...cue, throttle: 0, tiltDeg: 0 })
    expect(low?.hover).toBe(false)
    expect(low?.sink).toBeGreaterThan(20)
    // Predicting must not move the real flight.
    expect(flight.phase).toBe('landing')
    expect(flight.outcome).toBeNull()
  })
})
