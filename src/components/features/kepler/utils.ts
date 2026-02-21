import type { KeplerPlanetRow, Planet, PlanetCategory, StarSystem } from './types'

// ── Temperature → CSS color (blackbody approximation) ─────────────────────
export function tempToColor(t: number | null): string {
  if (!t || t <= 0) return '#ffd700'
  if (t < 2800)  return '#ff2200'
  if (t < 3200)  return '#ff3800'
  if (t < 3700)  return '#ff5500'
  if (t < 4200)  return '#ff7700'
  if (t < 4800)  return '#ff9a00'
  if (t < 5300)  return '#ffbe00'
  if (t < 5800)  return '#ffd700'
  if (t < 6200)  return '#ffe870'
  if (t < 6800)  return '#fff4c0'
  if (t < 8000)  return '#e0ecff'
  if (t < 11000) return '#c0d8ff'
  return '#9bb8ff'
}

export function tempToRGB(t: number | null): [number, number, number] {
  const h = tempToColor(t)
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ]
}

export function tempToSpectral(t: number | null): string {
  if (!t) return '?'
  if (t < 3700)  return 'M'
  if (t < 5200)  return 'K'
  if (t < 6000)  return 'G'
  if (t < 7500)  return 'F'
  if (t < 10000) return 'A'
  return 'B'
}

// ── Planet category ────────────────────────────────────────────────────────
export function planetCategory(r: number | null): PlanetCategory {
  if (!r) return 'unknown'
  if (r <= 1.25) return 'earth'
  if (r <= 2.0)  return 'superearth'
  if (r <= 6.0)  return 'neptune'
  return 'jupiter'
}

export const PLANET_COLORS: Record<PlanetCategory, string> = {
  earth:      '#7fff7f',
  superearth: '#7fd4ff',
  neptune:    '#7f9fff',
  jupiter:    '#ffaf7f',
  unknown:    '#aaaaaa',
}

// ── Habitable zone check (insolation flux relative to Earth) ───────────────
export function isInHZ(insol: number | null): boolean {
  return insol != null && insol >= 0.25 && insol <= 1.75
}

// ── Group raw planet rows by host star ────────────────────────────────────
export function groupByHost(rows: KeplerPlanetRow[]): StarSystem[] {
  const map = new Map<string, StarSystem>()

  for (const r of rows) {
    if (!map.has(r.hostname)) {
      map.set(r.hostname, {
        name: r.hostname,
        ra: r.ra,
        dec: r.dec,
        teff: r.st_teff,
        srad: r.st_rad,
        smass: r.st_mass,
        slum: r.st_lum,
        dist: r.sy_dist,
        pnum: r.sy_pnum,
        planets: [],
        color: tempToColor(r.st_teff),
        hasEarth: false,
        hasHZ: false,
        minPeriod: Infinity,
        minYear: Infinity,
        x: 0,
        y: 0,
        drawR: 2,
      })
    }

    const star = map.get(r.hostname)!
    const planet: Planet = {
      name: r.pl_name,
      rade: r.pl_rade,
      period: r.pl_orbper,
      eqt: r.pl_eqt,
      mass: r.pl_bmasse,
      insol: r.pl_insol,
      smax: r.pl_orbsmax,
      year: r.disc_year,
      cat: planetCategory(r.pl_rade),
      hz: isInHZ(r.pl_insol),
    }
    star.planets.push(planet)
    if (planet.hz) star.hasHZ = true
    if (planet.cat === 'earth') star.hasEarth = true
    if (planet.period && planet.period < star.minPeriod) star.minPeriod = planet.period
    if (planet.year && planet.year < star.minYear) star.minYear = planet.year
  }

  return Array.from(map.values())
}

// ── Coordinate projections ─────────────────────────────────────────────────
const KEPLER_RA  = 291.0  // degrees
const KEPLER_DEC = 44.5   // degrees

export function skyProjection(ra: number, dec: number, W: number, H: number) {
  const cosD = Math.cos((KEPLER_DEC * Math.PI) / 180)
  const dRA  = (ra - KEPLER_RA) * cosD
  const dDec = dec - KEPLER_DEC
  const scale = Math.min(W, H) * 0.38
  return {
    x: W / 2 + dRA  * (scale / 12),
    y: H / 2 - dDec * (scale / 8),
  }
}

export function galaxyProjection(
  ra: number,
  dec: number,
  dist: number | null,
  W: number,
  H: number,
) {
  if (!dist) return skyProjection(ra, dec, W, H)
  const ra_r  = (ra  * Math.PI) / 180
  const dec_r = (dec * Math.PI) / 180
  const x3 = dist * Math.cos(dec_r) * Math.cos(ra_r)
  const y3 = dist * Math.cos(dec_r) * Math.sin(ra_r)
  const scale = Math.min(W, H) / 3800
  return { x: W / 2 + y3 * scale, y: H / 2 - x3 * scale }
}

export function hrProjection(
  teff: number | null,
  slum: number | null,
  srad: number | null,
  W: number,
  H: number,
) {
  const pad = 55
  const t = teff ?? 5500
  let L = slum
  if (!L && srad) L = Math.pow(srad, 2) * Math.pow(t / 5778, 4)
  if (!L) L = 1
  const tx = 1 - (t - 2500) / (12000 - 2500)
  const ly = (Math.log10(Math.max(L, 0.001)) - (-2.5)) / (4 - (-2.5))
  return {
    x: pad + Math.max(0, Math.min(1, tx)) * (W - 2 * pad),
    y: H - pad - Math.max(0, Math.min(1, ly)) * (H - 2 * pad),
  }
}
