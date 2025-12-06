/**
 * GCN (Gamma-ray Coordinates Network) API Proxy
 * Fetches recent GCN circulars from NASA GCN
 */

import { NextRequest, NextResponse } from 'next/server'

// GCN circulars can be fetched individually via JSON endpoint
const GCN_BASE = 'https://gcn.nasa.gov/circulars'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5')

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
    // Try to fetch a known recent circular to verify the endpoint works
    // Then estimate the latest ID based on current date
    // GCN circulars are numbered sequentially, roughly ~43000 as of Dec 2025
    const estimatedLatest = 43010 // Approximate current ID

    // Verify this ID exists
    const response = await fetch(`${GCN_BASE}/${estimatedLatest}.json`, {
      headers: { 'Accept': 'application/json' }
    })

    if (response.ok) {
      return estimatedLatest
    }

    // If not found, try a slightly lower ID
    for (let id = estimatedLatest; id > estimatedLatest - 20; id--) {
      const checkResponse = await fetch(`${GCN_BASE}/${id}.json`, {
        headers: { 'Accept': 'application/json' }
      })
      if (checkResponse.ok) {
        return id
      }
    }

    return null
  } catch {
    return null
  }
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
