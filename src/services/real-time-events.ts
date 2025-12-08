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

export async function getISSPosition(): Promise<ApiResponse<{
  position: { lat: number; lon: number; alt: number }
  velocity: number
  timestamp: string
}>> {
  try {
    const response = await axios.get<ISSPosition>(API_ENDPOINTS.issPosition, {
      timeout: 5000,
    })

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
    console.error('ISS position error:', error)
    return {
      success: false,
      error: {
        code: 'ISS_ERROR',
        message: 'Failed to fetch ISS position',
      },
    }
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
