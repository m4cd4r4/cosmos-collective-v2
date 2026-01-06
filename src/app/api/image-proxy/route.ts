/**
 * Image Proxy API
 * Proxies NASA and other external images through our server
 * Provides retry logic, caching, and fallback handling
 */

import { NextRequest, NextResponse } from 'next/server'

// Placeholder image (1x1 cosmic gradient)
const PLACEHOLDER_IMAGE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88/7jfwAJbQPbFQ5R2AAAAABJRU5ErkJggg==',
  'base64'
)

const ALLOWED_DOMAINS = [
  'images-assets.nasa.gov',
  'images-api.nasa.gov',
  'www.nasa.gov',
  'apod.nasa.gov',
  'mast.stsci.edu',
  'casda.csiro.au',
]

// Check if domain is allowed
function isAllowedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ALLOWED_DOMAINS.some(domain => urlObj.hostname.includes(domain))
  } catch {
    return false
  }
}

// Fetch with retry logic
async function fetchWithRetry(
  url: string,
  maxRetries = 2,
  timeout = 10000
): Promise<Response> {
  let lastError: Error | null = null

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Cosmos-Collective/2.0 (Educational Platform)',
          'Accept': 'image/*',
        },
        // Cache for 24 hours
        next: { revalidate: 86400 },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return response
      }

      // Don't retry on 404
      if (response.status === 404) {
        throw new Error(`Image not found: ${response.status}`)
      }

    } catch (error) {
      lastError = error as Error

      // Don't retry on abort (timeout)
      if (lastError.name === 'AbortError' && i < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        continue
      }
    }
  }

  throw lastError || new Error('Failed to fetch image')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const width = searchParams.get('w')

    if (!imageUrl) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Decode URL
    const decodedUrl = decodeURIComponent(imageUrl)

    // Security: Check if domain is allowed
    if (!isAllowedDomain(decodedUrl)) {
      return new NextResponse('Domain not allowed', { status: 403 })
    }

    // Fetch image with retry logic
    const response = await fetchWithRetry(decodedUrl)

    // Get image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Return proxied image with caching headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        'CDN-Cache-Control': 'public, max-age=604800',
        'Vercel-CDN-Cache-Control': 'public, max-age=604800',
        'X-Proxied-From': new URL(decodedUrl).hostname,
      },
    })

  } catch (error) {
    console.error('Image proxy error:', error)

    // Return placeholder image on error
    return new NextResponse(PLACEHOLDER_IMAGE, {
      status: 200, // Return 200 so Next.js Image doesn't retry
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'X-Proxy-Error': 'true',
      },
    })
  }
}

// Enable edge runtime for faster response
export const runtime = 'edge'
