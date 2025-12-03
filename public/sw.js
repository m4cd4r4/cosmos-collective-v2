/**
 * Cosmos Collective - Service Worker
 * Provides offline support and caching for better performance
 */

const CACHE_NAME = 'cosmos-collective-v1'
const OFFLINE_URL = '/offline'

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Cache strategies:
// - Network First: API calls, dynamic content
// - Cache First: Static assets, images
// - Stale While Revalidate: HTML pages

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching essential assets')
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  // Activate immediately
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  // Take control immediately
  self.clients.claim()
})

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip browser extension requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Skip cross-origin requests (except for images we want to cache)
  if (url.origin !== self.location.origin) {
    // Allow caching of external images (JWST, etc.)
    if (request.destination === 'image') {
      event.respondWith(cacheFirstWithNetwork(request))
    }
    return
  }

  // API requests - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request))
    return
  }

  // Static assets (JS, CSS, fonts) - Cache First
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirstWithNetwork(request))
    return
  }

  // Images - Cache First with longer expiry
  if (request.destination === 'image') {
    event.respondWith(cacheFirstWithNetwork(request))
    return
  }

  // HTML pages - Stale While Revalidate
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Default - Network First
  event.respondWith(networkFirstWithCache(request))
})

// ============================================
// Caching Strategies
// ============================================

/**
 * Network First with Cache fallback
 * Good for: API calls, dynamic content
 */
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // If this was a navigation request, show offline page
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL)
    }

    throw error
  }
}

/**
 * Cache First with Network fallback
 * Good for: Static assets, images
 */
async function cacheFirstWithNetwork(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // For images, return a placeholder if available
    if (request.destination === 'image') {
      return caches.match('/images/placeholder.svg')
    }
    throw error
  }
}

/**
 * Stale While Revalidate
 * Good for: HTML pages that change occasionally
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  // Fetch in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Network failed, return cached or offline page
    return cachedResponse || caches.match(OFFLINE_URL)
  })

  // Return cached immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise
}

// ============================================
// Background Sync (for classifications)
// ============================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-classifications') {
    event.waitUntil(syncClassifications())
  }
})

async function syncClassifications() {
  // Get pending classifications from IndexedDB
  // Submit them to the server
  // This would integrate with the Zooniverse API
  console.log('[SW] Syncing offline classifications')
}

// ============================================
// Push Notifications (for events)
// ============================================

self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})

// ============================================
// Periodic Background Sync (for updates)
// ============================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-events') {
    event.waitUntil(updateEvents())
  }
})

async function updateEvents() {
  // Fetch latest astronomical events
  // Cache them for offline viewing
  console.log('[SW] Updating astronomical events in background')
}
