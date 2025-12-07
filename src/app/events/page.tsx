'use client'

/**
 * Live Events Page
 * Real-time astronomical events, meteor showers, and space weather
 */

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Starfield } from '@/components/ui/Starfield'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  getAllCurrentEvents,
  getISSPosition,
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
    embedUrl: 'https://www.youtube.com/embed/Ni-YkkvH6DQ?autoplay=1&mute=1&rel=0',
    directUrl: 'https://www.youtube.com/watch?v=Ni-YkkvH6DQ',
  },
  {
    id: 'iss-live-2',
    name: 'ISS Live Camera 2',
    description: 'Alternative ISS live stream with Earth views from orbit',
    embedUrl: 'https://www.youtube.com/embed/iYmvCUonukw?autoplay=0&rel=0',
    directUrl: 'https://www.youtube.com/watch?v=iYmvCUonukw',
  },
]

export default function EventsPage() {
  const [events, setEvents] = useState<AstronomicalEvent[]>([])
  const [apod, setApod] = useState<APODData | null>(null)
  const [issPosition, setIssPosition] = useState<{ lat: number; lon: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedCamera, setSelectedCamera] = useState(ISS_CAMERAS[0])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [eventsResult, apodResult, issResult] = await Promise.allSettled([
        getAllCurrentEvents(),
        getAstronomyPictureOfTheDay(),
        getISSPosition(),
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
      }
    }, 30000)

    return () => clearInterval(issInterval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'once-in-lifetime':
      case 'rare':
        return 'bg-cosmos-pink/20 text-cosmos-pink border-cosmos-pink/50'
      case 'significant':
        return 'bg-cosmos-gold/20 text-cosmos-gold border-cosmos-gold/50'
      case 'notable':
        return 'bg-cosmos-cyan/20 text-cosmos-cyan border-cosmos-cyan/50'
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
      default:
        return Sparkles
    }
  }

  const meteorShowers = getMeteorShowers()
  const now = new Date()
  const upcomingShowers = meteorShowers.filter(
    (shower) => new Date(shower.peakDate) >= now
  ).slice(0, 3)

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <Header />

      <main className="relative z-10 pt-20 pb-24 lg:pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-cyan/10 border border-cosmos-cyan/30 mb-4">
                  <Calendar className="w-4 h-4 text-cosmos-cyan" />
                  <span className="text-sm text-cosmos-cyan font-medium">Live Updates</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  Live <span className="text-gradient-stellar">Events</span>
                </h1>
                <p className="text-gray-400 max-w-xl">
                  Real-time astronomical events, meteor showers, asteroid approaches,
                  and space weather alerts.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-sm text-gray-500">
                    Updated {formatDate(lastUpdated.toISOString(), { hour: 'numeric', minute: 'numeric' })}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={isLoading}
                  leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </section>

          {/* ISS Live Cameras Section - Featured at top */}
          <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                  <Video className="w-6 h-6 text-cosmos-cyan" />
                  ISS Live Cameras
                </h2>
                <p className="text-gray-400 mt-1">
                  Watch Earth from space in real-time from the International Space Station
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Camera Selector */}
              <div className="space-y-3 order-2 lg:order-1">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Select Camera
                </h3>
                {ISS_CAMERAS.map((camera) => (
                  <button
                    key={camera.id}
                    type="button"
                    onClick={() => setSelectedCamera(camera)}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all',
                      selectedCamera.id === camera.id
                        ? 'bg-cosmos-cyan/20 border border-cosmos-cyan/50'
                        : 'glass-panel hover:bg-white/5 border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        selectedCamera.id === camera.id
                          ? 'bg-cosmos-cyan/30'
                          : 'bg-white/10'
                      )}>
                        <Eye className={cn(
                          'w-5 h-5',
                          selectedCamera.id === camera.id ? 'text-cosmos-cyan' : 'text-gray-400'
                        )} />
                      </div>
                      <div>
                        <h4 className={cn(
                          'font-medium',
                          selectedCamera.id === camera.id ? 'text-cosmos-cyan' : 'text-white'
                        )}>
                          {camera.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {camera.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                <Card className="mt-4" padding="md">
                  <CardContent>
                    <h4 className="text-sm font-medium text-white mb-2">About the Feed</h4>
                    <p className="text-xs text-gray-400">
                      When the ISS is in darkness or switching between cameras,
                      you may see a blue or black screen. This is normal - the station
                      orbits Earth every 90 minutes, experiencing sunrise and sunset
                      16 times per day.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Video Player */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                <Card padding="none" className="overflow-hidden">
                  <div className="relative aspect-video bg-cosmos-void">
                    <iframe
                      src={selectedCamera.embedUrl}
                      title={selectedCamera.name}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{selectedCamera.name}</h3>
                      <p className="text-sm text-gray-400">{selectedCamera.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={selectedCamera.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in YouTube
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </Card>

                {/* Additional Info */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Card padding="md" className="text-center">
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold text-cosmos-cyan">~27,600</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">km/h orbital speed</div>
                    </CardContent>
                  </Card>
                  <Card padding="md" className="text-center">
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold text-cosmos-gold">~408</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">km altitude</div>
                    </CardContent>
                  </Card>
                  <Card padding="md" className="text-center">
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold text-cosmos-pink">92</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">min per orbit</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Events List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-cosmos-gold" />
                Current & Upcoming Events
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-cosmos-cyan animate-spin" />
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => {
                    const Icon = getEventIcon(event.type)
                    return (
                      <Card key={event.id} variant="default" padding="md">
                        <CardContent className="flex items-start gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                            getSeverityColor(event.severity)
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-white">{event.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                              </div>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0',
                                getSeverityColor(event.severity)
                              )}>
                                {event.severity}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span>
                                {formatDate(event.eventTime, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span>Source: {event.source}</span>
                              {event.isOngoing && (
                                <span className="text-cosmos-cyan">Ongoing</span>
                              )}
                            </div>
                            {event.references && event.references.length > 0 && (
                              <div className="mt-2">
                                <a
                                  href={event.references[0].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-cosmos-cyan hover:underline"
                                >
                                  {event.references[0].label}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="text-center" padding="xl">
                  <CardContent>
                    <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Active Events</h3>
                    <p className="text-gray-400">
                      Check back later for upcoming astronomical events
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* ISS Tracker */}
              <Card padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Satellite className="w-5 h-5 text-cosmos-cyan" />
                    ISS Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {issPosition ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Latitude</span>
                        <span className="text-white font-mono">{issPosition.lat.toFixed(4)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Longitude</span>
                        <span className="text-white font-mono">{issPosition.lon.toFixed(4)}°</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Position updates every 30 seconds
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Loading ISS position...</p>
                  )}
                </CardContent>
              </Card>

              {/* Meteor Showers */}
              <Card padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-cosmos-gold" />
                    Upcoming Meteor Showers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingShowers.map((shower) => (
                      <div key={shower.name} className="p-3 rounded-lg bg-white/5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{shower.name}</span>
                          <span className="text-xs text-cosmos-gold">{shower.zenithalHourlyRate}/hr</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Peak: {formatDate(shower.peakDate, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* APOD */}
              {apod && (
                <Card padding="none" className="overflow-hidden">
                  {apod.media_type === 'image' && (
                    <div className="relative aspect-video">
                      <img
                        src={apod.url}
                        alt={apod.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cosmos-void to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm">{apod.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">NASA Picture of the Day</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
