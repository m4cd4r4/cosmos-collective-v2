/**
 * Google Analytics Component
 * Adds GA4 tracking to the Cosmos Collective website
 * Measurement ID: G-EFL048RDVK
 *
 * Automatically disabled in:
 * - Development mode (NODE_ENV !== 'production')
 * - Test/headless browser environments (detected via user agent)
 */

'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function GoogleAnalytics() {
  const measurementId = 'G-EFL048RDVK'
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Skip GA in development
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    // Detect headless browsers and automated testing
    const userAgent = navigator.userAgent.toLowerCase()
    const isHeadless =
      userAgent.includes('headless') ||
      userAgent.includes('phantomjs') ||
      userAgent.includes('selenium') ||
      userAgent.includes('playwright') ||
      userAgent.includes('puppeteer') ||
      // @ts-ignore - navigator.webdriver exists in automated contexts
      navigator.webdriver === true

    // Only load GA for real users
    if (!isHeadless) {
      setShouldLoad(true)
    }
  }, [])

  // Don't render anything if we shouldn't load GA
  if (!shouldLoad) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  )
}
