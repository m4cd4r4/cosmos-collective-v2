import { describe, expect, it } from 'vitest'
import { DT } from './physics'
import { advance, startFlight } from './flight'
import { makeScenario } from './scenario'
import { pilot } from './pilot'
import { scoreCatch } from './score'

describe('the catch score', () => {
  it('scores a clean catch out of 100, and scores nothing that was not caught', () => {
    const caught = startFlight(makeScenario(2))
    while (!caught.outcome) advance(caught, pilot(caught), DT)
    const score = scoreCatch(caught)
    expect(score).not.toBeNull()
    expect(score!.total).toBeGreaterThan(50)
    expect(score!.total).toBeLessThanOrEqual(100)

    const crashed = startFlight(makeScenario(2))
    while (!crashed.outcome) advance(crashed, { throttle: 0, steer: 0, ignite: false }, DT)
    expect(scoreCatch(crashed)).toBeNull()
  })
})
