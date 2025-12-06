/**
 * Cosmos Collective - Australian Radio Telescope Integration
 * Services for ASKAP, MWA, Parkes, and ATCA data access
 *
 * This integration demonstrates understanding of CSIRO's radio astronomy infrastructure
 * and the future Square Kilometre Array (SKA) project.
 */

import axios from 'axios'
import type { Observation, ApiResponse, SkyCoordinates } from '@/types'

// ============================================
// Configuration
// ============================================

const CASDA_BASE = 'https://casda.csiro.au'
const CASDA_TAP = `${CASDA_BASE}/votools/tap/sync`
const CASDA_SIA = `${CASDA_BASE}/votools/sia2/query`

// Placeholder images for radio observations
const RADIO_PLACEHOLDER_IMAGES = {
  askap: '/images/askap-placeholder.svg',
  parkes: '/images/parkes-placeholder.svg',
  mwa: '/images/mwa-placeholder.svg',
  generic: '/images/radio-placeholder.svg',
}

// Australian telescope information
export const AUSTRALIAN_TELESCOPES = {
  askap: {
    name: 'ASKAP',
    fullName: 'Australian Square Kilometre Array Pathfinder',
    location: 'Murchison Radio-astronomy Observatory, Western Australia',
    coordinates: { lat: -26.697, lon: 116.631 },
    description: 'A precursor to SKA-Low, ASKAP uses phased array feeds for wide-field radio imaging.',
    wavelengthRange: '70cm - 3cm (700 MHz - 1.8 GHz)',
    keyProjects: ['WALLABY (HI survey)', 'EMU (Evolutionary Map of the Universe)', 'VAST (Variables and Slow Transients)'],
    dishes: 36,
    dishDiameter: 12, // meters
  },
  mwa: {
    name: 'MWA',
    fullName: 'Murchison Widefield Array',
    location: 'Murchison Radio-astronomy Observatory, Western Australia',
    coordinates: { lat: -26.703, lon: 116.671 },
    description: 'A low-frequency radio telescope, precursor to SKA-Low.',
    wavelengthRange: '3.5m - 80cm (80 - 300 MHz)',
    keyProjects: ['EoR (Epoch of Reionization)', 'GLEAM (GaLactic and Extragalactic All-sky MWA survey)'],
    tiles: 4096,
  },
  parkes: {
    name: 'Parkes',
    fullName: 'Parkes Radio Telescope (The Dish)',
    location: 'Parkes, New South Wales',
    coordinates: { lat: -32.998, lon: 148.263 },
    description: 'Iconic 64-meter radio telescope, famous for receiving Apollo 11 TV transmissions.',
    wavelengthRange: '60cm - 1.3cm (0.5 - 24 GHz)',
    keyProjects: ['Pulsar timing', 'SETI', 'Fast Radio Bursts'],
    dishDiameter: 64, // meters
  },
  atca: {
    name: 'ATCA',
    fullName: 'Australia Telescope Compact Array',
    location: 'Narrabri, New South Wales',
    coordinates: { lat: -30.313, lon: 149.550 },
    description: 'Six 22-meter dishes operating as an interferometer.',
    wavelengthRange: '25cm - 3mm (1.1 - 105 GHz)',
    keyProjects: ['Galaxy surveys', 'Molecular line studies', 'Transient follow-up'],
    dishes: 6,
    dishDiameter: 22,
  },
  ska: {
    name: 'SKA',
    fullName: 'Square Kilometre Array',
    location: 'Murchison (SKA-Low) & South Africa (SKA-Mid)',
    coordinates: { lat: -26.82, lon: 116.76 },
    description: 'The world\'s largest radio telescope, currently under construction.',
    wavelengthRange: '4m - 1.5cm (50 MHz - 20 GHz)',
    keyProjects: ['Dark energy', 'Cosmic magnetism', 'Gravitational waves', 'SETI', 'Pulsars'],
    expectedFirstLight: '2027',
  },
} as const

export type AustralianTelescope = keyof typeof AUSTRALIAN_TELESCOPES

// ============================================
// Types for CASDA/VOTable responses
// ============================================

interface CASDACatalogEntry {
  obs_id: string
  target_name: string
  s_ra: number
  s_dec: number
  t_min: number
  t_exptime: number
  instrument_name: string
  obs_collection: string
  access_url?: string
  thumbnail_url?: string
  project_code?: string
  obs_release_date?: string
}

// ============================================
// CASDA TAP Query Service
// ============================================

/**
 * Execute an ADQL query against CASDA TAP service
 * ADQL (Astronomical Data Query Language) is SQL-like
 */
export async function queryCASDATAP(
  adqlQuery: string
): Promise<ApiResponse<Record<string, unknown>[]>> {
  try {
    const params = new URLSearchParams({
      REQUEST: 'doQuery',
      LANG: 'ADQL',
      FORMAT: 'json',
      QUERY: adqlQuery,
    })

    const response = await axios.post(CASDA_TAP, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000,
    })

    return {
      success: true,
      data: response.data.data || [],
      meta: {
        requestId: `casda-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('CASDA TAP query error:', error)
    return {
      success: false,
      error: {
        code: 'CASDA_TAP_ERROR',
        message: 'Failed to query CASDA TAP service',
      },
    }
  }
}

/**
 * Search ASKAP observations by position
 */
export async function searchASKAPByPosition(
  coordinates: SkyCoordinates,
  radiusDegrees: number = 1.0
): Promise<ApiResponse<Observation[]>> {
  const query = `
    SELECT TOP 100
      obs_id, target_name, s_ra, s_dec, t_min, t_exptime,
      instrument_name, obs_collection, access_url, project_code
    FROM ivoa.ObsCore
    WHERE obs_collection = 'ASKAP'
      AND CONTAINS(POINT('ICRS', s_ra, s_dec),
                   CIRCLE('ICRS', ${coordinates.ra}, ${coordinates.dec}, ${radiusDegrees})) = 1
    ORDER BY t_min DESC
  `

  const result = await queryCASDATAP(query)

  if (!result.success) {
    return result as unknown as ApiResponse<Observation[]>
  }

  const observations = (result.data || []).map((row) => transformCASDATOObservation(row as unknown as CASDACatalogEntry))

  return {
    success: true,
    data: observations,
  }
}

/**
 * Search ASKAP observations by project
 */
export async function searchASKAPByProject(
  projectCode: string
): Promise<ApiResponse<Observation[]>> {
  const query = `
    SELECT TOP 100
      obs_id, target_name, s_ra, s_dec, t_min, t_exptime,
      instrument_name, obs_collection, access_url, project_code
    FROM ivoa.ObsCore
    WHERE obs_collection = 'ASKAP'
      AND project_code LIKE '%${projectCode}%'
    ORDER BY t_min DESC
  `

  const result = await queryCASDATAP(query)

  if (!result.success) {
    return result as unknown as ApiResponse<Observation[]>
  }

  const observations = (result.data || []).map((row) => transformCASDATOObservation(row as unknown as CASDACatalogEntry))

  return {
    success: true,
    data: observations,
  }
}

/**
 * Get recent ASKAP observations
 */
export async function getRecentASKAPObservations(
  limit: number = 50
): Promise<ApiResponse<Observation[]>> {
  const query = `
    SELECT TOP ${limit}
      obs_id, target_name, s_ra, s_dec, t_min, t_exptime,
      instrument_name, obs_collection, access_url, project_code
    FROM ivoa.ObsCore
    WHERE obs_collection = 'ASKAP'
      AND dataproduct_type = 'cube'
    ORDER BY t_min DESC
  `

  const result = await queryCASDATAP(query)

  if (!result.success) {
    return result as unknown as ApiResponse<Observation[]>
  }

  const observations = (result.data || []).map((row) => transformCASDATOObservation(row as unknown as CASDACatalogEntry))

  return {
    success: true,
    data: observations,
  }
}

// ============================================
// Transform Functions
// ============================================

function transformCASDATOObservation(entry: CASDACatalogEntry): Observation {
  return {
    id: entry.obs_id,
    source: 'ASKAP',
    targetName: entry.target_name || 'Unknown Target',
    coordinates: {
      ra: entry.s_ra,
      dec: entry.s_dec,
      equinox: 'J2000',
    },
    category: 'other', // Would need more info to categorize
    wavelengthBand: 'radio',
    instrument: undefined, // Radio telescope - not a JWST instrument
    observationDate: entry.t_min ? new Date(entry.t_min * 86400000 + Date.UTC(1858, 10, 17)).toISOString() : new Date().toISOString(),
    exposureTime: entry.t_exptime,
    proposalId: entry.project_code,
    images: {
      thumbnail: entry.thumbnail_url || RADIO_PLACEHOLDER_IMAGES.generic,
      preview: entry.thumbnail_url || RADIO_PLACEHOLDER_IMAGES.generic,
      full: entry.access_url || '',
    },
    externalLinks: [
      {
        label: 'View on CASDA',
        url: `https://casda.csiro.au/casda_vo_tools/observations/${entry.obs_id}`,
        type: 'other',
      },
    ],
  }
}

// ============================================
// SKA Information & Simulations
// ============================================

/**
 * Get information about SKA science goals
 */
export function getSKAScienceGoals() {
  return [
    {
      id: 'dark-energy',
      title: 'Dark Energy & Dark Matter',
      description: 'Mapping the distribution of hydrogen across the universe to understand cosmic acceleration.',
      icon: '🌌',
      wavelengthBand: 'radio' as const,
      expectedResults: 'Precise measurements of the expansion history of the universe',
    },
    {
      id: 'cosmic-magnetism',
      title: 'Cosmic Magnetism',
      description: 'Understanding the origin and evolution of magnetic fields in the universe.',
      icon: '🧲',
      wavelengthBand: 'radio' as const,
      expectedResults: 'First detailed maps of intergalactic magnetic fields',
    },
    {
      id: 'pulsars',
      title: 'Gravity & Pulsars',
      description: 'Using pulsars as natural gravitational wave detectors and to test general relativity.',
      icon: '💫',
      wavelengthBand: 'radio' as const,
      expectedResults: 'Detection of gravitational waves from supermassive black hole mergers',
    },
    {
      id: 'epoch-reionization',
      title: 'Cosmic Dawn & Epoch of Reionization',
      description: 'Observing the first stars and galaxies that lit up the universe.',
      icon: '🌅',
      wavelengthBand: 'radio' as const,
      expectedResults: 'Direct observation of the first billion years of cosmic history',
    },
    {
      id: 'seti',
      title: 'Search for Extraterrestrial Intelligence',
      description: 'The most comprehensive search for technosignatures in history.',
      icon: '👽',
      wavelengthBand: 'radio' as const,
      expectedResults: 'Survey of millions of star systems for artificial signals',
    },
    {
      id: 'transients',
      title: 'Transient Radio Sky',
      description: 'Monitoring the sky for fast radio bursts, supernovae, and other explosive events.',
      icon: '💥',
      wavelengthBand: 'radio' as const,
      expectedResults: 'Real-time detection and localization of cosmic explosions',
    },
  ]
}

/**
 * Get SKA construction timeline
 */
export function getSKATimeline() {
  return [
    { year: 2012, event: 'Site selection - Australia and South Africa chosen', status: 'completed' },
    { year: 2018, event: 'SKA Observatory established', status: 'completed' },
    { year: 2021, event: 'Construction approved', status: 'completed' },
    { year: 2022, event: 'Construction begins', status: 'completed' },
    { year: 2024, event: 'First antennas deployed at SKA-Low (Australia)', status: 'in-progress' },
    { year: 2027, event: 'Expected first light observations', status: 'upcoming' },
    { year: 2028, event: 'Early science operations begin', status: 'upcoming' },
    { year: 2030, event: 'Full array completion', status: 'upcoming' },
  ]
}

/**
 * Compare SKA to current telescopes
 */
export function getSKAComparison() {
  return {
    sensitivity: {
      current: 'Current largest radio telescopes',
      ska: '50x more sensitive',
      description: 'SKA will be able to detect signals 50 times fainter than current telescopes',
    },
    surveySpeed: {
      current: 'Years to survey the sky',
      ska: 'Days to weeks',
      description: 'SKA will survey the entire sky millions of times faster',
    },
    resolution: {
      current: 'Arcsecond resolution',
      ska: 'Milliarcsecond resolution',
      description: 'Able to see details 50 times smaller',
    },
    dataRate: {
      current: 'Gigabytes per second',
      ska: '710 petabytes per day (raw)',
      description: 'More data than the entire internet traffic combined',
    },
    baselines: {
      current: 'Hundreds of kilometers',
      ska: 'Up to 3,000 km',
      description: 'Creates a virtual telescope thousands of kilometers wide',
    },
  }
}

// ============================================
// Featured Australian Radio Observations
// ============================================

export function getFeaturedRadioObservations(): Observation[] {
  return [
    // ASKAP Observations
    {
      id: 'askap-emu-pilot',
      source: 'ASKAP',
      targetName: 'EMU Pilot Survey Region',
      aliases: ['Evolutionary Map of the Universe Pilot'],
      coordinates: { ra: 0, dec: -27, equinox: 'J2000' },
      category: 'deep-field',
      wavelengthBand: 'radio',
      observationDate: '2021-01-15T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.askap,
        preview: RADIO_PLACEHOLDER_IMAGES.askap,
        full: RADIO_PLACEHOLDER_IMAGES.askap,
      },
      description: 'Radio continuum survey revealing millions of galaxies across the southern sky.',
      isFeatured: true,
      analysis: {
        summary: 'ASKAP\'s EMU survey will catalogue approximately 70 million galaxies at radio wavelengths.',
        scientificContext: 'This survey is a pathfinder for SKA continuum science, demonstrating the power of wide-field radio imaging.',
        keyFeatures: ['Radio galaxies', 'Active galactic nuclei', 'Star-forming galaxies'],
        relatedObjects: ['Radio galaxy population'],
        confidence: 'high',
        generatedAt: new Date().toISOString(),
      },
      externalLinks: [
        { label: 'EMU Project', url: 'https://www.atnf.csiro.au/people/Ray.Norris/emu/', type: 'other' },
      ],
    },
    {
      id: 'askap-wallaby-survey',
      source: 'ASKAP',
      targetName: 'WALLABY HI Survey - NGC 5044 Group',
      aliases: ['WALLABY', 'Widefield ASKAP L-band Legacy All-sky Blind surveY'],
      coordinates: { ra: 198.85, dec: -16.39, equinox: 'J2000' },
      category: 'galaxy',
      wavelengthBand: 'radio',
      observationDate: '2022-03-15T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.askap,
        preview: RADIO_PLACEHOLDER_IMAGES.askap,
        full: RADIO_PLACEHOLDER_IMAGES.askap,
      },
      description: 'Mapping neutral hydrogen in galaxies to understand galaxy evolution and the cosmic web.',
      isFeatured: true,
      analysis: {
        summary: 'WALLABY will detect over 500,000 galaxies in neutral hydrogen emission.',
        scientificContext: 'Neutral hydrogen (HI) traces the fuel for star formation and is sensitive to galaxy interactions.',
        keyFeatures: ['HI 21cm emission', 'Galaxy dynamics', 'Dark matter content', 'Tidal interactions'],
        relatedObjects: ['NGC 5044 Group', 'Galaxy groups'],
        confidence: 'high',
        generatedAt: new Date().toISOString(),
      },
      externalLinks: [
        { label: 'WALLABY Project', url: 'https://wallaby-survey.org/', type: 'other' },
      ],
    },
    {
      id: 'askap-vast-transient',
      source: 'ASKAP',
      targetName: 'VAST Transient Discovery',
      aliases: ['Variables and Slow Transients'],
      coordinates: { ra: 325.92, dec: -45.67, equinox: 'J2000' },
      category: 'other',
      wavelengthBand: 'radio',
      observationDate: '2023-08-20T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.askap,
        preview: RADIO_PLACEHOLDER_IMAGES.askap,
        full: RADIO_PLACEHOLDER_IMAGES.askap,
      },
      description: 'Discovering variable and transient radio sources across the southern sky.',
      isFeatured: true,
      analysis: {
        summary: 'VAST surveys the sky repeatedly to find objects that vary or appear suddenly.',
        scientificContext: 'Radio transients include supernovae, neutron star mergers, and mysterious new phenomena.',
        keyFeatures: ['Radio variability', 'Multi-epoch imaging', 'Transient alerts', 'Counterpart identification'],
        relatedObjects: ['Radio supernovae', 'Gamma-ray bursts'],
        confidence: 'high',
        generatedAt: new Date().toISOString(),
      },
    },
    {
      id: 'askap-odd-radio-circles',
      source: 'ASKAP',
      targetName: 'Odd Radio Circles (ORCs)',
      aliases: ['ORC1', 'ASKAP J210857.7-510851'],
      coordinates: { ra: 317.24, dec: -51.15, equinox: 'J2000' },
      category: 'other',
      wavelengthBand: 'radio',
      observationDate: '2020-09-01T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.askap,
        preview: RADIO_PLACEHOLDER_IMAGES.askap,
        full: RADIO_PLACEHOLDER_IMAGES.askap,
      },
      description: 'A mysterious new class of circular radio objects discovered by ASKAP.',
      isFeatured: true,
      analysis: {
        summary: 'ORCs are giant rings of radio emission surrounding distant galaxies - a completely new phenomenon.',
        scientificContext: 'First discovered in 2020, ORCs may be shockwaves from galactic merger events or massive starbursts.',
        keyFeatures: ['Circular morphology', 'Central galaxy', 'No optical counterpart', 'Possible shockwave origin'],
        relatedObjects: ['Radio relics', 'Galaxy mergers'],
        funFacts: ['The rings are about 1 million light-years across', 'Only a handful have been discovered so far'],
        confidence: 'medium',
        generatedAt: new Date().toISOString(),
      },
    },
    // Parkes Observations
    {
      id: 'parkes-fast-radio-burst',
      source: 'Parkes',
      targetName: 'FRB 010724 (Lorimer Burst)',
      aliases: ['The Lorimer Burst', 'First FRB'],
      coordinates: { ra: 1.4, dec: -73.5, equinox: 'J2000' },
      category: 'other',
      wavelengthBand: 'radio',
      observationDate: '2001-07-24T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.parkes,
        preview: RADIO_PLACEHOLDER_IMAGES.parkes,
        full: RADIO_PLACEHOLDER_IMAGES.parkes,
      },
      description: 'The first fast radio burst ever discovered - a mysterious millisecond flash of radio waves.',
      isFeatured: true,
      analysis: {
        summary: 'The discovery that launched an entirely new field of astrophysics.',
        scientificContext: 'Fast radio bursts are intense millisecond pulses of radio waves from distant galaxies. Their origin is still being investigated.',
        keyFeatures: ['Millisecond duration', 'High dispersion measure', 'Extragalactic origin'],
        relatedObjects: ['Magnetars', 'Neutron stars'],
        funFacts: ['In that millisecond, the burst released as much energy as the Sun does in 3 days'],
        confidence: 'high',
        generatedAt: new Date().toISOString(),
      },
    },
    {
      id: 'parkes-pulsar-timing',
      source: 'Parkes',
      targetName: 'Pulsar Timing Array - J0437-4715',
      aliases: ['PSR J0437-4715', 'Millisecond Pulsar'],
      coordinates: { ra: 69.32, dec: -47.25, equinox: 'J2000' },
      category: 'pulsar',
      wavelengthBand: 'radio',
      observationDate: '2023-01-15T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.parkes,
        preview: RADIO_PLACEHOLDER_IMAGES.parkes,
        full: RADIO_PLACEHOLDER_IMAGES.parkes,
      },
      description: 'Precision timing of millisecond pulsars to detect gravitational waves.',
      isFeatured: true,
      analysis: {
        summary: 'The closest and brightest millisecond pulsar, a cornerstone of gravitational wave detection.',
        scientificContext: 'Pulsar timing arrays use stable millisecond pulsars as cosmic clocks to detect low-frequency gravitational waves from supermassive black hole binaries.',
        keyFeatures: ['173 Hz rotation', 'Nanosecond timing precision', 'Binary system', 'Gravitational wave detection'],
        relatedObjects: ['NANOGrav', 'EPTA', 'PPTA'],
        funFacts: ['Rotates 173 times per second', 'Only 510 light-years away'],
        confidence: 'high',
        generatedAt: new Date().toISOString(),
      },
    },
    {
      id: 'parkes-magellanic-survey',
      source: 'Parkes',
      targetName: 'Large Magellanic Cloud HI Survey',
      aliases: ['LMC', 'Parkes Multibeam HI Survey'],
      coordinates: { ra: 80.89, dec: -69.76, equinox: 'J2000' },
      category: 'galaxy',
      wavelengthBand: 'radio',
      observationDate: '2003-06-01T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.parkes,
        preview: RADIO_PLACEHOLDER_IMAGES.parkes,
        full: RADIO_PLACEHOLDER_IMAGES.parkes,
      },
      description: 'Detailed mapping of neutral hydrogen in our nearest galactic neighbour.',
      isFeatured: true,
      analysis: {
        summary: 'High-resolution map of the hydrogen gas in the Large Magellanic Cloud.',
        scientificContext: 'The LMC is a satellite galaxy of the Milky Way and a testbed for understanding star formation and galaxy evolution.',
        keyFeatures: ['HI distribution', 'Magellanic Stream', 'Star formation regions', 'Galaxy interaction'],
        relatedObjects: ['Small Magellanic Cloud', 'Milky Way'],
        funFacts: ['The LMC is visible to the naked eye from the southern hemisphere', 'Contains the Tarantula Nebula'],
        confidence: 'high',
        generatedAt: new Date().toISOString(),
      },
    },
    // MWA Observations
    {
      id: 'mwa-eor',
      source: 'MWA',
      targetName: 'Epoch of Reionization Field',
      coordinates: { ra: 0, dec: -27, equinox: 'J2000' },
      category: 'deep-field',
      wavelengthBand: 'radio',
      observationDate: '2023-06-01T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.mwa,
        preview: RADIO_PLACEHOLDER_IMAGES.mwa,
        full: RADIO_PLACEHOLDER_IMAGES.mwa,
      },
      description: 'Searching for the faint signal of neutral hydrogen from the cosmic dawn.',
      isFeatured: true,
      analysis: {
        summary: 'MWA observations searching for the 21cm signal from the first billion years of the universe.',
        scientificContext: 'During the Epoch of Reionization, the first stars and galaxies ionized the neutral hydrogen filling the universe. MWA seeks to detect this transition.',
        keyFeatures: ['21cm hydrogen line', 'Redshifted signal', 'Foreground subtraction'],
        relatedObjects: ['First galaxies', 'Cosmic dawn'],
        confidence: 'high',
        generatedAt: new Date().toISOString(),
      },
    },
    {
      id: 'mwa-gleam-survey',
      source: 'MWA',
      targetName: 'GLEAM All-Sky Survey',
      aliases: ['GaLactic and Extragalactic All-sky MWA Survey'],
      coordinates: { ra: 180.0, dec: -30.0, equinox: 'J2000' },
      category: 'deep-field',
      wavelengthBand: 'radio',
      observationDate: '2018-01-01T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.mwa,
        preview: RADIO_PLACEHOLDER_IMAGES.mwa,
        full: RADIO_PLACEHOLDER_IMAGES.mwa,
      },
      description: 'The most detailed low-frequency radio map of the southern sky ever created.',
      isFeatured: true,
      analysis: {
        summary: 'GLEAM cataloged over 300,000 radio sources at frequencies between 72 and 231 MHz.',
        scientificContext: 'Low-frequency radio observations reveal steep-spectrum sources, relic radio galaxies, and diffuse emission invisible at higher frequencies.',
        keyFeatures: ['Multi-frequency imaging', 'Spectral indices', 'Diffuse emission', 'Radio galaxy census'],
        relatedObjects: ['Radio galaxies', 'Galaxy clusters'],
        funFacts: ['Created from over 45,000 images', 'Covers 80% of the sky'],
        confidence: 'high',
        generatedAt: new Date().toISOString(),
      },
      externalLinks: [
        { label: 'GLEAM Survey', url: 'https://www.mwatelescope.org/gleam', type: 'other' },
      ],
    },
    {
      id: 'mwa-solar-observation',
      source: 'MWA',
      targetName: 'Solar Radio Bursts',
      aliases: ['MWA Solar', 'Space Weather Monitoring'],
      coordinates: { ra: 0, dec: 0, equinox: 'J2000' },
      category: 'solar-system',
      wavelengthBand: 'radio',
      observationDate: '2024-03-15T00:00:00Z',
      images: {
        thumbnail: RADIO_PLACEHOLDER_IMAGES.mwa,
        preview: RADIO_PLACEHOLDER_IMAGES.mwa,
        full: RADIO_PLACEHOLDER_IMAGES.mwa,
      },
      description: 'Monitoring solar radio bursts to understand space weather and protect Earth.',
      isFeatured: true,
      analysis: {
        summary: 'MWA provides real-time monitoring of solar radio emissions for space weather prediction.',
        scientificContext: 'Solar radio bursts are associated with coronal mass ejections and solar flares that can affect satellites and power grids on Earth.',
        keyFeatures: ['Type II/III bursts', 'Coronal mass ejections', 'Space weather alerts', 'Real-time imaging'],
        relatedObjects: ['Sun', 'Solar corona'],
        funFacts: ['MWA can image the Sun every 0.5 seconds', 'Helps protect astronauts and satellites'],
        confidence: 'high',
        generatedAt: new Date().toISOString(),
      },
    },
  ]
}
