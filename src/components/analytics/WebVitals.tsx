'use client'

/**
 * Web Vitals Component
 * Tracks Core Web Vitals and reports to Google Analytics
 *
 * Metrics tracked:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint)
 */

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function WebVitals() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only run in production and if browser supports performance APIs
    if (
      process.env.NODE_ENV !== 'production' ||
      typeof window === 'undefined' ||
      !window.performance
    ) {
      return
    }

    // Import web-vitals dynamically to reduce initial bundle
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      // Report to Google Analytics (if available)
      const reportWebVital = (metric: any) => {
        // Check if gtag is available
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', metric.name, {
            event_category: 'Web Vitals',
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_label: metric.id,
            non_interaction: true,
          })
        }

        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals] ${metric.name}:`, {
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          })
        }
      }

      // Register all Core Web Vitals
      onCLS(reportWebVital)
      onFID(reportWebVital)
      onFCP(reportWebVital)
      onLCP(reportWebVital)
      onTTFB(reportWebVital)
      onINP(reportWebVital)
    })
  }, [pathname, searchParams])

  // This component doesn't render anything
  return null
}
