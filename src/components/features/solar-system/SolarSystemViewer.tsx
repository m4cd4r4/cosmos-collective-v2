'use client'

/**
 * Solar System Viewer Component
 * Embeds the Solar Vortex 3D visualization via iframe
 * Similar pattern to SkyMapViewer with Aladin Lite
 */

import { useState } from 'react'

export function SolarSystemViewer() {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="absolute inset-0">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-cosmos-void flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cosmos-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading Solar System...</p>
            <p className="text-gray-500 text-sm mt-2">
              Initializing 3D renderer and NASA textures
            </p>
          </div>
        </div>
      )}

      {/* Solar Vortex iframe */}
      <iframe
        src="/solar-system/index.html"
        title="Interactive 3D Solar System Visualization"
        className="w-full h-full border-0"
        onLoad={() => setIsLoaded(true)}
        allow="fullscreen"
      />

      {/* Accessibility description */}
      <div className="sr-only" aria-live="polite">
        Interactive 3D solar system visualization showing all 8 planets with
        photorealistic NASA textures. Use the on-screen controls to adjust
        orbital speed, camera mode, and follow individual planets. Press D to
        dive into Earth.
      </div>
    </div>
  )
}
