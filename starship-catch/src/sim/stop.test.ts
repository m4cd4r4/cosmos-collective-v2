// Validates the stop and propellant readouts against advance(), table-driven over the three engine cases. tdd-guard:allow
import { describe, expect, it } from 'vitest'
import { DT } from './physics'
import { TUNING, advance, startFlight, type Flight } from './flight'
import { ENGINE_CASES, makeScenario } from './scenario'
import { propellantSeconds, stopDistance } from './stop'

/** A drop on the given engine case, well clear of the tower so nothing but the burn ends it. */
function drop(caseIndex: number): Flight {
  const scenario = { ...makeScenario(3), engines: ENGINE_CASES[caseIndex], x: 2_500, vx: 0, wind: 0, gusts: [] }
  return startFlight(scenario)
}

function fallTo(flight: Flight, height: number) {
  while (flight.state.y > height && !flight.outcome) advance(flight, { throttle: 0, steer: 0, ignite: false }, DT)
}

/** Light at `throttle` and fly until the sink reaches zero. Returns the height lost, or null if it never stopped. */
function burn(flight: Flight, throttle: number): number | null {
  const from = flight.state.y
  for (let i = 0; i < 60 * 120 && !flight.outcome; i++) {
    advance(flight, { throttle, steer: 0, ignite: true }, DT)
    if (flight.state.vy >= 0) return from - flight.state.y
  }
  return null
}

describe('stopping distance', () => {
  for (const [index, engineCase] of ENGINE_CASES.entries()) {
    for (const throttle of [0.5, 0.6, 0.7, 0.85, 1]) {
      it(`matches the flown burn on ${engineCase.landingLit} engines at ${throttle * 100}%`, () => {
        const flight = drop(index)
        fallTo(flight, 4_000)
        const guess = stopDistance(flight, throttle)
        const flown = burn(flight, throttle)
        // At 50% the 3 centre engines barely beat gravity, and the tanks run dry first.
        if (throttle === 0.5) {
          expect(guess.kind).toBe('dry')
          expect(flown).toBeNull()
          expect(flight.ranDry).toBe(true)
          return
        }
        expect(guess.kind).toBe('stops')
        expect(flown).not.toBeNull()
        expect(Math.abs(guess.distance - flown!) / flown!).toBeLessThan(0.02)
      })
    }
  }

  it('matches mid-burn, with the engines already spooled', () => {
    const flight = drop(0)
    fallTo(flight, 4_000)
    for (let i = 0; i < 120; i++) advance(flight, { throttle: 0.6, steer: 0, ignite: true }, DT)
    const guess = stopDistance(flight, 0.6)
    const flown = burn(flight, 0.6)!
    expect(Math.abs(guess.distance - flown) / flown).toBeLessThan(0.02)
  })

  it('says there is no stop when 3 engines at this throttle cannot beat gravity, and the flown burn agrees', () => {
    const flight = drop(1)
    fallTo(flight, 4_000)
    expect(stopDistance(flight, 0.45).kind).toBe('no-stop-3')
    expect(burn(flight, 0.45)).toBeNull()
    expect(flight.outcome).not.toBeNull()
  })

  it('runs below the minimum throttle as the engines do', () => {
    const flight = drop(0)
    fallTo(flight, 4_000)
    expect(stopDistance(flight, 0.1).throttle).toBe(TUNING.minThrottle)
  })
})

describe('propellant in seconds', () => {
  it('matches how long the engines run before the tanks are dry', () => {
    for (const throttle of [0.5, 1]) {
      const flight = drop(2)
      fallTo(flight, 8_000)
      advance(flight, { throttle, steer: 0, ignite: true }, DT)
      while (flight.spool < 1) advance(flight, { throttle, steer: 0, ignite: true }, DT)
      flight.state.deltaV = 120
      const guess = propellantSeconds(flight, throttle)
      const from = flight.state.time
      while (!flight.ranDry && !flight.outcome) advance(flight, { throttle, steer: 0, ignite: true }, DT)
      expect(flight.downselected).toBe(false)
      expect(Math.abs(flight.state.time - from - guess)).toBeLessThan(0.05)
    }
  })

  it('reads off the engines that would light before the burn', () => {
    const flight = drop(1)
    expect(propellantSeconds(flight, 1)).toBeCloseTo(TUNING.propellant / TUNING.landingAccel13, 5)
  })
})
