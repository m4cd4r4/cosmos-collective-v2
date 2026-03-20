/**
 * Next.js Middleware
 * Generates a per-request CSP nonce and applies security headers
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Generate a cryptographically random nonce per request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Forward nonce to the app via request header (layout.tsx reads it)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // ============================================
  // Content Security Policy (nonce-based)
  // ============================================
  // 'strict-dynamic' allows scripts loaded by nonce-bearing scripts (Next.js
  // chunks, GTM child scripts, etc.) — origin allowlist is fallback for
  // browsers that don't support strict-dynamic.
  const scriptSrc = process.env.NODE_ENV === 'development'
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'wasm-unsafe-eval' https://cdnjs.cloudflare.com https://aladin.cds.unistra.fr https://www.googletagmanager.com https://www.google-analytics.com`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval' https://cdnjs.cloudflare.com https://aladin.cds.unistra.fr https://www.googletagmanager.com https://www.google-analytics.com`

  const cspDirectives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://aladin.cds.unistra.fr https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' data: blob: https://images-api.nasa.gov https://images-assets.nasa.gov https://mast.stsci.edu https://api.nasa.gov https://www.nasa.gov https://apod.nasa.gov https://casda.csiro.au https://www.zooniverse.org https://panoptes-uploads.zooniverse.org https://*.unistra.fr https://irsa.ipac.caltech.edu https://healpix.ias.u-psud.fr https://skies.esac.esa.int https://www.google-analytics.com https://api.wheretheiss.at https://services.swpc.noaa.gov https://exoplanetarchive.ipac.caltech.edu https://tle.ivanstanojevic.me",
    "frame-src 'self' https://www.youtube.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspDirectives)

  // HTTP Strict Transport Security
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  // Clickjacking protection
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')

  // MIME type sniffing prevention
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Legacy XSS protection header
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer policy (+5 Observatory bonus)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // DNS prefetch
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  return response
}

// ============================================
// Middleware Configuration
// ============================================

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
