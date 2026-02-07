'use client'

/**
 * Live Events Bar Component
 * Static ticker with auto-rotating priority events
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { getUpcomingEvents } from '@/services/real-time-events'
import type { AstronomicalEvent } from '@/types'
import { cn, getRelativeTime } from '@/lib/utils'
import { Radio, AlertCircle, Star, Rocket, Sun, Sparkles, Moon, Globe, Zap, ChevronRight } from 'lucide-react'

// ============================================
// Event Type Icons
// ============================================

const eventIcons: Record<string, React.ReactNode> = {
  'meteor-shower': <Sparkles className="w-3.5 h-3.5" />,
  asteroid: <Globe className="w-3.5 h-3.5" />,
  solar: <Zap className="w-3.5 h-3.5" />,
  launch: <Rocket className="w-3.5 h-3.5" />,
  transient: <AlertCircle className="w-3.5 h-3.5" />,
  lunar: <Moon className="w-3.5 h-3.5" />,
  eclipse: <Sun className="w-3.5 h-3.5" />,
  conjunction: <Star className="w-3.5 h-3.5" />,
  default: <Radio className="w-3.5 h-3.5" />,
}

const severityColors: Record<string, string> = {
  'once-in-lifetime': 'text-cosmos-hydrogen',
  rare: 'text-cosmos-nebula-blue',
  significant: 'text-cosmos-gold',
  notable: 'text-cosmos-gold',
  info: 'text-gray-400',
}

const severityOrder: Record<string, number> = {
  'once-in-lifetime': 5,
  rare: 4,
  significant: 3,
  notable: 2,
  info: 1,
}

const MAX_BANNER_EVENTS = 6

function getPriorityEvents(events: AstronomicalEvent[]): AstronomicalEvent[] {
  const priorityEvents = events.filter(
    (e) => e.isOngoing || ['notable', 'significant', 'rare', 'once-in-lifetime'].includes(e.severity)
  )

  const now = Date.now()
  return priorityEvents
    .sort((a, b) => {
      if (a.isOngoing && !b.isOngoing) return -1
      if (!a.isOngoing && b.isOngoing) return 1
      const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      if (severityDiff !== 0) return severityDiff
      return Math.abs(new Date(a.eventTime).getTime() - now) - Math.abs(new Date(b.eventTime).getTime() - now)
    })
    .slice(0, MAX_BANNER_EVENTS)
}

// ============================================
// Live Events Bar Component
// ============================================

export function LiveEventsBar() {
  const [events, setEvents] = useState<AstronomicalEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const loadEvents = () => {
      const upcomingEvents = getUpcomingEvents(50)
      const priorityEvents = getPriorityEvents(upcomingEvents)
      setEvents(priorityEvents)
      setIsLoading(false)
    }

    loadEvents()
    const interval = setInterval(loadEvents, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-rotate through events every 5 seconds
  useEffect(() => {
    if (events.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % events.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [events.length])

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % events.length)
  }, [events.length])

  if (isLoading) {
    return (
      <div className="h-10 bg-cosmos-surface/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="w-24 h-4 skeleton rounded" />
        </div>
      </div>
    )
  }

  if (events.length === 0) return null

  const activeEvent = events[activeIndex]

  return (
    <div
      className="relative bg-cosmos-surface/50 border-b border-white/5"
      role="status"
      aria-label="Live astronomical events"
      aria-live="polite"
    >
      <div className="flex items-center h-10 max-w-7xl mx-auto">
        {/* Live indicator */}
        <div className="flex-shrink-0 px-4 h-full flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 flex-shrink-0" />

        {/* Active event — fade transition */}
        <Link
          href={`/events#${activeEvent.id}`}
          className="flex-1 flex items-center gap-2.5 px-4 h-full hover:bg-white/5 transition-colors group min-w-0"
        >
          <span className={cn('flex-shrink-0', severityColors[activeEvent.severity])}>
            {eventIcons[activeEvent.type] || eventIcons.default}
          </span>
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
            {activeEvent.title}
          </span>
          {activeEvent.isOngoing && (
            <span className="flex-shrink-0 text-[10px] font-semibold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Now
            </span>
          )}
          <span className="flex-shrink-0 text-xs text-gray-500">
            {new Date(activeEvent.eventTime) > new Date()
              ? `in ${getRelativeTime(activeEvent.eventTime).replace(' ago', '')}`
              : getRelativeTime(activeEvent.eventTime)}
          </span>
        </Link>

        {/* Event counter + next button */}
        {events.length > 1 && (
          <>
            <div className="w-px h-5 bg-white/10 flex-shrink-0" />
            <button
              onClick={goNext}
              className="flex-shrink-0 px-3 h-full flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Next event"
            >
              <span className="tabular-nums">
                {activeIndex + 1}/{events.length}
              </span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </>
        )}

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 flex-shrink-0" />

        {/* View all link */}
        <Link
          href="/events"
          className="flex-shrink-0 px-4 h-full flex items-center text-xs text-cosmos-gold hover:text-white transition-colors"
        >
          All Events
        </Link>
      </div>
    </div>
  )
}
