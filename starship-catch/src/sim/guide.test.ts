import { describe, expect, it } from 'vitest'
import { TUNING, startFlight } from './flight'
import { scopePoint, sinkBand, towerFromBooster } from './guide'
import { makeScenario } from './scenario'

describe('the target guide', () => {
  it('points the arrow and the scope at the tower, from wherever the booster is', () => {
    const flight = startFlight(makeScenario(3))
    flight.state = { ...flight.state, x: 640, y: 3_000 }
    expect(towerFromBooster(flight)).toEqual({ dx: -640, dh: TUNING.catchHeight - 3_000 })

    // East of the tower and above it: the dot sits right of and above the centre, which is the arms.
    const east = scopePoint(flight)
    expect(east.x).toBeGreaterThan(0)
    expect(east.y).toBeGreaterThan(0)
    expect(Math.hypot(east.x, east.y)).toBeLessThanOrEqual(1)

    flight.state = { ...flight.state, x: -640 }
    expect(scopePoint(flight).x).toBeCloseTo(-east.x)

    flight.state = { ...flight.state, x: 0, y: TUNING.catchHeight }
    expect(scopePoint(flight)).toEqual({ x: 0, y: 0 })
  })

  it('bands the sink rate against the catch limit', () => {
    expect(sinkBand(TUNING.catchSinkSpeed)).toBe('ok')
    expect(sinkBand(TUNING.catchSinkSpeed * 1.5)).toBe('warn')
    expect(sinkBand(TUNING.catchSinkSpeed * 3)).toBe('bad')
  })
})
