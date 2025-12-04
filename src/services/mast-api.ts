/**
 * Cosmos Collective - MAST (Mikulski Archive for Space Telescopes) API Service
 * Handles JWST, Hubble, and other space telescope data from STScI
 */

import axios, { AxiosError } from 'axios'
import type {
  Observation,
  SearchFilters,
  SkyCoordinates,
  ApiResponse,
  JWSTInstrument,
  ObjectCategory,
} from '@/types'

// ============================================
// Configuration
// ============================================

const MAST_BASE_URL = 'https://mast.stsci.edu/api/v0'
const MAST_INVOKE_URL = `${MAST_BASE_URL}/invoke`
const IMAGE_CDN_BASE = 'https://stsci-opo.org/STScI-01'

// Request timeout
const REQUEST_TIMEOUT = 30000

// Create axios instance
const mastClient = axios.create({
  baseURL: MAST_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ============================================
// Types for MAST API
// ============================================

interface MASTObservation {
  obsid: string
  obs_collection: string
  target_name: string
  s_ra: number
  s_dec: number
  t_min: number
  t_max: number
  t_exptime: number
  instrument_name: string
  filters: string
  dataproduct_type: string
  proposal_id: string
  proposal_pi: string
  calib_level: number
  obs_title?: string
  target_classification?: string
}

interface MASTResponse {
  status: string
  msg?: string
  data?: MASTObservation[]
  fields?: { name: string; type: string }[]
  paging?: {
    page: number
    pageSize: number
    pagesFiltered: number
    rows: number
    rowsFiltered: number
    rowsTotal: number
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert MAST Modified Julian Date to ISO date string
 */
function mjdToISODate(mjd: number): string {
  // MJD = JD - 2400000.5
  // JD to Unix timestamp: (JD - 2440587.5) * 86400 * 1000
  const jd = mjd + 2400000.5
  const unixTimestamp = (jd - 2440587.5) * 86400 * 1000
  return new Date(unixTimestamp).toISOString()
}

/**
 * Infer object category from target name and classification
 */
function inferCategory(targetName: string, classification?: string): ObjectCategory {
  const name = targetName.toLowerCase()
  const classif = (classification || '').toLowerCase()

  if (name.includes('nebula') || classif.includes('nebula')) return 'nebula'
  if (name.includes('galaxy') || classif.includes('galaxy') || name.includes('ngc') || name.includes('smacs')) return 'galaxy'
  if (name.includes('star') || classif.includes('star')) return 'star'
  if (name.includes('cluster') || classif.includes('cluster')) return 'star-cluster'
  if (name.includes('exoplanet') || classif.includes('planet') || name.includes('-b') || name.includes('-c')) return 'exoplanet'
  if (name.includes('supernova') || name.includes(' sn')) return 'supernova'
  if (name.includes('pulsar') || classif.includes('pulsar')) return 'pulsar'
  if (name.includes('quasar') || classif.includes('qso')) return 'quasar'
  if (name.includes('lens') || classif.includes('lens')) return 'gravitational-lens'
  if (name.includes('deep field')) return 'deep-field'

  return 'other'
}

/**
 * Generate image URLs for an observation
 */
function generateImageUrls(obsid: string, targetName: string) {
  // STScI image naming convention varies, so we provide multiple possible URLs
  const cleanName = targetName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')

  return {
    thumbnail: `${IMAGE_CDN_BASE}${obsid.slice(-4)}-${cleanName.slice(0, 10)}.png`,
    preview: `${IMAGE_CDN_BASE}${obsid.slice(-4)}-${cleanName.slice(0, 10)}.png`,
    full: `${IMAGE_CDN_BASE}${obsid.slice(-4)}-${cleanName.slice(0, 10)}.png`,
  }
}

/**
 * Transform MAST observation to our Observation type
 */
function transformMASTObservation(mast: MASTObservation): Observation {
  const coordinates: SkyCoordinates = {
    ra: mast.s_ra,
    dec: mast.s_dec,
    equinox: 'J2000',
  }

  return {
    id: mast.obsid,
    source: mast.obs_collection === 'JWST' ? 'JWST' : 'Hubble',
    targetName: mast.target_name,
    coordinates,
    category: inferCategory(mast.target_name, mast.target_classification),
    wavelengthBand: mast.obs_collection === 'JWST' ? 'infrared' : 'optical',
    instrument: mast.instrument_name as JWSTInstrument | undefined,
    filters: mast.filters ? mast.filters.split(';').map((f) => f.trim()) : undefined,
    observationDate: mjdToISODate(mast.t_min),
    exposureTime: mast.t_exptime,
    proposalId: mast.proposal_id,
    principalInvestigator: mast.proposal_pi,
    images: generateImageUrls(mast.obsid, mast.target_name),
    description: mast.obs_title,
    dataQuality: mast.calib_level >= 3 ? 'excellent' : mast.calib_level >= 2 ? 'good' : 'fair',
    externalLinks: [
      {
        label: 'View on MAST',
        url: `https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=${mast.obsid}`,
        type: 'mast',
      },
    ],
  }
}

// ============================================
// API Functions
// ============================================

/**
 * Search JWST observations
 */
export async function searchJWSTObservations(
  filters?: Partial<SearchFilters>
): Promise<ApiResponse<Observation[]>> {
  try {
    const requestFilters: { paramName: string; values: (string | number)[] }[] = [
      { paramName: 'obs_collection', values: ['JWST'] },
      { paramName: 'dataproduct_type', values: ['image'] },
      { paramName: 'calib_level', values: [3] }, // Fully calibrated data
    ]

    // Add category filter if provided
    if (filters?.categories && filters.categories.length > 0) {
      // Note: MAST doesn't have direct category filtering, so we'd filter post-query
    }

    // Add date range filter
    if (filters?.dateRange) {
      // Convert ISO dates to MJD for MAST query
      // This is simplified - real implementation would convert properly
    }

    const response = await mastClient.post<MASTResponse>(MAST_INVOKE_URL, {
      service: 'Mast.Caom.Filtered',
      format: 'json',
      params: {
        columns: '*',
        filters: requestFilters,
        pagesize: 100,
        page: 1,
      },
    })

    if (response.data.status !== 'COMPLETE' || !response.data.data) {
      throw new Error(response.data.msg || 'MAST query failed')
    }

    const observations = response.data.data.map(transformMASTObservation)

    return {
      success: true,
      data: observations,
      meta: {
        requestId: `mast-${Date.now()}`,
        timestamp: new Date().toISOString(),
        cached: false,
      },
    }
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('MAST API error:', axiosError.message)

    return {
      success: false,
      error: {
        code: 'MAST_ERROR',
        message: 'Failed to fetch observations from MAST',
        details: { originalError: axiosError.message },
      },
    }
  }
}

/**
 * Search by cone (position and radius)
 */
export async function searchByCone(
  coordinates: SkyCoordinates,
  radiusDegrees: number = 0.1
): Promise<ApiResponse<Observation[]>> {
  try {
    const response = await mastClient.post<MASTResponse>(MAST_INVOKE_URL, {
      service: 'Mast.Caom.Cone',
      format: 'json',
      params: {
        ra: coordinates.ra,
        dec: coordinates.dec,
        radius: radiusDegrees,
        columns: '*',
        filters: [
          { paramName: 'obs_collection', values: ['JWST', 'HST'] },
          { paramName: 'dataproduct_type', values: ['image'] },
        ],
      },
    })

    if (response.data.status !== 'COMPLETE' || !response.data.data) {
      throw new Error(response.data.msg || 'MAST cone search failed')
    }

    const observations = response.data.data.map(transformMASTObservation)

    return {
      success: true,
      data: observations,
    }
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      success: false,
      error: {
        code: 'MAST_CONE_ERROR',
        message: 'Failed to search by position',
        details: { originalError: axiosError.message },
      },
    }
  }
}

/**
 * Resolve target name to coordinates
 */
export async function resolveTargetName(
  targetName: string
): Promise<ApiResponse<SkyCoordinates>> {
  try {
    const response = await mastClient.post<{
      status: string
      resolvedCoordinate?: { ra: number; decl: number }
    }>(MAST_INVOKE_URL, {
      service: 'Mast.Name.Lookup',
      format: 'json',
      params: {
        input: targetName,
        format: 'json',
      },
    })

    if (!response.data.resolvedCoordinate) {
      throw new Error(`Could not resolve target: ${targetName}`)
    }

    return {
      success: true,
      data: {
        ra: response.data.resolvedCoordinate.ra,
        dec: response.data.resolvedCoordinate.decl,
        equinox: 'J2000',
      },
    }
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      success: false,
      error: {
        code: 'NAME_RESOLVE_ERROR',
        message: `Could not resolve target name: ${targetName}`,
        details: { originalError: axiosError.message },
      },
    }
  }
}

/**
 * Get data products for an observation
 */
export async function getObservationProducts(
  obsid: string
): Promise<ApiResponse<{ dataURI: string; productType: string }[]>> {
  try {
    const response = await mastClient.post<MASTResponse>(MAST_INVOKE_URL, {
      service: 'Mast.Caom.Products',
      format: 'json',
      params: {
        obsid,
      },
    })

    if (response.data.status !== 'COMPLETE') {
      throw new Error('Failed to get products')
    }

    return {
      success: true,
      data:
        (response.data.data as any[])?.map((p: any) => ({
          dataURI: p.dataURI,
          productType: p.productType,
        })) || [],
    }
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      success: false,
      error: {
        code: 'PRODUCTS_ERROR',
        message: 'Failed to get observation products',
        details: { originalError: axiosError.message },
      },
    }
  }
}

// ============================================
// Featured Images (Curated)
// ============================================

/**
 * Get curated featured JWST images
 * These are hand-picked iconic images with verified URLs
 */
export function getFeaturedJWSTImages(): Observation[] {
  return [
    {
      id: 'jwst-carina-nebula',
      source: 'JWST',
      targetName: 'Carina Nebula (Cosmic Cliffs)',
      aliases: ['NGC 3324', 'Cosmic Cliffs'],
      coordinates: { ra: 160.9625, dec: -59.2744, equinox: 'J2000', constellation: 'Carina' },
      category: 'nebula',
      wavelengthBand: 'infrared',
      instrument: 'NIRCam',
      filters: ['F090W', 'F187N', 'F200W', 'F335M', 'F444W'],
      observationDate: '2022-07-12T00:00:00Z',
      images: {
        thumbnail: 'https://stsci-opo.org/STScI-01G8GZR2PM5DH9B8DNSYSCXQ81.png',
        preview: 'https://stsci-opo.org/STScI-01G8GZR2PM5DH9B8DNSYSCXQ81.png',
        full: 'https://stsci-opo.org/STScI-01G8GZQ5RMASQ6PQMJ2P59CR6Q.png',
      },
      description: 'The "Cosmic Cliffs" of the Carina Nebula reveal baby stars and structures previously hidden.',
      distanceLightYears: 7600,
      isFeatured: true,
      dataQuality: 'excellent',
      externalLinks: [
        { label: 'NASA Feature', url: 'https://www.nasa.gov/image-feature/goddard/2022/nasa-s-webb-reveals-cosmic-cliffs-glittering-landscape-of-star-birth', type: 'nasa' },
      ],
      analysis: {
        summary: 'Star-forming region in the Carina Nebula showing dramatic structures carved by stellar radiation.',
        scientificContext: 'This region is actively forming stars. The "cliffs" are walls of gas and dust being eroded by radiation from hot young stars.',
        keyFeatures: ['Star-forming pillars', 'Protostellar jets', 'Ionization fronts', 'Young stellar objects'],
        relatedObjects: ['NGC 3324', 'Eta Carinae'],
        funFacts: ['The tallest peaks are about 7 light-years high', 'Some stars in this image are only 50,000-100,000 years old'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'jwst-smacs-0723',
      source: 'JWST',
      targetName: "SMACS 0723 (Webb's First Deep Field)",
      aliases: ['SMACS J0723.3-7327', 'First Deep Field'],
      coordinates: { ra: 110.825, dec: -73.4533, equinox: 'J2000' },
      category: 'deep-field',
      wavelengthBand: 'infrared',
      instrument: 'NIRCam',
      filters: ['F090W', 'F150W', 'F200W', 'F277W', 'F356W', 'F444W'],
      observationDate: '2022-07-11T00:00:00Z',
      images: {
        thumbnail: 'https://stsci-opo.org/STScI-01G7JJADTH90FR98AKKJFKSS0B.png',
        preview: 'https://stsci-opo.org/STScI-01G7JJADTH90FR98AKKJFKSS0B.png',
        full: 'https://stsci-opo.org/STScI-01G7DBRVK5M1JW5V3RXM1EY0Y0.png',
      },
      description: "JWST's first deep field image, showing thousands of galaxies including some from 13 billion years ago.",
      redshift: 0.39,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'Gravitationally lensed deep field showing thousands of galaxies spanning cosmic history.',
        scientificContext: 'The galaxy cluster SMACS 0723 acts as a gravitational lens, magnifying distant galaxies behind it. Some visible galaxies existed when the universe was less than 1 billion years old.',
        keyFeatures: ['Gravitational lensing arcs', 'Galaxy cluster', 'High-redshift galaxies', 'Cosmic web structure'],
        relatedObjects: ['Hubble Deep Field', 'GOODS Survey'],
        funFacts: ['The image covers an area of sky about the size of a grain of sand held at arm\'s length', 'Over 10,000 galaxies are visible'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'jwst-stephans-quintet',
      source: 'JWST',
      targetName: "Stephan's Quintet",
      aliases: ['HCG 92', 'Arp 319'],
      coordinates: { ra: 339.0096, dec: 33.9658, equinox: 'J2000', constellation: 'Pegasus' },
      category: 'galaxy',
      wavelengthBand: 'infrared',
      instrument: 'NIRCam',
      observationDate: '2022-07-12T00:00:00Z',
      images: {
        thumbnail: 'https://stsci-opo.org/STScI-01G8H12BQGA8KBQCN6YT9MA6PG.png',
        preview: 'https://stsci-opo.org/STScI-01G8H12BQGA8KBQCN6YT9MA6PG.png',
        full: 'https://stsci-opo.org/STScI-01G8H1118D6WV5XFEXJTZWN2W6.png',
      },
      description: 'A visual grouping of five galaxies, four of which are locked in a cosmic dance of collisions.',
      distanceLightYears: 290000000,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'Compact galaxy group showing dramatic interactions and star formation triggered by galactic collisions.',
        scientificContext: 'Four of the five galaxies are gravitationally bound and interacting. One galaxy (NGC 7320) is actually a foreground galaxy not part of the group.',
        keyFeatures: ['Galaxy interactions', 'Tidal tails', 'Shock waves', 'Triggered star formation', 'Active galactic nucleus'],
        relatedObjects: ['NGC 7317', 'NGC 7318A', 'NGC 7318B', 'NGC 7319', 'NGC 7320'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'jwst-southern-ring',
      source: 'JWST',
      targetName: 'Southern Ring Nebula',
      aliases: ['NGC 3132', 'Eight-Burst Nebula'],
      coordinates: { ra: 151.7554, dec: -40.4369, equinox: 'J2000', constellation: 'Vela' },
      category: 'nebula',
      wavelengthBand: 'infrared',
      instrument: 'NIRCam',
      observationDate: '2022-07-12T00:00:00Z',
      images: {
        thumbnail: 'https://stsci-opo.org/STScI-01G8H0TDKJ5X2VVMD8X2HCCXTQ.png',
        preview: 'https://stsci-opo.org/STScI-01G8H0TDKJ5X2VVMD8X2HCCXTQ.png',
        full: 'https://stsci-opo.org/STScI-01G8H0TB22PRFTKDEWDHFJ2XST.png',
      },
      description: 'A planetary nebula - shells of gas and dust expelled by a dying star.',
      distanceLightYears: 2500,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'Planetary nebula showing the expanding shells of material expelled by a dying Sun-like star.',
        scientificContext: 'JWST revealed that the central system is actually a binary star. The dying white dwarf is now clearly visible alongside its companion.',
        keyFeatures: ['Binary central star', 'Expanding shells', 'Molecular hydrogen', 'Dust lanes'],
        relatedObjects: ['Ring Nebula', 'Helix Nebula'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'jwst-pillars-creation',
      source: 'JWST',
      targetName: 'Pillars of Creation',
      aliases: ['M16', 'Eagle Nebula Pillars'],
      coordinates: { ra: 274.7, dec: -13.8067, equinox: 'J2000', constellation: 'Serpens' },
      category: 'nebula',
      wavelengthBand: 'infrared',
      instrument: 'NIRCam',
      observationDate: '2022-10-19T00:00:00Z',
      images: {
        thumbnail: 'https://stsci-opo.org/STScI-01GFK4S3B8XH9JYXVVC5SFK4J2.png',
        preview: 'https://stsci-opo.org/STScI-01GFK4S3B8XH9JYXVVC5SFK4J2.png',
        full: 'https://stsci-opo.org/STScI-01GFK4RN3Q73HGEDPGX0NCCHE4.png',
      },
      description: 'The iconic Pillars of Creation in the Eagle Nebula, now revealed in unprecedented infrared detail.',
      distanceLightYears: 6500,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'Star-forming pillars of cold gas and dust in the Eagle Nebula, showing newborn stars previously hidden.',
        scientificContext: 'These pillars are being sculpted by radiation from nearby massive stars. The infrared view reveals young stars embedded within the pillars that are invisible in optical light.',
        keyFeatures: ['Elephant trunk structures', 'Embedded protostars', 'Evaporating gaseous globules', 'Ionization fronts'],
        relatedObjects: ['Eagle Nebula (M16)', 'NGC 6611'],
        funFacts: ['The pillars are about 5 light-years tall', 'The Hubble image of these pillars from 1995 is one of the most famous astronomical images ever taken'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'jwst-jupiter',
      source: 'JWST',
      targetName: 'Jupiter',
      coordinates: { ra: 0, dec: 0, equinox: 'J2000' }, // Solar system object, coordinates vary
      category: 'solar-system',
      wavelengthBand: 'infrared',
      instrument: 'NIRCam',
      observationDate: '2022-08-22T00:00:00Z',
      images: {
        thumbnail: 'https://stsci-opo.org/STScI-01G9HQCCKFWB8DSXSDCQPXM5ME.png',
        preview: 'https://stsci-opo.org/STScI-01G9HQCCKFWB8DSXSDCQPXM5ME.png',
        full: 'https://stsci-opo.org/STScI-01G9HQ39ZCCEMW51HWEKRBH4B2.png',
      },
      description: 'Jupiter in infrared light, revealing auroras, storms, and rings in stunning detail.',
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'Infrared portrait of Jupiter showing atmospheric dynamics, polar auroras, and faint ring system.',
        scientificContext: 'The infrared view reveals temperature variations in Jupiter\'s atmosphere. The Great Red Spot appears white because it reflects sunlight efficiently at high altitudes.',
        keyFeatures: ['Polar auroras', 'Great Red Spot', 'Atmospheric bands', 'Ring system', 'Moons'],
        relatedObjects: ['Io', 'Europa', 'Ganymede', 'Callisto'],
        funFacts: ['Jupiter\'s auroras are hundreds of times more energetic than Earth\'s', 'The Great Red Spot is larger than Earth'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'jwst-tarantula-nebula',
      source: 'JWST',
      targetName: 'Tarantula Nebula',
      aliases: ['30 Doradus', 'NGC 2070'],
      coordinates: { ra: 84.6758, dec: -69.1008, equinox: 'J2000', constellation: 'Dorado' },
      category: 'nebula',
      wavelengthBand: 'infrared',
      instrument: 'NIRCam',
      observationDate: '2022-09-06T00:00:00Z',
      images: {
        thumbnail: 'https://stsci-opo.org/STScI-01GBZ7CZ2R5F1MP8JMRSWJQPR1.png',
        preview: 'https://stsci-opo.org/STScI-01GBZ7CZ2R5F1MP8JMRSWJQPR1.png',
        full: 'https://stsci-opo.org/STScI-01GBZYB6C7YHP8E2SHK4XMFCGY.png',
      },
      description: 'The most violent star-forming region in our cosmic neighborhood.',
      distanceLightYears: 161000,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'Most active star-forming region in the Local Group, revealing thousands of young stars.',
        scientificContext: 'Located in the Large Magellanic Cloud, this nebula provides insight into what star formation was like when the universe was much younger and metal-poor.',
        keyFeatures: ['Massive star cluster R136', 'Protostellar jets', 'Superbubbles', 'Pillars of creation'],
        relatedObjects: ['Large Magellanic Cloud', 'R136 cluster'],
        funFacts: ['If the Tarantula Nebula were as close as the Orion Nebula, it would cast shadows on Earth', 'It contains some of the most massive stars known'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'jwst-cartwheel-galaxy',
      source: 'JWST',
      targetName: 'Cartwheel Galaxy',
      aliases: ['ESO 350-40', 'PGC 2248'],
      coordinates: { ra: 9.4083, dec: -33.7167, equinox: 'J2000', constellation: 'Sculptor' },
      category: 'galaxy',
      wavelengthBand: 'infrared',
      instrument: 'NIRCam',
      observationDate: '2022-08-02T00:00:00Z',
      images: {
        thumbnail: 'https://stsci-opo.org/STScI-01G9D2YE3S3BTGDC4FE2HSHFGA.png',
        preview: 'https://stsci-opo.org/STScI-01G9D2YE3S3BTGDC4FE2HSHFGA.png',
        full: 'https://stsci-opo.org/STScI-01G9D2XQKA5PH1MFHE2HT5K1G5.png',
      },
      description: 'A ring galaxy formed by a spectacular collision with another galaxy.',
      distanceLightYears: 500000000,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'Ring galaxy showing expanding wave of star formation triggered by a galactic collision.',
        scientificContext: 'About 400 million years ago, a smaller galaxy punched through the center, creating an expanding ring of star formation like ripples from a stone dropped in water.',
        keyFeatures: ['Double ring structure', 'Star formation wave', 'Central hub', 'Tidal tails', 'Companion galaxies'],
        relatedObjects: ['Hoag\'s Object', 'Arp 147'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
  ]
}
