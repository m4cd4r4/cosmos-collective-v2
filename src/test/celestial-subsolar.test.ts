// tdd-guard:allow (backfill: checks an existing function against NOAA reference values)
import { describe, expect, it } from 'vitest'
import { getSubsolarPoint } from '@/lib/celestial'

// Reference values: declination and equation of time from the NOAA solar
// calculator. At 12:00 UTC the sub-solar longitude is -EoT/4 degrees.
describe('getSubsolarPoint', () => {
  it('June solstice 2024: Sun over the Tropic of Cancer', () => {
    const p = getSubsolarPoint(new Date(Date.UTC(2024, 5, 20, 20, 51)))
    expect(p.lat).toBeCloseTo(23.44, 1)
  })

  it('3 Nov 2024 12:00 UTC: EoT +16.4 min, dec -15.2', () => {
    const p = getSubsolarPoint(new Date(Date.UTC(2024, 10, 3, 12, 0)))
    expect(Math.abs(p.lon - -4.1)).toBeLessThan(0.3)
    expect(Math.abs(p.lat - -15.2)).toBeLessThan(0.3)
  })

  it('11 Feb 2025 12:00 UTC: EoT -14.2 min, dec -14.0', () => {
    const p = getSubsolarPoint(new Date(Date.UTC(2025, 1, 11, 12, 0)))
    expect(Math.abs(p.lon - 3.55)).toBeLessThan(0.3)
    expect(Math.abs(p.lat - -14.0)).toBeLessThan(0.5)
  })

  it('moves west 15 degrees an hour', () => {
    const a = getSubsolarPoint(new Date(Date.UTC(2026, 10, 16, 9, 0)))
    const b = getSubsolarPoint(new Date(Date.UTC(2026, 10, 16, 10, 0)))
    expect(a.lon - b.lon).toBeCloseTo(15, 0)
  })
})
