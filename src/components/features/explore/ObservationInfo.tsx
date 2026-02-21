'use client'

/**
 * Observation Info Panel
 * Displays metadata, analysis, and actions for an observation
 */

import { useState } from 'react'
import Link from 'next/link'
import { useCosmosStore } from '@/store/cosmos-store'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn, formatCoordinates, formatDistance, formatDate, getWavelengthInfo } from '@/lib/utils'
import type { Observation } from '@/types'
import {
  Heart,
  MapPin,
  Calendar,
  Telescope,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radio,
  Info,
  BookOpen,
  Globe,
} from 'lucide-react'

interface ObservationInfoProps {
  observation: Observation
}

export function ObservationInfo({ observation }: ObservationInfoProps) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)
  const { favorites, toggleFavorite } = useCosmosStore()

  const isFavorite = favorites.includes(observation.id)
  const wavelengthInfo = getWavelengthInfo(observation.wavelengthBand)

  return (
    <div className="space-y-4 sticky top-24">
      {/* Title and actions */}
      <Card padding="lg">
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-2',
                  observation.source === 'JWST'
                    ? 'bg-cosmos-gold/20 text-cosmos-gold'
                    : 'bg-cosmos-gold/20 text-cosmos-gold'
                )}
              >
                {observation.source === 'JWST' ? (
                  <Telescope className="w-3 h-3" />
                ) : (
                  <Radio className="w-3 h-3" />
                )}
                {observation.source}
              </span>
              <h1 className="text-2xl font-display font-bold text-white">
                {observation.targetName}
              </h1>
              {observation.aliases && observation.aliases.length > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  Also known as: {observation.aliases.join(', ')}
                </p>
              )}
            </div>

            <Button
              variant={isFavorite ? 'danger' : 'ghost'}
              size="icon"
              onClick={() => toggleFavorite(observation.id)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
            >
              <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
            </Button>
          </div>

          {/* Category badge */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded bg-white/5 text-gray-300 text-sm">
              {observation.category.replace('-', ' ')}
            </span>
            <span
              className="px-2 py-1 rounded text-sm flex items-center gap-1"
              style={{ backgroundColor: `${wavelengthInfo.color}20`, color: wavelengthInfo.color }}
            >
              <span
                className={cn('w-2 h-2 rounded-full', wavelengthInfo.pattern)}
                style={{ backgroundColor: wavelengthInfo.color }}
              />
              {wavelengthInfo.name}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Analysis */}
      {observation.analysis && (
        <Card padding="lg">
          <CardContent>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <BookOpen className="w-4 h-4 text-cosmos-gold" />
              Analysis
            </h2>

            <p className="text-gray-300 leading-relaxed">
              {showFullAnalysis
                ? observation.analysis.scientificContext
                : observation.analysis.summary}
            </p>

            {observation.analysis.keyFeatures && (
              <div className="mt-4">
                <h3 className="text-xs text-gray-500 uppercase mb-2">Key Features</h3>
                <ul className="flex flex-wrap gap-2">
                  {observation.analysis.keyFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="px-2 py-1 rounded bg-cosmos-nebula-blue/10 text-cosmos-nebula-blue text-xs"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {observation.analysis.funFacts && observation.analysis.funFacts.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-cosmos-gold/5 border border-cosmos-gold/20">
                <h3 className="text-xs text-cosmos-gold uppercase mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Fun Fact
                </h3>
                <p className="text-sm text-gray-300">{observation.analysis.funFacts[0]}</p>
              </div>
            )}

            <button
              onClick={() => setShowFullAnalysis(!showFullAnalysis)}
              className="mt-3 text-sm text-cosmos-gold hover:text-white flex items-center gap-1 transition-colors"
            >
              {showFullAnalysis ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> Read more
                </>
              )}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Observation Details */}
      <Card padding="lg">
        <CardContent>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            <BookOpen className="w-4 h-4" />
            Observation Details
          </h2>

          <dl className="space-y-3">
            {/* Coordinates */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-cosmos-gold flex-shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-gray-500">Coordinates</dt>
                <dd className="text-sm text-white font-mono">
                  {formatCoordinates(observation.coordinates)}
                </dd>
                {observation.coordinates.constellation && (
                  <dd className="text-xs text-gray-400">
                    Constellation: {observation.coordinates.constellation}
                  </dd>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-cosmos-gold flex-shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-gray-500">Observation Date</dt>
                <dd className="text-sm text-white">
                  {formatDate(observation.observationDate)}
                </dd>
              </div>
            </div>

            {/* Instrument */}
            {observation.instrument && (
              <div className="flex items-start gap-3">
                <Telescope className="w-5 h-5 text-cosmos-nebula-blue flex-shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-gray-500">Instrument</dt>
                  <dd className="text-sm text-white">{observation.instrument}</dd>
                  {observation.filters && (
                    <dd className="text-xs text-gray-400">
                      Filters: {observation.filters.join(', ')}
                    </dd>
                  )}
                </div>
              </div>
            )}

            {/* Distance */}
            {observation.distanceLightYears && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-cosmos-hydrogen flex-shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-gray-500">Distance</dt>
                  <dd className="text-sm text-white">
                    {formatDistance(observation.distanceLightYears)}
                  </dd>
                </div>
              </div>
            )}

            {/* Principal Investigator */}
            {observation.principalInvestigator && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-gray-500">Principal Investigator</dt>
                  <dd className="text-sm text-white">
                    {observation.principalInvestigator}
                  </dd>
                  {observation.proposalId && (
                    <dd className="text-xs text-gray-400">
                      Program: {observation.proposalId}
                    </dd>
                  )}
                </div>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* External Links */}
      {observation.externalLinks && observation.externalLinks.length > 0 && (
        <Card padding="lg">
          <CardContent>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Learn More
            </h2>
            <div className="space-y-2">
              {observation.externalLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <span className="text-sm text-gray-300 group-hover:text-white">
                    {link.label}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-cosmos-gold" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" fullWidth asChild>
          <Link href={`/sky-map?ra=${observation.coordinates.ra}&dec=${observation.coordinates.dec}`}>
            <Globe className="w-4 h-4 mr-2" />
            View in Sky Map
          </Link>
        </Button>
      </div>
    </div>
  )
}
