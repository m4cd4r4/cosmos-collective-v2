import { eciToEcf, gstime } from 'satellite.js'
import { getSunDirection } from '@/lib/celestial'
import { ecefToScene } from './catalog'
import { EARTH_RADIUS_KM } from './orbit'

const OBLIQUITY = (23.4393 * Math.PI) / 180

/** Unit vector to the Sun in the satellite scene frame (Earth-fixed, Y-up). */
export function sunSceneDirection(date: Date): [number, number, number] {
  // celestial.ts frame: +X vernal equinox, +Y ecliptic north, in-plane second axis is +Z.
  const [ex, en, ey] = getSunDirection(date)
  const eci = {
    x: ex,
    y: ey * Math.cos(OBLIQUITY) - en * Math.sin(OBLIQUITY),
    z: ey * Math.sin(OBLIQUITY) + en * Math.cos(OBLIQUITY),
  }
  const ecf = eciToEcf(eci, gstime(date))
  // ecefToScene expects km; the Sun direction is a unit vector, so scale it back up.
  const out: [number, number, number] = [0, 0, 0]
  ecefToScene(ecf.x * EARTH_RADIUS_KM, ecf.y * EARTH_RADIUS_KM, ecf.z * EARTH_RADIUS_KM, out, 0)
  return out
}
