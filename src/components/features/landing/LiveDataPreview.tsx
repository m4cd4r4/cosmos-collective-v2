'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

// Same notation as the masses in the solar system app: 4.58 × 10⁻⁷
function formatFlux(flux: number): string {
  const [mantissa, exponent] = flux.toExponential(2).split('e')
  const superscript = [...String(Number(exponent))]
    .map((c) => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]))
    .join('')
  return `${mantissa} × 10${superscript}`
}

// NASA reports close approaches in UTC
function formatApproachDate(time: number): string {
  return new Date(time).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

export function LiveDataPreview() {
  const { closestAsteroid, issPosition, issUpdatedAt, solarWeather, solarUpdatedAt, isLoading } =
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
          <span className="text-sm text-gray-400">Live telemetry</span>
          <h2 id="live-data-heading" className="text-2xl sm:text-3xl font-display font-semibold text-white mt-2">
            Real data, right now
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Closest asteroid */}
          <a
            href={closestAsteroid?.url ?? 'https://cneos.jpl.nasa.gov/ca/'}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 flex flex-col justify-center hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                aria-hidden="true"
                style={{
                  background: closestAsteroid ? '#34d399' : isLoading ? '#6b7280' : '#ef4444',
                }}
              />
              <span className="text-xs text-gray-400 font-medium">
                Closest asteroid
              </span>
            </div>
            {closestAsteroid ? (
              <>
                <span className="text-xl font-mono tabular-nums font-medium text-white mb-1">
                  {closestAsteroid.name}
                </span>
                <span className="text-xs text-gray-500 tabular-nums">
                  {closestAsteroid.lunarDistances.toFixed(1)} lunar distances ·{' '}
                  {formatApproachDate(closestAsteroid.approachTime)} · NASA NeoWs
                </span>
              </>
            ) : (
              <span className="text-sm font-mono text-gray-500">
                {isLoading ? 'Loading' : 'No data'}
              </span>
            )}
          </a>

          {/* ISS Position */}
          <Link
            href="/satellites"
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 flex flex-col justify-center hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                aria-hidden="true"
                style={{
                  background: issPosition ? '#34d399' : isLoading ? '#6b7280' : '#ef4444',
                }}
              />
              <span className="text-xs text-gray-400 font-medium">
                ISS position
              </span>
            </div>
            {issPosition ? (
              <>
                <div className="flex items-baseline gap-4 mb-1.5">
                  <div>
                    <span className="text-xs text-gray-500 block">Lat</span>
                    <span className="text-xl font-mono tabular-nums font-medium text-white">
                      {issPosition.lat.toFixed(2)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Lon</span>
                    <span className="text-xl font-mono tabular-nums font-medium text-white">
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
          <a
            href="https://www.swpc.noaa.gov/"
            target="_blank"
            rel="noopener noreferrer"
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
              <span className="text-xs text-gray-400 font-medium">
                Solar activity
              </span>
            </div>
            {solarWeather ? (
              <>
                <span className="text-xl font-mono tabular-nums font-medium text-white capitalize mb-1">
                  {solarWeather.flareLevel}
                </span>
                <span className="text-xs text-gray-500 tabular-nums">
                  Flux {formatFlux(solarWeather.currentFlux)} W/m² · NOAA SWPC
                  {solarFresh ? ` · ${solarFresh}` : ''}
                </span>
              </>
            ) : (
              <span className="text-sm font-mono text-gray-500">
                {isLoading ? 'Reading sensors' : 'No data'}
              </span>
            )}
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Sources: NASA, NOAA SWPC, Open Notify, Launch Library 2, ESA, CSIRO. All readouts are
          real and refresh automatically.
        </p>
      </div>
    </section>
  )
}
