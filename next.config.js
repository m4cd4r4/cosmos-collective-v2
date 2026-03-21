const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /middleware-build-manifest\.js$/,
    // Exclude large planetary textures from precache - served via runtime CacheFirst
    /solar-system\/textures\/.*/,
  ],
  runtimeCaching: [
    // Astronomical imagery - CacheFirst (rarely changes)
    {
      urlPattern: /^https:\/\/esawebb\.org\/archives\/images\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'esawebb-images',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
      }
    },
    {
      urlPattern: /^https:\/\/apod\.nasa\.gov\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'apod-images',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
      }
    },
    {
      urlPattern: /^https:\/\/images-assets\.nasa\.gov\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'nasa-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
      }
    },
    // NASA/MAST APIs - NetworkFirst (fresh data preferred)
    {
      urlPattern: /^https:\/\/images-api\.nasa\.gov\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'nasa-api',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
      }
    },
    {
      urlPattern: /^https:\/\/mast\.stsci\.edu\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'mast-api',
        networkTimeoutSeconds: 8,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }
      }
    },
    {
      urlPattern: /^https:\/\/casda\.csiro\.au\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'casda-api',
        networkTimeoutSeconds: 8,
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 }
      }
    },
    {
      urlPattern: /^https:\/\/exoplanetarchive\.ipac\.caltech\.edu\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'exoplanet-archive',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 }
      }
    },
    {
      urlPattern: /^https:\/\/services\.swpc\.noaa\.gov\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'space-weather',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 15 }
      }
    },
    // Real-time data - short TTL
    {
      urlPattern: /^https:\/\/api\.wheretheiss\.at\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'iss-tracking',
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 5 }
      }
    },
    // Local planetary textures - CacheFirst (immutable assets)
    {
      urlPattern: /\/solar-system\/textures\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'solar-textures',
        expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 }
      }
    }
  ]
})

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.stsci.edu' },
      { protocol: 'https', hostname: 'mast.stsci.edu' },
      { protocol: 'https', hostname: 'esawebb.org' },
      { protocol: 'https', hostname: 'apod.nasa.gov' },
      { protocol: 'https', hostname: 'images-api.nasa.gov' },
      { protocol: 'https', hostname: 'images-assets.nasa.gov' },
      { protocol: 'https', hostname: 'casda.csiro.au' },
      { protocol: 'https', hostname: '**.zooniverse.org' },
      { protocol: 'https', hostname: 'panoptes-uploads.zooniverse.org' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion'],
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
    // Service worker must never be cached by the browser
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
    // Workbox runtime chunk can be cached indefinitely (content-hashed filename)
    {
      source: '/workbox-:hash.js',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = withBundleAnalyzer(withPWA(nextConfig))
