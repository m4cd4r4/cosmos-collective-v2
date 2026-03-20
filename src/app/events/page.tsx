'use client'

/**
 * Live Events Page
 * Sky-event-map hero + gallery cards + real-time data panels
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { WorldMapSVG } from '@/components/ui/WorldMapSVG'
import { NeoApproachDiagram } from '@/components/features/events/NeoApproachDiagram'
import { SolarGauge } from '@/components/features/events/SolarGauge'
import { EventSkyMap, type EventSkyMapHandle } from '@/components/features/events/EventSkyMap'
import {
  getAllCurrentEvents,
  getISSPosition,
  getSolarWeather,
  getMeteorShowers,
  getAstronomyPictureOfTheDay,
  type APODData,
} from '@/services/real-time-events'
import type { AstronomicalEvent } from '@/types'
import {
  Calendar,
  Zap,
  Globe,
  Star,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Loader2,
  Sparkles,
  Radio,
  Satellite,
  Video,
  Eye,
  Moon,
  Sun,
  Rocket,
  ChevronDown,
  ChevronUp,
  MapPin,
  Telescope,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { getEventIcon, getSeverityHex } from '@/lib/event-utils'

// ── ISS Camera feeds ────────────────────────────────────────────────────────

const ISS_CAMERAS = [
  {
    id: 'iss-live-1',
    name: 'Cam 1',
    description: 'ISS exterior camera',
    videoId: 'Ni-YkkvH6DQ',
    directUrl: 'https://www.youtube.com/watch?v=Ni-YkkvH6DQ',
  },
  {
    id: 'iss-live-2',
    name: 'Cam 2',
    description: 'Earth views from orbit',
    videoId: 'iYmvCUonukw',
    directUrl: 'https://www.youtube.com/watch?v=iYmvCUonukw',
  },
]

const getEmbedUrl = (videoId: string) =>
  `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&enablejsapi=1`

async function checkYouTubeAvailable(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(5000) },
    )
    return res.ok
  } catch {
    return false
  }
}

const INITIAL_EVENT_COUNT = 8
const LOAD_MORE_COUNT = 8

// ── Helpers ─────────────────────────────────────────────────────────────────

function getEventThumbnail(type: string) {
  switch (type) {
    case 'solar':
      return 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000393/GSFC_20171208_Archive_e000393~thumb.jpg'
    case 'asteroid':
      return 'https://images-assets.nasa.gov/image/PIA17041/PIA17041~thumb.jpg'
    case 'meteor-shower':
      return 'https://images-assets.nasa.gov/image/NHQ201908130001/NHQ201908130001~thumb.jpg'
    case 'transit':
      return 'https://images-assets.nasa.gov/image/PIA23172/PIA23172~thumb.jpg'
    case 'transient':
      return 'https://images-assets.nasa.gov/image/PIA22085/PIA22085~thumb.jpg'
    case 'grb':
      return 'https://images-assets.nasa.gov/image/PIA20051/PIA20051~thumb.jpg'
    case 'lunar':
      return 'https://images-assets.nasa.gov/image/PIA12235/PIA12235~thumb.jpg'
    case 'eclipse':
      return 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001435/GSFC_20171208_Archive_e001435~thumb.jpg'
    case 'conjunction':
      return 'https://images-assets.nasa.gov/image/PIA23962/PIA23962~thumb.jpg'
    case 'launch':
      return 'https://images-assets.nasa.gov/image/KSC-20201115-PH-SPX01_0001/KSC-20201115-PH-SPX01_0001~thumb.jpg'
    default:
      return 'https://images-assets.nasa.gov/image/PIA17563/PIA17563~thumb.jpg'
  }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<AstronomicalEvent[]>([])
  const [apod, setApod] = useState<APODData | null>(null)
  const [issPosition, setIssPosition] = useState<{ lat: number; lon: number } | null>(null)
  const [issError, setIssError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedCamera, setSelectedCamera] = useState(ISS_CAMERAS[0])
  const [displayCount, setDisplayCount] = useState(INITIAL_EVENT_COUNT)
  const [solarData, setSolarData] = useState<{ flareLevel: string; currentFlux: number } | null>(null)
  const [apodExpanded, setApodExpanded] = useState(false)
  const [highlightedEvent, setHighlightedEvent] = useState<string | null>(null)

  const skyMapRef = useRef<EventSkyMapHandle>(null)
  const skyMapSectionRef = useRef<HTMLElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const ytReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const switchToCamera2 = useCallback(() => {
    setSelectedCamera((prev) => (prev.id === 'iss-live-1' ? ISS_CAMERAS[1] : prev))
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [eventsResult, apodResult, issResult, solarResult] = await Promise.allSettled([
        getAllCurrentEvents(),
        getAstronomyPictureOfTheDay(),
        getISSPosition(),
        getSolarWeather(),
      ])
      if (eventsResult.status === 'fulfilled' && eventsResult.value.success)
        setEvents(eventsResult.value.data || [])
      if (apodResult.status === 'fulfilled' && apodResult.value.success)
        setApod(apodResult.value.data || null)
      if (issResult.status === 'fulfilled' && issResult.value.success && issResult.value.data) {
        setIssPosition({ lat: issResult.value.data.position.lat, lon: issResult.value.data.position.lon })
        setIssError(false)
      } else {
        setIssError(true)
      }
      if (solarResult.status === 'fulfilled' && solarResult.value.success && solarResult.value.data)
        setSolarData({ flareLevel: solarResult.value.data.flareLevel, currentFlux: solarResult.value.data.currentFlux })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const issInterval = setInterval(async () => {
      const result = await getISSPosition()
      if (result.success && result.data) {
        setIssPosition({ lat: result.data.position.lat, lon: result.data.position.lon })
        setIssError(false)
      } else {
        setIssError(true)
      }
    }, 30000)
    return () => clearInterval(issInterval)
  }, [])

  useEffect(() => {
    let cancelled = false
    checkYouTubeAvailable(ISS_CAMERAS[0].videoId).then((ok) => {
      if (!ok && !cancelled) switchToCamera2()
    })
    function handleYTMessage(event: MessageEvent) {
      if (event.origin !== 'https://www.youtube.com') return
      try {
        const data = JSON.parse(event.data as string)
        if (data.event === 'onError' && !cancelled) switchToCamera2()
        if (data.event === 'onReady') {
          ytReadyTimeoutRef.current = setTimeout(() => { if (!cancelled) switchToCamera2() }, 8000)
        }
        if (data.event === 'onStateChange' && (data.info === 1 || data.info === 3)) {
          if (ytReadyTimeoutRef.current) clearTimeout(ytReadyTimeoutRef.current)
        }
      } catch { /* not a YT message */ }
    }
    window.addEventListener('message', handleYTMessage)
    return () => {
      cancelled = true
      window.removeEventListener('message', handleYTMessage)
      if (ytReadyTimeoutRef.current) clearTimeout(ytReadyTimeoutRef.current)
    }
  }, [switchToCamera2])

  useEffect(() => {
    if (!isLoading && events.length > 0) {
      const hash = window.location.hash.slice(1)
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            el.classList.add('ring-2', 'ring-cosmos-gold', 'ring-offset-2', 'ring-offset-cosmos-void')
            setTimeout(() => el.classList.remove('ring-2', 'ring-cosmos-gold', 'ring-offset-2', 'ring-offset-cosmos-void'), 3000)
          }
        }, 100)
      }
    }
  }, [isLoading, events])

  const handleLocate = useCallback((event: AstronomicalEvent) => {
    if (!skyMapRef.current) return
    if (event.coordinates) {
      skyMapRef.current.flyTo(event.coordinates.ra, event.coordinates.dec, 20)
    } else if (event.type === 'conjunction') {
      const firstBody = event.title.split('-')[0].trim()
      skyMapRef.current.gotoObject(firstBody)
    }
    skyMapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleSkyMarkerHover = useCallback((name: string | null) => {
    if (name) {
      const matchId = `meteor-${name.toLowerCase().replace(/\s/g, '-')}`
      setHighlightedEvent(matchId)
    } else {
      setHighlightedEvent(null)
    }
  }, [])

  const meteorShowers = getMeteorShowers()
  const now = new Date()
  const upcomingShowers = meteorShowers.filter((s) => new Date(s.peakDate) >= now).slice(0, 3)

  const canLocate = (event: AstronomicalEvent) =>
    !!(event.coordinates || event.type === 'conjunction')

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* ── App Header Strip ──────────────────────────────────────────────── */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-[#d4af37]" />
          <span className="text-base font-bold tracking-[0.15em] uppercase text-[#e0e8ff]">Live Events</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.15em] text-red-400">Live</span>
          </div>
          <span className="hidden sm:inline text-[9px] uppercase tracking-[0.12em] text-[#4a5580] border border-[rgba(212,175,55,0.1)] px-2 py-0.5 rounded">
            Astronomical · Space Weather · ISS
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] text-[#4a5580] uppercase tracking-wider hidden sm:block">
              {formatDate(lastUpdated.toISOString(), { hour: 'numeric', minute: 'numeric' })}
            </span>
          )}
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[rgba(212,175,55,0.2)] text-[#d4af37] text-[10px] uppercase tracking-wider hover:bg-[rgba(212,175,55,0.08)] transition-colors disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.08)] flex shrink-0">
        {[
          { label: 'Active Events', value: isLoading ? '—' : String(events.length), color: '#d4af37' },
          { label: 'ISS Altitude', value: '~408 km', color: '#4a90e2' },
          { label: 'Solar Activity', value: solarData ? solarData.flareLevel : '—', color: '#f59e0b' },
          { label: 'Next Shower', value: upcomingShowers[0]?.name ?? '—', color: '#e040fb' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center px-6 lg:px-10 py-2 border-r border-[rgba(212,175,55,0.06)] last:border-0">
            <span className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</span>
            <span className="text-[9px] uppercase tracking-[0.13em] text-[#4a5580] mt-0.5 whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* ── LEFT ────────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Sky Event Map */}
            <section
              ref={skyMapSectionRef}
              className="rounded-xl border border-[rgba(212,175,55,0.15)] overflow-hidden bg-[rgba(8,12,28,0.7)]"
            >
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Telescope className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff] font-semibold">
                    Sky Events Map
                  </span>
                  <span className="text-[9px] text-[#4a5580]">· Meteor radiant positions</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-[#4a5580]">
                  <MapPin className="w-3 h-3 text-[#d4af37]" />
                  Hover markers · click Locate on events below
                </div>
              </div>
              <EventSkyMap
                ref={skyMapRef}
                className="h-64"
                onMarkerHover={handleSkyMarkerHover}
              />
            </section>

            {/* ISS Live Feed — compact */}
            <section className="rounded-xl border border-[rgba(212,175,55,0.15)] overflow-hidden bg-[rgba(8,12,28,0.7)]">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff] font-semibold">ISS Live Feed</span>
                  <span className="text-[9px] text-[#4a5580]">· Earth from 408 km</span>
                </div>
                <div className="flex items-center gap-1">
                  {ISS_CAMERAS.map((camera) => (
                    <button
                      key={camera.id}
                      type="button"
                      onClick={() => setSelectedCamera(camera)}
                      className={cn(
                        'px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider transition-colors',
                        selectedCamera.id === camera.id
                          ? 'bg-[rgba(212,175,55,0.15)] text-[#d4af37] border border-[rgba(212,175,55,0.3)]'
                          : 'text-[#4a5580] hover:text-[#c8d4f0]',
                      )}
                    >
                      {camera.name}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30">
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] text-red-400">Live</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-video bg-black">
                <iframe
                  ref={iframeRef}
                  src={getEmbedUrl(selectedCamera.videoId)}
                  title={selectedCamera.name}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="px-4 py-2 border-t border-[rgba(212,175,55,0.08)] flex items-center justify-between flex-wrap gap-2 text-[10px]">
                <div className="flex items-center gap-4">
                  <span className="text-[#4a5580]"><span className="text-[#d4af37] font-bold">~27,600</span> km/h</span>
                  <span className="text-[#4a5580]"><span className="text-[#d4af37] font-bold">~408</span> km alt</span>
                  <span className="text-[#4a5580]"><span className="text-[#e040fb] font-bold">92</span> min/orbit</span>
                </div>
                <a
                  href={selectedCamera.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#d4af37] hover:text-[#e0c060] transition-colors"
                >
                  YouTube <ExternalLink className="w-3 h-3" />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </div>
            </section>

            {/* ── Events Gallery ───────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff] font-semibold">
                  Current &amp; Upcoming Events
                </span>
                {!isLoading && (
                  <span className="text-[10px] text-[#4a5580]">({events.length})</span>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12 rounded-xl border border-[rgba(212,175,55,0.08)]">
                  <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
                </div>
              ) : events.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {events.slice(0, displayCount).map((event) => {
                      const Icon = getEventIcon(event.type)
                      const severityColor = getSeverityHex(event.severity)
                      const isHighlighted = highlightedEvent === event.id
                      return (
                        <div
                          key={event.id}
                          id={event.id}
                          className={cn(
                            'rounded-xl border overflow-hidden bg-[rgba(8,12,28,0.7)] transition-all duration-300 group',
                            isHighlighted
                              ? 'border-[rgba(212,175,55,0.5)] shadow-[0_0_16px_rgba(212,175,55,0.15)]'
                              : 'border-[rgba(212,175,55,0.12)] hover:border-[rgba(212,175,55,0.3)]',
                          )}
                        >
                          {/* Hero image */}
                          <div className="relative h-32 overflow-hidden">
                            <img
                              src={getEventThumbnail(event.type)}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            {event.isOngoing && (
                              <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/80 backdrop-blur-sm">
                                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                <span className="text-[8px] text-white uppercase tracking-wider">Live</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <span
                                className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: `${severityColor}30`,
                                  color: severityColor,
                                  border: `1px solid ${severityColor}50`,
                                }}
                              >
                                {event.severity}
                              </span>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center backdrop-blur-sm"
                                style={{ background: `${severityColor}30`, border: `1px solid ${severityColor}30` }}
                              >
                                <Icon className="w-3.5 h-3.5" style={{ color: severityColor }} />
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3">
                            <div className="text-[12px] text-[#c8d4f0] font-semibold line-clamp-1 mb-1">
                              {event.title}
                            </div>
                            <p className="text-[10px] text-[#4a5580] line-clamp-2 leading-relaxed">
                              {event.description}
                            </p>
                            <div className="flex items-center justify-between mt-2.5 gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-[9px] text-[#4a5580] whitespace-nowrap">
                                  {formatDate(event.eventTime, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {event.references?.[0] && (
                                  <a
                                    href={event.references[0].url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-0.5 text-[9px] text-[#d4af37] hover:underline shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {event.references[0].label}
                                    <ExternalLink className="w-2 h-2" />
                                    <span className="sr-only">(opens in new tab)</span>
                                  </a>
                                )}
                              </div>
                              {canLocate(event) && (
                                <button
                                  type="button"
                                  onClick={() => handleLocate(event)}
                                  className="flex items-center gap-1 text-[9px] text-[#d4af37] hover:text-white transition-colors shrink-0 px-2 py-0.5 rounded hover:bg-[rgba(212,175,55,0.1)]"
                                >
                                  <MapPin className="w-2.5 h-2.5" />
                                  Locate
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {displayCount < events.length && (
                    <button
                      type="button"
                      onClick={() => setDisplayCount((c) => c + LOAD_MORE_COUNT)}
                      className="w-full mt-3 py-2.5 text-[10px] uppercase tracking-[0.15em] text-[#d4af37] hover:bg-[rgba(212,175,55,0.05)] rounded-xl border border-[rgba(212,175,55,0.1)] transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show {events.length - displayCount} more events
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-12 rounded-xl border border-[rgba(212,175,55,0.08)]">
                  <Sparkles className="w-8 h-8 text-[#4a5580] mx-auto mb-3" />
                  <p className="text-[12px] text-[#4a5580]">No active events — check back soon</p>
                </div>
              )}
            </section>
          </div>

          {/* ── RIGHT: Sidebar ────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* ISS Position */}
            <section className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                <Satellite className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff]">ISS Position</span>
              </div>
              <div className="p-3">
                {issPosition ? (
                  <div className="space-y-2">
                    <WorldMapSVG issPosition={issPosition} className="w-full rounded bg-white/5 p-1" />
                    <div className="grid grid-cols-2 gap-x-4 text-[11px]">
                      <div className="flex justify-between"><span className="text-[#4a5580]">Lat</span><span className="text-[#c8d4f0]">{issPosition.lat.toFixed(2)}°</span></div>
                      <div className="flex justify-between"><span className="text-[#4a5580]">Lon</span><span className="text-[#c8d4f0]">{issPosition.lon.toFixed(2)}°</span></div>
                    </div>
                    <p className="text-[9px] text-[#4a5580]">↻ Updates every 30 seconds</p>
                  </div>
                ) : issError ? (
                  <div className="py-2 space-y-1.5">
                    <p className="text-[11px] text-[#4a5580]">Tracking unavailable</p>
                    <a href="https://spotthestation.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#d4af37] hover:underline">
                      NASA Spot the Station →
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-2 text-[11px] text-[#4a5580]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
                  </div>
                )}
              </div>
            </section>

            {/* Solar Activity */}
            {solarData && (
              <section className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff]">Solar Activity</span>
                </div>
                <div className="p-3">
                  <SolarGauge flareLevel={solarData.flareLevel} currentFlux={solarData.currentFlux} />
                  <a href="https://www.swpc.noaa.gov/" target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#d4af37] hover:underline flex items-center gap-1 mt-2">
                    NOAA Space Weather <ExternalLink className="w-2.5 h-2.5" />
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </div>
              </section>
            )}

            {/* NEO Approach */}
            {events.some((e) => e.type === 'asteroid') && (
              <section className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff]">Near-Earth Objects</span>
                </div>
                <div className="p-3"><NeoApproachDiagram events={events} /></div>
              </section>
            )}

            {/* Meteor Showers */}
            <section className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff]">Upcoming Showers</span>
              </div>
              <div className="divide-y divide-[rgba(212,175,55,0.06)]">
                {upcomingShowers.map((shower) => (
                  <button
                    key={shower.name}
                    type="button"
                    onClick={() => skyMapRef.current?.flyTo(shower.radiant.ra, shower.radiant.dec, 20)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.03] transition-colors group text-left"
                  >
                    <div>
                      <div className="text-[11px] text-[#c8d4f0] group-hover:text-[#d4af37] transition-colors">{shower.name}</div>
                      <div className="text-[9px] text-[#4a5580] mt-0.5">Peak: {formatDate(shower.peakDate, { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#d4af37]">{shower.zenithalHourlyRate}/hr</span>
                      <MapPin className="w-3 h-3 text-[#4a5580] group-hover:text-[#d4af37] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* APOD */}
            {apod && (
              <section className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff]">Astronomy Picture</span>
                  </div>
                  <span className="text-[9px] text-[#d4af37] px-1.5 py-0.5 rounded border border-[rgba(212,175,55,0.2)]">Today</span>
                </div>
                {apod.media_type === 'image' ? (
                  <a href={apod.hdurl || apod.url} target="_blank" rel="noopener noreferrer" className="block" aria-label={`${apod.title} (opens in new tab)`}>
                    <div className="relative aspect-video">
                      <img src={apod.url} alt={apod.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] to-transparent" />
                    </div>
                  </a>
                ) : apod.media_type === 'video' ? (
                  <div className="relative aspect-video">
                    <iframe src={apod.url} title={apod.title} className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                ) : null}
                <div className="px-4 py-3">
                  <div className="text-[11px] text-[#c8d4f0]">{apod.title}</div>
                  {apod.copyright && <div className="text-[9px] text-[#4a5580] mt-0.5">© {apod.copyright}</div>}
                  {apod.explanation && (
                    <div className="mt-2">
                      <p className={cn('text-[10px] text-[#4a5580] leading-relaxed', apodExpanded ? '' : 'line-clamp-3')}>
                        {apod.explanation}
                      </p>
                      <button onClick={() => setApodExpanded(!apodExpanded)} className="text-[9px] text-[#d4af37] hover:text-white mt-1 flex items-center gap-1 transition-colors">
                        {apodExpanded ? <>Less <ChevronUp className="w-2.5 h-2.5" /></> : <>More <ChevronDown className="w-2.5 h-2.5" /></>}
                      </button>
                    </div>
                  )}
                  <a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#d4af37] hover:underline flex items-center gap-0.5 mt-2">
                    NASA APOD <ExternalLink className="w-2.5 h-2.5" />
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
