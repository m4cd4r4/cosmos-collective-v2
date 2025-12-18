'use client'

/**
 * Agencies Page
 * Directory of space agencies and companies
 */

import { useState } from 'react'
import { AgencyCard } from '@/components/features/agency/AgencyCard'
import { Building2, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agency } from '@/types/agency'

// Mock agency data (will be replaced with API in future phase)
const MOCK_AGENCIES: Agency[] = [
  {
    id: '121',
    name: 'Space Exploration Technologies Corp.',
    shortName: 'SpaceX',
    slug: 'spacex',
    type: 'commercial',
    country: 'United States',
    countryCode: 'USA',
    description: 'Space Exploration Technologies Corp. develops advanced rockets and spacecraft with the goal of enabling human life on Mars. Known for the Falcon 9 and Starship launch systems.',
    foundedYear: 2002,
    administrator: 'Elon Musk',
    website: 'https://www.spacex.com',
    logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/spacex_logo_20220826094313.png',
    totalLaunches: 250,
    successfulLaunches: 245,
    failedLaunches: 5,
    pendingLaunches: 45,
    vehicles: [],
    launchSites: [],
  },
  {
    id: '44',
    name: 'National Aeronautics and Space Administration',
    shortName: 'NASA',
    slug: 'nasa',
    type: 'government',
    country: 'United States',
    countryCode: 'USA',
    description: 'The National Aeronautics and Space Administration conducts civilian space programs, aeronautics research, and space science. Leading missions include Artemis, Mars rovers, and the James Webb Space Telescope.',
    foundedYear: 1958,
    administrator: 'Bill Nelson',
    website: 'https://www.nasa.gov',
    logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/national2520aeronautics2520and2520space2520administration_logo_20190207032448.png',
    totalLaunches: 300,
    successfulLaunches: 285,
    failedLaunches: 15,
    pendingLaunches: 12,
    vehicles: [],
    launchSites: [],
  },
  {
    id: '27',
    name: 'European Space Agency',
    shortName: 'ESA',
    slug: 'esa',
    type: 'international',
    country: 'Europe',
    countryCode: 'EU',
    description: 'The European Space Agency coordinates space-related activities of European countries and ensures European investment in space delivers benefits. Notable missions include Rosetta, ExoMars, and Copernicus.',
    foundedYear: 1975,
    website: 'https://www.esa.int',
    logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/european2520space2520agency_logo_20190207032429.png',
    totalLaunches: 85,
    successfulLaunches: 80,
    failedLaunches: 5,
    pendingLaunches: 8,
    vehicles: [],
    launchSites: [],
  },
  {
    id: '63',
    name: 'Russian Federal Space Agency',
    shortName: 'Roscosmos',
    slug: 'roscosmos',
    type: 'government',
    country: 'Russia',
    countryCode: 'RUS',
    description: 'The Roscosmos State Corporation for Space Activities is responsible for Russia\'s space science program and general aerospace research. Operates the Soyuz launch system and ISS modules.',
    foundedYear: 1992,
    website: 'https://www.roscosmos.ru',
    logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/russian2520federal2520space2520agency_logo_20190207032459.png',
    totalLaunches: 180,
    successfulLaunches: 165,
    failedLaunches: 15,
    pendingLaunches: 15,
    vehicles: [],
    launchSites: [],
  },
  {
    id: '17',
    name: 'China National Space Administration',
    shortName: 'CNSA',
    slug: 'cnsa',
    type: 'government',
    country: 'China',
    countryCode: 'CHN',
    description: 'The China National Space Administration is responsible for the national space program and planning. Recent achievements include the Tianwen Mars mission, Chang\'e lunar program, and Tiangong space station.',
    foundedYear: 1993,
    website: 'http://www.cnsa.gov.cn',
    logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/china2520national2520space2520administration_logo_20190207032424.png',
    totalLaunches: 95,
    successfulLaunches: 92,
    failedLaunches: 3,
    pendingLaunches: 20,
    vehicles: [],
    launchSites: [],
  },
  {
    id: '141',
    name: 'Blue Origin',
    shortName: 'Blue Origin',
    slug: 'blue-origin',
    type: 'commercial',
    country: 'United States',
    countryCode: 'USA',
    description: 'Blue Origin develops reusable launch vehicles and engines with the goal of enabling private human access to space. Known for New Shepard suborbital missions and the upcoming New Glenn orbital vehicle.',
    foundedYear: 2000,
    administrator: 'Bob Smith',
    website: 'https://www.blueorigin.com',
    logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/blue2520origin_logo_20190207032427.png',
    totalLaunches: 25,
    successfulLaunches: 25,
    failedLaunches: 0,
    pendingLaunches: 6,
    vehicles: [],
    launchSites: [],
  },
]

const AGENCY_TYPES = ['all', 'government', 'commercial', 'international'] as const

export default function AgenciesPage() {
  const [selectedType, setSelectedType] = useState<typeof AGENCY_TYPES[number]>('all')

  // Filter agencies by type
  const filteredAgencies =
    selectedType === 'all'
      ? MOCK_AGENCIES
      : MOCK_AGENCIES.filter((agency) => agency.type === selectedType)

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-8 w-8 text-rocket-orange" aria-hidden="true" />
          <h1 className="text-4xl font-bold text-white font-display">Space Agencies</h1>
        </div>
        <p className="text-gray-300">
          Browse government agencies, commercial companies, and international organizations
        </p>
      </div>

      {/* Type Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">Filter by type:</span>
        </div>

        {AGENCY_TYPES.map((type) => {
          const isActive = selectedType === type
          const count =
            type === 'all'
              ? MOCK_AGENCIES.length
              : MOCK_AGENCIES.filter((a) => a.type === type).length

          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all duration-200',
                isActive
                  ? 'bg-rocket-orange/20 text-rocket-orange border border-rocket-orange/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
              )}
              aria-pressed={isActive}
            >
              {type} ({count})
            </button>
          )
        })}
      </div>

      {/* Agencies Grid */}
      {filteredAgencies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgencies.map((agency) => (
            <AgencyCard key={agency.id} agency={agency} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 className="h-16 w-16 text-gray-600 mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-white mb-2">No agencies found</h3>
          <p className="text-gray-400">Try selecting a different filter.</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-12 grid gap-4 md:grid-cols-4">
        <div className="glass-panel rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-white mb-1">{MOCK_AGENCIES.length}</div>
          <div className="text-sm text-gray-400">Agencies</div>
        </div>

        <div className="glass-panel rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-cosmos-cyan mb-1">
            {MOCK_AGENCIES.reduce((sum, a) => sum + a.totalLaunches, 0)}
          </div>
          <div className="text-sm text-gray-400">Total Launches</div>
        </div>

        <div className="glass-panel rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-rocket-orange mb-1">
            {MOCK_AGENCIES.reduce((sum, a) => sum + a.pendingLaunches, 0)}
          </div>
          <div className="text-sm text-gray-400">Pending Launches</div>
        </div>

        <div className="glass-panel rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-cosmos-gold mb-1">
            {Math.round(
              (MOCK_AGENCIES.reduce((sum, a) => sum + a.successfulLaunches, 0) /
                MOCK_AGENCIES.reduce((sum, a) => sum + a.totalLaunches, 0)) *
                100
            )}
            %
          </div>
          <div className="text-sm text-gray-400">Success Rate</div>
        </div>
      </div>

      {/* Note about mock data */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Note: Agency data is currently mocked. Future updates will integrate Launch Library 2
          API for real-time information.
        </p>
      </div>
    </div>
  )
}
