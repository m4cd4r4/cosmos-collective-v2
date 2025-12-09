/**
 * Google Analytics Component
 * Adds GA4 tracking to the Cosmos Collective website
 * Measurement ID: G-EFL048RDVK
 */

import Script from 'next/script'

export default function GoogleAnalytics() {
  const measurementId = 'G-EFL048RDVK'

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
