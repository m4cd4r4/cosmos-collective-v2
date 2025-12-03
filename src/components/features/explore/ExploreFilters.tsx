'use client'

/**
 * Explore Filters Component
 * Filter controls for the gallery
 */

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  Telescope,
  Radio,
  Sparkles,
  Sun,
  Atom,
  Filter,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import type { TelescopeSource, ObjectCategory, WavelengthBand } from '@/types'

// Filter options
const sources: { value: TelescopeSource | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Sources', icon: <Telescope className="w-4 h-4" /> },
  { value: 'JWST', label: 'JWST', icon: <Sparkles className="w-4 h-4" /> },
  { value: 'Hubble', label: 'Hubble', icon: <Telescope className="w-4 h-4" /> },
  { value: 'ASKAP', label: 'ASKAP', icon: <Radio className="w-4 h-4" /> },
  { value: 'MWA', label: 'MWA', icon: <Radio className="w-4 h-4" /> },
  { value: 'Parkes', label: 'Parkes', icon: <Radio className="w-4 h-4" /> },
]

const categories: { value: ObjectCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All Types', emoji: '🌌' },
  { value: 'galaxy', label: 'Galaxies', emoji: '🌀' },
  { value: 'nebula', label: 'Nebulae', emoji: '💨' },
  { value: 'star', label: 'Stars', emoji: '⭐' },
  { value: 'star-cluster', label: 'Star Clusters', emoji: '✨' },
  { value: 'exoplanet', label: 'Exoplanets', emoji: '🪐' },
  { value: 'solar-system', label: 'Solar System', emoji: '☀️' },
  { value: 'deep-field', label: 'Deep Fields', emoji: '🔭' },
  { value: 'supernova', label: 'Supernovae', emoji: '💥' },
  { value: 'pulsar', label: 'Pulsars', emoji: '💫' },
]

const wavelengths: { value: WavelengthBand | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Wavelengths', color: 'bg-gray-500' },
  { value: 'radio', label: 'Radio', color: 'bg-green-500' },
  { value: 'infrared', label: 'Infrared', color: 'bg-red-500' },
  { value: 'optical', label: 'Visible', color: 'bg-yellow-500' },
  { value: 'ultraviolet', label: 'Ultraviolet', color: 'bg-purple-500' },
  { value: 'xray', label: 'X-ray', color: 'bg-blue-500' },
]

interface ExploreFiltersProps {
  initialSource?: string
  initialCategory?: string
  initialWavelength?: string
}

export function ExploreFilters({
  initialSource,
  initialCategory,
  initialWavelength,
}: ExploreFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSource = initialSource || 'all'
  const currentCategory = initialCategory || 'all'
  const currentWavelength = initialWavelength || 'all'

  const hasActiveFilters =
    currentSource !== 'all' ||
    currentCategory !== 'all' ||
    currentWavelength !== 'all'

  // Update URL with filter
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // Clear all filters
  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('source')
    params.delete('category')
    params.delete('wavelength')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Filter header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 rounded-full bg-cosmos-cyan/20 text-cosmos-cyan text-xs">
              Active
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            leftIcon={<X className="w-4 h-4" />}
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter rows */}
      <div className="flex flex-wrap gap-6">
        {/* Source filter */}
        <div className="space-y-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider">
            Telescope
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by telescope">
            {sources.map((source) => (
              <button
                key={source.value}
                onClick={() => updateFilter('source', source.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  currentSource === source.value
                    ? 'bg-cosmos-cyan/20 text-cosmos-cyan border border-cosmos-cyan/50'
                    : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white'
                )}
                aria-pressed={currentSource === source.value}
              >
                {source.icon}
                <span className="hidden sm:inline">{source.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="space-y-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider">
            Object Type
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by object type">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category.value}
                onClick={() => updateFilter('category', category.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  currentCategory === category.value
                    ? 'bg-cosmos-gold/20 text-cosmos-gold border border-cosmos-gold/50'
                    : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white'
                )}
                aria-pressed={currentCategory === category.value}
              >
                <span aria-hidden="true">{category.emoji}</span>
                <span className="hidden sm:inline">{category.label}</span>
              </button>
            ))}
            {/* More dropdown would go here */}
          </div>
        </div>

        {/* Wavelength filter */}
        <div className="space-y-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider">
            Wavelength
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by wavelength">
            {wavelengths.map((wavelength) => (
              <button
                key={wavelength.value}
                onClick={() => updateFilter('wavelength', wavelength.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  currentWavelength === wavelength.value
                    ? 'bg-cosmos-purple/20 text-cosmos-purple border border-cosmos-purple/50'
                    : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white'
                )}
                aria-pressed={currentWavelength === wavelength.value}
              >
                <span
                  className={cn('w-2 h-2 rounded-full', wavelength.color)}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">{wavelength.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
