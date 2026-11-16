// Where the Sun stands in the sky for a place and a moment. Pure logic, no rendering.
// The NOAA solar position algorithm (Meeus, "Astronomical Algorithms", as used by the NOAA
// Solar Calculator): good to about 0.01 degrees for dates between 1901 and 2099.

const RAD = Math.PI / 180
const DEG = 180 / Math.PI

export interface SunPosition {
  /** Degrees clockwise from true north. */
  azimuth: number
  /** Degrees above the horizon, without refraction. */
  elevation: number
  /** Degrees above the horizon as seen, with standard atmospheric refraction. */
  apparentElevation: number
}

/** Atmospheric refraction near the horizon, degrees, from the NOAA calculator. */
function refraction(elevation: number): number {
  if (elevation > 85) return 0
  const te = Math.tan(elevation * RAD)
  if (elevation > 5) return (58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5) / 3600
  if (elevation > -0.575) return (1735 + elevation * (-518.2 + elevation * (103.4 + elevation * (-12.79 + elevation * 0.711)))) / 3600
  return -20.774 / te / 3600
}

/** The Sun's position at `date` seen from `latitude`, `longitude` (degrees, east positive). */
export function sunPosition(date: Date, latitude: number, longitude: number): SunPosition {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5
  const t = (jd - 2_451_545) / 36_525
  const l0 = (((280.46646 + t * (36_000.76983 + t * 0.0003032)) % 360) + 360) % 360
  const m = 357.52911 + t * (35_999.05029 - 0.0001537 * t)
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t)
  const c =
    Math.sin(m * RAD) * (1.914602 - t * (0.004817 + 0.000014 * t)) + Math.sin(2 * m * RAD) * (0.019993 - 0.000101 * t) + Math.sin(3 * m * RAD) * 0.000289
  const omega = 125.04 - 1934.136 * t
  const lambda = l0 + c - 0.00569 - 0.00478 * Math.sin(omega * RAD)
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD)
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD))
  const y = Math.tan((eps / 2) * RAD) ** 2
  const eqTime =
    4 *
    DEG *
    (y * Math.sin(2 * l0 * RAD) -
      2 * e * Math.sin(m * RAD) +
      4 * e * y * Math.sin(m * RAD) * Math.cos(2 * l0 * RAD) -
      0.5 * y * y * Math.sin(4 * l0 * RAD) -
      1.25 * e * e * Math.sin(2 * m * RAD))
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60 + date.getUTCMilliseconds() / 60_000
  const solarTime = (((minutes + eqTime + 4 * longitude) % 1440) + 1440) % 1440
  const hourAngle = (solarTime / 4 - 180) * RAD
  const lat = latitude * RAD
  const cosZenith = Math.min(1, Math.max(-1, Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle)))
  const elevation = 90 - Math.acos(cosZenith) * DEG
  const azimuth = ((Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) * DEG + 180) % 360 + 360) % 360
  return { azimuth, elevation, apparentElevation: elevation + refraction(elevation) }
}

/** The Pad 1 tower at Starbase, Texas, degrees. */
export const STARBASE = { latitude: 25.997, longitude: -97.157 }

/**
 * Flight 8, 6 March 2025. Liftoff 23:30:31 UTC (5:30:31 pm CST); the booster was caught at
 * T+7:02, 23:37:33 UTC. Liftoff time from Jonathan McDowell's launch log ("Revised launch time
 * estimate 2330:31 UTC", posted on X on the day), as recorded in Wikipedia's "Starship flight
 * test 8"; the T+7:02 catch is SpaceX's published timeline (FLIGHT_8 in data/facts.ts).
 * Checked 2026-11-16.
 */
export const FLIGHT_8_LIFTOFF = new Date(Date.UTC(2025, 2, 6, 23, 30, 31))
export const FLIGHT_8_CATCH = new Date(FLIGHT_8_LIFTOFF.getTime() + 422_000)

export type SunMode = 'flight8' | 'photo'

/**
 * The Sun for each mode: where it stood at Flight 8's catch, or where it stood when the ground
 * photograph was flown (NAIP, 14 October 2024, mid-morning: east-south-east and about 33 degrees
 * up, measured from the Pad 1 tower's 228 m shadow and its bearing), so the photograph's baked
 * shadows agree with the models.
 */
export function sunFor(mode: SunMode): { azimuth: number; elevation: number } {
  if (mode === 'photo') return { azimuth: 119, elevation: 33 }
  const p = sunPosition(FLIGHT_8_CATCH, STARBASE.latitude, STARBASE.longitude)
  return { azimuth: p.azimuth, elevation: p.apparentElevation }
}

/** Reads the mode from a query string: `?sun=photo` picks the photograph's Sun; anything else is Flight 8. */
export function sunModeFrom(search: string): SunMode {
  return new URLSearchParams(search).get('sun') === 'photo' ? 'photo' : 'flight8'
}
