import { describe, it, expect } from 'vitest'
import { sunSceneDirection } from '@/lib/satellites/sun'

describe('sunSceneDirection', () => {
  it('puts the sub-solar point where an independent tracker says it is', () => {
    // wheretheiss.at, timestamp 1792160050 (2026-10-16): solar_lat -9.0255, solar_lon 322.84
    // (i.e. 37.16 W). Captured by hand while checking this build.
    const [x, y, z] = sunSceneDirection(new Date(1792160050 * 1000))
    const lat = (Math.asin(y) * 180) / Math.PI
    const lon = (Math.atan2(-z, x) * 180) / Math.PI
    expect(Math.abs(lat - -9.0255)).toBeLessThan(0.5)
    expect(Math.abs(lon - -37.16)).toBeLessThan(0.5)
  })
})
