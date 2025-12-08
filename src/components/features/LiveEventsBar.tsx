'use client'

/**
 * Live Events Bar Component
 * Scrolling ticker showing real-time astronomical events
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUpcomingEvents, type MeteorShower } from '@/services/real-time-events'
import type { AstronomicalEvent } from '@/types'
import { cn, getRelativeTime } from '@/lib/utils'
import { Radio, AlertCircle, Star, Rocket, Sun, Sparkles } from 'lucide-react'

// ============================================
// Event Type Icons
// ============================================

const eventIcons: Record<string, React.ReactNode> = {
  'meteor-shower': <Sparkles className="w-4 h-4" />,
  asteroid: <Star className="w-4 h-4" />,
  solar: <Sun className="w-4 h-4" />,
  launch: <Rocket className="w-4 h-4" />,
  transient: <AlertCircle className="w-4 h-4" />,
  default: <Radio className="w-4 h-4" />,
}

const severityColors: Record<string, string> = {
  'once-in-lifetime': 'text-cosmos-pink',
  rare: 'text-cosmos-purple',
  significant: 'text-cosmos-gold',
  notable: 'text-cosmos-cyan',
  info: 'text-gray-400',
}

// ============================================
// Live Events Bar Component
// ============================================

export function LiveEventsBar() {
  const [events, setEvents] = useState<AstronomicalEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Load upcoming events
    const loadEvents = () => {
      const upcomingEvents = getUpcomingEvents(10)
      setEvents(upcomingEvents)
      setIsLoading(false)
    }

    loadEvents()

    // Refresh every 5 minutes
    const interval = setInterval(loadEvents, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="h-10 bg-cosmos-surface/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="w-24 h-4 skeleton rounded" />
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return null
  }

  return (
    <div
      className="relative bg-cosmos-surface/50 border-b border-white/5 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="marquee"
      aria-label="Live astronomical events"
    >
      <div className="flex items-center h-10">
        {/* Live indicator */}
        <div className="flex-shrink-0 px-4 border-r border-white/10 h-full flex items-center gap-2 bg-cosmos-surface/80 z-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-medium text-gray-400">LIVE</span>
        </div>

        {/* Scrolling content */}
        <div className="overflow-hidden flex-1">
          <div
            className={cn(
              'flex gap-8 animate-scroll whitespace-nowrap',
              isPaused && 'animation-paused'
            )}
            style={{
              animationDuration: `${events.length * 8}s`,
            }}
          >
            {/* Duplicate for seamless loop */}
            {[...events, ...events].map((event, index) => (
              <Link
                key={`${event.id}-${index}`}
                href={`/events#${event.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors group"
              >
                <span className={severityColors[event.severity]}>
                  {eventIcons[event.type] || eventIcons.default}
                </span>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {event.title}
                </span>
                {event.isOngoing && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                    NOW
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(event.eventTime) > new Date()
                    ? `in ${getRelativeTime(event.eventTime).replace(' ago', '')}`
                    : getRelativeTime(event.eventTime)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* View all link */}
        <Link
          href="/events"
          className="flex-shrink-0 px-4 border-l border-white/10 h-full flex items-center text-xs text-cosmos-cyan hover:text-white transition-colors bg-cosmos-surface/80 z-10"
        >
          View All →
        </Link>
      </div>

      {/* CSS for scroll animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll linear infinite;
        }
        .animation-paused {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
