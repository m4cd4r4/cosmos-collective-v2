'use client'

/**
 * Sky Map Viewer Component
 * Interactive celestial map using Aladin Lite
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn, formatCoordinates, debounce } from '@/lib/utils'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import type { SkyCoordinates, WavelengthBand } from '@/types'
import {
  Search,
  Layers,
  Target,
  ZoomIn,
  ZoomOut,
  Home,
  Crosshair,
  MapPin,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// ============================================
// Types
// ============================================

declare global {
  interface Window {
    A: {
      aladin: (container: string | HTMLElement, options: AladinOptions) => AladinInstance
      catalog: (options: CatalogOptions) => AladinCatalog
      source: (ra: number, dec: number, options: SourceOptions) => AladinSource
      marker: (ra: number, dec: number, options: MarkerOptions) => AladinMarker
      catalogFromSimbad: (query: string) => AladinCatalog
    }
  }
}

interface AladinOptions {
  survey?: string
  fov?: number
  target?: string
  cooFrame?: string
  showReticle?: boolean
  showZoomControl?: boolean
  showFullscreenControl?: boolean
  showLayersControl?: boolean
  showGotoControl?: boolean
  showFrame?: boolean
  fullScreen?: boolean
}

interface AladinInstance {
  gotoRaDec: (ra: number, dec: number) => void
  gotoObject: (name: string, callback?: () => void) => void
  getRaDec: () => [number, number]
  getFov: () => [number, number]
  setFov: (fov: number) => void
  setImageSurvey: (survey: string) => void
  addCatalog: (catalog: AladinCatalog) => void
  addOverlay: (overlay: unknown) => void
  on: (event: string, callback: (object: unknown) => void) => void
  getSize: () => [number, number]
  increaseZoom: () => void
  decreaseZoom: () => void
}

interface CatalogOptions {
  name: string
  color: string
  sourceSize?: number
  shape?: string
  onClick?: string
}

interface SourceOptions {
  name?: string
  popupTitle?: string
  popupDesc?: string
}

interface MarkerOptions {
  popupTitle?: string
  popupDesc?: string
}

interface AladinCatalog {
  addSources: (sources: AladinSource[]) => void
}

interface AladinSource {
  // Source object
}

interface AladinMarker {
  // Marker object
}

// ============================================
// Survey Options (Different Wavelengths)
// ============================================

const surveyOptions: {
  id: string
  name: string
  wavelength: WavelengthBand
  survey: string
  description: string
  color: string
}[] = [
  {
    id: 'dss',
    name: 'DSS (Optical)',
    wavelength: 'optical',
    survey: 'P/DSS2/color',
    description: 'Digitized Sky Survey - visible light',
    color: '#f59e0b',
  },
  {
    id: '2mass',
    name: '2MASS (Near-IR)',
    wavelength: 'infrared',
    survey: 'P/2MASS/color',
    description: 'Two Micron All Sky Survey - near-infrared',
    color: '#ef4444',
  },
  {
    id: 'wise',
    name: 'WISE (Mid-IR)',
    wavelength: 'infrared',
    survey: 'P/allWISE/color',
    description: 'Wide-field Infrared Survey Explorer',
    color: '#dc2626',
  },
  {
    id: 'galex',
    name: 'GALEX (UV)',
    wavelength: 'ultraviolet',
    survey: 'P/GALEXGR6/AIS/color',
    description: 'Galaxy Evolution Explorer - ultraviolet',
    color: '#8b5cf6',
  },
  {
    id: 'fermi',
    name: 'Fermi (Gamma)',
    wavelength: 'gamma',
    survey: 'P/Fermi/color',
    description: 'Fermi Gamma-ray Space Telescope',
    color: '#06b6d4',
  },
  {
    id: 'planck',
    name: 'Planck (CMB)',
    wavelength: 'microwave',
    survey: 'P/Planck/R2/HFI/color',
    description: 'Planck Cosmic Microwave Background',
    color: '#22c55e',
  },
]

// ============================================
// Props
// ============================================

interface SkyMapViewerProps {
  initialRa?: number
  initialDec?: number
  initialFov?: number
  initialTarget?: string
}

// ============================================
// Component
// ============================================

export function SkyMapViewer({
  initialRa,
  initialDec,
  initialFov = 60,
  initialTarget,
}: SkyMapViewerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const aladinRef = useRef<AladinInstance | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 50 // 5 seconds max wait (50 * 100ms)

  const [isLoaded, setIsLoaded] = useState(false)
  const [currentSurvey, setCurrentSurvey] = useState(surveyOptions[0])
  const [searchQuery, setSearchQuery] = useState(initialTarget || '')
  const [currentCoords, setCurrentCoords] = useState<SkyCoordinates | null>(null)
  const [currentFov, setCurrentFov] = useState(initialFov)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedObject, setSelectedObject] = useState<{
    name: string
    ra: number
    dec: number
    type?: string
  } | null>(null)

  // Initialize Aladin with retry logic
  const initializeAladin = useCallback(() => {
    // Already initialized
    if (aladinRef.current) return

    // Check if window.A is available (script might still be loading)
    if (typeof window === 'undefined' || !window.A) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(initializeAladin, 100)
      } else {
        console.error('Aladin Lite failed to load after maximum retries')
      }
      return
    }

    // Wait for container to be available and have dimensions
    if (!containerRef.current) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(initializeAladin, 50)
      }
      return
    }

    // Ensure container has dimensions before initializing
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(initializeAladin, 100)
      }
      return
    }

    try {
      // Set initial target
      let targetStr = 'galactic center'
      if (initialRa !== undefined && initialDec !== undefined) {
        targetStr = `${initialRa} ${initialDec}`
      } else if (initialTarget) {
        targetStr = initialTarget
      }

      const options: AladinOptions = {
        survey: 'P/DSS2/color',
        fov: initialFov,
        target: targetStr,
        cooFrame: 'J2000',
        showReticle: true,
        showZoomControl: false,
        showFullscreenControl: false,
        showLayersControl: false,
        showGotoControl: false,
        showFrame: true,
      }

      const aladin = window.A.aladin(containerRef.current, options)
      aladinRef.current = aladin

      // Add observation markers after a short delay to ensure map is ready
      setTimeout(() => {
        if (aladinRef.current) {
          addObservationMarkers(aladinRef.current)
        }
      }, 500)

      // Set up event listeners
      aladin.on('positionChanged', () => {
        const [ra, dec] = aladin.getRaDec()
        const [fov] = aladin.getFov()
        setCurrentCoords({ ra, dec })
        setCurrentFov(fov)
      })

      aladin.on('objectClicked', (object: unknown) => {
        if (object && typeof object === 'object' && 'data' in object) {
          const data = (object as { data: { name: string; ra: number; dec: number } }).data
          setSelectedObject({
            name: data.name,
            ra: data.ra,
            dec: data.dec,
          })
        }
      })

      setIsLoaded(true)
    } catch (error) {
      console.error('Failed to initialize Aladin:', error)
      // Retry on error
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(initializeAladin, 500)
      }
    }
  }, [initialRa, initialDec, initialFov, initialTarget, maxRetries])

  // Add observation markers from our data
  const addObservationMarkers = (aladin: AladinInstance) => {
    const observations = getFeaturedJWSTImages()

    const catalog = window.A.catalog({
      name: 'JWST Observations',
      color: '#f59e0b',
      sourceSize: 12,
      shape: 'circle',
      onClick: 'showPopup',
    })

    const sources = observations.map((obs) =>
      window.A.source(obs.coordinates.ra, obs.coordinates.dec, {
        name: obs.targetName,
        popupTitle: obs.targetName,
        popupDesc: `<a href="/explore/${obs.id}" target="_blank">View Details</a>`,
      })
    )

    catalog.addSources(sources)
    aladin.addCatalog(catalog)
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (aladinRef.current && searchQuery) {
      aladinRef.current.gotoObject(searchQuery, () => {
        // Update URL with target
        const params = new URLSearchParams(searchParams.toString())
        params.set('target', searchQuery)
        router.replace(`/sky-map?${params.toString()}`)
      })
    }
  }

  // Change survey
  const changeSurvey = (survey: typeof surveyOptions[0]) => {
    setCurrentSurvey(survey)
    if (aladinRef.current) {
      aladinRef.current.setImageSurvey(survey.survey)
    }
  }

  // Navigation functions
  const zoomIn = () => aladinRef.current?.increaseZoom()
  const zoomOut = () => aladinRef.current?.decreaseZoom()
  const goHome = () => {
    aladinRef.current?.gotoObject('galactic center')
    aladinRef.current?.setFov(60)
  }
  const goToCoords = (ra: number, dec: number) => {
    aladinRef.current?.gotoRaDec(ra, dec)
  }

  return (
    <>
      {/* Load Aladin Lite v3 - CSS is bundled in the JS */}
      <Script
        src="https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js"
        strategy="afterInteractive"
        onLoad={initializeAladin}
      />

      <div className="absolute inset-0 flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'relative z-20 h-full bg-cosmos-depth border-r border-white/10 transition-all duration-300',
            sidebarOpen ? 'w-80' : 'w-0'
          )}
        >
          {sidebarOpen && (
            <div className="h-full flex flex-col p-4 overflow-y-auto">
              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                  Search Object
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="M31, NGC 1234, Crab Nebula..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-cosmos-surface border border-white/10 text-white placeholder:text-gray-500 text-sm"
                  />
                </div>
              </form>

              {/* Current Position */}
              {currentCoords && (
                <div className="mb-6">
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                    Current Position
                  </label>
                  <div className="glass-panel rounded-lg p-3 font-mono text-xs text-gray-300">
                    <div>RA: {currentCoords.ra.toFixed(4)}°</div>
                    <div>Dec: {currentCoords.dec >= 0 ? '+' : ''}{currentCoords.dec.toFixed(4)}°</div>
                    <div className="text-gray-500 mt-1">FOV: {currentFov.toFixed(2)}°</div>
                  </div>
                </div>
              )}

              {/* Survey Layers */}
              <div className="mb-6">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Wavelength Layer
                </label>
                <div className="space-y-2">
                  {surveyOptions.map((survey) => (
                    <button
                      key={survey.id}
                      type="button"
                      onClick={() => changeSurvey(survey)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all text-sm',
                        currentSurvey.id === survey.id
                          ? 'bg-white/10 border border-white/20'
                          : 'hover:bg-white/5'
                      )}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: survey.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white truncate">{survey.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {survey.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Quick Navigation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Galactic Center', target: 'galactic center' },
                    { name: 'Andromeda', target: 'M31' },
                    { name: 'Orion Nebula', target: 'M42' },
                    { name: 'Crab Nebula', target: 'M1' },
                    { name: 'Whirlpool', target: 'M51' },
                    { name: 'LMC', target: 'LMC' },
                  ].map((loc) => (
                    <button
                      key={loc.target}
                      type="button"
                      onClick={() => aladinRef.current?.gotoObject(loc.target)}
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition-colors truncate"
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Object Info */}
              {selectedObject && (
                <Card className="mt-6" padding="md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{selectedObject.name}</h4>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {selectedObject.ra.toFixed(4)}°, {selectedObject.dec.toFixed(4)}°
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedObject(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Toggle button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-1/2 -right-4 -translate-y-1/2 z-30 w-8 h-16 bg-cosmos-surface border border-white/10 rounded-r-lg flex items-center justify-center hover:bg-white/5 transition-colors"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </aside>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className="absolute inset-0 bg-cosmos-void"
            style={{ minHeight: '400px' }}
          />

          {/* Loading overlay */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-cosmos-void flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cosmos-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Initializing sky map...</p>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
            <div className="glass-panel rounded-lg p-1 flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={zoomIn}
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={zoomOut}
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={goHome}
                aria-label="Reset view"
              >
                <Home className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Info Badge */}
          <div className="absolute top-4 right-4 z-20">
            <div className="glass-panel rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentSurvey.color }}
              />
              <span className="text-gray-300">{currentSurvey.name}</span>
            </div>
          </div>

          {/* Accessibility Description */}
          <div className="sr-only" aria-live="polite">
            Interactive sky map showing {currentSurvey.name}.
            Current position: Right Ascension {currentCoords?.ra.toFixed(2)} degrees,
            Declination {currentCoords?.dec.toFixed(2)} degrees.
            Use search to find objects. Click and drag to pan, scroll to zoom.
          </div>
        </div>
      </div>
    </>
  )
}
