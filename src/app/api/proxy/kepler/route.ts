import { NextResponse } from 'next/server'

const NASA_TAP = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'
const QUERY = `select pl_name,hostname,pl_rade,pl_orbper,pl_eqt,pl_bmasse,pl_insol,pl_orbsmax,st_teff,st_rad,st_mass,st_lum,sy_dist,ra,dec,sy_pnum,disc_year from pscomppars where disc_facility like 'Kepler' order by hostname,pl_orbper`

let cached: { data: unknown; ts: number } | null = null
const TTL = 3600_000 // 1 hour

export async function GET() {
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
    return NextResponse.json(
      { error: 'Failed to fetch Kepler data from NASA' },
      { status: 502 },
    )
  }
}
