/**
 * Cosmos Collective - Root Layout
 * Provides global structure, fonts, metadata, and providers
 */

import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from './providers'
import { SkipToContent } from '@/components/accessibility/SkipToContent'
import GoogleAnalytics from '@/components/GoogleAnalytics'

// Lazy load Starfield (WebGL animation) to reduce initial bundle
const Starfield = dynamic(() => import('@/components/ui/Starfield').then(mod => ({ default: mod.Starfield })), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-cosmos-void" />
})

// Lazy load Web Vitals (performance monitoring)
const WebVitals = dynamic(() => import('@/components/analytics/WebVitals').then(mod => ({ default: mod.WebVitals })), {
  ssr: false,
})

// Lazy load Mission Control FAB (client-only)
const MissionControlFAB = dynamic(() => import('@/components/ui/MissionControlFAB').then(mod => ({ default: mod.MissionControlFAB })), {
  ssr: false,
})

// ============================================
// Font Configuration
// ============================================

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

// ============================================
// Metadata
// ============================================

export const metadata: Metadata = {
  title: {
    default: 'Cosmos Collective | Multi-Spectrum Astronomical Explorer',
    template: '%s | Cosmos Collective',
  },
  description:
    'Explore the universe through JWST, Australian radio telescopes, and real-time space data. A multi-wavelength journey through space featuring live events, interactive sky maps, and exoplanet exploration.',
  keywords: [
    'JWST',
    'James Webb Space Telescope',
    'astronomy',
    'space',
    'ASKAP',
    'SKA',
    'radio astronomy',
    'galaxies',
    'nebulae',
    'exoplanets',
    'CSIRO',
    'Australian telescopes',
  ],
  authors: [{ name: 'Cosmos Collective' }],
  creator: 'Cosmos Collective',
  publisher: 'Cosmos Collective',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://cosmos-collective.com.au',
    siteName: 'Cosmos Collective',
    title: 'Cosmos Collective | Multi-Spectrum Astronomical Explorer',
    description:
      'Explore the universe through JWST, Australian radio telescopes, and real-time space data.',
    images: [
      {
        url: 'https://cosmos-collective.com.au/images/social-preview.png',
        width: 1280,
        height: 640,
        alt: 'Cosmos Collective - Explore the Universe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmos Collective | Multi-Spectrum Astronomical Explorer',
    description:
      'Explore the universe through JWST, Australian radio telescopes, and real-time space data.',
    images: ['https://cosmos-collective.com.au/images/social-preview.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://cosmos-collective.com.au',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0e1a' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0e1a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

// ============================================
// Root Layout Component
// ============================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Critical Resource Hints - Preconnect for immediate needs */}
        <link rel="preconnect" href="https://images-api.nasa.gov" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images-assets.nasa.gov" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mast.stsci.edu" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://aladin.cds.unistra.fr" crossOrigin="anonymous" />

        {/* DNS Prefetch - Lower priority external domains */}
        <link rel="dns-prefetch" href="https://api.nasa.gov" />
        <link rel="dns-prefetch" href="https://www.nasa.gov" />
        <link rel="dns-prefetch" href="https://apod.nasa.gov" />
        <link rel="dns-prefetch" href="https://casda.csiro.au" />

        {/* Color scheme for system UI */}
        <meta name="color-scheme" content="dark" />

        {/* PWA meta tags */}
        <meta name="application-name" content="Cosmos Collective" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cosmos" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0a0e1a" />

        {/* JSON-LD Structured Data - Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Cosmos Collective',
              url: 'https://cosmos-collective.com.au',
              description: 'Multi-spectrum astronomical data exploration platform featuring JWST, Kepler exoplanet data, Australian radio telescopes, and real-time space events.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://cosmos-collective.com.au/explore?search={search_term_string}'
                },
                'query-input': 'required name=search_term_string'
              },
              publisher: {
                '@type': 'Organization',
                name: 'Cosmos Collective',
                url: 'https://cosmos-collective.com.au',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://cosmos-collective.com.au/icon.svg'
                },
                sameAs: [
                  'https://github.com/m4cd4r4/cosmos-collective-v2'
                ]
              },
              about: [
                {
                  '@type': 'Thing',
                  name: 'James Webb Space Telescope',
                  sameAs: 'https://www.nasa.gov/mission_pages/webb/main/index.html'
                },
                {
                  '@type': 'Thing',
                  name: 'Radio Astronomy',
                  sameAs: 'https://en.wikipedia.org/wiki/Radio_astronomy'
                },
                {
                  '@type': 'Thing',
                  name: 'Exoplanet Research',
                  sameAs: 'https://exoplanetarchive.ipac.caltech.edu'
                }
              ]
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Skip to content link for keyboard navigation */}
        <SkipToContent />

        {/* Animated starfield background */}
        <Starfield />

        {/* Google Analytics */}
        <GoogleAnalytics />

        {/* Web Vitals Performance Monitoring */}
        <WebVitals />

        {/* App providers (React Query, Auth, etc.) */}
        <Providers>
          {/* Main content area */}
          <div id="main-content" className="relative min-h-screen grain-overlay">
            {children}
          </div>
          <MissionControlFAB />
        </Providers>

        {/* Announcer for screen readers */}
        <div
          id="announcer"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </body>
    </html>
  )
}
