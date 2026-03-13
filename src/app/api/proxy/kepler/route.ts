import { NextRequest, NextResponse } from 'next/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const NASA_TAP = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'
const QUERY = `select pl_name,hostname,pl_rade,pl_orbper,pl_eqt,pl_bmasse,pl_insol,pl_orbsmax,st_teff,st_rad,st_mass,st_lum,sy_dist,ra,dec,sy_pnum,disc_year from pscomppars where disc_facility like 'Kepler' order by hostname,pl_orbper`

let cached: { data: unknown; ts: number } | null = null
const TTL = 3600_000 // 1 hour

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request)
  const allowed = await apiLimiter.check(clientId)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT' },
    })
  }

  try {
    const url = `${NASA_TAP}?query=${encodeURIComponent(QUERY)}&format=json`
    const res = await fetch(url, { signal: AbortSignal.timeout(45_000) })

    if (!res.ok) {
      throw new Error(`NASA API returned ${res.status}`)
    }

    const data = await res.json()
    cached = { data, ts: Date.now() }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    })
  } catch (err) {
    console.error('Kepler proxy error:', err)

    // Return well-known Kepler exoplanets as fallback when NASA TAP is down
    const fallbackData = getFallbackKeplerData()
    return NextResponse.json(fallbackData, {
      headers: { 'X-Cache': 'FALLBACK' },
    })
  }
}

function getFallbackKeplerData() {
  return [
    {
      pl_name: 'Kepler-22 b',
      hostname: 'Kepler-22',
      pl_rade: 2.38,
      pl_orbper: 289.8623,
      pl_eqt: 262,
      pl_bmasse: null,
      pl_insol: 1.11,
      pl_orbsmax: 0.849,
      st_teff: 5518,
      st_rad: 0.979,
      st_mass: 0.97,
      st_lum: -0.088,
      sy_dist: 190.86,
      ra: 286.0154,
      dec: 47.8844,
      sy_pnum: 1,
      disc_year: 2011,
    },
    {
      pl_name: 'Kepler-442 b',
      hostname: 'Kepler-442',
      pl_rade: 1.34,
      pl_orbper: 112.3053,
      pl_eqt: 233,
      pl_bmasse: 2.36,
      pl_insol: 0.73,
      pl_orbsmax: 0.409,
      st_teff: 4402,
      st_rad: 0.598,
      st_mass: 0.61,
      st_lum: -0.776,
      sy_dist: 342.14,
      ra: 291.7317,
      dec: 39.2539,
      sy_pnum: 2,
      disc_year: 2015,
    },
    {
      pl_name: 'Kepler-452 b',
      hostname: 'Kepler-452',
      pl_rade: 1.63,
      pl_orbper: 384.843,
      pl_eqt: 265,
      pl_bmasse: null,
      pl_insol: 1.11,
      pl_orbsmax: 1.046,
      st_teff: 5757,
      st_rad: 1.11,
      st_mass: 1.04,
      st_lum: 0.15,
      sy_dist: 430.58,
      ra: 286.8083,
      dec: 44.2761,
      sy_pnum: 1,
      disc_year: 2015,
    },
    {
      pl_name: 'Kepler-186 f',
      hostname: 'Kepler-186',
      pl_rade: 1.17,
      pl_orbper: 129.9441,
      pl_eqt: 188,
      pl_bmasse: null,
      pl_insol: 0.29,
      pl_orbsmax: 0.432,
      st_teff: 3755,
      st_rad: 0.472,
      st_mass: 0.48,
      st_lum: -1.365,
      sy_dist: 178.48,
      ra: 296.0345,
      dec: 43.6958,
      sy_pnum: 5,
      disc_year: 2014,
    },
    {
      pl_name: 'Kepler-69 c',
      hostname: 'Kepler-69',
      pl_rade: 1.71,
      pl_orbper: 242.4613,
      pl_eqt: 299,
      pl_bmasse: null,
      pl_insol: 1.91,
      pl_orbsmax: 0.64,
      st_teff: 5638,
      st_rad: 0.93,
      st_mass: 0.81,
      st_lum: -0.14,
      sy_dist: 332.74,
      ra: 296.8017,
      dec: 44.6806,
      sy_pnum: 2,
      disc_year: 2013,
    },
    {
      pl_name: 'Kepler-62 f',
      hostname: 'Kepler-62',
      pl_rade: 1.41,
      pl_orbper: 267.291,
      pl_eqt: 208,
      pl_bmasse: null,
      pl_insol: 0.39,
      pl_orbsmax: 0.718,
      st_teff: 4925,
      st_rad: 0.64,
      st_mass: 0.69,
      st_lum: -0.59,
      sy_dist: 301.96,
      ra: 292.6345,
      dec: 45.3464,
      sy_pnum: 5,
      disc_year: 2013,
    },
    {
      pl_name: 'Kepler-62 e',
      hostname: 'Kepler-62',
      pl_rade: 1.61,
      pl_orbper: 122.3874,
      pl_eqt: 270,
      pl_bmasse: null,
      pl_insol: 1.15,
      pl_orbsmax: 0.427,
      st_teff: 4925,
      st_rad: 0.64,
      st_mass: 0.69,
      st_lum: -0.59,
      sy_dist: 301.96,
      ra: 292.6345,
      dec: 45.3464,
      sy_pnum: 5,
      disc_year: 2013,
    },
    {
      pl_name: 'Kepler-438 b',
      hostname: 'Kepler-438',
      pl_rade: 1.12,
      pl_orbper: 35.2331,
      pl_eqt: 276,
      pl_bmasse: null,
      pl_insol: 1.38,
      pl_orbsmax: 0.166,
      st_teff: 3748,
      st_rad: 0.52,
      st_mass: 0.54,
      st_lum: -1.29,
      sy_dist: 145.24,
      ra: 284.6614,
      dec: 41.9498,
      sy_pnum: 2,
      disc_year: 2015,
    },
    {
      pl_name: 'Kepler-1649 c',
      hostname: 'Kepler-1649',
      pl_rade: 1.06,
      pl_orbper: 19.535,
      pl_eqt: 234,
      pl_bmasse: null,
      pl_insol: 0.75,
      pl_orbsmax: 0.0855,
      st_teff: 3240,
      st_rad: 0.23,
      st_mass: 0.2,
      st_lum: -2.35,
      sy_dist: 92.38,
      ra: 298.3017,
      dec: 41.6556,
      sy_pnum: 2,
      disc_year: 2020,
    },
    {
      pl_name: 'Kepler-1652 b',
      hostname: 'Kepler-1652',
      pl_rade: 1.6,
      pl_orbper: 38.0998,
      pl_eqt: 268,
      pl_bmasse: null,
      pl_insol: 1.06,
      pl_orbsmax: 0.165,
      st_teff: 3638,
      st_rad: 0.42,
      st_mass: 0.4,
      st_lum: -1.65,
      sy_dist: 249.12,
      ra: 298.7381,
      dec: 46.0289,
      sy_pnum: 1,
      disc_year: 2016,
    },
  ]
}
