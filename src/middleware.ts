/**
 * Next.js Middleware
 * Adds security headers to all responses
 * Improves security score and protects against common vulnerabilities
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Clone the response
  const response = NextResponse.next()

  // ============================================
  // Security Headers
  // ============================================

  // Content Security Policy (CSP)
  // Allows our own content, NASA/astronomy APIs, and necessary CDNs
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://aladin.cds.unistra.fr https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://aladin.cds.unistra.fr https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://images-api.nasa.gov https://images-assets.nasa.gov https://mast.stsci.edu https://api.nasa.gov https://www.nasa.gov https://apod.nasa.gov https://casda.csiro.au https://www.zooniverse.org https://panoptes-uploads.zooniverse.org https://aladin.cds.unistra.fr https://www.google-analytics.com",
    "frame-src 'self' https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspDirectives)

  // HTTP Strict Transport Security (HSTS)
  // Force HTTPS for 2 years, including subdomains
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  // X-Frame-Options
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY')

  // X-Content-Type-Options
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // X-XSS-Protection
  // Enable browser XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer-Policy
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions-Policy
  // Control browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // X-DNS-Prefetch-Control
  // Enable DNS prefetching for performance
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  return response
}

// ============================================
// Middleware Configuration
// ============================================

export const config = {
  // Apply middleware to all routes except:
  // - API routes (they set their own headers)
  // - Static files (_next/static)
  // - Image optimization (_next/image)
  // - Favicon and other public files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
