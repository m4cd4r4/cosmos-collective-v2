/**
 * NASA API Proxy
 * Keeps NASA_API_KEY server-side instead of exposing via NEXT_PUBLIC_
 * Proxies APOD and NEO requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rate-limit'

const NASA_API_KEY = process.env.NASA_API_KEY ?? process.env.NEXT_PUBLIC_NASA_API_KEY ?? 'DEMO_KEY'

const ENDPOINTS: Record<string, string> = {
  apod: `https://api.nasa.gov/planetary/apod`,
  neo: `https://api.nasa.gov/neo/rest/v1/feed`,
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const allowed = await apiLimiter.check(clientId)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')

  if (!endpoint || !ENDPOINTS[endpoint]) {
    return NextResponse.json(
      { error: 'Invalid endpoint. Use ?endpoint=apod or ?endpoint=neo' },
      { status: 400 },
    )
  }

  try {
    const baseUrl = ENDPOINTS[endpoint]
    const params = new URLSearchParams({ api_key: NASA_API_KEY })

    // Forward relevant query params (excluding our internal ones)
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'endpoint') {
        params.set(key, value)
      }
    }

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `NASA API returned ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': endpoint === 'apod'
          ? 'public, s-maxage=3600, stale-while-revalidate=7200'
          : 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'NASA API request timed out' },
        { status: 504 },
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch from NASA API' },
      { status: 502 },
    )
  }
}
