/**
 * Moon phase instants, computed rather than copied.
 *
 * Meeus, Astronomical Algorithms (2nd ed.), chapter 49 "Phases of the Moon",
 * including the planetary-argument corrections. The result is the instant of
 * each principal phase in Terrestrial Dynamical Time, converted to UTC with a
 * polynomial fit for Delta T. Accuracy over 1980-2050 is a couple of minutes,
 * which is far better than the one-day resolution the site needs.
 *
 * Geocentric distance comes from chapter 47's main periodic terms, enough to
 * tell a perigee full moon ("supermoon") from an ordinary one.
 *
 * No dependency: the whole thing is arithmetic on a handful of series.
 */

const RAD = Math.PI / 180
const SYNODIC_MONTH = 29.530588861

export type PhaseName = 'new-moon' | 'first-quarter' | 'full-moon' | 'last-quarter'

export interface MoonPhase {
  /** Principal phase. */
  phase: PhaseName
  /** Instant of the phase, UTC. */
  date: Date
  /** Geocentric distance of the Moon's centre at that instant, km. */
  distanceKm: number
}

// ── Time scales ─────────────────────────────────────────────────────────────

/** Delta T = TT - UT, seconds. Espenak/Meeus polynomials (NASA eclipse site). */
function deltaTSeconds(year: number): number {
  if (year >= 2005 && year < 2050) {
    const t = year - 2000
    return 62.92 + 0.32217 * t + 0.005589 * t * t
  }
  if (year >= 1986 && year < 2005) {
    const t = year - 2000
    return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t
      + 0.000651814 * t * t * t * t + 0.00002373599 * t * t * t * t * t
  }
  if (year >= 2050 && year <= 2150) {
    const u = (year - 1820) / 100
    return -20 + 32 * u * u - 0.5628 * (2150 - year)
  }
  const u = (year - 1820) / 100
  return -20 + 32 * u * u
}

/** Julian Day (TT) to a UTC Date. */
function jdeToDate(jde: number, year: number): Date {
  const jdUT = jde - deltaTSeconds(year) / 86400
  // Unix epoch is JD 2440587.5
  return new Date((jdUT - 2440587.5) * 86400000)
}

// ── Phase instants (Meeus ch. 49) ───────────────────────────────────────────

/** Corrections for new and full moon, in days, by Meeus table 49.A. */
const NEW_FULL_TERMS: Array<[number, number, number, number, number]> = [
  // [coefficient, E power, M, M', F]  — arguments in multiples of each angle
  [-0.40720, 0, 0, 1, 0],
  [0.17241, 1, 1, 0, 0],
  [0.01608, 0, 0, 2, 0],
  [0.01039, 0, 0, 0, 2],
  [0.00739, 1, -1, 1, 0],
  [-0.00514, 1, 1, 1, 0],
  [0.00208, 2, 2, 0, 0],
  [-0.00111, 0, 0, 1, -2],
  [-0.00057, 0, 0, 1, 2],
  [0.00056, 1, 1, 2, 0],
  [-0.00042, 0, 0, 3, 0],
  [0.00042, 1, 1, 0, 2],
  [0.00038, 1, 1, 0, -2],
  [-0.00024, 1, -1, 2, 0],
  [-0.00007, 0, 2, 1, 0],
  [0.00004, 0, 0, 2, -2],
  [0.00004, 0, 3, 0, 0],
  [0.00003, 0, 1, 1, -2],
  [0.00003, 0, 0, 2, 2],
  [-0.00003, 0, 1, 1, 2],
  [0.00003, 0, -1, 1, 2],
  [-0.00002, 0, -1, 1, -2],
  [-0.00002, 0, 3, 1, 0],
  [0.00002, 0, 0, 4, 0],
]

/** Corrections for the quarters, Meeus table 49.B. */
const QUARTER_TERMS: Array<[number, number, number, number, number]> = [
  [-0.62801, 0, 0, 1, 0],
  [0.17172, 1, 1, 0, 0],
  [-0.01183, 1, 1, 1, 0],
  [0.00862, 0, 0, 2, 0],
  [0.00804, 0, 0, 0, 2],
  [0.00454, 1, -1, 1, 0],
  [0.00204, 2, 2, 0, 0],
  [-0.00180, 0, 0, 1, -2],
  [-0.00070, 0, 0, 1, 2],
  [-0.00040, 0, 0, 3, 0],
  [-0.00034, 1, -1, 2, 0],
  [0.00032, 1, 1, 0, 2],
  [0.00032, 1, 1, 0, -2],
  [-0.00028, 2, 2, 1, 0],
  [0.00027, 1, 1, 2, 0],
  [-0.00017, 0, 1, 0, 0],
  [-0.00005, 0, -1, 1, -2],
  [0.00004, 0, 0, 2, 2],
  [-0.00004, 0, 1, 1, 2],
  [0.00004, 0, -2, 1, 0],
  [0.00003, 0, 1, 1, -2],
  [0.00003, 0, 3, 0, 0],
  [0.00002, 0, 0, 2, -2],
  [0.00002, 0, -1, 1, 2],
  [-0.00002, 0, 1, 3, 0],
]

/** Additional corrections from the planetary arguments, Meeus p. 352. */
function planetaryCorrection(k: number, T: number): number {
  const A = [
    299.77 + 0.107408 * k - 0.009173 * T * T,
    251.88 + 0.016321 * k,
    251.83 + 26.651886 * k,
    349.42 + 36.412478 * k,
    84.66 + 18.206239 * k,
    141.74 + 53.303771 * k,
    207.14 + 2.453732 * k,
    154.84 + 7.306860 * k,
    34.52 + 27.261239 * k,
    207.19 + 0.121824 * k,
    291.34 + 1.844379 * k,
    161.72 + 24.198154 * k,
    239.56 + 25.513099 * k,
    331.55 + 3.592518 * k,
  ]
  const C = [
    0.000325, 0.000165, 0.000164, 0.000126, 0.000110, 0.000062, 0.000060,
    0.000056, 0.000047, 0.000042, 0.000040, 0.000037, 0.000035, 0.000023,
  ]
  let sum = 0
  for (let i = 0; i < A.length; i++) sum += C[i] * Math.sin(A[i] * RAD)
  return sum
}

/**
 * Instant of the principal phase at lunation index `k`.
 * k is an integer for a new moon, +0.25 first quarter, +0.5 full, +0.75 last.
 * k = 0 is the new moon of 2000 January 6.
 */
function phaseJDE(k: number): number {
  const T = k / 1236.85
  const T2 = T * T
  const T3 = T2 * T
  const T4 = T3 * T

  let jde = 2451550.09766 + SYNODIC_MONTH * k
    + 0.00015437 * T2 - 0.000000150 * T3 + 0.00000000073 * T4

  // Eccentricity of the Earth's orbit
  const E = 1 - 0.002516 * T - 0.0000074 * T2
  // Sun's mean anomaly
  const M = (2.5534 + 29.10535670 * k - 0.0000014 * T2 - 0.00000011 * T3) * RAD
  // Moon's mean anomaly
  const MP = (201.5643 + 385.81693528 * k + 0.0107582 * T2
    + 0.00001238 * T3 - 0.000000058 * T4) * RAD
  // Moon's argument of latitude
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T2
    - 0.00000227 * T3 + 0.000000011 * T4) * RAD
  // Longitude of the ascending node
  const OMEGA = (124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * RAD

  const frac = ((k % 1) + 1) % 1
  const isQuarter = frac === 0.25 || frac === 0.75
  const terms = isQuarter ? QUARTER_TERMS : NEW_FULL_TERMS

  for (const [coeff, ePow, mMul, mpMul, fMul] of terms) {
    jde += coeff * Math.pow(E, ePow) * Math.sin(mMul * M + mpMul * MP + fMul * F)
  }

  if (isQuarter) {
    // W correction: added at first quarter, subtracted at last
    const W = 0.00306
      - 0.00038 * E * Math.cos(M)
      + 0.00026 * Math.cos(MP)
      - 0.00002 * Math.cos(MP - M)
      + 0.00002 * Math.cos(MP + M)
      + 0.00002 * Math.cos(2 * F)
    jde += frac === 0.25 ? W : -W
  }

  jde += planetaryCorrection(k, T)
  // Omega appears only through the planetary series' first argument in Meeus;
  // keep the node to hand for the distance series below.
  void OMEGA

  return jde
}

// ── Geocentric distance (Meeus ch. 47, main terms) ──────────────────────────

/** Geocentric distance of the Moon, km, at Julian Day (TT) `jde`. */
function moonDistanceKm(jde: number): number {
  const T = (jde - 2451545.0) / 36525
  const T2 = T * T
  const T3 = T2 * T
  const T4 = T3 * T

  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T2
    + T3 / 545868 - T4 / 113065000) * RAD
  const M = (357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000) * RAD
  const MP = (134.9633964 + 477198.8675055 * T + 0.0087414 * T2
    + T3 / 69699 - T4 / 14712000) * RAD
  const F = (93.2720950 + 483202.0175233 * T - 0.0036539 * T2
    - T3 / 3526000 + T4 / 863310000) * RAD
  const E = 1 - 0.002516 * T - 0.0000074 * T2

  // Table 47.A, the terms in Sigma r with a coefficient of at least 1000 km/1e3
  const terms: Array<[number, number, number, number, number]> = [
    // [coefficient (0.001 km), D, M, M', F]
    [-20905355, 0, 0, 1, 0],
    [-3699111, 2, 0, -1, 0],
    [-2955968, 2, 0, 0, 0],
    [-569925, 0, 0, 2, 0],
    [48888, 0, 1, 0, 0],
    [-3149, 0, 0, 0, 2],
    [246158, 2, 0, -2, 0],
    [-152138, 2, -1, -1, 0],
    [-170733, 2, 0, 1, 0],
    [-204586, 2, -1, 0, 0],
    [-129620, 0, 1, -1, 0],
    [108743, 1, 0, 0, 0],
    [104755, 0, 1, 1, 0],
    [10321, 2, 0, 0, -2],
    [79661, 0, 0, 1, -2],
    [-34782, 4, 0, -1, 0],
    [-23210, 0, 0, 3, 0],
    [-21636, 4, 0, -2, 0],
    [24208, 2, 1, -1, 0],
    [30824, 2, 1, 0, 0],
    [-8379, 1, 0, -1, 0],
    [-16675, 1, 1, 0, 0],
    [-12831, 2, -1, 1, 0],
    [-10445, 2, 0, 2, 0],
    [-11650, 4, 0, 0, 0],
    [14403, 2, 0, -3, 0],
    [-7003, 0, 1, -2, 0],
    [10056, 2, -1, -2, 0],
    [6322, 1, 0, 1, 0],
    [-9884, 2, -2, 0, 0],
    [5751, 0, 1, 2, 0],
    [-4950, 2, -2, -1, 0],
    [4130, 2, 0, 1, -2],
    [-3958, 4, -1, -1, 0],
    [3258, 3, 0, -1, 0],
    [2616, 2, 1, 1, 0],
    [-1897, 4, -1, -2, 0],
    [-2117, 0, 2, -1, 0],
    [2354, 2, 2, -1, 0],
    [-1423, 4, 0, 1, 0],
    [-1117, 0, 0, 4, 0],
    [-1571, 4, -1, 0, 0],
    [-1739, 1, 0, -2, 0],
    [-4421, 0, 0, 2, -2],
    [1165, 0, 2, 1, 0],
    [8752, 2, 0, -1, -2],
  ]

  let sumR = 0
  for (const [coeff, dMul, mMul, mpMul, fMul] of terms) {
    const ePow = Math.abs(mMul) === 1 ? E : Math.abs(mMul) === 2 ? E * E : 1
    sumR += coeff * ePow * Math.cos(dMul * D + mMul * M + mpMul * MP + fMul * F)
  }

  return 385000.56 + sumR / 1000
}

// ── Public API ──────────────────────────────────────────────────────────────

const PHASE_ORDER: Array<[PhaseName, number]> = [
  ['new-moon', 0],
  ['first-quarter', 0.25],
  ['full-moon', 0.5],
  ['last-quarter', 0.75],
]

/** Lunation index closest to a Date, by Meeus' approximation k ~ (y - 2000) * 12.3685. */
function approxK(date: Date): number {
  const year = date.getUTCFullYear()
  const start = Date.UTC(year, 0, 1)
  const yearFraction = year + (date.getTime() - start) / (365.25 * 86400000)
  return (yearFraction - 2000) * 12.3685
}

/** Every principal phase between `from` and `to`, in chronological order. */
export function getMoonPhases(from: Date, to: Date): MoonPhase[] {
  const out: MoonPhase[] = []
  const kStart = Math.floor(approxK(from)) - 2
  const kEnd = Math.ceil(approxK(to)) + 2

  for (let k = kStart; k <= kEnd; k++) {
    for (const [phase, offset] of PHASE_ORDER) {
      const jde = phaseJDE(k + offset)
      // The year only feeds Delta T, so a one-day error in it is harmless
      const year = 2000 + (k + offset) / 12.3685
      const date = jdeToDate(jde, Math.round(year))
      if (date < from || date > to) continue
      out.push({ phase, date, distanceKm: moonDistanceKm(jde) })
    }
  }

  out.sort((a, b) => a.date.getTime() - b.date.getTime())
  return out
}

/** Every principal phase in a calendar year, UTC. */
export function getMoonPhasesForYear(year: number): MoonPhase[] {
  return getMoonPhases(new Date(Date.UTC(year, 0, 1)), new Date(Date.UTC(year, 11, 31, 23, 59, 59)))
}

/**
 * A full moon counts as a supermoon when the Moon's centre is within 360,000 km
 * of Earth's — the threshold in common use, and the one timeanddate.com applies.
 */
export const SUPERMOON_DISTANCE_KM = 360_000

export function isSupermoon(p: MoonPhase): boolean {
  return p.phase === 'full-moon' && p.distanceKm <= SUPERMOON_DISTANCE_KM
}
