/**
 * Low-precision Sun and Moon ephemeris for the landing hero.
 *
 * Based on Paul Schlyter's "How to compute planetary positions"
 * (stjarnhimlen.se/comp/ppcomp.html). Accuracy is ~1 arcminute for the Sun
 * and ~2 arcminutes for the Moon - far more than a hero scene needs, and
 * precise enough that the Moon's illuminated phase reads correctly.
 *
 * Directions are returned as unit vectors in a geocentric ecliptic frame:
 *   +X = towards the vernal equinox, +Y = ecliptic north, +Z completes it.
 * The Earth sits at the origin; the Moon and Sun directions share this frame,
 * so lighting the Moon from the Sun direction reproduces the real phase.
 */

const DEG = Math.PI / 180
const rev = (x: number) => ((x % 360) + 360) % 360
const sind = (d: number) => Math.sin(d * DEG)
const cosd = (d: number) => Math.cos(d * DEG)

/**
 * Schlyter day number: days since this algorithm's epoch, 2000 Jan 0.0
 * (1999-12-31 00:00 UT). The orbital-element constants below are calibrated
 * to that epoch, not J2000 (2000-01-01 12:00 UT). Feeding a J2000-based value
 * is 1.5 days short and shifts the fast-moving Moon by ~19 deg - about 1.5
 * days of phase - so the epoch must match Schlyter's.
 */
function schlyterDay(date: Date): number {
  return (date.getTime() - Date.UTC(1999, 11, 31, 0, 0, 0)) / 86_400_000
}

/** Geocentric ecliptic longitude of the Sun, degrees. */
function sunLongitude(d: number): number {
  const w = 282.9404 + 4.70935e-5 * d
  const e = 0.016709 - 1.151e-9 * d
  const M = rev(356.047 + 0.9856002585 * d)
  const E = M + e * (180 / Math.PI) * sind(M) * (1 + e * cosd(M))
  const x = cosd(E) - e
  const y = sind(E) * Math.sqrt(1 - e * e)
  const v = Math.atan2(y, x) / DEG
  return rev(v + w)
}

/** Geocentric ecliptic longitude and latitude of the Moon, degrees. */
function moonLonLat(d: number): { lon: number; lat: number } {
  const N = rev(125.1228 - 0.0529538083 * d)
  const i = 5.1454
  const w = rev(318.0634 + 0.1643573223 * d)
  const e = 0.0549
  const M = rev(115.3654 + 13.0649929509 * d)

  // Eccentric anomaly (a couple of Newton iterations - Moon's e is sizeable)
  let E = M + e * (180 / Math.PI) * sind(M) * (1 + e * cosd(M))
  for (let k = 0; k < 3; k++) {
    E = E - (E - e * (180 / Math.PI) * sind(E) - M) / (1 - e * cosd(E))
  }

  const xv = cosd(E) - e
  const yv = Math.sqrt(1 - e * e) * sind(E)
  const v = rev(Math.atan2(yv, xv) / DEG)
  const r = Math.sqrt(xv * xv + yv * yv)

  const xe = r * (cosd(N) * cosd(v + w) - sind(N) * sind(v + w) * cosd(i))
  const ye = r * (sind(N) * cosd(v + w) + cosd(N) * sind(v + w) * cosd(i))
  const ze = r * sind(v + w) * sind(i)

  let lon = rev(Math.atan2(ye, xe) / DEG)
  let lat = Math.atan2(ze, Math.sqrt(xe * xe + ye * ye)) / DEG

  // Main periodic perturbations (keep the phase and position honest)
  const Ls = sunLongitude(d)
  const Ms = rev(356.047 + 0.9856002585 * d)
  const Lm = rev(N + w + M)
  const D = rev(Lm - Ls)
  const F = rev(Lm - N)
  lon +=
    -1.274 * sind(M - 2 * D) +
    0.658 * sind(2 * D) -
    0.186 * sind(Ms) -
    0.059 * sind(2 * M - 2 * D) -
    0.057 * sind(M - 2 * D + Ms) +
    0.053 * sind(M + 2 * D) +
    0.046 * sind(2 * D - Ms) +
    0.041 * sind(M - Ms) -
    0.035 * sind(D) -
    0.031 * sind(M + Ms)
  lat +=
    -0.173 * sind(F - 2 * D) -
    0.055 * sind(M - F - 2 * D) -
    0.046 * sind(M + F - 2 * D) +
    0.033 * sind(F + 2 * D) +
    0.017 * sind(2 * M + F)

  return { lon: rev(lon), lat }
}

/** Convert ecliptic (lon, lat) in degrees to a unit vector in the frame above. */
function eclipticToVec(lon: number, lat: number): [number, number, number] {
  return [cosd(lat) * cosd(lon), sind(lat), cosd(lat) * sind(lon)]
}

export function getSunDirection(date: Date): [number, number, number] {
  return eclipticToVec(sunLongitude(schlyterDay(date)), 0)
}

export function getMoonDirection(date: Date): [number, number, number] {
  const { lon, lat } = moonLonLat(schlyterDay(date))
  return eclipticToVec(lon, lat)
}

export interface MoonIllumination {
  /** Illuminated fraction of the disc, 0 (new) to 1 (full). */
  fraction: number
  /** True while the Moon is waxing (illumination increasing). */
  waxing: boolean
  /** Human-readable phase name. */
  phaseName: string
  /** Sun-Moon elongation in degrees, 0-360. */
  elongationDeg: number
}

export function getMoonIllumination(date: Date): MoonIllumination {
  const d = schlyterDay(date)
  const elong = rev(moonLonLat(d).lon - sunLongitude(d))
  const fraction = (1 - cosd(elong)) / 2
  const waxing = elong < 180

  let phaseName: string
  if (fraction < 0.02) phaseName = 'New moon'
  else if (fraction > 0.98) phaseName = 'Full moon'
  else if (Math.abs(fraction - 0.5) < 0.06) phaseName = waxing ? 'First quarter' : 'Last quarter'
  else if (fraction < 0.5) phaseName = waxing ? 'Waxing crescent' : 'Waning crescent'
  else phaseName = waxing ? 'Waxing gibbous' : 'Waning gibbous'

  return { fraction, waxing, phaseName, elongationDeg: elong }
}
