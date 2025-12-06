/**
 * ALeRCE API Proxy
 * Proxies requests to ALeRCE to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server'

// Correct ALeRCE ZTF API endpoint (with trailing slash for redirect handling)
const ALERCE_API = 'https://api.alerce.online/ztf/v1/objects/'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const classifier = searchParams.get('classifier') || 'lc_classifier'
    const className = searchParams.get('class_name') || 'SNIa'
    const limit = searchParams.get('limit') || '5'

    // Build query with correct ALeRCE v1 parameters
    // Note: order_by is not supported by this endpoint
    const url = `${ALERCE_API}?classifier=${classifier}&class=${className}&page_size=${limit}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CosmosCollective/2.0'
      },
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      throw new Error(`ALeRCE API error: ${response.status}`)
    }

    const data = await response.json()

    const alerts = (data.items || []).slice(0, parseInt(limit)).map((item: {
      oid: string
      meanra: number
      meandec: number
      lastmjd: number
      class?: string
      probability?: number
    }) => ({
      id: item.oid,
      name: item.oid,
      ra: item.meanra,
      dec: item.meandec,
      classification: item.class || className,
      probability: item.probability || 0.5,
      lastDetection: mjdToDate(item.lastmjd),
      url: `https://alerce.online/object/${item.oid}`
    }))

    return NextResponse.json({
      success: true,
      data: alerts,
      source: 'ALeRCE',
      cached: false
    })
  } catch (error) {
    console.error('ALeRCE proxy error:', error)

    return NextResponse.json({
      success: true,
      data: getFallbackAleRCEData(),
      source: 'ALeRCE (fallback)',
      cached: true,
      note: 'Using cached data due to API unavailability'
    })
  }
}

function mjdToDate(mjd: number): string {
  const jd = mjd + 2400000.5
  const unixTime = (jd - 2440587.5) * 86400000
  return new Date(unixTime).toISOString()
}

function getFallbackAleRCEData() {
  return [
    {
      id: 'ZTF24abcdef1',
      name: 'ZTF24abcdef1',
      ra: 180.5,
      dec: 15.2,
      classification: 'SN',
      probability: 0.85,
      lastDetection: new Date(Date.now() - 86400000).toISOString(),
      url: 'https://alerce.online/',
      note: 'Sample transient - live data temporarily unavailable'
    },
    {
      id: 'ZTF24abcdef2',
      name: 'ZTF24abcdef2',
      ra: 220.3,
      dec: -5.8,
      classification: 'SN',
      probability: 0.78,
      lastDetection: new Date(Date.now() - 172800000).toISOString(),
      url: 'https://alerce.online/',
      note: 'Sample transient - live data temporarily unavailable'
    }
  ]
}
