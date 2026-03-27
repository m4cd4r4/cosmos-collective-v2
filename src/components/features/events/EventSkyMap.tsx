'use client'

/**
 * EventSkyMap — Lightweight Aladin sky map for the Events page
 * Shows meteor shower radiant markers with hover thumbnail popups.
 * Exposes flyTo / gotoObject via forwardRef for event-card "Locate" buttons.
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
import { getMeteorShowers } from '@/services/real-time-events'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface HoveredMarker {
  name: string
  thumbnail: string
  subtitle: string
}

// ── Public handle ──────────────────────────────────────────────────────────

export interface EventSkyMapHandle {
  flyTo: (ra: number, dec: number, fov?: number) => void
  gotoObject: (name: string) => void
}

// ── Constants ──────────────────────────────────────────────────────────────

const METEOR_THUMB =
  'https://images-assets.nasa.gov/image/NHQ201908130001/NHQ201908130001~thumb.jpg'

// ── Component ──────────────────────────────────────────────────────────────

export const EventSkyMap = forwardRef<
  EventSkyMapHandle,
  { className?: string; onMarkerHover?: (name: string | null) => void }
>(({ className, onMarkerHover }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aladinRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker | null>(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })

  useImperativeHandle(ref, () => ({
    flyTo(ra, dec, fov = 15) {
      if (!aladinRef.current) return
      aladinRef.current.gotoRaDec(ra, dec)
      aladinRef.current.setFov(fov)
    },
    gotoObject(name) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      aladinRef.current?.gotoObject(name)
    },
  }))

  const initAladin = useCallback(() => {
    if (typeof window === 'undefined' || !window.A || !containerRef.current || aladinRef.current) return

    // Cast options to any — some fields (showStatusBar, showCooGrid) aren't in the typed interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const aladin = (window.A.aladin as any)(containerRef.current, {
      survey: 'P/DSS2/color',
      fov: 180,
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

    // Add meteor shower radiant markers
    const showers = getMeteorShowers()
    const now = new Date()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const activeCatalog = window.A.catalog({
      name: 'Active Showers',
      color: '#ef4444',
      sourceSize: 16,
      shape: 'cross',
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const upcomingCatalog = window.A.catalog({
      name: 'Upcoming Showers',
      color: '#d4af37',
      sourceSize: 12,
      shape: 'plus',
    })

    for (const shower of showers) {
      const peak = new Date(shower.peakDate)
      const start = new Date(shower.activeStart)
      const end = new Date(shower.activeEnd)
      const isActive = now >= start && now <= end
      const isPast = now > end
      if (isPast) continue

      const subtitle = isActive
        ? `ACTIVE · ZHR ${shower.zenithalHourlyRate}/hr`
        : `Peak: ${peak.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} · ZHR ${shower.zenithalHourlyRate}/hr`

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const source = window.A.source(shower.radiant.ra, shower.radiant.dec, {
        name: shower.name,
        thumbnail: METEOR_THUMB,
        subtitle,
        parentBody: shower.parentBody || '',
      })

      if (isActive) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        activeCatalog.addSources([source])
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        upcomingCatalog.addSources([source])
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    aladin.addCatalog(upcomingCatalog)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    aladin.addCatalog(activeCatalog)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    aladin.on('objectHovered', (obj: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const src = obj as any
      if (src?.data?.thumbnail) {
        setHoveredMarker({
          name: String(src.data.name ?? ''),
          thumbnail: String(src.data.thumbnail),
          subtitle: String(src.data.subtitle ?? ''),
        })
        setHoverPos({ x: mousePosRef.current.x, y: mousePosRef.current.y })
        onMarkerHover?.(String(src.data.name ?? null))
      } else {
        setHoveredMarker(null)
        onMarkerHover?.(null)
      }
    })
  }, [onMarkerHover])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!aladinRef.current) initAladin()
    }, 200)
    return () => clearTimeout(timer)
  }, [initAladin])

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
            <p className="text-[11px] text-[#4a5580] uppercase tracking-[0.15em]">Loading Sky Map…</p>
          </div>
        </div>
      )}

      {/* Aladin container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Legend */}
      {isLoaded && (
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-3 pointer-events-none">
          <div className="flex items-center gap-1 text-[11px] text-[#c8d4f0] bg-[rgba(4,6,18,0.7)] px-2 py-1 rounded backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block" />
            Active
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#c8d4f0] bg-[rgba(4,6,18,0.7)] px-2 py-1 rounded backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] inline-block" />
            Upcoming
          </div>
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
                  ☄️ {hoveredMarker.name}
                </div>
                {hoveredMarker.subtitle && (
                  <div className="text-[#d4af37] text-[11px] mt-0.5 drop-shadow-lg">
                    {hoveredMarker.subtitle}
                  </div>
                )}
              </div>
            </div>
            <div className="px-3 py-1.5 text-[11px] text-[#4a5580] uppercase tracking-[0.12em]">
              Meteor radiant position
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

EventSkyMap.displayName = 'EventSkyMap'
