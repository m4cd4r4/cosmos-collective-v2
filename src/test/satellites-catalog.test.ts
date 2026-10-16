import { describe, it, expect } from 'vitest'
import fallback from '@/data/satellites-stations-fallback.json'
import { compactGp, isValidGp, type GpRecord } from '@/lib/satellites/gp'
import { buildCatalog, stateOf, ISS_NORAD } from '@/lib/satellites/catalog'

describe('ISS position from the bundled snapshot', () => {
  it('matches an independent tracker (wheretheiss.at) at the same instant', () => {
    const catalog = buildCatalog((fallback as GpRecord[]).filter(isValidGp).map(compactGp))
    const i = catalog.indexByNorad.get(ISS_NORAD)!
    expect(i).toBeDefined()

    // wheretheiss.at, timestamp 1792160050: lat -13.0908, lon 170.0944, alt 422.11 km.
    // Captured by hand on 2026-10-16 while checking this build; elements are the
    // bundled snapshot (epoch 2026-10-15), so the comparison is repeatable.
    const s = stateOf(catalog, i, new Date(1792160050 * 1000))!
    expect(s.lat).toBeCloseTo(-13.09, 0)
    expect(Math.abs(s.lon - 170.09)).toBeLessThan(0.3)
    expect(Math.abs(s.altitudeKm - 422.11)).toBeLessThan(3)
  })
})
