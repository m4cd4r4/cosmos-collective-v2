import { describe, expect, it } from 'vitest'
import { FLIGHT_8 } from '../data/facts'
import { DT } from './physics'
import { advance, guidance, startFlight, type Flight, type Input } from './flight'
import { SCENARIOS } from './scenario'

/** Fly a whole run on the computer's cue. `go` overrides the catch call. */
export function flyOnCue(scenarioIndex: number, go?: boolean): { flight: Flight; log: string } {
  const flight = startFlight(SCENARIOS[scenarioIndex])
  const log: string[] = []
  let phase: string = flight.phase
  const stage = () => (flight.phase !== 'landing' ? flight.phase : flight.downselected ? 'landing-3' : flight.lit ? 'landing-13' : 'landing')
  for (let i = 0; i < 60 * 60 * 12 && flight.phase !== 'ended'; i++) {
    const cue = guidance(flight)
    if (go !== undefined) cue.go = go
    advance(flight, cue, DT)
    if (stage() !== phase) {
      const s = flight.state
      log.push(
        `${phase} -> ${stage()} t=${s.time.toFixed(1)} x=${s.x.toFixed(0)} y=${s.y.toFixed(0)} vx=${s.vx.toFixed(1)} vy=${s.vy.toFixed(1)} dv=${s.deltaV.toFixed(0)} impact=${flight.impactX.toFixed(0)} peakQ=${flight.peakQ.toFixed(0)}`,
      )
      phase = stage()
    }
  }
  log.push(`events ${JSON.stringify(flight.events)} outcome=${flight.outcome}`)
  return { flight, log: log.join('\n') }
}

describe('a run flown on the cue', () => {
  it('Flight 8 as flown: liftoff to the arms, close to the published timeline', () => {
    const { flight, log } = flyOnCue(0)
    console.log(log)
    expect(flight.outcome, log).toBe('caught')
    for (const row of FLIGHT_8) {
      const mine = flight.events[row.id]
      expect(mine, `${row.id}\n${log}`).toBeDefined()
      expect(Math.abs((mine as number) - row.seconds), `${row.id} at ${mine}\n${log}`).toBeLessThan(12)
    }
    expect(flight.state.deltaV, log).toBeGreaterThan(60)
  })
})

/** Fly on the cue with one input overridden. */
function flyWith(scenarioIndex: number, override: (cue: Input, flight: Flight) => Partial<Input>): Flight {
  const flight = startFlight(SCENARIOS[scenarioIndex])
  for (let i = 0; i < 60 * 60 * 12 && flight.phase !== 'ended'; i++) {
    const cue = guidance(flight)
    advance(flight, { ...cue, ...override(cue, flight) }, DT)
  }
  return flight
}

describe('the decisions matter', () => {
  it('full throttle through max-Q breaks the stack up', () => {
    const flight = flyWith(0, () => ({ throttle: 1 }))
    expect(flight.outcome).toBe('breakup')
    expect(flight.events.meco).toBeUndefined()
  })

  it('lighting the landing burn late reaches the arms too fast to be caught', () => {
    const flight = flyWith(0, (_cue, f) => ({ ignite: f.state.y < 900 }))
    expect(flight.events.landingStart).toBeDefined()
    expect(['hard-catch', 'missed', 'tower-strike']).toContain(flight.outcome)
  })

  it('never lighting the landing burn is its own ending, not a missed catch', () => {
    const flight = flyWith(0, () => ({ ignite: false }))
    expect(flight.events.landingStart).toBeUndefined()
    expect(flight.outcome).toBe('no-burn')
  })

  it('Flight 6: no-go on a tower fault ends in a soft splashdown offshore', () => {
    const { flight, log } = flyOnCue(2)
    expect(flight.goSent, log).toBe(false)
    expect(flight.outcome, log).toBe('splashdown')
    expect(flight.state.x, log).toBeGreaterThan(400)
  })

  it('go with a tower fault is overridden by the health checks: the booster still diverts', () => {
    const flight = flyWith(2, (_cue, f) => ({ go: true, shutdown: f.impactX <= 0 }))
    const log = JSON.stringify(flight.state)
    expect(flight.goSent, log).toBe(true)
    expect(flight.committed, log).toBe(false)
    expect(flight.outcome, log).toBe('splashdown')
  })

  it('every healthy scenario can be caught with its engines out', () => {
    for (const index of [1, 3]) {
      const { flight, log } = flyOnCue(index)
      expect(flight.outcome, `${SCENARIOS[index].id}\n${log}`).toBe('caught')
      expect(flight.state.deltaV, log).toBeGreaterThan(60)
    }
  })
})
