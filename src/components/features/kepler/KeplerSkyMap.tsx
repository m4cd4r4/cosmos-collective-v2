'use client'

/**
 * KeplerSkyMap — Aladin Lite sky map for the Kepler Explorer.
 * Centered on the Kepler/Cygnus field. When a star system is selected,
 * it is plotted as a highlighted marker and the view flies to it.
 */

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import Script from 'next/script'
import type { StarSystem } from './types'
import { tempToColor } from './utils'
import { cn } from '@/lib/utils'

// ── Public handle ──────────────────────────────────────────────────────────

export interface KeplerSkyMapHandle {
  flyTo: (ra: number, dec: number, fov?: number) => void
  resetToField: () => void
}

// ── Kepler field centre (Cygnus) ──────────────────────────────────────────

const KEPLER_FIELD = { ra: 291.0, dec: 44.5, fov: 15 }

// ── Component ──────────────────────────────────────────────────────────────

export const KeplerSkyMap = forwardRef<
  KeplerSkyMapHandle,
  {
    className?: string
    selectedStar: StarSystem | null
  }
>(({ className, selectedStar }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aladinRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerCatalogRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useImperativeHandle(ref, () => ({
    flyTo(ra, dec, fov = 0.3) {
      if (!aladinRef.current) return
      aladinRef.current.gotoRaDec(ra, dec)
      aladinRef.current.setFov(fov)
    },
    resetToField() {
      if (!aladinRef.current) return
      aladinRef.current.gotoRaDec(KEPLER_FIELD.ra, KEPLER_FIELD.dec)
      aladinRef.current.setFov(KEPLER_FIELD.fov)
    },
  }))

  const initAladin = useCallback(() => {
    if (typeof window === 'undefined' || !window.A || !containerRef.current || aladinRef.current) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const aladin = (window.A.aladin as any)(containerRef.current, {
      survey: 'P/DSS2/color',
      fov: KEPLER_FIELD.fov,
      target: `${KEPLER_FIELD.ra} ${KEPLER_FIELD.dec}`,
      showReticle: false,
      showZoomControl: false,
      showGotoControl: false,
      showLayersControl: false,
      showFullscreenControl: false,
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    aladinRef.current = aladin

    // Persistent marker catalog for the selected star
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const catalog = window.A.catalog({
      name: 'Selected Star',
      color: '#d4af37',
      sourceSize: 20,
      shape: 'circle',
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    aladin.addCatalog(catalog)
    markerCatalogRef.current = catalog

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!aladinRef.current) initAladin()
    }, 200)
    return () => clearTimeout(timer)
  }, [initAladin])

  // Update marker and fly to the selected star whenever it changes
  useEffect(() => {
    if (!isLoaded || !aladinRef.current || !markerCatalogRef.current) return

    // Clear previous markers
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    markerCatalogRef.current.removeAll()

    if (!selectedStar || selectedStar.ra == null || selectedStar.dec == null) return

    const starColor = tempToColor(selectedStar.teff)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    markerCatalogRef.current.setColor(starColor)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const source = window.A.source(selectedStar.ra, selectedStar.dec, {
      name: selectedStar.name,
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    markerCatalogRef.current.addSources([source])

    // Fly to the star
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    aladinRef.current.gotoRaDec(selectedStar.ra, selectedStar.dec)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    aladinRef.current.setFov(0.5)
  }, [isLoaded, selectedStar])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Script
        src="https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js"
        strategy="afterInteractive"
        onLoad={initAladin}
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#050810] flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-[#4a90e2] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[9px] text-[#4a5580] uppercase tracking-[0.15em]">Loading Kepler Field…</p>
          </div>
        </div>
      )}

      {/* Aladin container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Field label */}
      {isLoaded && (
        <div className="absolute top-2 left-2 z-20 pointer-events-none flex flex-col gap-1">
          <span className="text-[9px] text-[#4a90e2] bg-[rgba(4,6,18,0.8)] px-2 py-1 rounded backdrop-blur-sm uppercase tracking-[0.15em]">
            Kepler Field · Cygnus
          </span>
          {selectedStar && (
            <span className="text-[9px] text-[#d4af37] bg-[rgba(4,6,18,0.8)] px-2 py-1 rounded backdrop-blur-sm">
              ◎ {selectedStar.name}
            </span>
          )}
        </div>
      )}

      {/* Reset button */}
      {isLoaded && selectedStar && (
        <button
          className="absolute bottom-2 right-2 z-20 text-[9px] text-[#4a90e2] bg-[rgba(4,6,18,0.8)] px-2 py-1 rounded backdrop-blur-sm uppercase tracking-[0.15em] hover:text-[#7fbfff] transition-colors"
          onClick={() => {
            if (!aladinRef.current) return
            aladinRef.current.gotoRaDec(KEPLER_FIELD.ra, KEPLER_FIELD.dec)
            aladinRef.current.setFov(KEPLER_FIELD.fov)
          }}
        >
          Reset View
        </button>
      )}

      {/* Legend */}
      {isLoaded && (
        <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[9px] text-[#c8d4f0] bg-[rgba(4,6,18,0.75)] px-2 py-0.5 rounded backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full inline-block shrink-0 bg-[#d4af37]" />
            Selected star
          </div>
        </div>
      )}
    </div>
  )
})

KeplerSkyMap.displayName = 'KeplerSkyMap'
