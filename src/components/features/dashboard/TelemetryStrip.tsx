'use client'

import { Satellite, Sun, Zap, Telescope, Heart } from 'lucide-react'

const FLARE_COLORS: Record<string, string> = {
  quiet: '#22c55e',
  minor: '#f59e0b',
  moderate: '#f97316',
  strong: '#ef4444',
  severe: '#dc2626',
}

interface TelemetryStripProps {
  issPosition: { lat: number; lon: number } | null
  solarWeather: { flareLevel: string; currentFlux: number } | null
  nextEventTitle: string
  nextEventCountdown: string
  observationCount: number
  favouriteCount: number
}

export function TelemetryStrip({
  issPosition,
  solarWeather,
  nextEventTitle,
  nextEventCountdown,
  observationCount,
  favouriteCount,
}: TelemetryStripProps) {
  const flareLevel = solarWeather?.flareLevel ?? 'quiet'
  const flareColor = FLARE_COLORS[flareLevel] ?? '#6b7280'

  return (
    <section className="mb-6 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        {/* ISS Position */}
        <TelemetryCell
          icon={<Satellite className="w-3.5 h-3.5 text-[#22c55e]" />}
          label="ISS Position"
          ledColor="#22c55e"
          ledActive={!!issPosition}
        >
          {issPosition ? (
            <span suppressHydrationWarning className="font-mono text-white text-sm">
              {issPosition.lat.toFixed(1)}° {issPosition.lon.toFixed(1)}°
            </span>
          ) : (
            <span className="text-[#4a5580] text-xs">Acquiring...</span>
          )}
        </TelemetryCell>

        {/* Solar Activity */}
        <TelemetryCell
          icon={<Sun className="w-3.5 h-3.5" style={{ color: flareColor }} />}
          label="Solar"
          ledColor={flareColor}
          ledActive={flareLevel !== 'quiet'}
        >
          <span className="font-bold text-sm capitalize" style={{ color: flareColor }}>
            {flareLevel}
          </span>
        </TelemetryCell>

        {/* Next Event */}
        <TelemetryCell
          icon={<Zap className="w-3.5 h-3.5 text-[#d4af37]" />}
          label="Next Event"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#e0e8ff] truncate max-w-[80px]">{nextEventTitle || 'None'}</span>
            {nextEventCountdown && (
              <span suppressHydrationWarning className="text-xs font-mono text-[#d4af37] shrink-0">{nextEventCountdown}</span>
            )}
          </div>
        </TelemetryCell>

        {/* Observations */}
        <TelemetryCell
          icon={<Telescope className="w-3.5 h-3.5 text-[#4a90e2]" />}
          label="Observations"
        >
          <span className="font-mono font-bold text-sm text-white">{observationCount}</span>
        </TelemetryCell>

        {/* Favourites */}
        <TelemetryCell
          icon={<Heart className="w-3.5 h-3.5 text-[#ec4899]" />}
          label="Favourites"
        >
          <span className="font-mono font-bold text-sm text-white">{favouriteCount}</span>
        </TelemetryCell>
      </div>
    </section>
  )
}

interface TelemetryCellProps {
  icon: React.ReactNode
  label: string
  ledColor?: string
  ledActive?: boolean
  children: React.ReactNode
}

function TelemetryCell({ icon, label, ledColor, ledActive, children }: TelemetryCellProps) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] min-w-[140px]">
      <div className="relative shrink-0">
        {icon}
        {ledColor && (
          <span
            className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
            style={{
              background: ledColor,
              boxShadow: ledActive ? `0 0 6px ${ledColor}` : undefined,
              opacity: ledActive ? 1 : 0.3,
            }}
          />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[8px] uppercase tracking-[0.15em] text-[#4a5580] leading-none mb-0.5">{label}</span>
        {children}
      </div>
    </div>
  )
}
