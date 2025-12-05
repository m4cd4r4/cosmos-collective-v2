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
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

export default function EventsPage() {
  const [events, setEvents] = useState<AstronomicalEvent[]>([])
  const [apod, setApod] = useState<APODData | null>(null)
  const [issPosition, setIssPosition] = useState<{ lat: number; lon: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

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

      <main className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <section className="mb-12">
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
