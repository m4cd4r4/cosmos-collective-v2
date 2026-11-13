import { describe, expect, it } from 'vitest'
import { LUNAR_NORTH_POLE, equatorial, skyToWorld } from './sky'

describe('star sky', () => {
  it('puts the Moon’s south celestial pole straight overhead', () => {
    const toWorld = skyToWorld(0, -1)
    const [x, y, z] = toWorld(equatorial(LUNAR_NORTH_POLE.raDeg + 180, -LUNAR_NORTH_POLE.decDeg))

    expect(y).toBeCloseTo(1, 6)
    expect(Math.hypot(x, z)).toBeLessThan(1e-3)
  })

  it('keeps the sky the right way round, with the Sun on the side the terrain is lit from', () => {
    const toWorld = skyToWorld(0, -1, 0)
    const [x, y, z] = [toWorld([1, 0, 0]), toWorld([0, 1, 0]), toWorld([0, 0, 1])]
    // A rotation has determinant +1; a mirrored sky would give -1.
    const determinant =
      x[0] * (y[1] * z[2] - y[2] * z[1]) - x[1] * (y[0] * z[2] - y[2] * z[0]) + x[2] * (y[0] * z[1] - y[1] * z[0])
    // Ecliptic longitude 0 is the J2000 x axis, so that is where the Sun is.
    const sun = x

    expect(determinant).toBeCloseTo(1, 6)
    expect(sun[2]).toBeLessThan(-0.99)
  })
})
