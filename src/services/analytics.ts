/**
 * Private Analytics Service
 * Self-hosted analytics that respects user privacy
 *
 * All data is stored locally in IndexedDB - no third-party tracking.
 * This allows the site owner to understand usage patterns without
 * compromising visitor privacy.
 */

import type { AnalyticsEvent, AnalyticsSummary } from '@/types'

// ============================================
// Configuration
// ============================================

const DB_NAME = 'cosmos-analytics'
const DB_VERSION = 1
const STORE_NAME = 'events'

// Session ID for this visit
let sessionId: string | null = null

// ============================================
// IndexedDB Helpers
// ============================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create events store with indexes
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('eventType', 'eventType', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('sessionId', 'sessionId', { unique: false })
      }
    }
  })
}

// ============================================
// Session Management
// ============================================

function getSessionId(): string {
  if (sessionId) return sessionId

  // Check for existing session in sessionStorage
  const existing = typeof window !== 'undefined' ? sessionStorage.getItem('cosmos-session') : null
  if (existing) {
    sessionId = existing
    return sessionId
  }

  // Create new session ID
  sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('cosmos-session', sessionId)
  }

  return sessionId
}

// ============================================
// Event Tracking
// ============================================

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: AnalyticsEvent['eventType'],
  data: Record<string, string | number | boolean> = {}
): Promise<void> {
  // Skip if not in browser
  if (typeof window === 'undefined') return

  // Respect Do Not Track
  if (navigator.doNotTrack === '1') return

  const event: Omit<AnalyticsEvent, 'id'> = {
    eventType,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    data: {
      ...data,
      // Add page context
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      // Device info (non-identifying)
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      touchEnabled: 'ontouchstart' in window,
    },
  }

  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.add(event)

    // Clean up old events (keep last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const range = IDBKeyRange.upperBound(thirtyDaysAgo.toISOString())
    const index = store.index('timestamp')
    index.openCursor(range).onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

/**
 * Track a page view
 */
export async function trackPageView(page?: string): Promise<void> {
  await trackEvent('page_view', {
    page: page || window.location.pathname,
    title: document.title,
  })
}

/**
 * Track an observation view
 */
export async function trackObservationView(
  observationId: string,
  observationName: string
): Promise<void> {
  await trackEvent('observation_view', {
    observationId,
    observationName,
  })
}

/**
 * Track a classification completion
 */
export async function trackClassification(
  projectId: string,
  projectName: string,
  timeSpent: number
): Promise<void> {
  await trackEvent('classification_complete', {
    projectId,
    projectName,
    timeSpent,
  })
}

/**
 * Track a search
 */
export async function trackSearch(query: string, resultCount: number): Promise<void> {
  await trackEvent('search', {
    query,
    resultCount,
  })
}

/**
 * Track a feature use
 */
export async function trackFeatureUse(feature: string, action: string): Promise<void> {
  await trackEvent('feature_use', {
    feature,
    action,
  })
}

// ============================================
// Analytics Retrieval
// ============================================

/**
 * Get all events (for export/analysis)
 */
export async function getAllEvents(): Promise<AnalyticsEvent[]> {
  if (typeof window === 'undefined') return []

  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to get events:', error)
    return []
  }
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const events = await getAllEvents()

  // Calculate summary stats
  const pageViews = events.filter((e) => e.eventType === 'page_view')
  const observationViews = events.filter((e) => e.eventType === 'observation_view')
  const classifications = events.filter((e) => e.eventType === 'classification_complete')
  const searches = events.filter((e) => e.eventType === 'search')

  // Unique sessions (visitors)
  const uniqueSessions = new Set(events.map((e) => e.sessionId)).size

  // Top observations by views
  const observationCounts: Record<string, number> = {}
  observationViews.forEach((e) => {
    const id = e.data.observationId as string
    observationCounts[id] = (observationCounts[id] || 0) + 1
  })
  const topObservations = Object.entries(observationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, views]) => ({ id, views }))

  // Top search terms
  const searchCounts: Record<string, number> = {}
  searches.forEach((e) => {
    const term = (e.data.query as string).toLowerCase()
    searchCounts[term] = (searchCounts[term] || 0) + 1
  })
  const topSearchTerms = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term, count]) => ({ term, count }))

  // Classification stats
  const classificationsByType: Record<string, number> = {}
  classifications.forEach((e) => {
    const projectId = e.data.projectId as string
    classificationsByType[projectId] = (classificationsByType[projectId] || 0) + 1
  })

  // Session duration estimation
  const sessionDurations: number[] = []
  const sessionEvents: Record<string, AnalyticsEvent[]> = {}

  events.forEach((e) => {
    if (!sessionEvents[e.sessionId]) sessionEvents[e.sessionId] = []
    sessionEvents[e.sessionId].push(e)
  })

  Object.values(sessionEvents).forEach((sessionEvts) => {
    if (sessionEvts.length > 1) {
      const sorted = sessionEvts.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      const duration =
        (new Date(sorted[sorted.length - 1].timestamp).getTime() -
          new Date(sorted[0].timestamp).getTime()) /
        1000
      sessionDurations.push(duration)
    }
  })

  const averageSessionDuration =
    sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0

  // Bounce rate (sessions with only 1 page view)
  const bouncedSessions = Object.values(sessionEvents).filter(
    (s) => s.filter((e) => e.eventType === 'page_view').length === 1
  ).length
  const bounceRate = uniqueSessions > 0 ? bouncedSessions / uniqueSessions : 0

  return {
    totalPageViews: pageViews.length,
    uniqueVisitors: uniqueSessions,
    topObservations,
    topSearchTerms,
    classificationStats: {
      total: classifications.length,
      byType: classificationsByType as Record<string, number>,
    },
    userEngagement: {
      averageSessionDuration,
      bounceRate,
      returnVisitorRate: 0, // Would need cross-session tracking
    },
  }
}

/**
 * Clear all analytics data
 */
export async function clearAnalytics(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.clear()
  } catch (error) {
    console.error('Failed to clear analytics:', error)
  }
}

/**
 * Export analytics data as JSON
 */
export async function exportAnalytics(): Promise<string> {
  const events = await getAllEvents()
  const summary = await getAnalyticsSummary()

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      summary,
      events,
    },
    null,
    2
  )
}
