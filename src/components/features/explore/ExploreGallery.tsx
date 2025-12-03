'use client'

/**
 * Explore Gallery Component
 * Main gallery grid with infinite scroll and interactions
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { getFeaturedRadioObservations } from '@/services/australian-telescopes'
import { ImageCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn, formatDate } from '@/lib/utils'
import { useCosmosStore } from '@/store/cosmos-store'
import type { Observation, ObjectCategory, WavelengthBand, TelescopeSource } from '@/types'
import { Heart, Grid, List, SortAsc, SortDesc, Telescope, Loader2 } from 'lucide-react'

interface ExploreGalleryProps {
  source?: string
  category?: string
  wavelength?: string
  query?: string
}

export function ExploreGallery({
  source,
  category,
  wavelength,
  query,
}: ExploreGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [isLoading, setIsLoading] = useState(false)

  const { favorites, toggleFavorite } = useCosmosStore()

  // Combine all observations
  const allObservations: Observation[] = [
    ...getFeaturedJWSTImages(),
    ...getFeaturedRadioObservations(),
  ]

  // Apply filters
  let filteredObservations = [...allObservations]

  // Source filter
  if (source && source !== 'all') {
    filteredObservations = filteredObservations.filter(
      (obs) => obs.source === source
    )
  }

  // Category filter
  if (category && category !== 'all') {
    filteredObservations = filteredObservations.filter(
      (obs) => obs.category === category
    )
  }

  // Wavelength filter
  if (wavelength && wavelength !== 'all') {
    filteredObservations = filteredObservations.filter(
      (obs) => obs.wavelengthBand === wavelength
    )
  }

  // Search query filter
  if (query) {
    const lowerQuery = query.toLowerCase()
    filteredObservations = filteredObservations.filter(
      (obs) =>
        obs.targetName.toLowerCase().includes(lowerQuery) ||
        obs.description?.toLowerCase().includes(lowerQuery) ||
        obs.aliases?.some((a) => a.toLowerCase().includes(lowerQuery)) ||
        obs.category.toLowerCase().includes(lowerQuery)
    )
  }

  // Sort by date
  filteredObservations.sort((a, b) => {
    const dateA = new Date(a.observationDate).getTime()
    const dateB = new Date(b.observationDate).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  const getBadgeVariant = (obs: Observation): 'cyan' | 'gold' | 'purple' | 'pink' => {
    switch (obs.wavelengthBand) {
      case 'radio':
        return 'cyan'
      case 'infrared':
        return 'gold'
      case 'ultraviolet':
        return 'purple'
      default:
        return 'pink'
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing <span className="text-white font-medium">{filteredObservations.length}</span> observations
          {query && (
            <span>
              {' '}for "<span className="text-cosmos-cyan">{query}</span>"
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          {/* Sort toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            leftIcon={sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            aria-label={`Sort by date ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
          >
            Date
          </Button>

          {/* View mode toggle */}
          <div className="flex rounded-lg bg-white/5 p-1" role="group" aria-label="View mode">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              )}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              )}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredObservations.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-4'
          )}
        >
          {filteredObservations.map((observation, index) => (
            <article
              key={observation.id}
              className={cn(
                'group relative animate-fade-in',
                viewMode === 'list' && 'flex gap-4'
              )}
              style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
            >
              {viewMode === 'grid' ? (
                // Grid view card
                <Link href={`/explore/${observation.id}`}>
                  <ImageCard
                    src={observation.images.thumbnail}
                    alt={`${observation.targetName} - ${observation.category} observed by ${observation.source}`}
                    title={observation.targetName}
                    subtitle={`${observation.source} • ${formatDate(observation.observationDate, { month: 'short', year: 'numeric' })}`}
                    badge={observation.source}
                    badgeVariant={getBadgeVariant(observation)}
                    className="h-full"
                  />
                </Link>
              ) : (
                // List view card
                <Link
                  href={`/explore/${observation.id}`}
                  className="flex-1 glass-panel rounded-xl p-4 flex gap-4 hover:border-white/20 transition-all"
                >
                  <img
                    src={observation.images.thumbnail}
                    alt=""
                    className="w-32 h-24 object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white truncate">
                        {observation.targetName}
                      </h3>
                      <span
                        className={cn(
                          'flex-shrink-0 px-2 py-0.5 rounded-full text-xs',
                          observation.source === 'JWST'
                            ? 'bg-cosmos-gold/20 text-cosmos-gold'
                            : 'bg-cosmos-cyan/20 text-cosmos-cyan'
                        )}
                      >
                        {observation.source}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                      {observation.description || observation.analysis?.summary}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Telescope className="w-3 h-3" />
                        {observation.instrument || observation.wavelengthBand}
                      </span>
                      <span>
                        {formatDate(observation.observationDate)}
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  toggleFavorite(observation.id)
                }}
                className={cn(
                  'absolute top-3 right-3 z-10 p-2 rounded-full transition-all',
                  'opacity-0 group-hover:opacity-100 focus:opacity-100',
                  favorites.includes(observation.id)
                    ? 'bg-red-500/80 text-white'
                    : 'bg-black/50 text-white hover:bg-black/70'
                )}
                aria-label={favorites.includes(observation.id) ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={favorites.includes(observation.id)}
              >
                <Heart
                  className={cn(
                    'w-4 h-4',
                    favorites.includes(observation.id) && 'fill-current'
                  )}
                />
              </button>
            </article>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔭</div>
          <h3 className="text-xl font-semibold text-white mb-2">No observations found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {query
              ? `No results match "${query}". Try a different search term or adjust your filters.`
              : 'No observations match your current filters. Try adjusting or clearing your filters.'}
          </p>
          <Button variant="secondary" asChild>
            <Link href="/explore">Clear all filters</Link>
          </Button>
        </div>
      )}

      {/* Load more button (for future pagination) */}
      {filteredObservations.length >= 12 && (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            isLoading={isLoading}
            onClick={() => {
              setIsLoading(true)
              // Simulate loading more
              setTimeout(() => setIsLoading(false), 1000)
            }}
          >
            Load More Observations
          </Button>
        </div>
      )}
    </div>
  )
}
