'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { getFeaturedJWSTImages } from '@/services/mast-api'

export function ExploreWidget() {
  const [activeIndex, setActiveIndex] = useState(0)

  const featured = useMemo(() => {
    const all = getFeaturedJWSTImages()
    return all.filter(o => o.isFeatured).slice(0, 4).map(o => ({
      name: o.targetName,
      url: o.images.preview,
    }))
  }, [])

  useEffect(() => {
    if (featured.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex(i => (i + 1) % featured.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [featured.length])

  if (featured.length === 0) return null

  return (
    <div className="absolute inset-0">
      {/* Stacked crossfading images */}
      {featured.map((obs, i) => (
        <Image
          key={obs.url}
          src={obs.url}
          alt={obs.name}
          fill
          className="object-cover transition-opacity duration-1000"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={i === 0}
          unoptimized
        />
      ))}

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,12,28,0.85)] via-transparent to-[rgba(8,12,28,0.3)]" />

      {/* Current observation name */}
      <div className="absolute top-2.5 right-3">
        <span
          className="text-[9px] font-mono tracking-wider text-white/60 transition-opacity duration-500"
          key={activeIndex}
        >
          {featured[activeIndex].name}
        </span>
      </div>

      {/* Observation count pill */}
      <div className="absolute bottom-3 left-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(8,12,28,0.7)] backdrop-blur-sm border border-[rgba(212,175,55,0.2)]">
          <span className="text-[10px] font-bold text-[#d4af37]">132</span>
          <span className="text-[8px] uppercase tracking-wider text-[#6070a0]">Observations</span>
        </div>
      </div>

      {/* Image dots */}
      <div className="absolute bottom-3 right-3 flex gap-1">
        {featured.map((_, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === activeIndex ? '#d4af37' : 'rgba(255,255,255,0.2)',
              boxShadow: i === activeIndex ? '0 0 6px rgba(212,175,55,0.5)' : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}
