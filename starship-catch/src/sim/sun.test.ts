// Backfilled onto sun.ts and air.ts against published reference values. tdd-guard:allow
import { describe, expect, it } from 'vitest'
import { FLIGHT_8_CATCH, FLIGHT_8_LIFTOFF, STARBASE, sunFor, sunModeFrom, sunPosition } from './sun'
import { RAYLEIGH, RAYLEIGH_HEIGHT, transmittance } from '../scene/air'

describe('sunPosition', () => {
  it('matches the NREL SPA worked example (Reda and Andreas 2004)', () => {
    // 17 October 2003, 12:30:30 local time (UTC-7), Golden, Colorado. SPA gives a topocentric
    // zenith of 50.11162 degrees (with refraction) and an azimuth of 194.34024 degrees.
    const p = sunPosition(new Date(Date.UTC(2003, 9, 17, 19, 30, 30)), 39.742476, -105.1786)
    expect(Math.abs(p.apparentElevation - (90 - 50.11162))).toBeLessThan(0.05)
    expect(Math.abs(p.azimuth - 194.34024)).toBeLessThan(0.05)
  })

  it('puts the Sun low in the west-south-west at the Flight 8 catch', () => {
    expect(FLIGHT_8_LIFTOFF.toISOString()).toBe('2025-03-06T23:30:31.000Z')
    expect(FLIGHT_8_CATCH.toISOString()).toBe('2025-03-06T23:37:33.000Z')
    const p = sunPosition(FLIGHT_8_CATCH, STARBASE.latitude, STARBASE.longitude)
    expect(p.elevation).toBeGreaterThan(8)
    expect(p.elevation).toBeLessThan(16)
    expect(p.azimuth).toBeGreaterThan(250)
    expect(p.azimuth).toBeLessThan(268)
  })

  it('sets at Starbase about an hour after the catch', () => {
    const later = new Date(FLIGHT_8_CATCH.getTime() + 75 * 60_000)
    expect(sunPosition(later, STARBASE.latitude, STARBASE.longitude).apparentElevation).toBeLessThan(0)
  })
})

describe('sun modes', () => {
  it('defaults to Flight 8 and switches to the photograph only when asked', () => {
    expect(sunModeFrom('')).toBe('flight8')
    expect(sunModeFrom('?sun=flight8')).toBe('flight8')
    expect(sunModeFrom('?seed=4&sun=photo')).toBe('photo')
    expect(sunFor('photo')).toEqual({ azimuth: 119, elevation: 33 })
  })
})

describe('transmittance', () => {
  it('lets through the textbook share of sunlight from the zenith at sea level', () => {
    const [r, g, b] = transmittance(0, 90)
    // Rayleigh alone takes out exp(-beta * H); haze and ozone take a little more.
    expect(b).toBeLessThan(Math.exp(-RAYLEIGH[2] * RAYLEIGH_HEIGHT))
    expect(b).toBeGreaterThan(Math.exp(-RAYLEIGH[2] * RAYLEIGH_HEIGHT) - 0.03)
    expect(r).toBeGreaterThan(g)
    expect(g).toBeGreaterThan(b)
  })

  it('reddens towards the horizon and clears with height', () => {
    const low = transmittance(0, 5)
    expect(low[0] / low[2]).toBeGreaterThan(2)
    expect(transmittance(10_000, 5)[2]).toBeGreaterThan(low[2])
    expect(transmittance(0, -2)).toEqual([0, 0, 0])
  })
})
