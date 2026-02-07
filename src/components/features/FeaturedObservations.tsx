'use client'

/**
 * Featured Observations Component
 * Displays curated JWST and other telescope images
 */

import { useState } from 'react'
import Link from 'next/link'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { ImageCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn, formatDate } from '@/lib/utils'
import type { ObjectCategory } from '@/types'
import { ArrowRight, Filter } from 'lucide-react'

// ============================================
// Category Filters
// ============================================

const categories: { value: ObjectCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🌌' },
  { value: 'nebula', label: 'Nebulae', emoji: '💨' },
  { value: 'galaxy', label: 'Galaxies', emoji: '🌀' },
  { value: 'deep-field', label: 'Deep Fields', emoji: '✨' },
  { value: 'solar-system', label: 'Solar System', emoji: '🪐' },
]

// ============================================
// Featured Observations Component
// ============================================

export function FeaturedObservations() {
  const [selectedCategory, setSelectedCategory] = useState<ObjectCategory | 'all'>('all')
  const observations = getFeaturedJWSTImages()

  const filteredObservations =
    selectedCategory === 'all'
      ? observations
      : observations.filter((obs) => obs.category === selectedCategory)

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h2
            id="featured-heading"
            className="text-3xl md:text-4xl font-display font-bold text-white mb-2"
          >
            Featured <span className="text-gradient-stellar">Observations</span>
          </h2>
          <p className="text-gray-400 max-w-xl">
            Explore the universe through the eyes of JWST, Hubble, and other space telescopes.
            Each image tells a story billions of years in the making.
          </p>
        </div>

        <Link href="/explore">
          <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
            View All
          </Button>
        </Link>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
        <div role="group" aria-label="Filter by category" className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                selectedCategory === category.value
                  ? 'bg-cosmos-gold/20 text-cosmos-gold border border-cosmos-gold/50'
                  : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white'
              )}
              aria-pressed={selectedCategory === category.value}
            >
              <span aria-hidden="true">{category.emoji}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Observations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredObservations.map((observation, index) => (
          <Link
            key={observation.id}
            href={`/explore/${observation.id}`}
            className={cn(
              'block animate-fade-in',
              index === 0 && 'sm:col-span-2 sm:row-span-2'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ImageCard
              src={observation.images.thumbnail}
              alt={`${observation.targetName} - ${observation.category} captured by ${observation.source}`}
              title={observation.targetName}
              subtitle={`${observation.source} • ${formatDate(observation.observationDate, { month: 'short', year: 'numeric' })}`}
              badge={observation.wavelengthBand.toUpperCase()}
              badgeVariant={
                observation.wavelengthBand === 'infrared'
                  ? 'gold'
                  : observation.wavelengthBand === 'radio'
                    ? 'cyan'
                    : 'purple'
              }
              aspectRatio={index === 0 ? 'square' : 'video'}
              className="h-full"
            />
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredObservations.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🔭</span>
          <h3 className="text-xl font-semibold text-white mb-2">No observations found</h3>
          <p className="text-gray-400 mb-4">
            Try selecting a different category to see more cosmic wonders.
          </p>
          <Button variant="secondary" onClick={() => setSelectedCategory('all')}>
            Show All Observations
          </Button>
        </div>
      )}
    </div>
  )
}
