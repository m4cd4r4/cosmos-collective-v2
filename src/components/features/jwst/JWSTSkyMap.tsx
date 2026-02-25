'use client'

/**
 * JWSTSkyMap — Aladin Lite sky map for the JWST Explorer page.
 * Plots all JWST observation targets as colored catalog markers.
 * Hover shows a thumbnail popup; click fires onMarkerClick(obsId).
 * flyTo / highlightObs exposed via forwardRef for sidebar cross-linking.
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import Script from 'next/script'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface HoveredMarker {
  obsId: string
  name: string
  thumbnail: string
  category: string
}

// ── Public handle ──────────────────────────────────────────────────────────

export interface JWSTSkyMapHandle {
  flyTo: (ra: number, dec: number, fov?: number) => void
}

// ── Constants ──────────────────────────────────────────────────────────────

export const JWST_CATEGORY_COLORS: Record<string, string> = {
  nebula: '#d4af37',
  galaxy: '#4a90e2',
  'deep-field': '#9b59b6',
  'solar-system': '#2ecc71',
  'star-cluster': '#e67e22',
  star: '#ff6b6b',
  other: '#7f8c8d',
}

const CATEGORY_LABELS: Record<string, string> = {
  nebula: 'Nebula',
  galaxy: 'Galaxy',
  'deep-field': 'Deep Field',
  'solar-system': 'Solar System',
  'star-cluster': 'Star Cluster',
  star: 'Star',
  other: 'Other',
}

// ── Component ──────────────────────────────────────────────────────────────

export const JWSTSkyMap = forwardRef<
  JWSTSkyMapHandle,
  {
    className?: string
    selectedObsId?: string
    onMarkerClick?: (obsId: string) => void
  }
>(({ className, selectedObsId, onMarkerClick }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aladinRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker | null>(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })

  useImperativeHandle(ref, () => ({
    flyTo(ra, dec, fov = 0.5) {
      if (!aladinRef.current) return
      aladinRef.current.gotoRaDec(ra, dec)
      aladinRef.current.setFov(fov)
    },
  }))

  const initAladin = useCallback(() => {
    if (typeof window === 'undefined' || !window.A || !containerRef.current || aladinRef.current) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const aladin = (window.A.aladin as any)(containerRef.current, {
      survey: 'P/DSS2/color',
      fov: 60,
      target: 'galactic center',
      showReticle: false,
      showZoomControl: false,
      showGotoControl: false,
      showLayersControl: false,
      showFullscreenControl: false,
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    aladinRef.current = aladin
    setIsLoaded(true)

    const observations = getFeaturedJWSTImages()

    // Group observations by category for colour-coded catalogs
    const groups: Record<string, typeof observations> = {}
    for (const obs of observations) {
      if (!groups[obs.category]) groups[obs.category] = []
      groups[obs.category].push(obs)
    }

    for (const [category, obs] of Object.entries(groups)) {
      const color = JWST_CATEGORY_COLORS[category] ?? JWST_CATEGORY_COLORS.other
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const catalog = window.A.catalog({
        name: CATEGORY_LABELS[category] ?? category,
        color,
        sourceSize: 14,
        shape: 'circle',
      })

      for (const o of obs) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const source = window.A.source(o.coordinates.ra, o.coordinates.dec, {
          obsId: o.id,
          name: o.targetName,
          thumbnail: o.images.thumbnail,
          category,
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        catalog.addSources([source])
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      aladin.addCatalog(catalog)
    }

    // Hover handler
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    aladin.on('objectHovered', (obj: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const src = obj as any
      if (src?.data?.thumbnail) {
        setHoveredMarker({
          obsId: String(src.data.obsId ?? ''),
          name: String(src.data.name ?? ''),
          thumbnail: String(src.data.thumbnail),
          category: String(src.data.category ?? ''),
        })
        setHoverPos({ x: mousePosRef.current.x, y: mousePosRef.current.y })
      } else {
        setHoveredMarker(null)
      }
    })

    // Click handler
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    aladin.on('objectClicked', (obj: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const src = obj as any
      if (src?.data?.obsId) {
        onMarkerClick?.(String(src.data.obsId))
      }
    })

    // If there's already a selected observation, fly to it
    if (selectedObsId) {
      const target = observations.find(o => o.id === selectedObsId)
      if (target) {
        aladin.gotoRaDec(target.coordinates.ra, target.coordinates.dec)
        aladin.setFov(1.5)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMarkerClick])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!aladinRef.current) initAladin()
    }, 200)
    return () => clearTimeout(timer)
  }, [initAladin])

  // Fly to newly selected observation
  useEffect(() => {
    if (!selectedObsId || !aladinRef.current) return
    const observations = getFeaturedJWSTImages()
    const obs = observations.find(o => o.id === selectedObsId)
    if (obs) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      aladinRef.current.gotoRaDec(obs.coordinates.ra, obs.coordinates.dec)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      aladinRef.current.setFov(1.5)
    }
  }, [selectedObsId])

  // Compute legend categories that actually appear in the data
  const legendCategories = Object.keys(JWST_CATEGORY_COLORS).filter(cat => {
    const obs = getFeaturedJWSTImages()
    return obs.some(o => o.category === cat)
  })

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onMouseMove={(e) => {
        mousePosRef.current = { x: e.clientX, y: e.clientY }
      }}
    >
      <Script
        src="https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js"
        strategy="afterInteractive"
        onLoad={initAladin}
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#060a18] flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[9px] text-[#4a5580] uppercase tracking-[0.15em]">Loading Sky Map…</p>
          </div>
        </div>
      )}

      {/* Aladin container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Label */}
      {isLoaded && (
        <div className="absolute top-2 left-2 z-20 pointer-events-none">
          <span className="text-[9px] text-[#d4af37] bg-[rgba(4,6,18,0.8)] px-2 py-1 rounded backdrop-blur-sm uppercase tracking-[0.15em]">
            JWST Target Positions
          </span>
        </div>
      )}

      {/* Legend */}
      {isLoaded && (
        <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-0.5 pointer-events-none">
          {legendCategories.map(cat => (
            <div
              key={cat}
              className="flex items-center gap-1.5 text-[9px] text-[#c8d4f0] bg-[rgba(4,6,18,0.75)] px-2 py-0.5 rounded backdrop-blur-sm"
            >
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0"
                style={{ background: JWST_CATEGORY_COLORS[cat] }}
              />
              {CATEGORY_LABELS[cat] ?? cat}
            </div>
          ))}
        </div>
      )}

      {/* Hover thumbnail popup */}
      {hoveredMarker && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: Math.min(hoverPos.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 228),
            top: Math.max(8, hoverPos.y - 120),
          }}
        >
          <div className="rounded-xl overflow-hidden border border-white/15 shadow-2xl shadow-black/60 backdrop-blur-md bg-[#07090f]/90 w-52">
            <div className="relative h-28">
              <img
                src={hoveredMarker.thumbnail}
                alt={hoveredMarker.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/90 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <div className="text-white text-xs font-bold drop-shadow-lg">
                  🔭 {hoveredMarker.name}
                </div>
                <div
                  className="text-[9px] mt-0.5 drop-shadow-lg"
                  style={{ color: JWST_CATEGORY_COLORS[hoveredMarker.category] ?? '#d4af37' }}
                >
                  {CATEGORY_LABELS[hoveredMarker.category] ?? hoveredMarker.category} · JWST
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 text-[9px] text-[#4a5580] uppercase tracking-[0.12em]">
              Click to explore
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

JWSTSkyMap.displayName = 'JWSTSkyMap'
