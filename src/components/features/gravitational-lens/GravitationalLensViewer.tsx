'use client'

/**
 * Gravitational Lens Viewer
 * Embeds the standalone 550-AU Solar Gravitational Lens simulation
 * (Vite + Three.js, vendored under public/embeds/gravitational-lens/)
 * via a same-origin iframe. Same pattern as SolarSystemViewer.
 */

import { useEffect, useRef, useState } from 'react'

export function GravitationalLensViewer() {
  const [isLoaded, setIsLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // The embed's index.html is tiny and can finish loading before React
  // attaches onLoad, so also check readyState on mount and add a safety timeout.
  useEffect(() => {
    const el = iframeRef.current
    if (!el) return
    try {
      if (el.contentDocument?.readyState === 'complete') {
        setIsLoaded(true)
        return
      }
    } catch {
      // same-origin, but guard just in case
    }
    const onLoad = () => setIsLoaded(true)
    el.addEventListener('load', onLoad)
    const timer = setTimeout(() => setIsLoaded(true), 4000)
    return () => {
      el.removeEventListener('load', onLoad)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="absolute inset-0">
      {/* Loading overlay (amber accent matches the embedded app) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-cosmos-void flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#ffb000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading the Solar Gravitational Lens…</p>
            <p className="text-gray-500 text-sm mt-2">
              Initializing 3D renderer and mission data
            </p>
          </div>
        </div>
      )}

      {/* Small-screen advisory: the embedded app is desktop-first */}
      <div className="lg:hidden absolute top-0 inset-x-0 z-20 px-3 py-2 bg-[rgba(4,6,18,0.85)] border-b border-[#ffb000]/25 backdrop-blur-sm text-center">
        <p className="text-[11px] text-[#ffd27a] leading-snug">
          Best experienced on a larger screen. On mobile, use Tour mode.
        </p>
      </div>

      <iframe
        ref={iframeRef}
        src="/embeds/gravitational-lens/index.html"
        title="Solar Gravitational Lens Telescope mission simulation"
        className="w-full h-full border-0"
        onLoad={() => setIsLoaded(true)}
        allow="fullscreen; autoplay"
      />

      <div className="sr-only" aria-live="polite">
        Interactive simulation of the Solar Gravitational Lens telescope
        mission concept. Eight acts explain how a spacecraft flown to 650
        astronomical units could use the Sun&rsquo;s gravity as a lens to image
        an exoplanet&rsquo;s surface. Each act has a guided Tour mode and a free
        Explore mode with clickable objects.
      </div>
    </div>
  )
}
