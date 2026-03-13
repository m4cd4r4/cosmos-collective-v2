/**
 * GCN (Gamma-ray Coordinates Network) API Proxy
 * Fetches recent GCN circulars from NASA GCN
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rate-limit'

// GCN circulars can be fetched individually via JSON endpoint
const GCN_BASE = 'https://gcn.nasa.gov/circulars'

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request)
  const allowed = await apiLimiter.check(clientId)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '5', 10) || 5, 1), 100)

    // First, get the latest circular ID by fetching the main page
    // We'll start from a recent known ID and work backwards
    const latestId = await getLatestCircularId()

    if (!latestId) {
      throw new Error('Could not determine latest circular ID')
    }

    // Fetch multiple recent circulars
    const circulars = await fetchRecentCirculars(latestId, limit)

    return NextResponse.json({
      success: true,
      data: circulars,
      source: 'GCN',
      cached: false
    })
  } catch (error) {
    console.error('GCN proxy error:', error)

    // Return fallback data
    return NextResponse.json({
      success: true,
      data: getFallbackGCNData(),
      source: 'GCN (fallback)',
      cached: true,
      note: 'Using cached data due to API unavailability'
    })
  }
}

async function getLatestCircularId(): Promise<number | null> {
  try {
    // Try dynamic discovery first: fetch the circulars listing page to find the latest ID
    const discoveryResponse = await fetch(`${GCN_BASE}?limit=1`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })

    if (discoveryResponse.ok) {
      const body = await discoveryResponse.json()

      // The API returns an array of circulars or an object with items
      let latestId: number | null = null

      if (Array.isArray(body) && body.length > 0) {
        latestId = body[0].circularId ?? body[0].id ?? null
      } else if (body?.items && Array.isArray(body.items) && body.items.length > 0) {
        latestId = body.items[0].circularId ?? body.items[0].id ?? null
      }

      if (latestId && typeof latestId === 'number') {
        return latestId
      }

      // If the response was HTML or unexpected JSON, try parsing text for a circular number
      if (!latestId) {
        const text = typeof body === 'string' ? body : JSON.stringify(body)
        const match = text.match(/circularId["\s:]+(\d{4,6})/)
        if (match) {
          return parseInt(match[1], 10)
        }
      }
    }
  } catch {
    // Dynamic discovery failed, fall through to estimate
  }

  // Fallback: estimate based on ~44000+ as of early 2026, then probe for a valid ID
  const estimatedLatest = 44500

  try {
    // Binary-style search: try the estimate, then walk down to find a valid one
    for (let id = estimatedLatest; id > estimatedLatest - 50; id--) {
      const checkResponse = await fetch(`${GCN_BASE}/${id}.json`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      })
      if (checkResponse.ok) {
        return id
      }
    }
  } catch {
    // Probe failed entirely
  }

  return null
}

async function fetchRecentCirculars(latestId: number, limit: number) {
  const circulars = []

  for (let id = latestId; id > latestId - limit * 2 && circulars.length < limit; id--) {
    try {
      const response = await fetch(`${GCN_BASE}/${id}.json`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 }
      })

      if (response.ok) {
        const data = await response.json()
        circulars.push({
          id: data.circularId,
          title: data.subject || 'GCN Circular',
          submitter: data.submitter || 'Unknown',
          date: data.createdOn ? new Date(data.createdOn).toISOString() : new Date().toISOString(),
          url: `${GCN_BASE}/${data.circularId}`,
          excerpt: data.body ? data.body.substring(0, 200) + '...' : undefined,
          eventId: data.eventId
        })
      }
    } catch {
      // Skip failed fetches
    }
  }

  return circulars
}

// Fallback data when API is unavailable
function getFallbackGCNData() {
  return [
    {
      id: 'gcn-fallback-1',
      title: 'GRB Detection Alert',
      submitter: 'NASA GCN Network',
      date: new Date().toISOString(),
      url: 'https://gcn.nasa.gov/circulars',
      note: 'Live data temporarily unavailable'
    }
  ]
}
