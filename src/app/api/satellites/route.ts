import { NextRequest, NextResponse } from 'next/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rate-limit'
import { compactGp, isValidGp, type GpRecord, type SatellitePayload } from '@/lib/satellites/gp'
import { readStored } from '@/lib/satellites/store'
import fallback from '@/data/satellites-stations-fallback.json'

/**
 * Serves the copy the cron route keeps in Blob (see lib/satellites/store.ts). This
 * route never calls CelesTrak. If Blob cannot be read it serves the last good payload,
 * then the bundled stations snapshot.
 */

export const dynamic = 'force-dynamic'

let lastGood: SatellitePayload | null = null

function snapshot(): SatellitePayload {
  return {
    fetchedAt: new Date(0).toISOString(),
    source: 'snapshot',
    rows: (fallback as GpRecord[]).filter(isValidGp).map(compactGp),
  }
}

function respond(payload: SatellitePayload, cache: string) {
  // Good data may sit in shared caches for a while; anything degraded must not.
  const ttl = cache === 'STORED' ? 600 : 120
  return NextResponse.json(payload, {
    headers: {
      'X-Cache': cache,
      'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${cache === 'STORED' ? 3600 : 60}`,
    },
  })
}

export async function GET(request: NextRequest) {
  const allowed = await apiLimiter.check(getClientIdentifier(request))
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const stored = await readStored()
    if (stored) {
      lastGood = stored
      return respond(stored, 'STORED')
    }
  } catch (err) {
    console.error('Satellites store error:', err)
  }
  return respond(lastGood ?? snapshot(), lastGood ? 'STALE' : 'SNAPSHOT')
}
