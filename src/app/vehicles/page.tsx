'use client'

/**
 * Vehicles Page
 * Directory of launch vehicles and rockets
 */

import { VehicleCard } from '@/components/features/vehicle/VehicleCard'
import { Rocket } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'

// Mock vehicle data (will be replaced with API in future phase)
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    name: 'Falcon 9',
    slug: 'falcon-9',
    type: 'rocket',
    provider: { id: '121', name: 'SpaceX', logo: '', countryCode: 'USA' },
    description:
      'Falcon 9 is a reusable, two-stage rocket designed and manufactured by SpaceX for the reliable and safe transport of people and payloads into Earth orbit and beyond. It has become the workhorse of commercial spaceflight.',
    status: 'active',
    image:
      'https://spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com/media/launcher_images/falcon2520925_image_20230807133459.jpeg',
    specs: {
      height: 70,
      diameter: 3.7,
      mass: 549054,
      stages: 2,
      massToLEO: 22800,
      reusable: true,
    },
    firstFlight: new Date('2010-06-04'),
    totalLaunches: 200,
    successfulLaunches: 198,
    failedLaunches: 2,
  },
  {
    id: '2',
    name: 'Starship',
    slug: 'starship',
    type: 'rocket',
    provider: { id: '121', name: 'SpaceX', logo: '', countryCode: 'USA' },
    description:
      'Starship is a fully reusable super heavy-lift launch system under development by SpaceX, designed to be the most powerful launch vehicle ever built. It aims to enable human missions to Mars and beyond.',
    status: 'development',
    image:
      'https://spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com/media/launcher_images/starship_image_20210531060426.png',
    specs: {
      height: 120,
      diameter: 9,
      mass: 5000000,
      stages: 2,
      massToLEO: 150000,
      reusable: true,
    },
    firstFlight: new Date('2023-04-20'),
    totalLaunches: 3,
    successfulLaunches: 2,
    failedLaunches: 1,
  },
  {
    id: '3',
    name: 'Atlas V',
    slug: 'atlas-v',
    type: 'rocket',
    provider: { id: '124', name: 'United Launch Alliance', logo: '', countryCode: 'USA' },
    description:
      'Atlas V is an expendable launch system in the Atlas rocket family operated by United Launch Alliance (ULA). Known for its reliability, it has launched numerous NASA missions including Mars rovers and the Parker Solar Probe.',
    status: 'active',
    image:
      'https://spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com/media/launcher_images/atlas2520v_image_20210506072513.jpg',
    specs: {
      height: 58.3,
      diameter: 3.81,
      mass: 334500,
      stages: 2,
      massToLEO: 18814,
      reusable: false,
    },
    firstFlight: new Date('2002-08-21'),
    totalLaunches: 95,
    successfulLaunches: 95,
    failedLaunches: 0,
  },
  {
    id: '4',
    name: 'Soyuz',
    slug: 'soyuz',
    type: 'rocket',
    provider: { id: '63', name: 'Roscosmos', logo: '', countryCode: 'RUS' },
    description:
      'Soyuz is a family of expendable Russian and Soviet carrier rockets developed to launch the Soyuz spacecraft as part of the Soyuz program. It is the most frequently used launch vehicle in the world.',
    status: 'active',
    image:
      'https://spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com/media/launcher_images/soyuz_image_20210506073430.jpg',
    specs: {
      height: 46.3,
      diameter: 2.95,
      mass: 308000,
      stages: 3,
      massToLEO: 7220,
      reusable: false,
    },
    firstFlight: new Date('1966-11-28'),
    totalLaunches: 1900,
    successfulLaunches: 1850,
    failedLaunches: 50,
  },
  {
    id: '5',
    name: 'Ariane 5',
    slug: 'ariane-5',
    type: 'rocket',
    provider: { id: '27', name: 'European Space Agency', logo: '', countryCode: 'EU' },
    description:
      'Ariane 5 is a European heavy-lift space launch vehicle operated by Arianespace for the European Space Agency. It has been used to deliver payloads into geostationary transfer orbit and low Earth orbit.',
    status: 'retired',
    image:
      'https://spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com/media/launcher_images/ariane25202520eca_image_20210506124639.jpg',
    specs: {
      height: 52,
      diameter: 5.4,
      mass: 777000,
      stages: 2,
      massToLEO: 20000,
      reusable: false,
    },
    firstFlight: new Date('1996-06-04'),
    totalLaunches: 117,
    successfulLaunches: 112,
    failedLaunches: 5,
  },
  {
    id: '6',
    name: 'Long March 5',
    slug: 'long-march-5',
    type: 'rocket',
    provider: { id: '17', name: 'China National Space Administration', logo: '', countryCode: 'CHN' },
    description:
      'Long March 5 is a Chinese heavy-lift launch vehicle developed by the China Academy of Launch Vehicle Technology. It is currently the most powerful rocket in the Chinese space program, used for lunar and Mars missions.',
    status: 'active',
    image:
      'https://spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com/media/launcher_images/long2520march25205_image_20210506125839.jpg',
    specs: {
      height: 56.97,
      diameter: 5,
      mass: 867000,
      stages: 2,
      massToLEO: 25000,
      reusable: false,
    },
    firstFlight: new Date('2016-11-03'),
    totalLaunches: 10,
    successfulLaunches: 9,
    failedLaunches: 1,
  },
]

export default function VehiclesPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Rocket className="h-8 w-8 text-rocket-orange" aria-hidden="true" />
          <h1 className="text-4xl font-bold text-white font-display">Launch Vehicles</h1>
        </div>
        <p className="text-gray-300">
          Browse launch vehicles and rockets from space agencies and companies around the world
        </p>
      </div>

      {/* Vehicles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_VEHICLES.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {/* Stats Summary */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-white mb-1">{MOCK_VEHICLES.length}</div>
          <div className="text-sm text-gray-400">Launch Vehicles</div>
        </div>

        <div className="glass-panel rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-cosmos-cyan mb-1">
            {MOCK_VEHICLES.filter((v) => v.status === 'active').length}
          </div>
          <div className="text-sm text-gray-400">Active Vehicles</div>
        </div>

        <div className="glass-panel rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-rocket-orange mb-1">
            {MOCK_VEHICLES.reduce((sum, v) => sum + v.totalLaunches, 0)}
          </div>
          <div className="text-sm text-gray-400">Total Launches</div>
        </div>

        <div className="glass-panel rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-cosmos-gold mb-1">
            {MOCK_VEHICLES.filter((v) => v.specs.reusable).length}
          </div>
          <div className="text-sm text-gray-400">Reusable Systems</div>
        </div>
      </div>

      {/* Note about mock data */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          More vehicles coming soon! Future updates will integrate full Launch Library 2 database.
        </p>
      </div>
    </div>
  )
}
