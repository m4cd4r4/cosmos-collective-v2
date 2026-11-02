// @vitest-environment node
// tdd-guard:allow - backfilled onto the cron and visitor routes, written first.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { BlobNotFoundError, head, put } from '@vercel/blob'
import fallback from '@/data/satellites-stations-fallback.json'
import { GET as cronGet } from '@/app/api/cron/satellites/route'
import { GET as visitorGet } from '@/app/api/satellites/route'

vi.mock('@vercel/blob', () => ({ BlobNotFoundError: class extends Error {}, head: vi.fn(), put: vi.fn() }))

const NOW = Date.parse('2026-11-02T00:10:00Z')
const BLOB_URL = 'https://blob.test/satellites/active.json'
/** Enough valid records to clear the 100-row floor. */
const CELESTRAK_BODY = Array.from({ length: 150 }, () => (fallback as object[])[0])
const STORED = { fetchedAt: '2026-11-02T00:10:00.000Z', source: 'live', rows: Array.from({ length: 150 }, () => []) }

const fetchMock = vi.fn()
const cronRequest = (token = 'test-secret') =>
  new NextRequest('https://x.test/api/cron/satellites', { headers: { authorization: `Bearer ${token}` } })
const visitorRequest = () => new NextRequest('https://x.test/api/satellites')
const celestrakCalls = () => fetchMock.mock.calls.filter(([url]) => String(url).includes('celestrak'))

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('CRON_SECRET', 'test-secret')
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] })
  fetchMock.mockReset()
  vi.mocked(head).mockReset()
  vi.mocked(put).mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('cron refresh', () => {
  it('refuses a wrong token and a missing CRON_SECRET', async () => {
    expect((await cronGet(cronRequest('wrong'))).status).toBe(401)
    vi.stubEnv('CRON_SECRET', '')
    expect((await cronGet(cronRequest(''))).status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('stores CelesTrak rows in Blob', async () => {
    vi.mocked(head).mockRejectedValue(new BlobNotFoundError())
    fetchMock.mockResolvedValue(new Response(JSON.stringify(CELESTRAK_BODY)))

    const res = await cronGet(cronRequest())

    expect(await res.json()).toEqual({ status: 'stored', rows: 150 })
    const body = JSON.parse(vi.mocked(put).mock.calls[0][1] as string)
    expect(body.source).toBe('live')
    expect(body.fetchedAt).toBe(new Date(NOW).toISOString())
    expect(body.rows).toHaveLength(150)
  })

  it('does not call CelesTrak again when a repeat cron event arrives', async () => {
    vi.mocked(head).mockResolvedValue({ url: BLOB_URL, uploadedAt: new Date(NOW - 5 * 60_000) } as never)

    const res = await cronGet(cronRequest())

    expect(await res.json()).toEqual({ status: 'skipped', ageMinutes: 5 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    ['a 403', () => fetchMock.mockResolvedValue(new Response('', { status: 403 }))],
    ['a timeout', () => fetchMock.mockRejectedValue(new DOMException('timed out', 'TimeoutError'))],
    ['too few rows', () => fetchMock.mockResolvedValue(new Response('[]'))],
  ])('keeps the stored copy and reports failure on %s', async (_name, arrange) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(head).mockResolvedValue({ url: BLOB_URL, uploadedAt: new Date(NOW - 3 * 3_600_000) } as never)
    arrange()

    const res = await cronGet(cronRequest())

    expect(res.status).toBe(502)
    expect(put).not.toHaveBeenCalled()
  })
})

describe('visitor route', () => {
  it('serves the stored copy without calling CelesTrak', async () => {
    vi.mocked(head).mockResolvedValue({ url: BLOB_URL, uploadedAt: new Date(NOW) } as never)
    fetchMock.mockResolvedValue(new Response(JSON.stringify(STORED)))

    const res = await visitorGet(visitorRequest())

    expect(res.headers.get('X-Cache')).toBe('STORED')
    expect((await res.json()).source).toBe('live')
    expect(celestrakCalls()).toHaveLength(0)
  })

  it('falls back to the last good copy when Blob fails, still without CelesTrak', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(head).mockResolvedValue({ url: BLOB_URL, uploadedAt: new Date(NOW) } as never)
    fetchMock.mockResolvedValue(new Response('', { status: 500 }))

    const res = await visitorGet(visitorRequest())

    expect(res.headers.get('X-Cache')).toBe('STALE')
    expect(celestrakCalls()).toHaveLength(0)
  })
})

describe('visitor route on a fresh instance', () => {
  it('serves the bundled snapshot when nothing is stored', async () => {
    vi.resetModules()
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(head).mockRejectedValue(new BlobNotFoundError())
    const { GET } = await import('@/app/api/satellites/route')

    const res = await GET(visitorRequest())

    expect(res.headers.get('X-Cache')).toBe('SNAPSHOT')
    expect((await res.json()).source).toBe('snapshot')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(errorLog).not.toHaveBeenCalled()
  })

  it('logs a Blob failure such as a missing token, instead of passing it off as empty', async () => {
    vi.resetModules()
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
    errorLog.mockClear()
    vi.mocked(head).mockRejectedValue(new Error('No token found'))
    const { GET } = await import('@/app/api/satellites/route')

    const res = await GET(visitorRequest())

    expect(res.headers.get('X-Cache')).toBe('SNAPSHOT')
    expect(errorLog).toHaveBeenCalledOnce()
  })
})
