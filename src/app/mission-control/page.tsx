'use client'

/**
 * Mission Control — Live Telemetry Dashboard
 * Each module tile shows real data previews from its module
 */

import { Header } from '@/components/layout/Header'
import { StatPopover } from '@/components/ui/StatPopover'
import { BookMarked } from 'lucide-react'
import { TOOLS, INFO_PANELS } from '@/lib/mission-control-data'
import { TelemetryTile } from '@/components/features/mission-control/TelemetryTile'
import { useTelemetryData } from '@/components/features/mission-control/useTelemetryData'
import { ExploreWidget } from '@/components/features/mission-control/ExploreWidget'
import { LiveEventsWidget } from '@/components/features/mission-control/LiveEventsWidget'
import { DevlogWidget } from '@/components/features/mission-control/DevlogWidget'
import { ObservatoryWidget } from '@/components/features/mission-control/ObservatoryWidget'
import { DashboardWidget } from '@/components/features/mission-control/DashboardWidget'
import { CreditsWidget } from '@/components/features/mission-control/CreditsWidget'

// Map each module to its widget, data status, and telemetry text generator
const WIDGET_CONFIG: Record<string, {
  Widget: React.ComponentType<any>
  dataStatus: 'live' | 'cached' | 'static'
  propsKey?: string[]
}> = {
  Explore: { Widget: ExploreWidget, dataStatus: 'static' },
  'Live Events': { Widget: LiveEventsWidget, dataStatus: 'live', propsKey: ['issPosition', 'solarWeather', 'upcomingEvents'] },
  Devlog: { Widget: DevlogWidget, dataStatus: 'static' },
  Observatory: { Widget: ObservatoryWidget, dataStatus: 'static' },
  Dashboard: { Widget: DashboardWidget, dataStatus: 'live', propsKey: ['apod', 'issPosition', 'utcTime'] },
  Credits: { Widget: CreditsWidget, dataStatus: 'live' },
}

const TELEMETRY_TEXT: Record<string, (data: any) => string> = {
  Explore: () => 'OBS: 132 | JWST: 85 | HUBBLE: 18 | RADIO: 29',
  'Live Events': (d) => {
    const lat = d.issPosition?.lat?.toFixed(1) ?? '--'
    const lon = d.issPosition?.lon?.toFixed(1) ?? '--'
    const solar = d.solarWeather?.flareLevel ?? 'unknown'
    return `ISS: ${lat}° ${lon}° | ALT: ~408km | SOLAR: ${solar}`
  },
  Devlog: () => 'ARCHITECTURE · APIS · VISUALIZATION · RADIO',
  Observatory: () => 'AITOFF PROJECTION | IR · OPT · RADIO · UV · XRAY',
  Dashboard: (d) => {
    const parts = []
    if (d.apod) parts.push(`APOD: ${d.apod.title.slice(0, 28)}`)
    if (d.issPosition) parts.push(`ISS: ${d.issPosition.lat.toFixed(1)}° ${d.issPosition.lon.toFixed(1)}°`)
    parts.push(`UTC: ${d.utcTime ?? '--:--:--'}`)
    return parts.join(' | ')
  },
  Credits: () => 'LIVE API HEALTH MONITOR | 6 ENDPOINTS',
}

export default function MissionControlPage() {
  const telemetry = useTelemetryData()

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* App Header Strip */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <BookMarked className="w-4 h-4 text-[#d4af37]" />
          <span className="text-base font-bold tracking-[0.15em] uppercase text-[#e0e8ff]">Mission Control</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#d4af37]">All Systems</span>
          </div>
          <span className="hidden sm:inline text-[9px] uppercase tracking-[0.12em] text-[#4a5580] border border-[rgba(212,175,55,0.1)] px-2 py-0.5 rounded">
            Cosmos Collective Hub
          </span>
        </div>
        <span className="hidden sm:block text-[9px] uppercase tracking-wider text-[#4a5580]">
          6 Modules Active
        </span>
      </div>

      {/* Stats Bar */}
      <div className="bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.08)] flex shrink-0">
        {INFO_PANELS.map(({ label, value, color, popoverItems }) => (
          <StatPopover key={label} items={popoverItems} className="flex-1 border-r border-[rgba(212,175,55,0.06)] last:border-0">
            <div className="flex flex-col items-center px-6 lg:px-10 py-2">
              <span className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</span>
              <span className="text-[9px] uppercase tracking-[0.13em] text-[#4a5580] mt-0.5 whitespace-nowrap">{label}</span>
            </div>
          </StatPopover>
        ))}
      </div>

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-6xl mx-auto w-full">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#4a5580]">Available Modules</span>
          <div className="flex-1 h-px bg-[rgba(212,175,55,0.06)]" />
        </div>

        {/* Live Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => {
            const config = WIDGET_CONFIG[tool.label]
            if (!config) return null
            const { Widget, dataStatus } = config

            // Build widget props from telemetry data
            const widgetProps: Record<string, any> = {}
            if (tool.label === 'Live Events') {
              widgetProps.issPosition = telemetry.issPosition
              widgetProps.solarWeather = telemetry.solarWeather
              widgetProps.upcomingEvents = telemetry.upcomingEvents
            } else if (tool.label === 'Dashboard') {
              widgetProps.apod = telemetry.apod
              widgetProps.issPosition = telemetry.issPosition
              widgetProps.utcTime = telemetry.utcTime
            }

            const effectiveStatus = telemetry.isLoading && dataStatus === 'live' ? 'cached' as const : dataStatus
            const telemetryText = TELEMETRY_TEXT[tool.label]?.(telemetry) ?? ''

            return (
              <TelemetryTile
                key={tool.href}
                label={tool.label}
                href={tool.href}
                icon={tool.icon}
                badge={tool.badge}
                badgeColor={tool.badgeColor}
                badgePulse={tool.badgePulse}
                color={tool.color}
                glow={tool.glow}
                dataStatus={effectiveStatus}
                telemetryText={telemetryText}
              >
                <Widget {...widgetProps} />
              </TelemetryTile>
            )
          })}
        </div>

        {/* Bottom info row */}
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {INFO_PANELS.map(({ icon: Icon, label, detail, color, popoverItems }) => (
            <StatPopover key={label} items={popoverItems}>
              <div className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.5)] px-3.5 py-3 flex items-start gap-2.5 text-left">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${color}15`, border: `1px solid ${color}20` }}
                >
                  <Icon className="w-3 h-3" style={{ color }} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#c8d4f0]">{label}</div>
                  <div className="text-[9px] text-[#4a5580] mt-0.5 leading-relaxed">{detail}</div>
                </div>
              </div>
            </StatPopover>
          ))}
        </div>
      </main>
    </div>
  )
}
