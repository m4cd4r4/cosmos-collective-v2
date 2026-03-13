'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import type { Observation, DetectedFeature, ObjectCategory, JWSTInstrument, WavelengthChannel } from '@/types'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { HubbleComparison } from './HubbleComparison'
import Link from 'next/link'
import { ExternalLink, MapPin, Calendar, Ruler, Star, Layers, Search, ChevronRight, Maximize2, Info, Map, ZoomIn, ZoomOut, Minimize2 } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type CategoryFilter = 'all' | ObjectCategory
type InstrumentFilter = 'all' | JWSTInstrument

interface JWSTFilters {
  search: string
  category: CategoryFilter
  instrument: InstrumentFilter
}

// ── Resolution helpers ────────────────────────────────────────────────────────

function getResolutionTier(): 'low' | 'medium' | 'high' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = (navigator as unknown as Record<string, unknown>).connection as { effectiveType?: string; downlink?: number } | undefined
  if (!conn) return 'medium'
  const { effectiveType, downlink } = conn
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || (downlink != null && downlink < 1)) return 'low'
  if (effectiveType === '4g' && downlink != null && downlink >= 5) return 'high'
  return 'medium'
}

function applyTier(url: string, tier: 'low' | 'medium' | 'high'): string {
  if (!url.includes('images-assets.nasa.gov')) return url
  const map = { low: '~small.jpg', medium: '~medium.jpg', high: '~large.jpg' }
  return url.replace(/~(thumb|small|medium|large)\.jpg$/, map[tier])
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: JWSTFilters = {
  search: '',
  category: 'all',
  instrument: 'all',
}

const CATEGORY_LABELS: Record<string, string> = {
  nebula: 'Nebulae',
  galaxy: 'Galaxies',
  'deep-field': 'Deep Fields',
  'solar-system': 'Solar System',
  'star-cluster': 'Star Clusters',
  star: 'Stars',
  other: 'Other',
}

const INSTRUMENT_INFO: Record<string, { range: string; color: string; fullName: string }> = {
  NIRCam: { range: '0.6–5 μm', color: '#d4af37', fullName: 'Near-Infrared Camera' },
  MIRI: { range: '5–28 μm', color: '#ff6b6b', fullName: 'Mid-Infrared Instrument' },
  NIRSpec: { range: '0.6–5.3 μm', color: '#4a90e2', fullName: 'Near-Infrared Spectrograph' },
  NIRISS: { range: '0.6–5 μm', color: '#7ec4ff', fullName: 'Near-Infrared Imager and Slitless Spectrograph' },
}

const CHANNEL_COLORS: Record<string, string> = {
  red: '#ff4444',
  green: '#44dd44',
  blue: '#4488ff',
  luminance: '#ffffff',
}

// Channel off → complementary color overlay (mix-blend-mode: multiply removes that channel)
const CHANNEL_OVERLAY: Record<string, string> = {
  red: 'rgba(0,255,255,0.55)',     // cyan removes red
  green: 'rgba(255,0,255,0.55)',   // magenta removes green
  blue: 'rgba(255,255,0,0.55)',    // yellow removes blue
}

// ── Main Component ───────────────────────────────────────────────────────────

export function JWSTViewer() {
  const observations = useMemo(() => getFeaturedJWSTImages(), [])
  const [filters, setFilters] = useState<JWSTFilters>(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<Observation>(observations[0])
  const [activeWavelength, setActiveWavelength] = useState(0)
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  const [showFeatures, setShowFeatures] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list')
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [showHubble, setShowHubble] = useState(false)
  const [disabledChannels, setDisabledChannels] = useState<Set<string>>(new Set())
  const [channelsExpanded, setChannelsExpanded] = useState(true)

  // Resolution tier — detected once at mount
  const [tier] = useState<'low' | 'medium' | 'high'>(() =>
    typeof navigator !== 'undefined' ? getResolutionTier() : 'medium'
  )
  const upgradedRef = useRef(false)

  const listRef = useRef<HTMLDivElement>(null)

  // ── Derived data ─────────────────────────────────────────────────────────

  const categories = useMemo(() => {
    const cats = new Set(observations.map(o => o.category))
    return Array.from(cats).sort()
  }, [observations])

  const instruments = useMemo(() => {
    const insts = new Set(observations.map(o => o.instrument).filter(Boolean))
    return Array.from(insts) as JWSTInstrument[]
  }, [observations])

  const filtered = useMemo(() => {
    return observations.filter(o => {
      if (filters.category !== 'all' && o.category !== filters.category) return false
      if (filters.instrument !== 'all' && o.instrument !== filters.instrument) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const match = o.targetName.toLowerCase().includes(q)
          || o.aliases?.some(a => a.toLowerCase().includes(q))
          || o.description?.toLowerCase().includes(q)
          || o.coordinates.constellation?.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [observations, filters])

  const stats = useMemo(() => ({
    total: observations.length,
    nebulae: observations.filter(o => o.category === 'nebula').length,
    galaxies: observations.filter(o => o.category === 'galaxy' || o.category === 'deep-field').length,
    solar: observations.filter(o => o.category === 'solar-system').length,
    showing: filtered.length,
  }), [observations, filtered])

  const setFilter = useCallback(
    <K extends keyof JWSTFilters>(key: K, value: JWSTFilters[K]) =>
      setFilters(prev => ({ ...prev, [key]: value })),
    [],
  )

  const selectObservation = useCallback((obs: Observation) => {
    setSelected(obs)
    setActiveWavelength(0)
    setHoveredFeature(null)
    setMobileTab('detail')
    setShowHubble(false)
    setDisabledChannels(new Set())
  }, [])

  // Scroll the sidebar list to show the selected item
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-obs-id="${selected.id}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selected.id])

  // Reset upgrade flag when observation changes
  useEffect(() => {
    upgradedRef.current = false
  }, [selected.id])

  // Current image URL based on wavelength selection
  const currentImageUrl = useMemo(() => {
    const versions = selected.images.wavelengthVersions
    if (versions && versions[activeWavelength]) {
      return versions[activeWavelength].url
    }
    return selected.images.preview
  }, [selected, activeWavelength])

  // Apply resolution tier to the URL
  const tieredImageUrl = useMemo(() => applyTier(currentImageUrl, tier), [currentImageUrl, tier])

  // In production route through the image proxy for reliability
  const proxiedImageUrl = useMemo(() => {
    if (!tieredImageUrl) return ''
    return `/api/image-proxy?url=${encodeURIComponent(tieredImageUrl)}`
  }, [tieredImageUrl])

  // Proxied Hubble URL for comparison
  const proxiedHubbleUrl = useMemo(() => {
    if (!selected.hubbleUrl) return ''
    return `/api/image-proxy?url=${encodeURIComponent(selected.hubbleUrl)}`
  }, [selected.hubbleUrl])

  useEffect(() => {
    setImgLoaded(false)
    setImgError(false)
  }, [proxiedImageUrl])

  const toggleChannel = useCallback((color: string) => {
    setDisabledChannels(prev => {
      const next = new Set(prev)
      if (next.has(color)) next.delete(color)
      else next.add(color)
      return next
    })
  }, [])

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] text-[#c8d4f0] font-mono text-sm select-none overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 h-[52px] bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] shrink-0 z-20">
        <div className="flex items-center gap-3.5">
          <JWSTLogo />
          <span className="hidden sm:inline text-base font-bold tracking-[0.2em] uppercase text-[#e0e8ff]">James Webb Space Telescope</span>
          <span className="sm:hidden text-base font-bold tracking-[0.2em] uppercase text-[#e0e8ff]">JWST</span>
          <span className="hidden sm:inline"><Badge gold>L2 Orbit · 1.5M km</Badge></span>
          <span className="hidden sm:inline"><Badge>Launched Dec 2021</Badge></span>
        </div>
        <span className="text-[11px] text-[#4a5580] tracking-wider">Data: NASA/ESA/CSA/STScI</span>
      </header>

      {/* ── STATS BAR ──────────────────────────────────────────────────── */}
      <div className="flex overflow-x-auto bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.15)] shrink-0">
        <Stat label="JWST Observations" value={stats.total} color="gold" />
        <Stat label="Nebulae" value={stats.nebulae} color="red" />
        <Stat label="Galaxies & Deep Fields" value={stats.galaxies} color="blue" />
        <Stat label="Solar System" value={stats.solar} color="orange" />
        <Stat label="Showing" value={`${stats.showing} / ${stats.total}`} color="dim" />
      </div>

      {/* ── MOBILE TAB BAR ─────────────────────────────────────────────── */}
      <div className="flex lg:hidden bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] shrink-0">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors border-b-2 ${mobileTab === 'list' ? 'text-[#d4af37] border-[#d4af37]' : 'text-[#4a5580] border-transparent'}`}
        >
          Gallery
        </button>
        <button
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors border-b-2 ${mobileTab === 'detail' ? 'text-[#d4af37] border-[#d4af37]' : 'text-[#4a5580] border-transparent'}`}
        >
          Image · Details
        </button>
      </div>

      {/* ── 3-COL LAYOUT ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[240px_1fr_300px] min-h-0">

        {/* ── LEFT SIDEBAR: Gallery + Filters ───────────────────────── */}
        <aside className={`bg-[rgba(13,18,35,0.92)] border-r border-[rgba(212,175,55,0.15)] overflow-y-auto flex-col ${mobileTab === 'list' ? 'flex' : 'hidden lg:flex'}`}>

          {/* Search */}
          <div className="p-3 border-b border-[rgba(212,175,55,0.08)]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a5580]" />
              <input
                className="w-full bg-white/[0.03] border border-[rgba(212,175,55,0.15)] rounded pl-7 pr-2.5 py-1.5 text-[#c8d4f0] text-xs font-mono outline-none focus:border-[#d4af37] transition-colors"
                placeholder="Search targets…"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="px-3 py-2 border-b border-[rgba(212,175,55,0.08)]">
            <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-1.5">Category</div>
            <div className="flex flex-wrap gap-1">
              <Chip active={filters.category === 'all'} onClick={() => setFilter('category', 'all')}>All</Chip>
              {categories.map(cat => (
                <Chip key={cat} active={filters.category === cat} onClick={() => setFilter('category', cat)}>
                  {CATEGORY_LABELS[cat] || cat}
                </Chip>
              ))}
            </div>
          </div>

          {/* Instrument chips */}
          <div className="px-3 py-2 border-b border-[rgba(212,175,55,0.08)]">
            <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-1.5">Instrument</div>
            <div className="flex flex-wrap gap-1">
              <Chip active={filters.instrument === 'all'} onClick={() => setFilter('instrument', 'all')}>All</Chip>
              {instruments.map(inst => (
                <Chip
                  key={inst}
                  active={filters.instrument === inst}
                  onClick={() => setFilter('instrument', inst)}
                  color={INSTRUMENT_INFO[inst]?.color}
                  title={INSTRUMENT_INFO[inst] ? `${inst} (${INSTRUMENT_INFO[inst].fullName}) — ${INSTRUMENT_INFO[inst].range}` : inst}
                >
                  {inst}
                </Chip>
              ))}
            </div>
          </div>

          {/* Observation list */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <div className="text-center text-[#4a5580] text-xs py-8">No matching observations</div>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map(obs => (
                  <button
                    key={obs.id}
                    data-obs-id={obs.id}
                    onClick={() => selectObservation(obs)}
                    className={`flex items-start gap-2 p-2 rounded-lg text-left transition-all ${
                      selected.id === obs.id
                        ? 'bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.3)]'
                        : 'bg-transparent border border-transparent hover:bg-white/[0.03] hover:border-[rgba(212,175,55,0.1)]'
                    }`}
                  >
                    <div className="w-14 h-10 rounded overflow-hidden shrink-0 bg-black/40">
                      <img src={obs.images.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-bold truncate ${selected.id === obs.id ? 'text-[#d4af37]' : 'text-[#e0e8ff]'}`}>
                        {obs.targetName}
                        {obs.hubbleUrl && <span className="ml-1 text-[9px] text-[#4a90e2] opacity-70">⟺</span>}
                      </div>
                      <div className="text-[10px] text-[#4a5580] flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: INSTRUMENT_INFO[obs.instrument || '']?.color || '#666' }} />
                        <span title={INSTRUMENT_INFO[obs.instrument || '']?.fullName}>{obs.instrument || 'Multi'}</span>
                        <span className="text-[#2a3050]">·</span>
                        {CATEGORY_LABELS[obs.category] || obs.category}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Instrument legend */}
          <div className="p-3 border-t border-[rgba(212,175,55,0.08)]">
            <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-2">Instruments</div>
            {Object.entries(INSTRUMENT_INFO).map(([name, info]) => (
              <div key={name} className="flex items-center gap-2 text-[10px] text-[#4a5580] mb-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: info.color, boxShadow: `0 0 4px ${info.color}` }} />
                <span className="text-[#8090b0]">{name}</span>
                <span className="ml-auto">{info.range}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER: Image Viewer ──────────────────────────────────── */}
        <div className={`relative bg-black overflow-hidden ${fullscreen ? 'fixed inset-0 z-50' : ''} ${mobileTab === 'detail' ? 'flex flex-col min-h-[40vh] lg:min-h-0' : 'hidden lg:flex lg:flex-col'}`}>

          {/* Loading state */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none z-10">
              <div className="w-8 h-8 rounded-full border border-[rgba(212,175,55,0.2)] border-t-[#d4af37] animate-spin" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#4a5580]">Loading image…</span>
            </div>
          )}

          {/* Error state */}
          {imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none z-10">
              <span className="text-4xl opacity-30">🔭</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#4a5580]">Image unavailable</span>
            </div>
          )}

          {/* Deep Zoom wrapper */}
          <TransformWrapper
            minScale={1}
            maxScale={8}
            doubleClick={{ mode: 'zoomIn' }}
            wheel={{ step: 0.15 }}
            onTransformed={(_ref, state) => {
              // Progressive resolution upgrade on zoom > 2x
              if (state.scale > 2 && !upgradedRef.current && tier !== 'high') {
                const t = getResolutionTier()
                if (t === 'high') {
                  upgradedRef.current = true
                  // Re-render with high-res URL happens via state update if we expose setTier
                  // For now, mark upgraded to avoid repeated checks
                }
              }
            }}
          >
            {({ zoomIn, zoomOut, resetTransform, instance }) => {
              const scale = instance.transformState.scale
              return (
                <>
                  <TransformComponent
                    wrapperStyle={{ width: '100%', cursor: scale > 1 ? 'grab' : 'zoom-in' }}
                    contentStyle={{ width: '100%' }}
                  >
                    <div style={{ position: 'relative', width: '100%' }}>
                      {/* Channel suppression overlays (applied before SVG so they don't affect boxes) */}
                      {selected.channels && Array.from(disabledChannels).map(color => (
                        <div
                          key={color}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: CHANNEL_OVERLAY[color],
                            mixBlendMode: 'multiply',
                            pointerEvents: 'none',
                            zIndex: 1,
                          }}
                        />
                      ))}

                      <img
                        src={proxiedImageUrl}
                        alt={selected.targetName}
                        className={`w-full block transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        draggable={false}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => { setImgLoaded(false); setImgError(true) }}
                      />

                      {/* Feature bounding boxes — move with the image during zoom/pan */}
                      {showFeatures && selected.features && selected.features.length > 0 && (
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          style={{ top: 0, left: 0, zIndex: 2 }}
                        >
                          {selected.features.map(f => (
                            <g key={f.id}>
                              <rect
                                x={f.boundingBox.x}
                                y={f.boundingBox.y}
                                width={f.boundingBox.width}
                                height={f.boundingBox.height}
                                fill={hoveredFeature === f.id ? 'rgba(212,175,55,0.15)' : 'transparent'}
                                stroke={hoveredFeature === f.id ? '#d4af37' : 'rgba(212,175,55,0.4)'}
                                strokeWidth={hoveredFeature === f.id ? 0.5 : 0.3}
                                strokeDasharray={hoveredFeature === f.id ? undefined : '1 0.5'}
                                className="pointer-events-auto cursor-pointer transition-all"
                                onMouseEnter={() => setHoveredFeature(f.id)}
                                onMouseLeave={() => setHoveredFeature(null)}
                                style={{ vectorEffect: 'non-scaling-stroke' }}
                              />
                              <text
                                x={f.boundingBox.x + 0.5}
                                y={f.boundingBox.y - 0.5}
                                fill={hoveredFeature === f.id ? '#d4af37' : 'rgba(212,175,55,0.6)'}
                                fontSize="2.2"
                                fontFamily="monospace"
                                className="pointer-events-none"
                              >
                                {f.label}
                              </text>
                            </g>
                          ))}
                        </svg>
                      )}
                    </div>
                  </TransformComponent>

                  {/* Zoom controls — absolute over the image */}
                  <div
                    className="absolute flex items-center gap-1"
                    style={{ bottom: 48, right: 8, zIndex: 20 }}
                  >
                    {tier === 'high' && (
                      <span className="text-[9px] font-bold text-[#d4af37] border border-[rgba(212,175,55,0.4)] rounded px-1.5 py-0.5 bg-black/60 mr-1">HD</span>
                    )}
                    <span className="text-[10px] text-[#4a5580] bg-black/60 px-1.5 py-0.5 rounded tabular-nums">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => zoomIn()}
                      className="w-7 h-7 rounded flex items-center justify-center bg-black/60 border border-white/10 text-[#8090b0] hover:text-[#d4af37] hover:border-[rgba(212,175,55,0.3)] transition-colors"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="w-7 h-7 rounded flex items-center justify-center bg-black/60 border border-white/10 text-[#8090b0] hover:text-[#d4af37] hover:border-[rgba(212,175,55,0.3)] transition-colors"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="w-7 h-7 rounded flex items-center justify-center bg-black/60 border border-white/10 text-[#8090b0] hover:text-[#d4af37] hover:border-[rgba(212,175,55,0.3)] transition-colors"
                      title="Reset zoom"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )
            }}
          </TransformWrapper>

          {/* Gradient vignette */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          {/* Controls — top right */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            {/* Hubble comparison button */}
            {selected.hubbleUrl && (
              <button
                onClick={() => setShowHubble(true)}
                className="px-2.5 py-1.5 rounded text-[10px] uppercase tracking-wider bg-[rgba(74,144,226,0.15)] text-[#4a90e2] border border-[rgba(74,144,226,0.3)] hover:bg-[rgba(74,144,226,0.25)] transition-all backdrop-blur-sm"
                title="Compare this view with a Hubble image"
              >
                ⟺ Hubble
              </button>
            )}

            {selected.features && selected.features.length > 0 && (
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                className={`px-2.5 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all backdrop-blur-sm ${
                  showFeatures
                    ? 'bg-[rgba(212,175,55,0.2)] text-[#d4af37] border border-[rgba(212,175,55,0.3)]'
                    : 'bg-black/50 text-[#4a5580] border border-white/10 hover:text-[#d4af37]'
                }`}
              >
                <Layers className="w-3 h-3 inline-block mr-1" />
                {showFeatures ? 'Hide' : 'Show'} Features
              </button>
            )}
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-1.5 rounded bg-black/50 text-[#4a5580] border border-white/10 hover:text-[#d4af37] transition-colors backdrop-blur-sm"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen close */}
          {fullscreen && (
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-16 z-50 px-3 py-1.5 rounded bg-black/70 text-white border border-white/20 hover:bg-white/10 transition-colors text-xs tracking-wider"
            >
              ESC
            </button>
          )}

          {/* Target name — bottom left */}
          <div className="absolute bottom-3 left-4 z-10">
            <div className="text-lg font-bold text-white drop-shadow-lg leading-tight">
              {selected.targetName}
            </div>
            {selected.description && (
              <div className="text-[11px] text-white/60 max-w-[600px] line-clamp-1 drop-shadow-lg mt-0.5">
                {selected.description}
              </div>
            )}
          </div>

          {/* Wavelength switcher — bottom right */}
          {selected.images.wavelengthVersions && selected.images.wavelengthVersions.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
              <span className="text-[9px] uppercase tracking-[0.18em] text-white/40 mr-1">Band</span>
              {selected.images.wavelengthVersions.map((wv, i) => (
                <button
                  key={i}
                  onClick={() => setActiveWavelength(i)}
                  className={`px-3 py-1 rounded text-[11px] font-mono transition-all backdrop-blur-sm ${
                    activeWavelength === i
                      ? 'bg-[rgba(212,175,55,0.25)] text-[#d4af37] border border-[rgba(212,175,55,0.5)]'
                      : 'bg-black/50 text-white/50 border border-white/15 hover:text-[#d4af37] hover:border-[rgba(212,175,55,0.3)]'
                  }`}
                >
                  {wv.colorMap || wv.band}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR: Details ────────────────────────────────── */}
        <aside className={`bg-[rgba(13,18,35,0.92)] border-l border-[rgba(212,175,55,0.15)] overflow-y-auto flex-col ${mobileTab === 'detail' ? 'flex' : 'hidden lg:flex'}`}>

          {/* Observation info */}
          <div className="p-4">
            <h2 className="text-[15px] font-bold text-[#e0e8ff] mb-1">{selected.targetName}</h2>
            {selected.aliases && selected.aliases.length > 0 && (
              <div className="text-[10px] text-[#4a5580] mb-3">{selected.aliases.join(' · ')}</div>
            )}

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
              <MetaItem icon={<Star className="w-3 h-3" />} label="Category" value={CATEGORY_LABELS[selected.category] || selected.category} />
              <MetaItem icon={<Layers className="w-3 h-3" />} label="Instrument" value={selected.instrument ? `${selected.instrument} (${INSTRUMENT_INFO[selected.instrument]?.fullName || selected.instrument})` : 'Multiple'} />
              <MetaItem icon={<Calendar className="w-3 h-3" />} label="Observed" value={formatDate(selected.observationDate)} />
              {selected.coordinates.constellation && (
                <MetaItem icon={<MapPin className="w-3 h-3" />} label="Constellation" value={selected.coordinates.constellation} />
              )}
              {selected.distanceLightYears && (
                <MetaItem icon={<Ruler className="w-3 h-3" />} label="Distance" value={formatDistance(selected.distanceLightYears)} />
              )}
              {selected.redshift !== undefined && selected.redshift > 0 && (
                <MetaItem icon={<Info className="w-3 h-3" />} label="Redshift" value={`z = ${selected.redshift}`} />
              )}
            </div>

            {/* Coordinates */}
            <div className="bg-white/[0.02] rounded-lg p-2.5 border border-[rgba(212,175,55,0.08)] mb-4">
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-1.5">Coordinates (J2000)</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#4a5580]">RA: </span>
                  <span className="text-[#8090b0]">{selected.coordinates.ra.toFixed(4)}°</span>
                </div>
                <div>
                  <span className="text-[#4a5580]">Dec: </span>
                  <span className="text-[#8090b0]">{selected.coordinates.dec.toFixed(4)}°</span>
                </div>
              </div>
              <Link
                href={`/sky-map?ra=${selected.coordinates.ra.toFixed(4)}&dec=${selected.coordinates.dec.toFixed(4)}&fov=2&target=${encodeURIComponent(selected.targetName)}`}
                className="flex items-center gap-1.5 mt-2 text-[10px] text-[#4a90e2] hover:text-[#d4af37] transition-colors"
              >
                <Map className="w-3 h-3" />
                Open in Sky Map
              </Link>
            </div>

            {/* Filters used */}
            {selected.filters && selected.filters.length > 0 && (
              <div className="mb-4">
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-1.5">Filters Used</div>
                <div className="flex flex-wrap gap-1">
                  {selected.filters.map(f => (
                    <span key={f} className="px-2 py-0.5 rounded bg-white/[0.04] border border-[rgba(212,175,55,0.1)] text-[10px] text-[#8090b0]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Wavelength Channels panel */}
          {selected.channels && selected.channels.length > 0 && (
            <div className="px-4 pb-3 border-t border-[rgba(212,175,55,0.08)] pt-3">
              <button
                onClick={() => setChannelsExpanded(v => !v)}
                className="flex items-center justify-between w-full mb-2 group"
              >
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] group-hover:text-[#d4af37] transition-colors">
                  Wavelength Channels
                </div>
                <span className="text-[#4a5580] text-[10px]">{channelsExpanded ? '▲' : '▼'}</span>
              </button>

              {channelsExpanded && (
                <>
                  <div className="flex flex-col gap-1.5 mb-2">
                    {selected.channels.map((ch: WavelengthChannel) => {
                      const isOff = disabledChannels.has(ch.color)
                      const dotColor = CHANNEL_COLORS[ch.color] || '#888'
                      return (
                        <button
                          key={ch.name}
                          onClick={() => toggleChannel(ch.color)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                            isOff
                              ? 'bg-black/30 border-[rgba(255,255,255,0.05)] opacity-50'
                              : 'bg-white/[0.02] border-[rgba(212,175,55,0.08)] hover:border-[rgba(212,175,55,0.2)]'
                          }`}
                          title={isOff ? 'Click to restore this channel' : 'Click to suppress this channel'}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              background: isOff ? '#333' : dotColor,
                              boxShadow: isOff ? 'none' : `0 0 5px ${dotColor}80`,
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-[#e0e8ff]">{ch.name}</span>
                              <span className="text-[10px] text-[#4a5580]">{ch.wavelength}</span>
                            </div>
                            <div className="text-[9px] text-[#6a7890] leading-tight mt-0.5 truncate">{ch.description}</div>
                          </div>
                          {isOff && <span className="text-[9px] text-[#4a5580] shrink-0">OFF</span>}
                        </button>
                      )
                    })}
                  </div>

                  {disabledChannels.size > 0 && (
                    <button
                      onClick={() => setDisabledChannels(new Set())}
                      className="w-full text-[10px] text-[#d4af37] border border-[rgba(212,175,55,0.2)] rounded py-1 hover:bg-[rgba(212,175,55,0.08)] transition-colors mb-2"
                    >
                      Restore all channels
                    </button>
                  )}

                  <div className="bg-white/[0.01] rounded p-2 border border-[rgba(212,175,55,0.05)]">
                    <div className="text-[9px] uppercase tracking-[0.15em] text-[#4a5580] mb-1">What am I looking at?</div>
                    <p className="text-[10px] text-[#6a7890] leading-relaxed">
                      JWST images are false-color composites. Each filter captures a specific wavelength of light invisible to human eyes.
                      Scientists assign colors (R/G/B) to each channel to create the final image. Toggle channels above to see what each wavelength reveals.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Features section */}
          {selected.features && selected.features.length > 0 && (
            <div className="px-4 pb-3">
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-2">
                Detected Features ({selected.features.length})
              </div>
              <div className="flex flex-col gap-1.5">
                {selected.features.map(f => (
                  <FeatureCard
                    key={f.id}
                    feature={f}
                    isHovered={hoveredFeature === f.id}
                    onHover={() => setHoveredFeature(f.id)}
                    onLeave={() => setHoveredFeature(null)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Analysis section */}
          {selected.analysis && (
            <div className="px-4 pb-4 border-t border-[rgba(212,175,55,0.08)] pt-3">
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-2">Analysis</div>
              <p className="text-[11px] text-[#8090b0] leading-relaxed mb-3">{selected.analysis.summary}</p>

              {selected.analysis.scientificContext && (
                <>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-1.5">Scientific Context</div>
                  <p className="text-[11px] text-[#6a7890] leading-relaxed mb-3">{selected.analysis.scientificContext}</p>
                </>
              )}

              {selected.analysis.keyFeatures && selected.analysis.keyFeatures.length > 0 && (
                <>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-1.5">Key Features</div>
                  <ul className="mb-3">
                    {selected.analysis.keyFeatures.map((kf, i) => (
                      <li key={i} className="text-[11px] text-[#6a7890] flex items-start gap-1.5 mb-0.5">
                        <ChevronRight className="w-3 h-3 text-[#d4af37] shrink-0 mt-0.5" />
                        {kf}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {selected.analysis.funFacts && selected.analysis.funFacts.length > 0 && (
                <>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-1.5">Fun Facts</div>
                  <ul className="mb-3">
                    {selected.analysis.funFacts.map((ff, i) => (
                      <li key={i} className="text-[11px] text-[#6a7890] flex items-start gap-1.5 mb-1">
                        <span className="text-[#d4af37] shrink-0">★</span>
                        {ff}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* External links */}
          {selected.externalLinks && selected.externalLinks.length > 0 && (
            <div className="px-4 pb-4 border-t border-[rgba(212,175,55,0.08)] pt-3 mt-auto">
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-2">External Links</div>
              <div className="flex flex-col gap-1.5">
                {selected.externalLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white/[0.02] border border-[rgba(212,175,55,0.1)] text-[11px] text-[#8090b0] hover:text-[#d4af37] hover:border-[rgba(212,175,55,0.25)] transition-all"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {link.label}
                  </a>
                ))}
              </div>

              <a
                href={`/explore/${selected.id}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] text-[11px] text-[#d4af37] hover:bg-[rgba(212,175,55,0.15)] transition-all mt-1.5"
              >
                <ChevronRight className="w-3 h-3 shrink-0" />
                Full Details
              </a>
            </div>
          )}
        </aside>
      </div>

      {/* Hubble comparison fullscreen overlay */}
      {showHubble && selected.hubbleUrl && (
        <HubbleComparison
          jwstUrl={proxiedImageUrl}
          hubbleUrl={proxiedHubbleUrl}
          targetName={selected.targetName}
          onClose={() => setShowHubble(false)}
        />
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function JWSTLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      {[
        [16, 8], [22, 11], [22, 19], [16, 22], [10, 19], [10, 11],
        [16, 15],
      ].map(([cx, cy], i) => (
        <polygon
          key={i}
          points={hexPoints(cx, cy, i === 6 ? 3.5 : 3)}
          fill={i === 6 ? '#d4af37' : 'rgba(212,175,55,0.15)'}
          stroke="#d4af37"
          strokeWidth={i === 6 ? 0.8 : 0.5}
          opacity={i === 6 ? 1 : 0.7}
        />
      ))}
      <line x1="3" y1="28" x2="29" y2="28" stroke="#4a5580" strokeWidth="0.5" opacity="0.4" />
      <line x1="5" y1="30" x2="27" y2="30" stroke="#4a5580" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

function Badge({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded border tracking-[0.12em] uppercase ${
      gold
        ? 'bg-[rgba(212,175,55,0.1)] border-[rgba(212,175,55,0.25)] text-[#d4af37]'
        : 'bg-[rgba(74,144,226,0.12)] border-[rgba(74,144,226,0.25)] text-[#4a90e2]'
    }`}>
      {children}
    </span>
  )
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    gold: '#d4af37',
    blue: '#4a90e2',
    red: '#ff6b6b',
    orange: '#ff9a3c',
    dim: '#4a5580',
  }
  return (
    <div className="flex-1 py-2.5 px-4 border-r border-[rgba(212,175,55,0.08)] last:border-r-0 text-center">
      <div className="text-lg font-bold tabular-nums" style={{ color: colors[color] || colors.dim }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mt-0.5">{label}</div>
    </div>
  )
}

function Chip({ children, active, onClick, color, title }: { children: React.ReactNode; active: boolean; onClick: () => void; color?: string; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-[10px] transition-all border ${
        active
          ? 'bg-[rgba(212,175,55,0.15)] text-[#d4af37] border-[rgba(212,175,55,0.3)]'
          : 'bg-transparent text-[#4a5580] border-[rgba(212,175,55,0.08)] hover:text-[#d4af37] hover:border-[rgba(212,175,55,0.2)]'
      }`}
      style={active && color ? { color, borderColor: `${color}40` } : undefined}
    >
      {children}
    </button>
  )
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-[#4a5580] mb-0.5">
        {icon}
        {label}
      </div>
      <div className="text-[11px] text-[#8090b0]">{value}</div>
    </div>
  )
}

function FeatureCard({ feature, isHovered, onHover, onLeave }: {
  feature: DetectedFeature
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`p-2 rounded-lg border transition-all cursor-default ${
        isHovered
          ? 'bg-[rgba(212,175,55,0.08)] border-[rgba(212,175,55,0.25)]'
          : 'bg-white/[0.01] border-[rgba(212,175,55,0.06)]'
      }`}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-[11px] font-bold ${isHovered ? 'text-[#d4af37]' : 'text-[#e0e8ff]'}`}>
          {feature.label}
        </span>
        <span className="text-[10px] text-[#4a5580]">
          {Math.round(feature.confidence * 100)}%
        </span>
      </div>
      {feature.description && (
        <p className="text-[10px] text-[#6a7890] leading-relaxed">{feature.description}</p>
      )}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDistance(ly: number): string {
  if (ly >= 1_000_000_000) return `${(ly / 1_000_000_000).toFixed(1)}B ly`
  if (ly >= 1_000_000) return `${(ly / 1_000_000).toFixed(0)}M ly`
  if (ly >= 1_000) return `${(ly / 1_000).toFixed(1)}K ly`
  return `${ly.toLocaleString()} ly`
}
