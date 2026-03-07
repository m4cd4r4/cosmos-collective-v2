'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

interface TelemetryTileProps {
  label: string
  href: string
  icon: LucideIcon
  badge: string
  badgeColor: string
  badgePulse?: boolean
  color: string
  glow: string
  dataStatus: 'live' | 'cached' | 'static'
  telemetryText?: string
  children: React.ReactNode
}

const STATUS_COLORS = {
  live: '#22c55e',
  cached: '#f59e0b',
  static: '#6b7280',
}

export function TelemetryTile({
  label, href, icon: Icon, badge, badgeColor, badgePulse,
  color, glow, dataStatus, telemetryText, children,
}: TelemetryTileProps) {
  const router = useRouter()
  const tileRef = useRef<HTMLDivElement>(null)
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)
  const [hovering, setHovering] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => router.push(href), 350)
  }, [router, href])

  return (
    <div
      ref={tileRef}
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setRipple(null) }}
      className="group relative rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(8,12,28,0.7)] overflow-hidden cursor-pointer transition-all duration-200 flex flex-col"
      style={{
        transform: hovering ? 'scale(1.02)' : 'scale(1)',
        borderColor: hovering ? `${color}66` : undefined,
        boxShadow: hovering ? `0 0 24px ${glow}, 0 8px 32px rgba(0,0,0,0.3)` : undefined,
      }}
      role="link"
      tabIndex={0}
      aria-label={`${label} — ${badge}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(href) } }}
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}28` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <span className="text-[13px] font-bold text-[#e0e8ff] uppercase tracking-[0.1em]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Status LED */}
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: STATUS_COLORS[dataStatus],
              boxShadow: dataStatus === 'live' ? `0 0 6px ${STATUS_COLORS.live}` : undefined,
            }}
            title={`Data: ${dataStatus}`}
          />
          {/* Badge */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded"
            style={{ background: `${badgeColor}18`, border: `1px solid ${badgeColor}28` }}
          >
            {badgePulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badgeColor }} />}
            <span className="text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: badgeColor }}>{badge}</span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="relative flex-1 min-h-[160px] overflow-hidden">
        {children}

        {/* Scan-line overlay */}
        {hovering && (
          <div
            className="absolute left-0 right-0 h-[2px] pointer-events-none animate-scanline"
            style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
          />
        )}

        {/* Click ripple */}
        {ripple && (
          <span
            className="absolute rounded-full pointer-events-none animate-ripple"
            style={{
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
              background: `${color}30`,
            }}
          />
        )}
      </div>

      {/* Telemetry strip */}
      <div className="hidden sm:flex items-center px-3 py-1 border-t border-[rgba(212,175,55,0.06)] bg-[rgba(4,6,18,0.95)] shrink-0">
        <span className="text-[8px] font-mono tracking-[0.08em] text-[#d4af37] opacity-40 truncate">
          {telemetryText || new Date().toISOString().slice(11, 19) + ' UTC'}
        </span>
      </div>
    </div>
  )
}
