'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTelemetryData } from '@/components/features/mission-control/useTelemetryData'

function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function freshness(updatedAt: number | null, now: number): string | null {
  if (!updatedAt) return null
  const s = Math.max(0, Math.round((now - updatedAt) / 1000))
  if (s < 60) return `updated ${s}s ago`
  const m = Math.round(s / 60)
  return `updated ${m} min ago`
}

export function LiveDataPreview() {
  const { apod, issPosition, issUpdatedAt, solarWeather, solarUpdatedAt, isLoading } =
    useTelemetryData()
  const now = useNow()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const issFresh = mounted ? freshness(issUpdatedAt, now) : null
  const solarFresh = mounted ? freshness(solarUpdatedAt, now) : null

  return (
    <section
      className="bg-[rgba(4,6,18,0.97)] border-y border-white/[0.06] px-4 sm:px-6 py-14 sm:py-20"
      aria-labelledby="live-data-heading"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Live telemetry</span>
          <h2 id="live-data-heading" className="text-2xl sm:text-3xl font-display font-bold text-white mt-2">
            Real data, right now
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* APOD */}
          <Link
            href="/events"
            className="group rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden hover:border-white/20 transition-colors"
          >
            <div className="relative h-32 overflow-hidden">
              {apod && apod.media_type === 'image' ? (
                <Image
                  src={apod.url}
                  alt={apod.title}
                  fill
                  loading="lazy"
                  className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#131a35] to-[#0a0e1a]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,6,18,0.9)] to-transparent" />
              <span className="absolute top-2.5 left-2.5 text-[11px] uppercase tracking-[0.12em] text-cosmos-gold font-semibold px-1.5 py-0.5 rounded bg-black/50 border border-white/15">
                NASA APOD
              </span>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-white truncate">
                {apod?.title ?? (isLoading ? 'Loading picture of the day' : 'Picture of the day unavailable')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {apod?.date ? `Astronomy Picture of the Day · ${apod.date}` : 'Astronomy Picture of the Day'}
              </p>
            </div>
          </Link>

          {/* ISS Position */}
          <Link
            href="/events"
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 flex flex-col justify-center hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                aria-hidden="true"
                style={{
                  background: issPosition ? '#34d399' : isLoading ? '#6b7280' : '#ef4444',
                  boxShadow: issPosition ? '0 0 8px rgba(52,211,153,0.6)' : undefined,
                }}
              />
              <span className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">
                ISS position
              </span>
            </div>
            {issPosition ? (
              <>
                <div className="flex items-baseline gap-4 mb-1.5">
                  <div>
                    <span className="text-[11px] uppercase text-gray-500 block">Lat</span>
                    <span className="text-xl font-mono tabular-nums font-bold text-emerald-300">
                      {issPosition.lat.toFixed(2)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase text-gray-500 block">Lon</span>
                    <span className="text-xl font-mono tabular-nums font-bold text-emerald-300">
                      {issPosition.lon.toFixed(2)}°
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 tabular-nums">
                  Alt ~408 km{issFresh ? ` · ${issFresh}` : ''}
                </span>
              </>
            ) : (
              <span className="text-sm font-mono text-gray-500">
                {isLoading ? 'Acquiring signal' : 'Signal lost'}
              </span>
            )}
          </Link>

          {/* Solar Weather */}
          <Link
            href="/events"
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 flex flex-col justify-center hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                aria-hidden="true"
                style={{
                  background: solarWeather
                    ? ['strong', 'severe'].includes(solarWeather.flareLevel) ? '#ef4444'
                    : solarWeather.flareLevel === 'moderate' ? '#f59e0b'
                    : '#34d399'
                    : '#6b7280',
                }}
              />
              <span className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">
                Solar activity
              </span>
            </div>
            {solarWeather ? (
              <>
                <span className="text-2xl font-mono tabular-nums font-bold text-cosmos-amber mb-1">
                  {solarWeather.flareLevel}
                </span>
                <span className="text-xs text-gray-500 tabular-nums">
                  Flux {solarWeather.currentFlux.toExponential(2)} W/m² · NOAA SWPC
                  {solarFresh ? ` · ${solarFresh}` : ''}
                </span>
              </>
            ) : (
              <span className="text-sm font-mono text-gray-500">
                {isLoading ? 'Reading sensors' : 'No data'}
              </span>
            )}
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Sources: NASA, NOAA SWPC, Open Notify, Launch Library 2, ESA, CSIRO. All readouts are
          real and refresh automatically.
        </p>
      </div>
    </section>
  )
}
