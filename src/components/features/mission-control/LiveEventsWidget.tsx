'use client'

import { useState, useEffect } from 'react'
import { WorldMapSVG } from '@/components/ui/WorldMapSVG'
import { formatCountdown } from '@/lib/event-utils'
import type { AstronomicalEvent } from '@/types/astronomy'

interface LiveEventsWidgetProps {
  issPosition: { lat: number; lon: number } | null
  solarWeather: { flareLevel: string; currentFlux: number } | null
  upcomingEvents: AstronomicalEvent[]
}

const FLARE_COLORS: Record<string, string> = {
  quiet: '#22c55e',
  minor: '#f59e0b',
  moderate: '#f97316',
  strong: '#ef4444',
  severe: '#dc2626',
}

function getNextEvent(events: AstronomicalEvent[]): AstronomicalEvent | null {
  const now = Date.now()
  return events.find(e => new Date(e.eventTime).getTime() > now) ?? events[0] ?? null
}

export function LiveEventsWidget({ issPosition, solarWeather, upcomingEvents }: LiveEventsWidgetProps) {
  const [countdown, setCountdown] = useState('')
  const nextEvent = getNextEvent(upcomingEvents)

  useEffect(() => {
    if (!nextEvent) return
    const update = () => setCountdown(formatCountdown(nextEvent.eventTime))
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [nextEvent])

  const flareLevel = solarWeather?.flareLevel ?? 'quiet'
  const flareColor = FLARE_COLORS[flareLevel] ?? '#6b7280'

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* ISS World Map */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden px-2 pt-1">
        <WorldMapSVG
          issPosition={issPosition}
          className="w-full h-auto max-h-full"
        />
        {!issPosition && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] text-[#4a5580] uppercase tracking-wider">Acquiring signal...</span>
          </div>
        )}
      </div>

      {/* Bottom data strip */}
      <div className="flex items-stretch border-t border-[rgba(212,175,55,0.08)] shrink-0" style={{ height: 48 }}>
        {/* Next event */}
        <div className="flex-1 px-3 py-1.5 flex flex-col justify-center border-r border-[rgba(212,175,55,0.06)]">
          <span className="text-[7px] uppercase tracking-[0.15em] text-[#4a5580]">Next Event</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-[#e0e8ff] truncate max-w-[100px]">
              {nextEvent?.title ?? 'None'}
            </span>
            <span className="text-[10px] font-mono text-[#d4af37] shrink-0">{countdown}</span>
          </div>
        </div>

        {/* Solar activity */}
        <div className="px-3 py-1.5 flex flex-col justify-center items-center" style={{ minWidth: 80 }}>
          <span className="text-[7px] uppercase tracking-[0.15em] text-[#4a5580]">Solar</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: flareColor,
                boxShadow: flareLevel !== 'quiet' ? `0 0 8px ${flareColor}` : undefined,
                animation: flareLevel !== 'quiet' ? 'pulse 2s ease-in-out infinite' : undefined,
              }}
            />
            <span className="text-[10px] font-bold capitalize" style={{ color: flareColor }}>
              {flareLevel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
