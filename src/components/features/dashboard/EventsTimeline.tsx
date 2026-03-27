'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { getEventIcon, getSeverityColor, formatCountdown } from '@/lib/event-utils'
import type { AstronomicalEvent } from '@/types'

interface EventsTimelineProps {
  events: AstronomicalEvent[]
  upcomingEvents: AstronomicalEvent[]
}

export function EventsTimeline({ events, upcomingEvents }: EventsTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [countdowns, setCountdowns] = useState<Record<string, string>>({})

  // Merge and deduplicate events
  const allEvents = deduplicateEvents([...events, ...upcomingEvents])
    .sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime())
    .slice(0, 12)

  // Auto-scroll to nearest future event
  useEffect(() => {
    const container = scrollRef.current
    if (!container || allEvents.length === 0) return

    const now = Date.now()
    const idx = allEvents.findIndex(e => new Date(e.eventTime).getTime() > now)
    if (idx > 0) {
      const card = container.children[idx] as HTMLElement
      if (card) {
        container.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' })
      }
    }
  }, [allEvents.length])

  // Update countdowns every minute
  useEffect(() => {
    function update() {
      const map: Record<string, string> = {}
      for (const e of allEvents) {
        map[e.id] = formatCountdown(e.eventTime)
      }
      setCountdowns(map)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [allEvents])

  if (allEvents.length === 0) return null

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-[0.15em] text-[#4a5580] font-semibold flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#d4af37]" />
          Events Timeline
        </h2>
        <Link
          href="/events"
          className="flex items-center gap-1 text-xs uppercase tracking-wider text-[#d4af37] hover:text-[#e8c64a] transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
      >
        {allEvents.map((event) => {
          const Icon = getEventIcon(event.type)
          const colors = getSeverityColor(event.severity)
          const countdown = countdowns[event.id] ?? ''

          return (
            <div
              key={event.id}
              className={cn(
                'snap-start shrink-0 w-[200px] rounded-xl border p-3 flex flex-col gap-2',
                colors.bg, colors.border,
              )}
            >
              {/* Icon + severity badge */}
              <div className="flex items-center justify-between">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', colors.bg)}>
                  <Icon className={cn('w-3.5 h-3.5', colors.text)} />
                </div>
                <span className={cn('text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full', colors.bg, colors.text, 'border', colors.border)}>
                  {event.severity}
                </span>
              </div>

              {/* Title */}
              <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">{event.title}</p>

              {/* Date + countdown */}
              <div className="mt-auto flex items-center justify-between">
                <span className="text-[10px] text-[#4a5580] font-mono">
                  {formatDate(event.eventTime, { month: 'short', day: 'numeric' })}
                </span>
                <span className={cn('text-[10px] font-mono font-bold', colors.text)}>
                  {countdown}
                </span>
              </div>

              {event.isOngoing && (
                <span className="text-[8px] uppercase tracking-wider text-[#d4af37] font-semibold">Ongoing</span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function deduplicateEvents(events: AstronomicalEvent[]): AstronomicalEvent[] {
  const seen = new Set<string>()
  return events.filter(e => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })
}
