'use client'

/**
 * Australian Telescope Showcase Component
 * Highlights CSIRO telescopes and their capabilities
 */

import { useState } from 'react'
import Link from 'next/link'
import { AUSTRALIAN_TELESCOPES, type AustralianTelescope } from '@/services/australian-telescopes'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Radio, Satellite, MapPin, ExternalLink } from 'lucide-react'

// ============================================
// Telescope Showcase Component
// ============================================

export function TelescopeShowcase() {
  const [selectedTelescope, setSelectedTelescope] = useState<AustralianTelescope>('askap')

  const telescopes = Object.entries(AUSTRALIAN_TELESCOPES) as [AustralianTelescope, typeof AUSTRALIAN_TELESCOPES[AustralianTelescope]][]
  const selected = AUSTRALIAN_TELESCOPES[selectedTelescope]

  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-gold/10 border border-cosmos-gold/30 mb-4">
          <span className="text-cosmos-gold">🇦🇺</span>
          <span className="text-sm text-cosmos-gold font-medium">
            Australian Radio Astronomy
          </span>
        </div>
        <h2
          id="aussie-telescopes-heading"
          className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
        >
          World-Class <span className="text-cosmos-gold">Telescopes</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Australia hosts some of the world's most advanced radio telescopes,
          including precursors to the revolutionary Square Kilometre Array.
        </p>
      </div>

      {/* Telescope Selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {telescopes.map(([key, telescope]) => (
          <button
            key={key}
            onClick={() => setSelectedTelescope(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
              selectedTelescope === key
                ? 'bg-cosmos-gold/20 text-cosmos-gold border border-cosmos-gold/50'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white'
            )}
            aria-pressed={selectedTelescope === key}
          >
            <Radio className="w-4 h-4" aria-hidden="true" />
            {telescope.name}
          </button>
        ))}
      </div>

      {/* Selected Telescope Details */}
      <Card variant="elevated" padding="lg" className="max-w-4xl mx-auto">
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-cosmos-gold/20 flex items-center justify-center">
                  <Satellite className="w-6 h-6 text-cosmos-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                  <p className="text-sm text-gray-400">{selected.fullName}</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">{selected.description}</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cosmos-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="text-white">{selected.location}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Radio className="w-5 h-5 text-cosmos-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-400">Wavelength Range</div>
                    <div className="text-white">{selected.wavelengthRange}</div>
                  </div>
                </div>

                {'dishes' in selected && (
                  <div className="flex items-start gap-3">
                    <Satellite className="w-5 h-5 text-cosmos-nebula-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-400">Configuration</div>
                      <div className="text-white">
                        {selected.dishes} × {'dishDiameter' in selected ? `${selected.dishDiameter}m dishes` : 'antennas'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Key Projects & Stats */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Key Science Projects
              </h4>
              <ul className="space-y-2 mb-6">
                {selected.keyProjects.map((project) => (
                  <li
                    key={project}
                    className="flex items-center gap-2 text-gray-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cosmos-gold" />
                    {project}
                  </li>
                ))}
              </ul>

              {'expectedFirstLight' in selected && (
                <div className="glass-panel rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-1">Expected First Light</div>
                  <div className="text-2xl font-bold text-cosmos-gold">
                    {selected.expectedFirstLight}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                  asChild
                >
                  <a
                    href={`https://www.csiro.au/en/about/facilities-collections/atnf/${selectedTelescope === 'askap' ? 'the-australian-ska-pathfinder' : selectedTelescope}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn More
                  </a>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/explore?source=${selectedTelescope.toUpperCase()}`}>
                    View Observations
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          📍 Located in the radio-quiet zone of Western Australia's Murchison region
        </p>
      </div>
    </div>
  )
}
