/**
 * Cosmos Collective - Real-Time Astronomical Events Service
 * Aggregates live data from multiple sources for current space events
 */

import axios from 'axios'
import type { AstronomicalEvent, ApiResponse, SkyCoordinates, EventType, EventSeverity } from '@/types'

// ============================================
// Configuration
// ============================================

const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY'

const API_ENDPOINTS = {
  nasaApod: `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`,
  nasaNeo: `https://api.nasa.gov/neo/rest/v1/feed?api_key=${NASA_API_KEY}`,
  issPosition: 'https://api.wheretheiss.at/v1/satellites/25544',
  solarWeather: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json',
  transients: '/api/proxy/alerce',
  gcnNotices: '/api/proxy/gcn',
}

// ============================================
// NASA Astronomy Picture of the Day
// ============================================

export interface APODData {
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: 'image' | 'video'
  date: string
  copyright?: string
}

export async function getAstronomyPictureOfTheDay(): Promise<ApiResponse<APODData>> {
  try {
    const response = await axios.get<APODData>(API_ENDPOINTS.nasaApod, {
      timeout: 10000,
    })

    return {
      success: true,
      data: response.data,
      meta: {
        requestId: `apod-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('NASA APOD error:', error)
    return {
      success: false,
      error: {
        code: 'APOD_ERROR',
        message: 'Failed to fetch Astronomy Picture of the Day',
      },
    }
  }
}

// ============================================
// Near Earth Objects (Asteroids)
// ============================================

interface NasaNEO {
  id: string
  name: string
  nasa_jpl_url: string
  absolute_magnitude_h: number
  is_potentially_hazardous_asteroid: boolean
  close_approach_data: {
    close_approach_date: string
    close_approach_date_full: string
    relative_velocity: {
      kilometers_per_hour: string
    }
    miss_distance: {
      kilometers: string
      lunar: string
    }
  }[]
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number
      estimated_diameter_max: number
    }
  }
}

export async function getNearEarthObjects(
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<AstronomicalEvent[]>> {
  try {
    const today = new Date()
    const start = startDate || today.toISOString().split('T')[0]
    const end = endDate || new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const response = await axios.get<{
      element_count: number
      near_earth_objects: Record<string, NasaNEO[]>
    }>(`${API_ENDPOINTS.nasaNeo}&start_date=${start}&end_date=${end}`, {
      timeout: 15000,
    })

    const events: AstronomicalEvent[] = []

    for (const [date, neos] of Object.entries(response.data.near_earth_objects)) {
      for (const neo of neos) {
        const approach = neo.close_approach_data[0]
        const diameterKm = (neo.estimated_diameter.kilometers.estimated_diameter_min +
          neo.estimated_diameter.kilometers.estimated_diameter_max) / 2

        const severity: EventSeverity = neo.is_potentially_hazardous_asteroid
          ? 'significant'
          : parseFloat(approach.miss_distance.lunar) < 5
            ? 'notable'
            : 'info'

        events.push({
          id: `neo-${neo.id}`,
          type: 'asteroid',
          title: `Asteroid ${neo.name} Close Approach`,
          description: `Asteroid ${neo.name} will pass ${parseFloat(approach.miss_distance.lunar).toFixed(1)} lunar distances from Earth at ${parseFloat(approach.relative_velocity.kilometers_per_hour).toFixed(0)} km/h. Estimated diameter: ${(diameterKm * 1000).toFixed(0)} meters.`,
          eventTime: approach.close_approach_date_full || date,
          source: 'NASA JPL',
          severity,
          isOngoing: false,
          references: [
            { label: 'NASA JPL Details', url: neo.nasa_jpl_url, type: 'nasa' },
          ],
        })
      }
    }

    // Sort by date
    events.sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime())

    return {
      success: true,
      data: events,
    }
  } catch (error) {
    console.error('NASA NEO error:', error)
    return {
      success: false,
      error: {
        code: 'NEO_ERROR',
        message: 'Failed to fetch near-Earth object data',
      },
    }
  }
}

// ============================================
// International Space Station
// ============================================

interface ISSPosition {
  name: string
  id: number
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  visibility: string
  timestamp: number
}

export async function getISSPosition(retries = 2): Promise<ApiResponse<{
  position: { lat: number; lon: number; alt: number }
  velocity: number
  timestamp: string
}>> {
  const timeout = 5000

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await axios.get<ISSPosition>(API_ENDPOINTS.issPosition, {
        timeout,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      return {
        success: true,
        data: {
          position: {
            lat: response.data.latitude,
            lon: response.data.longitude,
            alt: response.data.altitude,
          },
          velocity: response.data.velocity,
          timestamp: new Date(response.data.timestamp * 1000).toISOString(),
        },
      }
    } catch (error) {
      // Log error but continue to retry
      console.error(`ISS position error (attempt ${attempt + 1}/${retries + 1}):`, error)

      // If we have more retries, wait before trying again (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  // All retries failed
  return {
    success: false,
    error: {
      code: 'ISS_ERROR',
      message: 'ISS position temporarily unavailable',
    },
  }
}

// ============================================
// Solar Weather / Space Weather
// ============================================

export interface SolarXRayData {
  time_tag: string
  flux: number
  observed_flux: number
  electron_correction: number
  electron_contamination: boolean
  energy: string
}

export async function getSolarWeather(): Promise<ApiResponse<{
  currentFlux: number
  flareLevel: 'quiet' | 'minor' | 'moderate' | 'strong' | 'severe'
  events: AstronomicalEvent[]
}>> {
  try {
    const response = await axios.get<SolarXRayData[]>(API_ENDPOINTS.solarWeather, {
      timeout: 10000,
    })

    const latestData = response.data[response.data.length - 1]
    const flux = latestData?.observed_flux || 0

    // Classify solar activity level based on X-ray flux
    let flareLevel: 'quiet' | 'minor' | 'moderate' | 'strong' | 'severe'
    if (flux < 1e-6) flareLevel = 'quiet'
    else if (flux < 1e-5) flareLevel = 'minor'
    else if (flux < 1e-4) flareLevel = 'moderate'
    else if (flux < 1e-3) flareLevel = 'strong'
    else flareLevel = 'severe'

    const events: AstronomicalEvent[] = []

    // Check for elevated activity
    if (flareLevel !== 'quiet') {
      events.push({
        id: `solar-${Date.now()}`,
        type: 'solar',
        title: `Solar Activity: ${flareLevel.charAt(0).toUpperCase() + flareLevel.slice(1)}`,
        description: `Current solar X-ray flux is elevated at ${flux.toExponential(2)} W/m². ${flareLevel === 'strong' || flareLevel === 'severe' ? 'Aurora may be visible at mid-latitudes!' : ''}`,
        eventTime: latestData?.time_tag || new Date().toISOString(),
        source: 'NOAA SWPC',
        severity: flareLevel === 'severe' ? 'rare' : flareLevel === 'strong' ? 'significant' : 'notable',
        isOngoing: true,
        references: [
          { label: 'Space Weather Prediction Center', url: 'https://www.swpc.noaa.gov/', type: 'other' },
        ],
      })
    }

    return {
      success: true,
      data: {
        currentFlux: flux,
        flareLevel,
        events,
      },
    }
  } catch (error) {
    console.error('Solar weather error:', error)
    return {
      success: false,
      error: {
        code: 'SOLAR_ERROR',
        message: 'Failed to fetch solar weather data',
      },
    }
  }
}

// ============================================
// Meteor Showers Calendar
// ============================================

export interface MeteorShower {
  name: string
  peakDate: string
  activeStart: string
  activeEnd: string
  zenithalHourlyRate: number
  radiant: SkyCoordinates
  parentBody?: string
  description: string
}

export function getMeteorShowers(year: number = new Date().getFullYear()): MeteorShower[] {
  return [
    {
      name: 'Quadrantids',
      peakDate: `${year}-01-04`,
      activeStart: `${year}-01-01`,
      activeEnd: `${year}-01-10`,
      zenithalHourlyRate: 110,
      radiant: { ra: 230, dec: 49 },
      parentBody: 'Asteroid 2003 EH1',
      description: 'One of the best annual meteor showers with bright meteors.',
    },
    {
      name: 'Lyrids',
      peakDate: `${year}-04-22`,
      activeStart: `${year}-04-16`,
      activeEnd: `${year}-04-25`,
      zenithalHourlyRate: 18,
      radiant: { ra: 271, dec: 34 },
      parentBody: 'Comet C/1861 G1 Thatcher',
      description: 'One of the oldest known meteor showers, observed for 2,700 years.',
    },
    {
      name: 'Eta Aquariids',
      peakDate: `${year}-05-06`,
      activeStart: `${year}-04-19`,
      activeEnd: `${year}-05-28`,
      zenithalHourlyRate: 50,
      radiant: { ra: 338, dec: -1 },
      parentBody: 'Comet Halley',
      description: 'Best viewed from southern hemisphere, debris from Halley\'s Comet.',
    },
    {
      name: 'Perseids',
      peakDate: `${year}-08-12`,
      activeStart: `${year}-07-17`,
      activeEnd: `${year}-08-24`,
      zenithalHourlyRate: 100,
      radiant: { ra: 48, dec: 58 },
      parentBody: 'Comet Swift-Tuttle',
      description: 'Most popular meteor shower, known for bright meteors and fireballs.',
    },
    {
      name: 'Orionids',
      peakDate: `${year}-10-21`,
      activeStart: `${year}-10-02`,
      activeEnd: `${year}-11-07`,
      zenithalHourlyRate: 20,
      radiant: { ra: 95, dec: 16 },
      parentBody: 'Comet Halley',
      description: 'Second meteor shower from Halley\'s Comet debris.',
    },
    {
      name: 'Leonids',
      peakDate: `${year}-11-17`,
      activeStart: `${year}-11-06`,
      activeEnd: `${year}-11-30`,
      zenithalHourlyRate: 15,
      radiant: { ra: 152, dec: 22 },
      parentBody: 'Comet Tempel-Tuttle',
      description: 'Famous for producing meteor storms approximately every 33 years.',
    },
    {
      name: 'Geminids',
      peakDate: `${year}-12-14`,
      activeStart: `${year}-12-04`,
      activeEnd: `${year}-12-17`,
      zenithalHourlyRate: 150,
      radiant: { ra: 112, dec: 33 },
      parentBody: 'Asteroid 3200 Phaethon',
      description: 'King of meteor showers, produces bright, multi-colored meteors.',
    },
  ]
}

// ============================================
// Lunar Events (Moon Phases, Supermoons)
// ============================================

export interface LunarEvent {
  name: string
  date: string
  type: 'new-moon' | 'first-quarter' | 'full-moon' | 'last-quarter' | 'supermoon' | 'blue-moon'
  description: string
  isSupermoon?: boolean
}

export function getLunarEvents(year: number = new Date().getFullYear()): LunarEvent[] {
  // Key lunar events for 2025 (pre-computed from astronomical data)
  const events2025: LunarEvent[] = [
    { name: 'Full Moon (Wolf Moon)', date: '2025-01-13', type: 'full-moon', description: 'First full moon of the year, named Wolf Moon by Native Americans.' },
    { name: 'New Moon', date: '2025-01-29', type: 'new-moon', description: 'Best time for deep-sky observation with no moonlight interference.' },
    { name: 'Full Moon (Snow Moon)', date: '2025-02-12', type: 'full-moon', description: 'February full moon, traditionally called Snow Moon.' },
    { name: 'Full Moon (Worm Moon)', date: '2025-03-14', type: 'full-moon', description: 'March full moon marking the end of winter.' },
    { name: 'Full Moon (Pink Moon)', date: '2025-04-13', type: 'full-moon', description: 'April full moon named after spring wildflowers.' },
    { name: 'Supermoon (Flower Moon)', date: '2025-05-12', type: 'supermoon', description: 'Full moon at perigee appears 14% larger and 30% brighter.', isSupermoon: true },
    { name: 'Full Moon (Strawberry Moon)', date: '2025-06-11', type: 'full-moon', description: 'June full moon coinciding with strawberry harvest season.' },
    { name: 'Supermoon (Buck Moon)', date: '2025-07-10', type: 'supermoon', description: 'Supermoon appearing larger and brighter than average.', isSupermoon: true },
    { name: 'Supermoon (Sturgeon Moon)', date: '2025-08-09', type: 'supermoon', description: 'August supermoon at closest approach to Earth.', isSupermoon: true },
    { name: 'Supermoon (Harvest Moon)', date: '2025-09-07', type: 'supermoon', description: 'Closest supermoon of 2025, spectacular viewing opportunity.', isSupermoon: true },
    { name: 'Supermoon (Hunter\'s Moon)', date: '2025-10-07', type: 'supermoon', description: 'October supermoon with orange hue near horizon.', isSupermoon: true },
    { name: 'Full Moon (Beaver Moon)', date: '2025-11-05', type: 'full-moon', description: 'November full moon when beavers prepare for winter.' },
    { name: 'Full Moon (Cold Moon)', date: '2025-12-04', type: 'full-moon', description: 'Last full moon of the year during winter\'s start.' },
  ]

  return year === 2025 ? events2025 : events2025.map(e => ({
    ...e,
    date: e.date.replace('2025', String(year))
  }))
}

// ============================================
// Solar and Lunar Eclipses
// ============================================

export interface EclipseEvent {
  name: string
  date: string
  type: 'solar-total' | 'solar-partial' | 'solar-annular' | 'lunar-total' | 'lunar-partial' | 'lunar-penumbral'
  description: string
  visibility: string[]
  peakTime?: string
  duration?: string
}

export function getEclipses(): EclipseEvent[] {
  return [
    // 2025 Eclipses
    {
      name: 'Total Lunar Eclipse',
      date: '2025-03-14',
      type: 'lunar-total',
      description: 'Total lunar eclipse with the Moon passing through Earth\'s shadow. The Moon will appear reddish-orange (Blood Moon).',
      visibility: ['Americas', 'Europe', 'Africa', 'Pacific'],
      peakTime: '06:58 UTC',
      duration: '1 hour 5 minutes totality',
    },
    {
      name: 'Partial Solar Eclipse',
      date: '2025-03-29',
      type: 'solar-partial',
      description: 'Partial solar eclipse visible from northwestern regions. Up to 93% coverage in some areas.',
      visibility: ['Northwestern North America', 'Arctic', 'Northern Europe'],
      peakTime: '10:47 UTC',
    },
    {
      name: 'Total Lunar Eclipse',
      date: '2025-09-07',
      type: 'lunar-total',
      description: 'Second total lunar eclipse of 2025. Blood Moon visible during totality phase.',
      visibility: ['Europe', 'Africa', 'Asia', 'Australia'],
      peakTime: '18:11 UTC',
      duration: '1 hour 22 minutes totality',
    },
    {
      name: 'Partial Solar Eclipse',
      date: '2025-09-21',
      type: 'solar-partial',
      description: 'Partial solar eclipse visible from the Southern Hemisphere.',
      visibility: ['New Zealand', 'Antarctica', 'Southern Pacific'],
      peakTime: '19:42 UTC',
    },
    // 2026 Eclipses (for advance planning)
    {
      name: 'Annular Solar Eclipse',
      date: '2026-02-17',
      type: 'solar-annular',
      description: 'Ring of fire eclipse with Moon too far to fully cover the Sun.',
      visibility: ['Antarctica', 'Southern Africa', 'South America'],
      peakTime: '12:28 UTC',
    },
    {
      name: 'Total Solar Eclipse',
      date: '2026-08-12',
      type: 'solar-total',
      description: 'Total solar eclipse crossing Spain and Iceland. Rare opportunity for European observers.',
      visibility: ['Greenland', 'Iceland', 'Spain', 'North Africa'],
      peakTime: '17:46 UTC',
      duration: '2 minutes 18 seconds totality',
    },
  ]
}

// ============================================
// Planetary Conjunctions and Alignments
// ============================================

export interface ConjunctionEvent {
  name: string
  date: string
  bodies: string[]
  separation: string
  description: string
  bestViewingTime: 'evening' | 'morning' | 'all-night'
  magnitude?: number
}

export function getPlanetaryConjunctions(year: number = new Date().getFullYear()): ConjunctionEvent[] {
  const events2025: ConjunctionEvent[] = [
    {
      name: 'Venus-Saturn Conjunction',
      date: '2025-01-18',
      bodies: ['Venus', 'Saturn'],
      separation: '2.2°',
      description: 'Brilliant Venus passes close to Saturn in the evening sky. Easy naked-eye observation.',
      bestViewingTime: 'evening',
      magnitude: -4.0,
    },
    {
      name: 'Mars-Pleiades Conjunction',
      date: '2025-01-21',
      bodies: ['Mars', 'Pleiades'],
      separation: '1.5°',
      description: 'Mars passes by the famous Seven Sisters star cluster. Stunning binocular view.',
      bestViewingTime: 'evening',
      magnitude: 1.0,
    },
    {
      name: 'Venus-Neptune Conjunction',
      date: '2025-02-03',
      bodies: ['Venus', 'Neptune'],
      separation: '0.5°',
      description: 'Venus and Neptune appear extremely close. Telescope needed to spot Neptune.',
      bestViewingTime: 'evening',
      magnitude: -4.0,
    },
    {
      name: 'Moon-Jupiter Close Approach',
      date: '2025-02-11',
      bodies: ['Moon', 'Jupiter'],
      separation: '0.8°',
      description: 'Crescent Moon passes very close to Jupiter. Spectacular naked-eye sight.',
      bestViewingTime: 'evening',
    },
    {
      name: 'Mars-Jupiter Conjunction',
      date: '2025-08-14',
      bodies: ['Mars', 'Jupiter'],
      separation: '0.3°',
      description: 'Two bright planets appear almost touching in the pre-dawn sky.',
      bestViewingTime: 'morning',
      magnitude: 1.8,
    },
    {
      name: 'Venus-Jupiter Conjunction',
      date: '2025-08-12',
      bodies: ['Venus', 'Jupiter'],
      separation: '1.0°',
      description: 'The two brightest planets meet in the morning sky. Unmissable event.',
      bestViewingTime: 'morning',
      magnitude: -4.2,
    },
    {
      name: 'Saturn Opposition',
      date: '2025-09-21',
      bodies: ['Saturn'],
      separation: 'N/A',
      description: 'Saturn at its closest and brightest for the year. Rings beautifully visible.',
      bestViewingTime: 'all-night',
      magnitude: 0.4,
    },
    {
      name: 'Jupiter Opposition',
      date: '2025-12-07',
      bodies: ['Jupiter'],
      separation: 'N/A',
      description: 'Jupiter at peak brightness and size. Great Galilean moons easily visible.',
      bestViewingTime: 'all-night',
      magnitude: -2.8,
    },
  ]

  return year === 2025 ? events2025 : events2025.map(e => ({
    ...e,
    date: e.date.replace('2025', String(year))
  }))
}

// ============================================
// Rocket Launches
// ============================================

export interface RocketLaunch {
  name: string
  date: string
  provider: string
  rocket: string
  mission: string
  site: string
  description: string
  isCrewed: boolean
  webcastUrl?: string
}

export function getUpcomingLaunches(): RocketLaunch[] {
  // Static list of notable upcoming launches (would be replaced with API in production)
  return [
    {
      name: 'SpaceX Starship Flight 8',
      date: '2025-12-15',
      provider: 'SpaceX',
      rocket: 'Starship/Super Heavy',
      mission: 'Test Flight',
      site: 'Starbase, TX',
      description: 'Next test flight of the largest rocket ever built. Full stack launch and landing attempt.',
      isCrewed: false,
      webcastUrl: 'https://www.spacex.com/launches/',
    },
    {
      name: 'Artemis II',
      date: '2025-09-01',
      provider: 'NASA',
      rocket: 'SLS Block 1',
      mission: 'Crewed Lunar Flyby',
      site: 'Kennedy Space Center, FL',
      description: 'First crewed Artemis mission, sending astronauts around the Moon.',
      isCrewed: true,
      webcastUrl: 'https://www.nasa.gov/artemis-ii',
    },
    {
      name: 'Europa Clipper Launch Window',
      date: '2025-10-01',
      provider: 'NASA/SpaceX',
      rocket: 'Falcon Heavy',
      mission: 'Jupiter/Europa Mission',
      site: 'Kennedy Space Center, FL',
      description: 'Mission to study Jupiter\'s moon Europa for signs of habitability.',
      isCrewed: false,
      webcastUrl: 'https://europa.nasa.gov/',
    },
    {
      name: 'Crew Dragon Mission',
      date: '2025-12-20',
      provider: 'SpaceX',
      rocket: 'Falcon 9',
      mission: 'ISS Crew Rotation',
      site: 'Kennedy Space Center, FL',
      description: 'Regular crew rotation mission to the International Space Station.',
      isCrewed: true,
      webcastUrl: 'https://www.spacex.com/launches/',
    },
  ]
}

// ============================================
// Upcoming Astronomical Events
// ============================================

export function getUpcomingEvents(limit: number = 10): AstronomicalEvent[] {
  const now = new Date()
  const events: AstronomicalEvent[] = []

  // Add meteor showers within next 2 months
  const showers = getMeteorShowers()
  for (const shower of showers) {
    const peakDate = new Date(shower.peakDate)
    const diffDays = (peakDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays > -7 && diffDays < 60) {
      // Generate IMO meteor shower URL slug
      const imoSlug = shower.name.toLowerCase().replace(/\s/g, '-')

      events.push({
        id: `meteor-${shower.name.toLowerCase().replace(/\s/g, '-')}`,
        type: 'meteor-shower',
        title: `${shower.name} Meteor Shower`,
        description: `${shower.description} Peak rate: ~${shower.zenithalHourlyRate} meteors/hour under ideal conditions.`,
        coordinates: shower.radiant,
        eventTime: shower.peakDate,
        source: 'IMO',
        severity: shower.zenithalHourlyRate > 50 ? 'notable' : 'info',
        isOngoing: now >= new Date(shower.activeStart) && now <= new Date(shower.activeEnd),
        visibility: {
          locations: ['Worldwide (dark skies)'],
          bestViewingTime: 'After midnight',
          requiredEquipment: 'None - naked eye',
        },
        references: [
          { label: 'IMO Meteor Shower Calendar', url: `https://www.imo.net/resources/calendar/`, type: 'other' },
          { label: 'NASA Sky Events', url: 'https://science.nasa.gov/skywatching/', type: 'nasa' },
        ],
      })
    }
  }

  // Add lunar events within next 2 months
  const lunarEvents = getLunarEvents()
  for (const lunar of lunarEvents) {
    const eventDate = new Date(lunar.date)
    const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays > -1 && diffDays < 60) {
      events.push({
        id: `lunar-${lunar.date}`,
        type: 'lunar',
        title: lunar.name,
        description: lunar.description,
        eventTime: lunar.date,
        source: 'Astronomical Calendar',
        severity: lunar.isSupermoon ? 'notable' : 'info',
        isOngoing: diffDays >= -0.5 && diffDays <= 0.5,
        visibility: {
          locations: ['Worldwide'],
          bestViewingTime: 'Night',
          requiredEquipment: 'None - naked eye',
        },
        references: [
          { label: 'TimeAndDate Moon Phases', url: 'https://www.timeanddate.com/moon/phases/', type: 'other' },
          { label: 'NASA Moon Guide', url: 'https://moon.nasa.gov/', type: 'nasa' },
        ],
      })
    }
  }

  // Add eclipses within next year
  const eclipses = getEclipses()
  for (const eclipse of eclipses) {
    const eventDate = new Date(eclipse.date)
    const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays > -1 && diffDays < 365) {
      const isTotal = eclipse.type.includes('total')
      events.push({
        id: `eclipse-${eclipse.date}-${eclipse.type}`,
        type: 'eclipse',
        title: eclipse.name,
        description: `${eclipse.description}${eclipse.duration ? ` Duration: ${eclipse.duration}.` : ''}${eclipse.peakTime ? ` Peak: ${eclipse.peakTime}.` : ''}`,
        eventTime: eclipse.date,
        source: 'NASA Eclipse',
        severity: isTotal ? 'significant' : 'notable',
        isOngoing: diffDays >= -0.5 && diffDays <= 0.5,
        visibility: {
          locations: eclipse.visibility,
          bestViewingTime: eclipse.peakTime,
          requiredEquipment: eclipse.type.includes('solar') ? 'Eclipse glasses required!' : 'None - naked eye',
        },
        references: [
          { label: 'NASA Eclipse Website', url: 'https://eclipse.gsfc.nasa.gov/', type: 'nasa' },
          { label: 'TimeAndDate Eclipse Guide', url: 'https://www.timeanddate.com/eclipse/', type: 'other' },
        ],
      })
    }
  }

  // Add planetary conjunctions within next 2 months
  const conjunctions = getPlanetaryConjunctions()
  for (const conj of conjunctions) {
    const eventDate = new Date(conj.date)
    const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays > -1 && diffDays < 60) {
      events.push({
        id: `conjunction-${conj.date}-${conj.bodies.join('-').toLowerCase()}`,
        type: 'conjunction',
        title: conj.name,
        description: `${conj.description} Separation: ${conj.separation}.`,
        eventTime: conj.date,
        source: 'Sky & Telescope',
        severity: conj.separation.startsWith('0.') ? 'notable' : 'info',
        isOngoing: diffDays >= -0.5 && diffDays <= 0.5,
        visibility: {
          locations: ['Worldwide (clear skies)'],
          bestViewingTime: conj.bestViewingTime === 'evening' ? 'After sunset' : conj.bestViewingTime === 'morning' ? 'Before sunrise' : 'All night',
          requiredEquipment: conj.magnitude && conj.magnitude > 4 ? 'Binoculars recommended' : 'None - naked eye',
        },
        references: [
          { label: 'Sky & Telescope', url: 'https://skyandtelescope.org/observing/', type: 'other' },
          { label: 'Heavens-Above', url: 'https://heavens-above.com/', type: 'other' },
        ],
      })
    }
  }

  // Add rocket launches within next month
  const launches = getUpcomingLaunches()
  for (const launch of launches) {
    const eventDate = new Date(launch.date)
    const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays > -1 && diffDays < 30) {
      events.push({
        id: `launch-${launch.date}-${launch.name.toLowerCase().replace(/\s/g, '-')}`,
        type: 'launch',
        title: launch.name,
        description: `${launch.description} Launch site: ${launch.site}. Rocket: ${launch.rocket}.`,
        eventTime: launch.date,
        source: launch.provider,
        severity: launch.isCrewed ? 'significant' : 'notable',
        isOngoing: false,
        visibility: {
          locations: [launch.site],
          requiredEquipment: 'Watch online',
        },
        liveFeedUrl: launch.webcastUrl,
        references: [
          { label: 'Watch Live', url: launch.webcastUrl || 'https://www.spacex.com/launches/', type: 'other' },
          { label: 'Spaceflight Now', url: 'https://spaceflightnow.com/launch-schedule/', type: 'other' },
        ],
      })
    }
  }

  // Sort by date and limit
  events.sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime())

  return events.slice(0, limit)
}

// ============================================
// ALeRCE Transient Alerts (Supernovae, Variable Stars)
// ============================================

interface ALeRCEObject {
  oid: string
  meanra: number
  meandec: number
  class: string
  probability: number
  firstmjd: number
  lastmjd: number
  ndet: number
}

interface ALeRCEProxyResponse {
  success: boolean
  data: {
    id: string
    name: string
    ra: number
    dec: number
    classification: string
    probability: number
    lastDetection: string
    url: string
  }[]
  source: string
}

export async function getTransientAlerts(
  limit: number = 10
): Promise<ApiResponse<AstronomicalEvent[]>> {
  try {
    // Use proxy endpoint to avoid CORS
    const response = await axios.get<ALeRCEProxyResponse>(
      `${API_ENDPOINTS.transients}`,
      {
        params: {
          classifier: 'stamp_classifier',
          class_name: 'SN',
          probability: 0.7,
          limit,
        },
        timeout: 15000,
      }
    )

    if (!response.data.success) {
      throw new Error('Proxy returned error')
    }

    const events: AstronomicalEvent[] = (response.data.data || []).map((obj) => ({
      id: `alerce-${obj.id}`,
      type: 'transient' as EventType,
      title: `Transient Candidate: ${obj.name}`,
      description: `Potential ${obj.classification} detected with ${(obj.probability * 100).toFixed(1)}% confidence.`,
      coordinates: { ra: obj.ra, dec: obj.dec },
      eventTime: obj.lastDetection,
      source: 'ALeRCE',
      severity: obj.probability > 0.9 ? 'significant' : 'notable',
      isOngoing: true,
      references: [
        {
          label: 'ALeRCE Explorer',
          url: obj.url,
          type: 'other',
        },
      ],
    }))

    return {
      success: true,
      data: events,
      meta: {
        requestId: `alerce-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('ALeRCE API error:', error)
    return {
      success: false,
      error: {
        code: 'ALERCE_ERROR',
        message: 'Failed to fetch transient alerts from ALeRCE',
      },
    }
  }
}

// ============================================
// GCN Notices (Gamma-Ray Bursts, Gravitational Waves)
// ============================================

interface GCNProxyResponse {
  success: boolean
  data: {
    id: string | number
    title: string
    submitter: string
    date: string
    url: string
    excerpt?: string
    note?: string
  }[]
  source: string
}

export async function getGCNNotices(
  limit: number = 5
): Promise<ApiResponse<AstronomicalEvent[]>> {
  try {
    // Use proxy endpoint to avoid CORS
    const response = await axios.get<GCNProxyResponse>(
      API_ENDPOINTS.gcnNotices,
      {
        params: { limit },
        timeout: 15000,
      }
    )

    if (!response.data.success) {
      throw new Error('Proxy returned error')
    }

    const events: AstronomicalEvent[] = (response.data.data || []).map((notice) => {
      // Determine severity based on title keywords
      const title = notice.title.toLowerCase()
      let severity: EventSeverity = 'notable'
      let eventType: EventType = 'transient'

      if (title.includes('gravitational') || title.includes('ligo') || title.includes('virgo')) {
        severity = 'rare'
      } else if (title.includes('grb') || title.includes('gamma-ray burst')) {
        severity = 'significant'
      } else if (title.includes('supernova') || title.includes('sn ')) {
        severity = 'significant'
      } else if (title.includes('neutrino')) {
        severity = 'rare'
      }

      return {
        id: `gcn-${notice.id}`,
        type: eventType,
        title: notice.title.slice(0, 100),
        description: notice.excerpt || `GCN Notice from ${notice.submitter}`,
        eventTime: notice.date,
        source: 'GCN',
        severity,
        isOngoing: false,
        references: [
          {
            label: 'GCN Circular',
            url: notice.url,
            type: 'nasa',
          },
        ],
      }
    })

    return {
      success: true,
      data: events,
      meta: {
        requestId: `gcn-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('GCN API error:', error)
    return {
      success: false,
      error: {
        code: 'GCN_ERROR',
        message: 'Failed to fetch GCN notices',
      },
    }
  }
}

// ============================================
// Aggregate All Events
// ============================================

export async function getAllCurrentEvents(): Promise<ApiResponse<AstronomicalEvent[]>> {
  const results = await Promise.allSettled([
    getNearEarthObjects(),
    getSolarWeather(),
    getTransientAlerts(5),
    getGCNNotices(3),
  ])

  const allEvents: AstronomicalEvent[] = []

  // Add NEO events
  if (results[0].status === 'fulfilled' && results[0].value.success && results[0].value.data) {
    allEvents.push(...results[0].value.data.slice(0, 5)) // Limit to 5 nearest
  }

  // Add solar events
  if (results[1].status === 'fulfilled' && results[1].value.success && results[1].value.data) {
    allEvents.push(...results[1].value.data.events)
  }

  // Add transient alerts (ALeRCE)
  if (results[2].status === 'fulfilled' && results[2].value.success && results[2].value.data) {
    allEvents.push(...results[2].value.data)
  }

  // Add GCN notices
  if (results[3].status === 'fulfilled' && results[3].value.success && results[3].value.data) {
    allEvents.push(...results[3].value.data)
  }

  // Add upcoming scheduled events
  allEvents.push(...getUpcomingEvents(5))

  // Sort by severity then date
  const severityOrder: Record<EventSeverity, number> = {
    'once-in-lifetime': 5,
    'rare': 4,
    'significant': 3,
    'notable': 2,
    'info': 1,
  }

  allEvents.sort((a, b) => {
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
    if (severityDiff !== 0) return severityDiff
    return new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()
  })

  return {
    success: true,
    data: allEvents,
    meta: {
      requestId: `events-${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
  }
}
