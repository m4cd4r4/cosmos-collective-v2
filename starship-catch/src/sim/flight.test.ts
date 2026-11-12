import { describe, expect, it } from 'vitest'
import { FLIGHT_8 } from '../data/facts'
import { DT } from './physics'
import { advance, guidance, startFlight, type Flight } from './flight'
import { SCENARIOS } from './scenario'

/** Fly a whole run on the computer's cue. `go` overrides the catch call. */
export function flyOnCue(scenarioIndex: number, go?: boolean): { flight: Flight; log: string } {
  const flight = startFlight(SCENARIOS[scenarioIndex])
  const log: string[] = []
  let phase = flight.phase
  for (let i = 0; i < 60 * 60 * 12 && flight.phase !== 'ended'; i++) {
    const cue = guidance(flight)
    if (go !== undefined) cue.go = go
    advance(flight, cue, DT)
    if (flight.phase !== phase) {
      const s = flight.state
      log.push(
        `${phase} -> ${flight.phase} t=${s.time.toFixed(1)} x=${s.x.toFixed(0)} y=${s.y.toFixed(0)} vx=${s.vx.toFixed(1)} vy=${s.vy.toFixed(1)} dv=${s.deltaV.toFixed(0)} impact=${flight.impactX.toFixed(0)} peakQ=${flight.peakQ.toFixed(0)}`,
      )
      phase = flight.phase
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
