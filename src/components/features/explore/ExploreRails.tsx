/**
 * Explore Rails
 * Horizontally scrolling rows of large image cards. Every card is a distinct real
 * image: observations that share an image with an earlier one are dropped, and
 * radio observations are left out until they have their own images.
 */

import Link from 'next/link'
import NextImage from 'next/image'
import { getFeaturedJWSTImages, getFeaturedHubbleImages } from '@/services/mast-api'
import { formatDate } from '@/lib/utils'
import type { Observation, ObjectCategory } from '@/types'
import { RailScroller } from './RailScroller'

interface RailDef {
  id: string
  title: string
  blurb: string
  pick: (o: Observation) => boolean
  newestFirst?: boolean
}

const RAILS: RailDef[] = [
  { id: 'newest', title: 'Newest', blurb: 'Most recent observations', pick: () => true, newestFirst: true },
  { id: 'nebulae', title: 'Nebulae', blurb: 'Stellar nurseries and dying stars', pick: (o) => o.category === 'nebula' },
  { id: 'galaxies', title: 'Galaxies', blurb: 'Spirals, mergers and the deep past', pick: (o) => o.category === 'galaxy' || o.category === 'deep-field' },
  { id: 'solar-system', title: 'Our Solar System', blurb: 'Planets and moons through Webb', pick: (o) => o.category === 'solar-system' },
]

const MIN_CARDS = 4
const MAX_CARDS = 14

const CATEGORY_LABEL: Partial<Record<ObjectCategory, string>> = {
  nebula: 'Nebula',
  galaxy: 'Galaxy',
  'deep-field': 'Deep field',
  'solar-system': 'Solar system',
  'star-cluster': 'Star cluster',
  exoplanet: 'Exoplanet',
  star: 'Star',
}

function distinctByImage(list: Observation[]): Observation[] {
  const seen = new Set<string>()
  return list.filter((o) => {
    const key = o.images.thumbnail
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function ExploreRails() {
  const all = [...getFeaturedJWSTImages(), ...getFeaturedHubbleImages()]
  const byDate = [...all].sort(
    (a, b) => new Date(b.observationDate).getTime() - new Date(a.observationDate).getTime(),
  )

  const rails = RAILS.map((rail) => {
    const source = rail.newestFirst ? byDate : all
    return { rail, cards: distinctByImage(source.filter(rail.pick)).slice(0, MAX_CARDS) }
  }).filter((r) => r.cards.length >= MIN_CARDS)

  return (
    <div className="py-8 space-y-10">
      {rails.map(({ rail, cards }) => (
        <section key={rail.id} aria-labelledby={`rail-${rail.id}`}>
          <div className="px-4 sm:px-8 mb-3 flex items-baseline gap-3 max-w-[1600px] mx-auto">
            <h2 id={`rail-${rail.id}`} className="font-display text-xl sm:text-2xl text-white font-semibold">
              {rail.title}
            </h2>
            <p className="text-xs text-gray-400 hidden sm:block">{rail.blurb}</p>
          </div>
          <div className="max-w-[1600px] mx-auto">
            <RailScroller label={rail.title}>
              {cards.map((o) => (
                <li key={o.id} className="snap-start shrink-0">
                  <Link
                    href={`/explore/${o.id}`}
                    className="group relative block w-[200px] sm:w-[240px] aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-[#0d1224] hover:border-[#d4af37]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] transition-colors"
                  >
                    <NextImage
                      src={o.images.thumbnail}
                      alt={`${o.targetName}, observed by ${o.source}`}
                      fill
                      sizes="(min-width: 640px) 240px, 200px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[#f0cd5a]">
                        {o.source} · {CATEGORY_LABEL[o.category] ?? o.category}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-white leading-snug line-clamp-2">
                        {o.targetName}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-gray-300">
                        {formatDate(o.observationDate, { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </RailScroller>
          </div>
        </section>
      ))}
    </div>
  )
}
