'use client'

import { useState, useEffect } from 'react'
import { Rocket, ExternalLink, MapPin, Clock } from 'lucide-react'
import type { LiveLaunch } from '@/services/launch-api'

const STATUS_COLORS: Record<string, string> = {
  Go: '#22c55e',
  TBD: '#f59e0b',
  Hold: '#ef4444',
  TBC: '#f59e0b',
  Success: '#22c55e',
  Failure: '#ef4444',
  'In Flight': '#3b82f6',
}

function getStatusColor(abbrev: string): string {
  return STATUS_COLORS[abbrev] ?? '#6b7280'
}

function formatCountdown(net: string): string {
  const diff = new Date(net).getTime() - Date.now()
  if (diff <= 0) return 'Launched'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  if (days > 7) return `${days}d ${hours}h`
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

function isWithin24h(net: string): boolean {
  const diff = new Date(net).getTime() - Date.now()
  return diff > 0 && diff < 24 * 60 * 60 * 1000
}

function LaunchCountdown({ net }: { net: string }) {
  const [display, setDisplay] = useState(() => formatCountdown(net))
  const live = isWithin24h(net)

  useEffect(() => {
    if (!live) return
    const interval = setInterval(() => setDisplay(formatCountdown(net)), 1000)
    return () => clearInterval(interval)
  }, [net, live])

  useEffect(() => {
    if (!live) setDisplay(formatCountdown(net))
  }, [net, live])

  return (
    <span className="font-mono text-cosmos-gold font-bold tabular-nums">
      {display}
    </span>
  )
}

interface LaunchTrackerProps {
  launches: LiveLaunch[]
  isLoading: boolean
}

export function LaunchTracker({ launches, isLoading }: LaunchTrackerProps) {
  if (isLoading) {
    return (
      <section>
        <SectionHeader />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (launches.length === 0) return null

  return (
    <section>
      <SectionHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {launches.slice(0, 6).map(launch => (
          <LaunchCard key={launch.id} launch={launch} />
        ))}
      </div>
    </section>
  )
}

function SectionHeader() {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Rocket className="w-3.5 h-3.5 text-cosmos-gold" />
      <span className="text-xs uppercase tracking-widest text-white/90 font-semibold">
        Upcoming Launches
      </span>
    </div>
  )
}

function LaunchCard({ launch }: { launch: LiveLaunch }) {
  const statusColor = getStatusColor(launch.status.abbrev)
  const launchDate = new Date(launch.net)
  const isPast = launchDate.getTime() < Date.now()

  return (
    <div className="rounded-xl border border-cosmos-gold/[0.12] overflow-hidden bg-[rgba(8,12,28,0.7)] hover:border-cosmos-gold/[0.3] transition-all group">
      {/* Image header */}
      <div className="relative h-32 overflow-hidden bg-cosmos-depth">
        {launch.imageUrl ? (
          <img
            src={launch.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cosmos-depth to-cosmos-void flex items-center justify-center">
            <Rocket className="w-8 h-8 text-cosmos-gold/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status badge */}
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm"
          style={{
            background: `${statusColor}25`,
            color: statusColor,
            border: `1px solid ${statusColor}40`,
          }}
        >
          {launch.webcastLive && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5 align-middle" />
          )}
          {launch.status.abbrev}
        </div>

        {/* Countdown overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-white/60" />
          <span className="text-[11px] text-white/80">
            {isPast ? 'Launched' : <LaunchCountdown net={launch.net} />}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 space-y-1.5">
        <h3 className="text-sm font-bold text-white/90 leading-tight line-clamp-1">
          {launch.missionName ?? launch.name}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span className="text-cosmos-gold font-medium">{launch.rocket}</span>
          <span>by {launch.provider}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{launch.padLocation}</span>
        </div>
        <div className="text-[11px] text-gray-500">
          {launchDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' '}
          {launchDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
        </div>

        {/* Webcast link */}
        {launch.webcastUrl && (
          <a
            href={launch.webcastUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-cosmos-gold hover:text-cosmos-gold/80 transition-colors mt-1"
          >
            {launch.webcastLive ? 'Watch Live' : 'Watch'}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}
