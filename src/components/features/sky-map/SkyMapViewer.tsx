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
import { getMeteorShowers } from '@/services/real-time-events'
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
  Eye,
  EyeOff,
} from 'lucide-react'

// ============================================
// Types
// ============================================

declare global {
  interface Window {
    A: {
      init: Promise<void>
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
  removeCatalog: (catalog: AladinCatalog) => void
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
  [key: string]: unknown
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
  const [loadError, setLoadError] = useState<string | null>(null)
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
    id?: string
    source?: string
    thumbnail?: string
    description?: string
    category?: string
    instrument?: string
  } | null>(null)
  const [uiHidden, setUiHidden] = useState(false)
  const [showMeteorRadiants, setShowMeteorRadiants] = useState(false)
  const meteorCatalogRef = useRef<AladinCatalog | null>(null)

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
        setLoadError('Failed to load sky map. Please check your internet connection and try refreshing the page.')
      }
      return
    }

    // Wait for container to be available and have dimensions
    if (!containerRef.current) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(initializeAladin, 50)
      } else {
        setLoadError('Sky map container failed to initialize. Please refresh the page.')
      }
      return
    }

    // Ensure container has dimensions before initializing
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(initializeAladin, 100)
      } else {
        setLoadError('Sky map container has invalid dimensions. Please try resizing your browser window.')
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

      // Aladin Lite v3 requires A.init to complete before calling A.aladin
      window.A.init.then(() => {
        if (!containerRef.current || aladinRef.current) return

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
            const data = (object as { data: Record<string, unknown> }).data
            setSelectedObject({
              name: (data.name as string) || 'Unknown',
              ra: data.ra as number,
              dec: data.dec as number,
              id: data.id as string | undefined,
              source: data.source as string | undefined,
              thumbnail: data.thumbnail as string | undefined,
              description: data.description as string | undefined,
              category: data.category as string | undefined,
              instrument: data.instrument as string | undefined,
            })
            if (!sidebarOpen) setSidebarOpen(true)
          }
        })

        setIsLoaded(true)
        setLoadError(null)
      }).catch((error: Error) => {
        console.error('Aladin init failed:', error)
        setLoadError(`Failed to initialize sky map: ${error.message}`)
      })
    } catch (error) {
      console.error('Failed to initialize Aladin:', error)
      // Retry on error
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(initializeAladin, 500)
      } else {
        setLoadError(`Failed to initialize sky map: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }, [initialRa, initialDec, initialFov, initialTarget, maxRetries])

  // Also try to initialize on mount (in case script is cached)
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!aladinRef.current && !loadError) {
        initializeAladin()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [initializeAladin, loadError])

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

    const sources = observations.map((obs) => {
      const category = obs.category.replace('-', ' ')
      const desc = obs.description || obs.analysis?.summary || ''
      const truncDesc = desc.length > 120 ? desc.slice(0, 120) + '...' : desc
      return window.A.source(obs.coordinates.ra, obs.coordinates.dec, {
        name: obs.targetName,
        popupTitle: `<div style="font-size:14px;font-weight:bold;margin-bottom:4px">${obs.targetName}</div>`,
        popupDesc: [
          `<div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${obs.source} · ${category}${obs.instrument ? ' · ' + obs.instrument : ''}</div>`,
          truncDesc ? `<div style="font-size:12px;color:#ccc;line-height:1.4;margin-bottom:8px">${truncDesc}</div>` : '',
          `<a href="/explore/${obs.id}" target="_blank" style="color:#d4af37;font-size:12px;text-decoration:none">View full details →</a>`,
        ].join(''),
        // Extra fields for sidebar card
        id: obs.id,
        source: obs.source,
        thumbnail: obs.images.thumbnail,
        description: desc,
        category,
        instrument: obs.instrument,
      })
    })

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

  // Toggle meteor shower radiants overlay
  const toggleMeteorRadiants = useCallback(() => {
    if (!aladinRef.current) return

    if (showMeteorRadiants && meteorCatalogRef.current) {
      aladinRef.current.removeCatalog(meteorCatalogRef.current)
      meteorCatalogRef.current = null
      setShowMeteorRadiants(false)
      return
    }

    const showers = getMeteorShowers()
    const now = new Date()

    const catalog = window.A.catalog({
      name: 'Meteor Radiants',
      color: '#ef4444',
      sourceSize: 14,
      shape: 'plus',
      onClick: 'showPopup',
    })

    const sources = showers.map((shower) => {
      const peak = new Date(shower.peakDate)
      const start = new Date(shower.activeStart)
      const end = new Date(shower.activeEnd)
      const isActive = now >= start && now <= end
      const isPast = now > end

      const status = isActive ? 'ACTIVE NOW' : isPast ? 'Past' : 'Upcoming'
      const peakFormatted = peak.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      const statusColor = isActive ? '#22c55e' : isPast ? '#6b7280' : '#f59e0b'
      return window.A.source(shower.radiant.ra, shower.radiant.dec, {
        name: shower.name,
        popupTitle: `<div style="font-size:14px;font-weight:bold;margin-bottom:4px">☄️ ${shower.name}</div>`,
        popupDesc: [
          `<div style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:bold;color:white;background:${statusColor};margin-bottom:6px">${status}</div>`,
          `<div style="font-size:12px;color:#ccc;line-height:1.6">`,
          `<b>Peak:</b> ${peakFormatted}<br/>`,
          `<b>ZHR:</b> ${shower.zenithalHourlyRate}/hr`,
          shower.parentBody ? `<br/><b>Parent:</b> ${shower.parentBody}` : '',
          `</div>`,
        ].join(''),
      })
    })

    catalog.addSources(sources)
    aladinRef.current.addCatalog(catalog)
    meteorCatalogRef.current = catalog
    setShowMeteorRadiants(true)
  }, [showMeteorRadiants])

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
            uiHidden ? 'w-0 opacity-0 pointer-events-none' : sidebarOpen ? 'w-80' : 'w-0'
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

              {/* Overlays */}
              <div className="mb-6">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Overlays
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={toggleMeteorRadiants}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all text-sm',
                      showMeteorRadiants
                        ? 'bg-red-500/10 border border-red-500/30'
                        : 'hover:bg-white/5'
                    )}
                  >
                    <span
                      className={cn(
                        'w-3 h-3 rounded-full border-2 transition-colors',
                        showMeteorRadiants ? 'bg-red-500 border-red-500' : 'border-gray-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={cn('truncate', showMeteorRadiants ? 'text-red-400' : 'text-white')}>
                        Meteor Radiants
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        Annual shower radiant positions
                      </div>
                    </div>
                  </button>
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
                <Card className="mt-6 overflow-hidden" padding="none">
                  {/* Thumbnail */}
                  {selectedObject.thumbnail && (
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={selectedObject.thumbnail}
                        alt={selectedObject.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cosmos-depth to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{selectedObject.name}</h4>
                        {selectedObject.source && (
                          <p className="text-xs text-cosmos-gold mt-0.5">
                            {selectedObject.source}
                            {selectedObject.instrument ? ` · ${selectedObject.instrument}` : ''}
                            {selectedObject.category ? ` · ${selectedObject.category}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          RA {selectedObject.ra.toFixed(4)}° Dec {selectedObject.dec.toFixed(4)}°
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedObject(null)}
                        className="text-gray-400 hover:text-white text-lg leading-none flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                    {selectedObject.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                        {selectedObject.description}
                      </p>
                    )}
                    {selectedObject.id && (
                      <a
                        href={`/explore/${selectedObject.id}`}
                        className="mt-3 block text-center text-xs font-medium text-cosmos-gold hover:text-white py-2 rounded-lg bg-cosmos-gold/10 hover:bg-cosmos-gold/20 transition-colors"
                      >
                        View full details →
                      </a>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Toggle button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'absolute top-1/2 -right-4 -translate-y-1/2 z-30 w-8 h-16 bg-cosmos-surface border border-white/10 rounded-r-lg flex items-center justify-center hover:bg-white/5 transition-all duration-300',
              uiHidden && 'opacity-0 pointer-events-none'
            )}
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
            id="aladin-lite-div"
            data-testid="aladin-container"
            className="absolute inset-0 w-full h-full bg-cosmos-void"
          />

          {/* Loading overlay */}
          {!isLoaded && !loadError && (
            <div className="absolute inset-0 bg-cosmos-void flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cosmos-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Initializing sky map...</p>
                <p className="text-gray-500 text-sm mt-2">Loading Aladin Lite from CDS Strasbourg...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {loadError && (
            <div className="absolute inset-0 bg-cosmos-void flex items-center justify-center z-10">
              <div className="text-center max-w-md px-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-400 text-2xl">!</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Sky Map Unavailable</h3>
                <p className="text-gray-400 mb-4">{loadError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoadError(null)
                    retryCountRef.current = 0
                    initializeAladin()
                  }}
                  className="px-4 py-2 bg-cosmos-gold/20 hover:bg-cosmos-gold/30 text-cosmos-gold rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          <div className={cn(
            'absolute bottom-6 right-6 z-20 flex flex-col gap-2 transition-all duration-300',
            uiHidden && 'opacity-0 pointer-events-none'
          )}>
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
          <div className={cn(
            'absolute top-4 right-4 z-20 transition-all duration-300',
            uiHidden && 'opacity-0 pointer-events-none'
          )}>
            <div className="glass-panel rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentSurvey.color }}
              />
              <span className="text-gray-300">{currentSurvey.name}</span>
            </div>
          </div>

          {/* Hide/Show UI Toggle */}
          <button
            type="button"
            onClick={() => {
              setUiHidden(!uiHidden)
              if (!uiHidden) setSidebarOpen(false)
            }}
            className={cn(
              'absolute z-30 transition-all duration-300 glass-panel rounded-lg p-2 hover:bg-white/10',
              uiHidden
                ? 'bottom-6 right-6 opacity-50 hover:opacity-100'
                : 'top-4 right-36'
            )}
            aria-label={uiHidden ? 'Show controls' : 'Hide controls'}
            title={uiHidden ? 'Show controls' : 'Hide controls'}
          >
            {uiHidden ? (
              <Eye className="w-4 h-4 text-gray-300" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-300" />
            )}
          </button>

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
