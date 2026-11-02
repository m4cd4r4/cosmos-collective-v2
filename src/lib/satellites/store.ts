import { BlobNotFoundError, head, put } from '@vercel/blob'
import { compactGp, isValidGp, type GpRecord, type SatellitePayload } from '@/lib/satellites/gp'

/**
 * The stored copy of CelesTrak's ACTIVE group. Only the cron route calls CelesTrak:
 * its policy allows one download per 2-hourly update per client, answers repeats
 * with 403, and firewalls IPs that keep going after a non-200. Visitors read Blob,
 * so a slow or refused CelesTrak call only delays the next refresh.
 */

const CELESTRAK_ACTIVE = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=JSON'
const BLOB_PATH = 'satellites/active.json'
/** Nobody waits on this request, so it can outlast a slow CelesTrak response. */
const FETCH_TIMEOUT_MS = 90_000
/** Vercel can deliver a cron event twice; the schedule is 2 h, so anything newer is a repeat. */
const MIN_REFRESH_GAP_MS = 110 * 60 * 1000

export type RefreshResult = { status: 'stored'; rows: number } | { status: 'skipped'; ageMinutes: number }

/** Null only when nothing is stored yet; a missing token or a Blob outage throws. */
async function storedMeta() {
  try {
    return await head(BLOB_PATH)
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null
    throw err
  }
}

export async function readStored(): Promise<SatellitePayload | null> {
  const meta = await storedMeta()
  if (!meta) return null
  const res = await fetch(meta.url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Blob returned ${res.status}`)
  const payload = (await res.json()) as SatellitePayload
  return payload.source === 'live' && Array.isArray(payload.rows) && payload.rows.length > 100 ? payload : null
}

export async function refreshStored(now = Date.now()): Promise<RefreshResult> {
  const meta = await storedMeta()
  const age = meta ? now - new Date(meta.uploadedAt).getTime() : Infinity
  if (age < MIN_REFRESH_GAP_MS) return { status: 'skipped', ageMinutes: Math.round(age / 60_000) }

  const res = await fetch(CELESTRAK_ACTIVE, { cache: 'no-store', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!res.ok) throw new Error(`CelesTrak returned ${res.status}`)

  const raw = (await res.json()) as Partial<GpRecord>[]
  const rows = raw.filter(isValidGp).map(compactGp)
  if (rows.length < 100) throw new Error(`CelesTrak returned only ${rows.length} usable records`)

  const payload: SatellitePayload = { fetchedAt: new Date(now).toISOString(), source: 'live', rows }
  await put(BLOB_PATH, JSON.stringify(payload), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  })
  return { status: 'stored', rows: rows.length }
}
