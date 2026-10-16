/**
 * Orbit-class helpers for the satellite app. Pure functions of the two GP
 * elements that decide a class: mean motion (rev/day) and eccentricity.
 */

export type OrbitClass = 'LEO' | 'MEO' | 'GEO' | 'HEO'

export const EARTH_RADIUS_KM = 6378.137
const MU = 398600.4418 // km^3/s^2
const SECONDS_PER_DAY = 86400

/** Highly eccentric orbits (Molniya, Tundra, GTO) read as HEO whatever their period. */
const HEO_ECCENTRICITY = 0.25
/** Upper edge of low Earth orbit by apogee altitude, km. */
const LEO_CEILING_KM = 2000
/** Mean motion band around one sidereal day (1.0027 rev/day) counted as geosynchronous. */
const GEO_MOTION_MIN = 0.9
const GEO_MOTION_MAX = 1.1

export function semiMajorAxisKm(meanMotion: number): number {
  const n = (meanMotion * 2 * Math.PI) / SECONDS_PER_DAY // rad/s
  return Math.cbrt(MU / (n * n))
}

export function altitudesKm(meanMotion: number, eccentricity: number) {
  const a = semiMajorAxisKm(meanMotion)
  return {
    perigee: a * (1 - eccentricity) - EARTH_RADIUS_KM,
    apogee: a * (1 + eccentricity) - EARTH_RADIUS_KM,
  }
}

export function classifyOrbit(meanMotion: number, eccentricity: number): OrbitClass {
  if (eccentricity > HEO_ECCENTRICITY) return 'HEO'
  const { apogee } = altitudesKm(meanMotion, eccentricity)
  if (apogee < LEO_CEILING_KM) return 'LEO'
  if (meanMotion >= GEO_MOTION_MIN && meanMotion <= GEO_MOTION_MAX) return 'GEO'
  // Between LEO and GEO is MEO; anything higher than GEO (graveyard orbits) is HEO.
  return meanMotion > GEO_MOTION_MAX ? 'MEO' : 'HEO'
}

export const ORBIT_CLASS_INFO: Record<OrbitClass, { label: string; range: string; color: string }> = {
  LEO: { label: 'Low Earth Orbit', range: 'below 2,000 km', color: '#4a90e2' },
  MEO: { label: 'Medium Earth Orbit', range: '2,000 to 35,000 km', color: '#d4af37' },
  GEO: { label: 'Geostationary', range: 'about 35,786 km', color: '#ff6b6b' },
  HEO: { label: 'Highly Elliptical', range: 'eccentric, reaches beyond GEO', color: '#b388ff' },
}
