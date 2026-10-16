import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { apiLimiter, getClientIdentifier } from '@/lib/rate-limit'
import { compactGp, isValidGp, type GpRecord, type SatellitePayload } from '@/lib/satellites/gp'
import fallback from '@/data/satellites-stations-fallback.json'

/**
 * Proxy for CelesTrak's ACTIVE group (one request covers every constellation,
 * so nothing overlaps). The browser never calls CelesTrak: its policy allows one
 * download per 2-hourly update per client, answers repeats with 403, and
 * firewalls IPs that keep going after a non-200. So this route:
 *   - shares one fetch across instances via the Next data cache,
 *   - keeps the last good payload in memory and on disk as a stale fallback,
 *   - after ANY non-200 or network error, stops calling CelesTrak for a cooldown
 *     and serves stale data (or the bundled stations snapshot) instead.
 */

const CELESTRAK_ACTIVE = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=JSON'
/** CelesTrak updates every 2 h; the margin keeps each of our fetches in a new update window. */
const REVALIDATE_SECONDS = 2 * 60 * 60 + 10 * 60
const COOLDOWN_MS = 30 * 60 * 1000
const DISK_CACHE = path.join(os.tmpdir(), 'cosmos-satellites-last-good.json')

export const revalidate = 7800

let lastGood: SatellitePayload | null = null
let blockedUntil = 0

function snapshot(): SatellitePayload {
  return {
    fetchedAt: new Date(0).toISOString(),
    source: 'snapshot',
    rows: (fallback as GpRecord[]).filter(isValidGp).map(compactGp),
  }
}

async function readDisk(): Promise<SatellitePayload | null> {
  try {
    const p = JSON.parse(await fs.readFile(DISK_CACHE, 'utf8')) as SatellitePayload
    return p.source === 'live' && Array.isArray(p.rows) && p.rows.length > 100 ? p : null
  } catch {
    return null
  }
}

function respond(payload: SatellitePayload, cache: string) {
  // Good data may sit in shared caches for a full update cycle; anything degraded must not.
  const ttl = cache === 'MISS' ? 7200 : 120
  return NextResponse.json(payload, {
    headers: {
      'X-Cache': cache,
      'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${cache === 'MISS' ? 3600 : 60}`,
    },
  })
}

async function degraded() {
  lastGood ??= await readDisk()
  return respond(lastGood ?? snapshot(), lastGood ? 'STALE' : 'SNAPSHOT')
}

export async function GET(request: NextRequest) {
  const allowed = await apiLimiter.check(getClientIdentifier(request))
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  if (Date.now() < blockedUntil) return degraded()

  try {
    const res = await fetch(CELESTRAK_ACTIVE, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) throw new Error(`CelesTrak returned ${res.status}`)

    const raw = (await res.json()) as Partial<GpRecord>[]
    const rows = raw.filter(isValidGp).map(compactGp)
    if (rows.length < 100) throw new Error(`CelesTrak returned only ${rows.length} usable records`)

    // A response served from the shared data cache keeps its original Date header,
    // so this is when CelesTrak was actually asked, not when this request arrived.
    const asked = Date.parse(res.headers.get('date') ?? '')
    lastGood = { fetchedAt: new Date(Number.isFinite(asked) ? asked : Date.now()).toISOString(), source: 'live', rows }
    fs.writeFile(DISK_CACHE, JSON.stringify(lastGood)).catch(() => {})
    return respond(lastGood, 'MISS')
  } catch (err) {
    blockedUntil = Date.now() + COOLDOWN_MS
    console.error('Satellites proxy error:', err)
    return degraded()
  }
}
