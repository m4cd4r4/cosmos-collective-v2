'use client'

/**
 * Dashboard Content
 * Real-time astronomy dashboard with live data from APIs
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import { useCosmosStore } from '@/store/cosmos-store'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WorldMapSVG } from '@/components/ui/WorldMapSVG'
import { cn, formatDate } from '@/lib/utils'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { getFeaturedRadioObservations, getSKAScienceGoals, getSKATimeline } from '@/services/australian-telescopes'
import { FEATURED_ZOONIVERSE_PROJECTS } from '@/services/zooniverse-api'
import { getAllCurrentEvents, getISSPosition, getAstronomyPictureOfTheDay, type APODData } from '@/services/real-time-events'
import type { AstronomicalEvent, Observation } from '@/types'
import {
  Heart,
  Star,
  Target,
  Clock,
  Telescope,
  Award,
  TrendingUp,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Radio,
  BookOpen,
  Settings,
  Zap,
  Globe,
  Satellite,
  RefreshCw,
  Loader2,
  ExternalLink,
  Image,
} from 'lucide-react'

// ============================================
// Tabs
// ============================================

type TabId = 'overview' | 'favorites' | 'events' | 'projects'

const tabs = [
  { id: 'overview' as TabId, label: 'Overview', icon: TrendingUp },
  { id: 'favorites' as TabId, label: 'Favourites', icon: Heart },
  { id: 'events' as TabId, label: 'Live Events', icon: Zap },
  { id: 'projects' as TabId, label: 'Projects', icon: Target },
]

// ============================================
// Component
// ============================================

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const { favorites, clearFavorites } = useCosmosStore()
  const [events, setEvents] = useState<AstronomicalEvent[]>([])
  const [apod, setApod] = useState<APODData | null>(null)
  const [issPosition, setIssPosition] = useState<{ lat: number; lon: number } | null>(null)
  const [issError, setIssError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Get all observations
  const jwstObservations = getFeaturedJWSTImages()
  const radioObservations = getFeaturedRadioObservations()
  const allObservations = [...jwstObservations, ...radioObservations]
  const favoriteObservations = allObservations.filter((obs) => favorites.includes(obs.id))

  // Real-time stats
  const stats = {
    totalObservations: allObservations.length,
    activeProjects: FEATURED_ZOONIVERSE_PROJECTS.length,
    liveEvents: events.length,
    savedFavorites: favorites.length,
  }

  // Fetch live data
  useEffect(() => {
    async function fetchData() {
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
          setIssError(false)
        } else {
          setIssError(true)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Refresh ISS position every 30 seconds
    const interval = setInterval(async () => {
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

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Cosmos <span className="text-gradient-stellar">Dashboard</span>
            </h1>
            <p className="text-gray-400">
              Real-time astronomical data and your cosmic collection
            </p>
          </div>

          <div className="flex items-center gap-3">
            {issPosition && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-cosmos-gold/10 border border-cosmos-gold/30">
                <Satellite className="w-4 h-4 text-cosmos-gold" />
                <span className="text-xs text-cosmos-gold">
                  ISS: {issPosition.lat.toFixed(1)}°, {issPosition.lon.toFixed(1)}°
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Telescope}
          value={stats.totalObservations}
          label="Observations"
          color="cyan"
        />
        <StatCard
          icon={Heart}
          value={stats.savedFavorites}
          label="Favourites"
          color="pink"
        />
        <StatCard
          icon={Target}
          value={stats.activeProjects}
          label="Active Projects"
          color="gold"
        />
        <StatCard
          icon={Zap}
          value={stats.liveEvents}
          label="Live Events"
          color="purple"
        />
      </section>

      {/* Tab Navigation */}
      <nav
        className="flex overflow-x-auto mb-6 border-b border-white/10"
        role="tablist"
        aria-label="Dashboard sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap',
              'border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-cosmos-gold text-cosmos-gold'
                : 'border-transparent text-gray-400 hover:text-white'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Panels */}
      <div className="min-h-[500px]">
        {/* Overview Panel */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* APOD Card */}
            <Card className="lg:col-span-2" padding="none">
              <CardContent className="p-0">
                {apod ? (
                  <div className="relative">
                    {apod.media_type === 'image' && (
                      <div className="relative aspect-video overflow-hidden rounded-t-xl">
                        <NextImage
                          src={apod.url}
                          alt={apod.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-cosmos-void via-transparent to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-cosmos-gold text-sm mb-2">
                        <Image className="w-4 h-4" />
                        NASA Picture of the Day
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-2">{apod.title}</h2>
                      <p className="text-gray-400 text-sm line-clamp-3">{apod.explanation}</p>
                      {apod.copyright && (
                        <p className="text-xs text-gray-500 mt-2">Credit: {apod.copyright}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    {isLoading ? (
                      <Loader2 className="w-8 h-8 text-cosmos-gold animate-spin mx-auto" />
                    ) : (
                      <p className="text-gray-400">Unable to load picture of the day</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card padding="lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cosmos-gold" />
                  Quick Actions
                </h2>

                <div className="space-y-3">
                  <QuickActionLink
                    href="/citizen-science"
                    icon={Target}
                    label="Start Classifying"
                    description="Help advance real science"
                  />
                  <QuickActionLink
                    href="/explore"
                    icon={Telescope}
                    label="Explore Images"
                    description="Browse astronomical data"
                  />
                  <QuickActionLink
                    href="/sky-map"
                    icon={Radio}
                    label="Open Sky Map"
                    description="Navigate the cosmos"
                  />
                  <QuickActionLink
                    href="/events"
                    icon={Zap}
                    label="Live Events"
                    description="Real-time astronomical events"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card className="lg:col-span-2" padding="lg">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cosmos-gold" />
                    Upcoming Events
                  </h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/events">View All</Link>
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-cosmos-gold animate-spin" />
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 4).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No upcoming events</p>
                )}
              </CardContent>
            </Card>

            {/* SKA Progress */}
            <Card padding="lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-cosmos-gold" />
                  SKA Progress
                </h2>

                <div className="space-y-3">
                  {getSKATimeline().slice(-4).map((item) => (
                    <div
                      key={item.year}
                      className={cn(
                        'p-3 rounded-lg',
                        item.status === 'completed' && 'bg-cosmos-gold/10 border border-cosmos-gold/20',
                        item.status === 'in-progress' && 'bg-cosmos-gold/10 border border-cosmos-gold/20',
                        item.status === 'upcoming' && 'bg-white/5 border border-white/10'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{item.year}</span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded',
                          item.status === 'completed' && 'bg-cosmos-gold/20 text-cosmos-gold',
                          item.status === 'in-progress' && 'bg-cosmos-gold/20 text-cosmos-gold',
                          item.status === 'upcoming' && 'bg-white/10 text-gray-400'
                        )}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{item.event}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Favorites Panel */}
        {activeTab === 'favorites' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved locally
              </p>
              {favorites.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFavorites}>
                  Clear All
                </Button>
              )}
            </div>

            {favoriteObservations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteObservations.map((obs) => (
                  <FavoriteCard key={obs.id} observation={obs} />
                ))}
              </div>
            ) : (
              <Card className="text-center" padding="xl">
                <CardContent>
                  <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Favourites Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Start exploring and save your favourite observations
                  </p>
                  <Button variant="primary" asChild>
                    <Link href="/explore">
                      Explore Images
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Events Panel */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card padding="lg">
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">All Astronomical Events</h2>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/events">
                        Full Events Page
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-cosmos-gold animate-spin" />
                    </div>
                  ) : events.length > 0 ? (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <EventCard key={event.id} event={event} expanded />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No events available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* ISS Tracker with Map */}
              <Card padding="lg">
                <CardContent>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Satellite className="w-5 h-5 text-cosmos-gold" />
                    ISS Location
                  </h3>
                  {issPosition ? (
                    <div className="space-y-3">
                      <WorldMapSVG
                        issPosition={issPosition}
                        width={280}
                        height={140}
                        className="w-full rounded-lg bg-white/5 p-1.5"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Lat</span>
                        <span className="text-white font-mono">{issPosition.lat.toFixed(2)}°</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Lon</span>
                        <span className="text-white font-mono">{issPosition.lon.toFixed(2)}°</span>
                      </div>
                      <p className="text-xs text-gray-500">Updates every 30s</p>
                    </div>
                  ) : issError ? (
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">ISS tracking temporarily unavailable</p>
                      <a
                        href="https://spotthestation.nasa.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cosmos-gold hover:underline"
                      >
                        View on NASA Spot the Station →
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading ISS position...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Event Types Legend */}
              <Card padding="lg">
                <CardContent>
                  <h3 className="text-lg font-semibold text-white mb-4">Event Types</h3>
                  <div className="space-y-2">
                    {[
                      { icon: Globe, label: 'Asteroids', color: 'text-cosmos-gold' },
                      { icon: Zap, label: 'Solar Activity', color: 'text-cosmos-gold' },
                      { icon: Star, label: 'Meteor Showers', color: 'text-cosmos-hydrogen' },
                    ].map((type) => (
                      <div key={type.label} className="flex items-center gap-2">
                        <type.icon className={cn('w-4 h-4', type.color)} />
                        <span className="text-sm text-gray-300">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Projects Panel */}
        {activeTab === 'projects' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Active Citizen Science Projects</h2>
              <p className="text-gray-400">
                Contribute to real astronomical research through these active projects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_ZOONIVERSE_PROJECTS.map((project) => (
                <Card key={project.id} padding="lg" className="group">
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-cosmos-gold/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-cosmos-gold" />
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs',
                        project.state === 'live' && 'bg-green-500/20 text-green-400',
                        project.state === 'paused' && 'bg-yellow-500/20 text-yellow-400',
                        project.state === 'finished' && 'bg-gray-500/20 text-gray-400'
                      )}>
                        {project.state}
                      </span>
                    </div>

                    <h3 className="text-white font-semibold mb-2 group-hover:text-cosmos-gold transition-colors">
                      {project.displayName}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{project.classifications_count.toLocaleString()} classifications</span>
                      <span>{Math.round(project.completeness * 100)}% complete</span>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                      <Link href="/citizen-science">
                        Contribute
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* SKA Science Goals */}
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Radio className="w-5 h-5 text-cosmos-gold" />
                SKA Science Goals
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSKAScienceGoals().map((goal) => (
                  <Card key={goal.id} padding="md">
                    <CardContent>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{goal.icon}</span>
                        <h3 className="text-white font-medium">{goal.title}</h3>
                      </div>
                      <p className="text-sm text-gray-400">{goal.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  value: number | string
  label: string
  color: 'cyan' | 'pink' | 'gold' | 'purple'
}

function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  const colorClasses = {
    cyan: 'text-cosmos-gold bg-cosmos-gold/10',
    pink: 'text-cosmos-hydrogen bg-cosmos-hydrogen/10',
    gold: 'text-cosmos-gold bg-cosmos-gold/10',
    purple: 'text-cosmos-nebula-blue bg-cosmos-nebula-blue/10',
  }

  return (
    <Card padding="lg">
      <CardContent>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Quick Action Link
// ============================================

interface QuickActionLinkProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

function QuickActionLink({ href, icon: Icon, label, description }: QuickActionLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-cosmos-gold/10 flex items-center justify-center group-hover:bg-cosmos-gold/20 transition-colors">
        <Icon className="w-5 h-5 text-cosmos-gold" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white group-hover:text-cosmos-gold transition-colors">
          {label}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cosmos-gold transition-colors" />
    </Link>
  )
}

// ============================================
// Event Card
// ============================================

interface EventCardProps {
  event: AstronomicalEvent
  expanded?: boolean
}

function EventCard({ event, expanded }: EventCardProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'solar': return Zap
      case 'asteroid': return Globe
      case 'meteor-shower': return Star
      default: return Sparkles
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'rare':
      case 'once-in-lifetime':
        return 'bg-cosmos-hydrogen/20 text-cosmos-hydrogen'
      case 'significant':
        return 'bg-cosmos-gold/20 text-cosmos-gold'
      case 'notable':
        return 'bg-cosmos-gold/20 text-cosmos-gold'
      default:
        return 'bg-white/10 text-gray-400'
    }
  }

  const Icon = getEventIcon(event.type)

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg bg-white/5',
      expanded && 'p-4'
    )}>
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        getSeverityColor(event.severity)
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-white font-medium">{event.title}</p>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded flex-shrink-0',
            getSeverityColor(event.severity)
          )}>
            {event.severity}
          </span>
        </div>
        {expanded && (
          <p className="text-xs text-gray-400 mt-1">{event.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(event.eventTime, { month: 'short', day: 'numeric' })}
          {event.isOngoing && <span className="text-cosmos-gold ml-2">Ongoing</span>}
        </p>
      </div>
    </div>
  )
}

// ============================================
// Favorite Card
// ============================================

function FavoriteCard({ observation }: { observation: Observation }) {
  const { toggleFavorite } = useCosmosStore()
  const [imgError, setImgError] = useState(false)

  return (
    <Card className="group overflow-hidden" padding="none">
      <CardContent className="p-0">
        {/* Image */}
        <Link href={`/explore/${observation.id}`} className="block relative aspect-video">
          <NextImage
            src={imgError ? '/images/cosmos-placeholder.svg' : observation.images.thumbnail}
            alt={observation.targetName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cosmos-void to-transparent" />
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/explore/${observation.id}`}
                className="text-lg font-semibold text-white hover:text-cosmos-gold transition-colors line-clamp-1"
              >
                {observation.targetName}
              </Link>
              <p className="text-sm text-gray-400">{observation.source}</p>
            </div>
            <button
              onClick={() => toggleFavorite(observation.id)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Remove from favourites"
            >
              <Heart className="w-5 h-5 text-cosmos-hydrogen fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-xs">
              {observation.category.replace('-', ' ')}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-xs">
              {observation.wavelengthBand}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
