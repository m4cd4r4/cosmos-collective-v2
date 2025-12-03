'use client'

/**
 * useAnalytics Hook
 * Convenient analytics tracking for React components
 */

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import {
  trackPageView,
  trackObservationView,
  trackClassification,
  trackSearch,
  trackFeatureUse,
} from '@/services/analytics'

/**
 * Hook that automatically tracks page views
 */
export function usePageTracking() {
  const pathname = usePathname()

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])
}

/**
 * Hook for manual analytics tracking
 */
export function useAnalytics() {
  const trackView = useCallback((observationId: string, observationName: string) => {
    trackObservationView(observationId, observationName)
  }, [])

  const trackClassify = useCallback(
    (projectId: string, projectName: string, timeSpent: number) => {
      trackClassification(projectId, projectName, timeSpent)
    },
    []
  )

  const trackSearchQuery = useCallback((query: string, resultCount: number) => {
    trackSearch(query, resultCount)
  }, [])

  const trackFeature = useCallback((feature: string, action: string) => {
    trackFeatureUse(feature, action)
  }, [])

  return {
    trackView,
    trackClassify,
    trackSearchQuery,
    trackFeature,
  }
}

/**
 * Track when a component becomes visible
 */
export function useVisibilityTracking(
  ref: React.RefObject<HTMLElement>,
  featureName: string
) {
  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackFeatureUse(featureName, 'viewed')
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref, featureName])
}
