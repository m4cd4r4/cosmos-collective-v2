'use client'

/**
 * Live Events Page
 * Real-time astronomical events, meteor showers, and space weather
 */

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/features/PageHero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WorldMapSVG } from '@/components/ui/WorldMapSVG'
import { NeoApproachDiagram } from '@/components/features/events/NeoApproachDiagram'
import { SolarGauge } from '@/components/features/events/SolarGauge'
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
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

// ISS Live Camera feeds
// Note: YouTube stream IDs may change periodically as NASA updates their streams
// Last updated: December 2025
const ISS_CAMERAS = [
  {
    id: 'iss-live-1',
    name: 'ISS Live Camera 1',
    description: 'Live views from the International Space Station exterior cameras',
    videoId: 'Ni-YkkvH6DQ',
    directUrl: 'https://www.youtube.com/watch?v=Ni-YkkvH6DQ',
  },
  {
    id: 'iss-live-2',
    name: 'ISS Live Camera 2',
    description: 'Alternative ISS live stream with Earth views from orbit',
    videoId: 'iYmvCUonukw',
    directUrl: 'https://www.youtube.com/watch?v=iYmvCUonukw',
  },
]

// Build embed URL with autoplay (muted, as required by browsers)
const getEmbedUrl = (videoId: string, autoplay: boolean = true) => {
  const params = autoplay ? 'autoplay=1&mute=1&rel=0' : 'rel=0'
  return `https://www.youtube.com/embed/${videoId}?${params}`
}

// Pagination constants
const INITIAL_EVENT_COUNT = 8
const LOAD_MORE_COUNT = 8

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

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [eventsResult, apodResult, issResult, solarResult] = await Promise.allSettled([
        getAllCurrentEvents(),
        getAstronomyPictureOfTheDay(),
        getISSPosition(),
        getSolarWeather(),
      ])

      if (eventsResult.status === 'fulfilled' && eventsResult.value.success) {
        setEvents(eventsResult.value.data || [])
      }

      if (apodResult.status === 'fulfilled' && apodResult.value.success) {
        setApod(apodResult.value.data || null)
      }

      if (issResult.status === 'fulfilled' && issResult.value.success && issResult.value.data) {
        setIssPosition({
          lat: issResult.value.data.position.lat,
          lon: issResult.value.data.position.lon,
        })
        setIssError(false)
      } else {
        setIssError(true)
      }

      if (solarResult.status === 'fulfilled' && solarResult.value.success && solarResult.value.data) {
        setSolarData({
          flareLevel: solarResult.value.data.flareLevel,
          currentFlux: solarResult.value.data.currentFlux,
        })
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh ISS position every 30 seconds
    const issInterval = setInterval(async () => {
      const result = await getISSPosition()
      if (result.success && result.data) {
        setIssPosition({
          lat: result.data.position.lat,
          lon: result.data.position.lon,
        })
        setIssError(false)
      } else {
        setIssError(true)
      }
    }, 30000)

    return () => clearInterval(issInterval)
  }, [])

  // Scroll to specific event if hash is present in URL
  useEffect(() => {
    if (!isLoading && events.length > 0) {
      const hash = window.location.hash.slice(1) // Remove the # symbol
      if (hash) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Add highlight effect
            element.classList.add('ring-2', 'ring-cosmos-gold', 'ring-offset-2', 'ring-offset-cosmos-void')
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-cosmos-gold', 'ring-offset-2', 'ring-offset-cosmos-void')
            }, 3000)
          }
        }, 100)
      }
    }
  }, [isLoading, events])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'once-in-lifetime':
      case 'rare':
        return 'bg-cosmos-hydrogen/20 text-cosmos-hydrogen border-cosmos-hydrogen/50'
      case 'significant':
        return 'bg-cosmos-gold/20 text-cosmos-gold border-cosmos-gold/50'
      case 'notable':
        return 'bg-cosmos-gold/20 text-cosmos-gold border-cosmos-gold/50'
      default:
        return 'bg-white/10 text-gray-300 border-white/20'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'solar':
        return Zap
      case 'asteroid':
        return Globe
      case 'meteor-shower':
        return Star
      case 'transit':
        return Radio
      case 'lunar':
        return Moon
      case 'eclipse':
        return Sun
      case 'conjunction':
        return Sparkles
      case 'launch':
        return Rocket
      default:
        return Sparkles
    }
  }

  // Get thumbnail image for event type
  const getEventThumbnail = (type: string) => {
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

  const meteorShowers = getMeteorShowers()
  const now = new Date()
  const upcomingShowers = meteorShowers.filter(
    (shower) => new Date(shower.peakDate) >= now
  ).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#c8d4f0] font-mono">
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

      <main className="px-4 sm:px-5 py-5 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* ── LEFT ─────────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* ISS Live Feed */}
            <section className="rounded-xl border border-[rgba(212,175,55,0.15)] overflow-hidden bg-[rgba(8,12,28,0.7)]">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff] font-semibold">ISS Live Feed</span>
                  <span className="text-[9px] text-[#4a5580]">· Earth from 408 km altitude</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] uppercase tracking-[0.12em] text-red-400">Live</span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr]">
                {/* Camera selector */}
                <div className="border-b lg:border-b-0 lg:border-r border-[rgba(212,175,55,0.08)] p-3 space-y-1.5">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-2">Cameras</div>
                  {ISS_CAMERAS.map((camera) => (
                    <button
                      key={camera.id}
                      type="button"
                      onClick={() => setSelectedCamera(camera)}
                      className={cn(
                        'w-full p-2.5 rounded-lg text-left transition-all',
                        selectedCamera.id === camera.id
                          ? 'bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.25)] text-[#d4af37]'
                          : 'border border-transparent hover:bg-white/[0.03] text-[#8090b0]'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <div>
                          <div className="text-[11px] font-semibold">{camera.name}</div>
                          <div className="text-[9px] opacity-60 mt-0.5 line-clamp-1">{camera.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="mt-3 p-2.5 rounded border border-[rgba(212,175,55,0.08)] bg-[rgba(212,175,55,0.02)]">
                    <div className="text-[9px] text-[#4a5580] leading-relaxed">
                      Dark/blue screen = ISS in night orbit (16 day/night cycles per 24h).
                    </div>
                  </div>
                </div>
                {/* Video */}
                <div>
                  <div className="relative aspect-video bg-black">
                    <iframe
                      src={getEmbedUrl(selectedCamera.videoId)}
                      title={selectedCamera.name}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="px-4 py-2.5 border-t border-[rgba(212,175,55,0.08)] flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-[#8090b0]">{selectedCamera.name}</span>
                    <div className="flex items-center gap-4 text-[10px]">
                      <span className="text-[#4a5580]"><span className="text-[#d4af37] font-bold">~27,600</span> km/h</span>
                      <span className="text-[#4a5580]"><span className="text-[#d4af37] font-bold">~408</span> km alt</span>
                      <span className="text-[#4a5580]"><span className="text-[#e040fb] font-bold">92</span> min/orbit</span>
                      <a href={selectedCamera.directUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#d4af37] hover:text-[#e0c060] transition-colors">
                        YouTube <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Events List */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#e0e8ff] font-semibold">Current &amp; Upcoming Events</span>
                {!isLoading && <span className="text-[10px] text-[#4a5580]">({events.length})</span>}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12 rounded-xl border border-[rgba(212,175,55,0.08)]">
                  <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
                </div>
              ) : events.length > 0 ? (
                <div className="rounded-xl border border-[rgba(212,175,55,0.15)] overflow-hidden bg-[rgba(8,12,28,0.7)] divide-y divide-[rgba(212,175,55,0.06)]">
                  {events.slice(0, displayCount).map((event) => {
                    const Icon = getEventIcon(event.type)
                    const severityColor = event.severity === 'rare' || event.severity === 'once-in-lifetime'
                      ? '#e040fb'
                      : event.severity === 'significant' || event.severity === 'notable'
                        ? '#d4af37'
                        : '#4a5580'
                    return (
                      <div key={event.id} id={event.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <img src={getEventThumbnail(event.type)} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-1 left-1 w-6 h-6 rounded flex items-center justify-center" style={{ background: `${severityColor}25` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: severityColor }} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="text-[12px] text-[#c8d4f0] font-semibold flex-1">{event.title}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {event.isOngoing && (
                                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400">Live</span>
                              )}
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: `${severityColor}15`, color: severityColor, border: `1px solid ${severityColor}30` }}>
                                {event.severity}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#4a5580] mt-0.5 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-[#4a5580]">{formatDate(event.eventTime, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[#4a5580]">·</span>
                            <span className="text-[10px] text-[#4a5580]">{event.source}</span>
                            {event.references?.map((ref, idx) => (
                              <a key={idx} href={ref.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-0.5 text-[10px] text-[#d4af37] hover:underline"
                                onClick={(e) => e.stopPropagation()}>
                                {ref.label} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {displayCount < events.length && (
                    <button type="button" onClick={() => setDisplayCount((c) => c + LOAD_MORE_COUNT)}
                      className="w-full py-2.5 text-[10px] uppercase tracking-[0.15em] text-[#d4af37] hover:bg-[rgba(212,175,55,0.05)] transition-colors flex items-center justify-center gap-2">
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show {events.length - displayCount} more events
                    </button>
                  )}
                </div>
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
                    <a href="https://spotthestation.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#d4af37] hover:underline">NASA Spot the Station →</a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-2 text-[11px] text-[#4a5580]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />Loading…
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
                  <a key={shower.name} href="https://www.imo.net/resources/calendar/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors group">
                    <div>
                      <div className="text-[11px] text-[#c8d4f0] group-hover:text-[#d4af37] transition-colors">{shower.name}</div>
                      <div className="text-[9px] text-[#4a5580] mt-0.5">Peak: {formatDate(shower.peakDate, { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <span className="text-[11px] font-bold text-[#d4af37]">{shower.zenithalHourlyRate}/hr</span>
                  </a>
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
                  <a href={apod.hdurl || apod.url} target="_blank" rel="noopener noreferrer" className="block">
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
                  </a>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
