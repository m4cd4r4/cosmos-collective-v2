// tdd-guard:allow - table-driven backfill. The implementation was verified first
// against published eclipse dates in a scratch script; these cases pin that
// verification into the suite rather than inventing expected behaviour.
import { describe, it, expect } from 'vitest'
import { getMoonPhasesForYear, isSupermoon, SUPERMOON_DISTANCE_KM } from '@/lib/moon-phase'
import { getLunarEvents } from '@/services/real-time-events'

const iso = (d: Date) => d.toISOString().slice(0, 10)

/**
 * Anchors are eclipse dates, which fix a new or full moon to the day and are
 * published independently of this code (NASA GSFC eclipse catalogue, and
 * timeanddate.com for the plain phases).
 */
const ANCHORS: Array<[number, 'new-moon' | 'full-moon', string, string]> = [
  [2026, 'full-moon', '2026-01-03', 'Wolf Moon; the old table said 13 Jan'],
  [2026, 'new-moon', '2026-02-17', 'annular solar eclipse'],
  [2026, 'full-moon', '2026-03-03', 'total lunar eclipse'],
  [2026, 'new-moon', '2026-08-12', 'total solar eclipse'],
  [2026, 'full-moon', '2026-08-28', 'partial lunar eclipse'],
  [2025, 'new-moon', '2025-03-29', 'partial solar eclipse'],
  [2025, 'full-moon', '2025-09-07', 'total lunar eclipse'],
  [2024, 'new-moon', '2024-04-08', 'total solar eclipse'],
  [2027, 'new-moon', '2027-08-02', 'total solar eclipse'],
]

describe('getMoonPhasesForYear', () => {
  it.each(ANCHORS)('%i: %s falls on %s (%s)', (year, phase, date) => {
    const hits = getMoonPhasesForYear(year)
      .filter(p => p.phase === phase)
      .map(p => iso(p.date))
    expect(hits).toContain(date)
  })

  it('returns 12 or 13 full moons and 12 or 13 new moons per year', () => {
    for (const year of [2024, 2025, 2026, 2027, 2030]) {
      const phases = getMoonPhasesForYear(year)
      const full = phases.filter(p => p.phase === 'full-moon').length
      const nu = phases.filter(p => p.phase === 'new-moon').length
      expect(full).toBeGreaterThanOrEqual(12)
      expect(full).toBeLessThanOrEqual(13)
      expect(nu).toBeGreaterThanOrEqual(12)
      expect(nu).toBeLessThanOrEqual(13)
    }
  })

  it('spaces consecutive full moons by roughly one synodic month', () => {
    const full = getMoonPhasesForYear(2026).filter(p => p.phase === 'full-moon')
    for (let i = 1; i < full.length; i++) {
      const days = (full[i].date.getTime() - full[i - 1].date.getTime()) / 86400000
      expect(days).toBeGreaterThan(29.1)
      expect(days).toBeLessThan(30.0)
    }
  })

  it('keeps the geocentric distance inside the real perigee/apogee range', () => {
    for (const p of getMoonPhasesForYear(2026)) {
      expect(p.distanceKm).toBeGreaterThan(356_000)
      expect(p.distanceKm).toBeLessThan(407_000)
    }
  })

  it('flags a supermoon only on a full moon inside the threshold', () => {
    const supers = getMoonPhasesForYear(2026).filter(isSupermoon)
    for (const p of supers) {
      expect(p.phase).toBe('full-moon')
      expect(p.distanceKm).toBeLessThanOrEqual(SUPERMOON_DISTANCE_KM)
    }
  })
})

describe('getLunarEvents', () => {
  it('no longer carries the year-swapped 13 January full moon', () => {
    const jan = getLunarEvents(2026).filter(e => e.date.startsWith('2026-01'))
    expect(jan.map(e => e.date)).toContain('2026-01-03')
    expect(jan.map(e => e.date)).not.toContain('2026-01-13')
  })

  it('names each full moon after its calendar month', () => {
    const march = getLunarEvents(2026).find(e => e.date === '2026-03-03')
    expect(march?.name).toContain('Worm Moon')
  })

  it('reports a distance on every event', () => {
    for (const e of getLunarEvents(2026)) {
      expect(e.distanceKm).toBeGreaterThan(0)
    }
  })

  it('labels a second full moon in one month a blue moon', () => {
    // 2026 has two full moons in May (1 May and 31 May)
    const may = getLunarEvents(2026).filter(
      e => e.date.startsWith('2026-05') && e.type !== 'new-moon',
    )
    expect(may).toHaveLength(2)
    expect(may[1].type).toBe('blue-moon')
  })
})
