'use client'

/**
 * Lunar Descent Viewer
 * Embeds the standalone game built from lunar-descent/ via iframe,
 * the same pattern as SolarSystemViewer.
 */

import { useEffect, useRef, useState } from 'react'

export function LunarDescentViewer() {
  const [isLoaded, setIsLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // The iframe can finish loading before hydration attaches onLoad, or between the
  // readyState check and React's listener, so check and listen natively as well.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const done = () => setIsLoaded(true)
    iframe.addEventListener('load', done)
    if (iframe.contentDocument?.readyState === 'complete' && iframe.contentDocument.URL !== 'about:blank') done()
    return () => iframe.removeEventListener('load', done)
  }, [])

  return (
    <div className="absolute inset-0">
      {!isLoaded && (
        <div className="absolute inset-0 bg-cosmos-void flex items-center justify-center z-10">
          <p className="text-gray-400">Loading Descent to Shackleton</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/lunar-descent/index.html"
        title="Descent to Shackleton, a lunar landing game"
        className="w-full h-full border-0"
        onLoad={() => setIsLoaded(true)}
        allow="fullscreen"
      />
    </div>
  )
}
