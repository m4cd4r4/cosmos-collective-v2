// tdd-guard:allow - table-driven anchors. The expected classes are published
// independently of this code (ISS/Starlink LEO, GPS/Galileo MEO, geostationary
// comsats GEO, Molniya HEO); the implementation was checked against them first.
import { describe, it, expect } from 'vitest'
import { classifyOrbit, altitudesKm } from '@/lib/satellites/orbit'

/** Mean-motion/eccentricity pairs are typical CelesTrak GP values for each craft. */
describe('classifyOrbit', () => {
  it.each([
    ['ISS', 15.488, 0.0007, 'LEO'],
    ['Starlink shell', 15.06, 0.0002, 'LEO'],
    ['GPS Block III', 2.0056, 0.0102, 'MEO'],
    ['Galileo', 1.7046, 0.0003, 'MEO'],
    ['Geostationary comsat', 1.0027, 0.0002, 'GEO'],
    ['Molniya', 2.0058, 0.7412, 'HEO'],
    ['GTO rocket body', 2.25, 0.73, 'HEO'],
  ] as const)('%s is %s', (_name, meanMotion, ecc, expected) => {
    expect(classifyOrbit(meanMotion, ecc)).toBe(expected)
  })
})

describe('altitudesKm', () => {
  it('puts the ISS perigee/apogee near 400 km', () => {
    const { perigee, apogee } = altitudesKm(15.488, 0.0007)
    expect(perigee).toBeGreaterThan(380)
    expect(apogee).toBeLessThan(440)
    expect(apogee).toBeGreaterThan(perigee)
  })

  it('puts a geostationary craft near 35,786 km', () => {
    const { perigee, apogee } = altitudesKm(1.0027379, 0)
    expect(perigee).toBeGreaterThan(35700)
    expect(apogee).toBeLessThan(35900)
  })
})
