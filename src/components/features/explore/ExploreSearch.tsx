'use client'

/**
 * Explore Search Component
 * Search bar with autocomplete suggestions
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, Sparkles } from 'lucide-react'
import { cn, debounce } from '@/lib/utils'

// Categorized search suggestions for cross-spectrum discovery
const searchCategories = {
  popular: [
    'Carina Nebula',
    'Pillars of Creation',
    'Deep Field',
    'Andromeda',
    'Orion Nebula',
    'Black Hole',
  ],
  objectTypes: [
    'Galaxy',
    'Nebula',
    'Star Cluster',
    'Exoplanet',
    'Pulsar',
    'Supernova Remnant',
    'Quasar',
  ],
  telescopes: [
    'JWST',
    'Hubble',
    'ASKAP',
    'Parkes',
    'MWA',
    'ATCA',
  ],
  wavelengths: [
    'Infrared',
    'Radio',
    'Optical',
    'X-ray',
    'Ultraviolet',
  ],
  targets: [
    'M31',
    'M42',
    'M51',
    'NGC 1300',
    'Crab Nebula',
    'Centaurus A',
    'Sagittarius A*',
    'Large Magellanic Cloud',
  ],
}

// Flatten for autocomplete
const allSuggestions = [
  ...searchCategories.popular,
  ...searchCategories.objectTypes,
  ...searchCategories.targets,
]

interface ExploreSearchProps {
  initialQuery?: string
}

export function ExploreSearch({ initialQuery = '' }: ExploreSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState(initialQuery)
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Update URL when search changes
  const updateSearch = debounce((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`${pathname}?${params.toString()}`)
  }, 300)

  // Filter suggestions based on input
  useEffect(() => {
    if (query.length > 0) {
      const queryLower = query.toLowerCase()
      // Search across all categories
      const filtered = allSuggestions.filter((s) =>
        s.toLowerCase().includes(queryLower)
      )
      // Also add telescope and wavelength matches
      const telescopeMatches = searchCategories.telescopes.filter((t) =>
        t.toLowerCase().includes(queryLower)
      )
      const wavelengthMatches = searchCategories.wavelengths.filter((w) =>
        w.toLowerCase().includes(queryLower)
      )
      // Combine unique results, prioritizing direct matches
      const combined = [...new Set([...filtered, ...telescopeMatches, ...wavelengthMatches])]
      setSuggestions(combined.slice(0, 8))
    } else {
      // Show popular searches when empty
      setSuggestions(searchCategories.popular)
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch(query)
    inputRef.current?.blur()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    updateSearch(suggestion)
    setIsFocused(false)
  }

  const clearSearch = () => {
    setQuery('')
    updateSearch('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          {/* Search icon */}
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            aria-hidden="true"
          />

          {/* Input */}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              updateSearch(e.target.value)
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search by object name, constellation, or keyword..."
            className={cn(
              'w-full pl-12 pr-12 py-3 rounded-xl',
              'bg-cosmos-surface border border-white/10',
              'text-white placeholder:text-gray-500',
              'focus:border-cosmos-cyan focus:ring-2 focus:ring-cosmos-cyan/20',
              'transition-all duration-200'
            )}
            aria-label="Search observations"
            aria-describedby="search-description"
            aria-expanded={isFocused && suggestions.length > 0}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        <p id="search-description" className="sr-only">
          Search for astronomical observations. Press Enter to search or select a suggestion.
        </p>
      </form>

      {/* Suggestions dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-2 py-2 glass-panel rounded-xl shadow-cosmic z-20"
          role="listbox"
        >
          <div className="px-3 py-2 text-xs text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {query ? 'Suggestions' : 'Popular searches'}
          </div>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              role="option"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
