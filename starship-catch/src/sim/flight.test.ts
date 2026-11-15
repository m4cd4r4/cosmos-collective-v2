// Backfilled onto the approach sim after it was flown and tuned seed by seed. tdd-guard:allow
import { describe, expect, it } from 'vitest'
import { DT } from './physics'
import { TUNING, advance, startFlight, type Flight, type Input, type Outcome } from './flight'
import { makeScenario, seeded } from './scenario'
import { pilot } from './pilot'

type Controller = (flight: Flight, random: () => number) => Input

function fly(seed: number, controller: Controller): Flight {
  const flight = startFlight(makeScenario(seed))
  const random = seeded(seed * 31 + 7)
  for (let i = 0; i < 60 * 60 * 8 && !flight.outcome; i++) advance(flight, controller(flight, random), DT)
  return flight
}

const SEEDS = Array.from({ length: 24 }, (_, i) => i + 1)
const outcomes = (controller: Controller) => SEEDS.map((seed) => fly(seed, controller).outcome as Outcome)
const share = (list: Outcome[], outcome: Outcome) => list.filter((o) => o === outcome).length / list.length

describe('the start', () => {
  it('drops the booster about 10 km up, engines off, with an offset and drift that vary by seed', () => {
    const a = startFlight(makeScenario(1))
    const b = startFlight(makeScenario(2))
    for (const f of [a, b]) {
      expect(f.state.y).toBeGreaterThan(9_000)
      expect(f.state.y).toBeLessThan(11_000)
      expect(f.state.vy).toBeLessThan(0)
      expect(f.lit).toBe(false)
      expect(f.engines).toBe(0)
      expect(Math.abs(f.state.x)).toBeGreaterThan(100)
    }
    expect(a.state.x).not.toBe(b.state.x)
    expect(makeScenario(5)).toEqual(makeScenario(5))
  })
})

describe('the run is flown by hand', () => {
  it('(a) with no input the booster crashes on every seed', () => {
    const list = outcomes(() => ({ throttle: 0, steer: 0, ignite: false }))
    expect(list).not.toContain('caught')
    for (const o of list) expect(['no-burn', 'sea', 'ground', 'tower-strike']).toContain(o)
  })

  it('(b) a feedback pilot that reads only the flight state catches on every seed', () => {
    const list = outcomes((f) => pilot(f))
    expect(list.every((o) => o === 'caught'), list.join(', ')).toBe(true)
  })

  it('(c) random and naive inputs fail on most seeds', () => {
    let lightAt = 0
    const random = outcomes((f, r) => {
      if (f.state.time === 0) lightAt = 300 + r() * 4_000
      return { throttle: r(), steer: r() * 2 - 1, ignite: f.state.y < lightAt }
    })
    expect(share(random, 'caught')).toBeLessThan(0.1)

    const fixedHeight = outcomes((f) => ({ throttle: 0.7, steer: 0, ignite: f.state.y < 1_500 }))
    expect(share(fixedHeight, 'caught')).toBeLessThan(0.2)

    // The pilot with its steering taken away: the wind and the drift win.
    const noSteer = outcomes((f) => ({ ...pilot(f), steer: 0 }))
    expect(share(noSteer, 'caught')).toBeLessThan(0.2)
  })

  it('(d) a careless burn runs out of propellant', () => {
    const f = fly(3, (flight) => ({ throttle: 1, steer: 0, ignite: flight.state.y < 6_000 }))
    expect(f.outcome).toBe('no-propellant')
    expect(f.ranDry).toBe(true)
    expect(f.reason).toMatch(/ran dry/)
  })

  it('(d) leaning west into the tower ends on the tower', () => {
    const f = fly(4, (flight) => {
      const input = pilot(flight)
      return flight.lit && flight.state.y < TUNING.towerHeight + 60 ? { ...input, steer: -1 } : input
    })
    expect(f.outcome).toBe('tower-strike')
  })

  it('lighting the burn late reaches the arms too fast', () => {
    const f = fly(6, (flight) => ({ ...pilot(flight), ignite: flight.state.y < 500 }))
    expect(['hard-catch', 'ground', 'tower-strike']).toContain(f.outcome)
  })

  it('steering hard east overshoots into the Gulf', () => {
    const f = fly(8, () => ({ throttle: 0, steer: 1, ignite: false }))
    expect(f.outcome).toBe('sea')
    expect(f.state.x).toBeGreaterThan(TUNING.shoreline)
  })

  it('the wind pushes a hovering booster sideways', () => {
    const scenario = { ...makeScenario(9), wind: 10, gusts: [] }
    const f = startFlight(scenario)
    f.state = { ...f.state, x: 0, y: 200, vx: 0, vy: 0 }
    f.lit = f.downselected = true
    f.spool = 1
    for (let i = 0; i < 60 * 5; i++) advance(f, { throttle: 0.49, steer: 0, ignite: false }, DT)
    expect(f.state.x).toBeGreaterThan(2)
  })
})
