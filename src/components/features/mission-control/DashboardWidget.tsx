'use client'

import Image from 'next/image'
import { useCosmosStore } from '@/store/cosmos-store'
import type { APODData } from '@/services/real-time-events'

interface DashboardWidgetProps {
  apod: APODData | null
  issPosition: { lat: number; lon: number } | null
  utcTime: string
}

export function DashboardWidget({ apod, issPosition, utcTime }: DashboardWidgetProps) {
  const favouriteCount = useCosmosStore(s => s.favorites.length)

  return (
    <div className="absolute inset-0">
      {/* APOD background image */}
      {apod && apod.media_type === 'image' && (
        <Image
          src={apod.url}
          alt={apod.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
      )}

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-[rgba(8,12,28,0.72)] backdrop-blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,12,28,0.9)] via-transparent to-[rgba(8,12,28,0.4)]" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col px-4 py-3">
        {/* Top — UTC Clock */}
        <div className="flex items-start justify-between">
          <div>
            {apod && (
              <span className="text-[7px] uppercase tracking-[0.12em] text-[#d4af37] font-semibold px-1.5 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.2)]">
                NASA APOD
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-[8px] uppercase tracking-[0.15em] text-[#4a5580] block leading-none">UTC</span>
            <span className="text-base font-mono font-bold text-white tracking-wider leading-tight">{utcTime}</span>
          </div>
        </div>

        {/* Center — APOD title */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[11px] font-semibold text-white/90 text-center truncate max-w-full">
            {apod?.title ?? 'Your Personal Space'}
          </p>
        </div>

        {/* Bottom — Live readouts */}
        <div className="flex items-end justify-between gap-2">
          {/* ISS position */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                background: issPosition ? '#22c55e' : '#6b7280',
                boxShadow: issPosition ? '0 0 6px #22c55e' : undefined,
              }}
            />
            <span className="text-[11px] font-mono text-[#22c55e]/70">
              {issPosition
                ? `ISS ${issPosition.lat.toFixed(1)}° ${issPosition.lon.toFixed(1)}°`
                : 'ISS ---'
              }
            </span>
          </div>

          {/* Favourites */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-[#ec4899]/70">
              {favouriteCount} ★
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
