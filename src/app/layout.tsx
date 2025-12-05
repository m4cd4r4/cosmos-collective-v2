/**
 * Cosmos Collective - Root Layout
 * Provides global structure, fonts, metadata, and providers
 */

import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from './providers'
import { SkipToContent } from '@/components/accessibility/SkipToContent'
import { Starfield } from '@/components/ui/Starfield'

// ============================================
// Font Configuration
// ============================================

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
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
    'Explore the universe through JWST, Australian radio telescopes, and citizen science. A multi-wavelength journey through space featuring real-time events, interactive sky maps, and community contributions.',
  keywords: [
    'JWST',
    'James Webb Space Telescope',
    'astronomy',
    'space',
    'ASKAP',
    'SKA',
    'radio astronomy',
    'citizen science',
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
    url: 'https://cosmos-collective.vercel.app',
    siteName: 'Cosmos Collective',
    title: 'Cosmos Collective | Multi-Spectrum Astronomical Explorer',
    description:
      'Explore the universe through JWST, Australian radio telescopes, and citizen science.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cosmos Collective - Explore the Universe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmos Collective | Multi-Spectrum Astronomical Explorer',
    description:
      'Explore the universe through JWST, Australian radio telescopes, and citizen science.',
    images: ['/og-image.png'],
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
    canonical: 'https://cosmos-collective.vercel.app',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#030014' },
    { media: '(prefers-color-scheme: dark)', color: '#030014' },
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://images-api.nasa.gov" />
        <link rel="preconnect" href="https://mast.stsci.edu" />
        <link rel="dns-prefetch" href="https://api.nasa.gov" />

        {/* Aladin Lite v3 - CSS is now bundled in the JS file */}
        <link rel="preconnect" href="https://aladin.cds.unistra.fr" />

        {/* Color scheme for system UI */}
        <meta name="color-scheme" content="dark" />

        {/* PWA meta tags */}
        <meta name="application-name" content="Cosmos Collective" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cosmos" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#030014" />
      </head>
      <body className="font-sans antialiased">
        {/* Skip to content link for keyboard navigation */}
        <SkipToContent />

        {/* Animated starfield background */}
        <Starfield />

        {/* App providers (React Query, Auth, etc.) */}
        <Providers>
          {/* Main content area */}
          <div id="main-content" className="relative min-h-screen">
            {children}
          </div>
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
