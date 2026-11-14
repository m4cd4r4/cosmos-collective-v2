// Test helper: fly a whole run on the flight computer's cue.

import { DT } from './physics'
import { advance, guidance, startFlight, type Flight } from './flight'
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
