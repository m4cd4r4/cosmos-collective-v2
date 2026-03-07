'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ArrowRight, Telescope } from 'lucide-react'
import { useCosmosStore } from '@/store/cosmos-store'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { getFeaturedRadioObservations } from '@/services/australian-telescopes'
import type { Observation } from '@/types'

export function ObservationHighlights() {
  const { favorites } = useCosmosStore()

  const allObservations = [...getFeaturedJWSTImages(), ...getFeaturedRadioObservations()]
  const favoriteObservations = allObservations.filter(obs => favorites.includes(obs.id))

  // Show favourites if any, otherwise show featured
  const showFavourites = favoriteObservations.length > 0
  const displayedObs = showFavourites
    ? favoriteObservations.slice(0, 8)
    : allObservations.filter(obs => obs.isFeatured).slice(0, 8)

  if (displayedObs.length === 0 && !showFavourites) {
    // Fallback: show first 6 observations
    displayedObs.push(...allObservations.slice(0, 6))
  }

  if (displayedObs.length === 0) return null

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-[0.15em] text-[#4a5580] font-semibold flex items-center gap-2">
          {showFavourites ? (
            <><Heart className="w-3.5 h-3.5 text-[#ec4899]" /> Your Favourites</>
          ) : (
            <><Telescope className="w-3.5 h-3.5 text-[#4a90e2]" /> Featured Observations</>
          )}
        </h2>
        <Link
          href="/explore"
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#d4af37] hover:text-[#e8c64a] transition-colors"
        >
          Explore All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
        {displayedObs.map((obs) => (
          <ObservationCard key={obs.id} observation={obs} />
        ))}
      </div>
    </section>
  )
}

function ObservationCard({ observation }: { observation: Observation }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/explore/${observation.id}`}
      className="snap-start shrink-0 w-[180px] group"
    >
      <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(212,175,55,0.2)] transition-all">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imgError ? '/images/cosmos-placeholder.svg' : observation.images.thumbnail}
            alt={observation.targetName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="180px"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] to-transparent" />

          {/* Source badge */}
          <span className="absolute top-2 right-2 text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] text-[#4a5580] backdrop-blur-sm">
            {observation.source}
          </span>
        </div>

        {/* Info */}
        <div className="p-2.5">
          <p className="text-[11px] font-semibold text-white truncate group-hover:text-[#d4af37] transition-colors">
            {observation.targetName}
          </p>
          <p className="text-[9px] text-[#4a5580] capitalize mt-0.5">
            {observation.wavelengthBand} · {observation.category.replace('-', ' ')}
          </p>
        </div>
      </div>
    </Link>
  )
}
