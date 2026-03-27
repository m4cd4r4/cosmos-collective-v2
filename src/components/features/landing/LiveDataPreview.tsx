'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTelemetryData } from '@/components/features/mission-control/useTelemetryData'

export function LiveDataPreview() {
  const { apod, issPosition, solarWeather, isLoading } = useTelemetryData()

  return (
    <section className="bg-[rgba(4,6,18,0.97)] border-y border-[rgba(212,175,55,0.08)] px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-[0.2em] text-[#4a5580]">Live Telemetry</span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-2">
            Real Data, Right Now
          </h2>
        </div>

        {/* 3-cell grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* APOD */}
          <Link
            href="/events"
            className="group rounded-xl border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.5)] overflow-hidden hover:border-[rgba(212,175,55,0.2)] transition-colors"
          >
            <div className="relative h-28 overflow-hidden">
              {apod && apod.media_type === 'image' ? (
                <Image
                  src={apod.url}
                  alt={apod.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1040] to-[#0a0e1a]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,12,28,0.9)] to-transparent" />
              <span className="absolute top-2 left-2 text-[11px] uppercase tracking-[0.12em] text-[#d4af37] font-semibold px-1.5 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.2)]">
                NASA APOD
              </span>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[11px] font-semibold text-white truncate">
                {apod?.title ?? 'Loading...'}
              </p>
              <p className="text-[11px] text-[#4a5580] mt-0.5">
                Astronomy Picture of the Day
              </p>
            </div>
          </Link>

          {/* ISS Position */}
          <Link
            href="/events"
            className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.5)] px-4 py-4 flex flex-col justify-center hover:border-[rgba(212,175,55,0.2)] transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: issPosition ? '#22c55e' : isLoading ? '#6b7280' : '#ef4444',
                  boxShadow: issPosition ? '0 0 8px #22c55e' : undefined,
                  animation: isLoading ? 'pulse 1.5s ease-in-out infinite' : undefined,
                }}
              />
              <span className="text-[11px] uppercase tracking-[0.15em] text-[#4a5580] font-semibold">
                ISS Tracker
              </span>
            </div>
            {issPosition ? (
              <>
                <div className="flex items-baseline gap-3 mb-1">
                  <div>
                    <span className="text-[11px] uppercase text-[#4a5580] block">Lat</span>
                    <span className="text-lg font-mono font-bold text-[#22c55e]">
                      {issPosition.lat.toFixed(2)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase text-[#4a5580] block">Lon</span>
                    <span className="text-lg font-mono font-bold text-[#22c55e]">
                      {issPosition.lon.toFixed(2)}°
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#4a5580]">Alt ~408 km · Updated every 30s</span>
              </>
            ) : (
              <span className="text-sm font-mono text-[#4a5580]">
                {isLoading ? 'Acquiring signal...' : 'Signal lost'}
              </span>
            )}
          </Link>

          {/* Solar Weather */}
          <Link
            href="/events"
            className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.5)] px-4 py-4 flex flex-col justify-center hover:border-[rgba(212,175,55,0.2)] transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: solarWeather
                    ? solarWeather.flareLevel.startsWith('X') ? '#ef4444'
                    : solarWeather.flareLevel.startsWith('M') ? '#f59e0b'
                    : '#22c55e'
                    : '#6b7280',
                  boxShadow: solarWeather ? '0 0 6px rgba(245,158,11,0.5)' : undefined,
                }}
              />
              <span className="text-[11px] uppercase tracking-[0.15em] text-[#4a5580] font-semibold">
                Solar Activity
              </span>
            </div>
            {solarWeather ? (
              <>
                <span className="text-2xl font-mono font-bold text-[#f59e0b] mb-1">
                  {solarWeather.flareLevel}
                </span>
                <span className="text-[11px] text-[#4a5580]">
                  Flux: {solarWeather.currentFlux.toFixed(2)} W/m² · NOAA SWPC
                </span>
              </>
            ) : (
              <span className="text-sm font-mono text-[#4a5580]">
                {isLoading ? 'Reading sensors...' : 'No data'}
              </span>
            )}
          </Link>
        </div>

        {/* Footer text */}
        <p className="text-center text-[11px] uppercase tracking-[0.15em] text-[#4a5580]/60 mt-6">
          All powered by 11 live data sources from NASA, ESA, CSIRO, and more
        </p>
      </div>
    </section>
  )
}
