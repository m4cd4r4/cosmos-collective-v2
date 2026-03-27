'use client'

import Image from 'next/image'
import { Satellite } from 'lucide-react'
import type { APODData } from '@/services/real-time-events'

interface HeroBannerProps {
  apod: APODData | null
  utcTime: string
  issPosition: { lat: number; lon: number } | null
  isLoading: boolean
}

export function HeroBanner({ apod, utcTime, issPosition, isLoading }: HeroBannerProps) {
  const hasImage = apod && apod.media_type === 'image'

  return (
    <section className="relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden mb-6">
      {/* Background */}
      {hasImage ? (
        <Image
          src={apod.url}
          alt={apod.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1628] to-[#1a1040]" />
      )}

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-[rgba(8,12,28,0.65)] backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Cosmos <span className="text-gradient-stellar">Dashboard</span>
            </h1>
            {!isLoading && apod && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] uppercase tracking-[0.12em] text-[#d4af37] font-semibold px-1.5 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.2)]">
                  NASA APOD
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* UTC Clock */}
            <div className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] backdrop-blur-sm">
              <span className="text-xs uppercase tracking-[0.15em] text-[#4a5580] block">UTC</span>
              <span suppressHydrationWarning className="text-lg font-mono font-bold text-white tracking-wider">{utcTime}</span>
            </div>

            {/* ISS badge */}
            {issPosition && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)]">
                <Satellite className="w-3 h-3 text-[#22c55e]" />
                <span suppressHydrationWarning className="text-[10px] font-mono text-[#22c55e]">
                  {issPosition.lat.toFixed(1)}° {issPosition.lon.toFixed(1)}°
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row — APOD title */}
        <div>
          <p className="text-sm sm:text-base font-semibold text-white/90 truncate max-w-[70%]">
            {apod?.title ?? 'Real-time astronomical data'}
          </p>
          {apod?.date && (
            <p className="text-[10px] text-[#4a5580] font-mono mt-0.5">{apod.date}</p>
          )}
        </div>
      </div>

      {/* Scan-line effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.3)] to-transparent animate-scanline" />
      </div>
    </section>
  )
}
