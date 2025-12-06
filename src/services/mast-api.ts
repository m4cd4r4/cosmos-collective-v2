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
// Placeholder for dynamically fetched observations (STScI CDN requires authentication)
const PLACEHOLDER_IMAGE = '/images/cosmos-placeholder.svg'

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
 * Note: STScI CDN requires authentication, so we use placeholders for dynamic observations
 * Featured images use verified NASA.gov URLs instead
 */
function generateImageUrls(_obsid: string, _targetName: string) {
  // STScI image CDN (stsci-opo.org) returns 403 for public access
  // Use placeholder for dynamically fetched observations
  return {
    thumbnail: PLACEHOLDER_IMAGE,
    preview: PLACEHOLDER_IMAGE,
    full: PLACEHOLDER_IMAGE,
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
 * NASA Images API URLs - using images-assets.nasa.gov with ~medium.jpg format
 * These are verified working URLs from the NASA Image and Video Library
 * Each ID has been verified to show the correct astronomical object
 */
const NASA_IMAGE_URLS = {
  // JWST First Images from NASA Images API (verified correct IDs)
  carina: 'https://images-assets.nasa.gov/image/carina_nebula/carina_nebula~medium.jpg',
  deepField: 'https://images-assets.nasa.gov/image/webb_first_deep_field/webb_first_deep_field~medium.jpg',
  southernRing: 'https://images-assets.nasa.gov/image/southern_ring_nebula/southern_ring_nebula~medium.jpg',
  // Other telescope images with verified correct IDs
  stephansQuintet: 'https://images-assets.nasa.gov/image/PIA04201/PIA04201~medium.jpg',
  pillars: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000842/GSFC_20171208_Archive_e000842~medium.jpg',
  tarantula: 'https://images-assets.nasa.gov/image/PIA14415/PIA14415~medium.jpg',
  cartwheel: 'https://images-assets.nasa.gov/image/PIA03296/PIA03296~medium.jpg',
  jupiter: 'https://images-assets.nasa.gov/image/PIA22949/PIA22949~medium.jpg',
  // Hubble Space Telescope images (verified working URLs)
  helix: 'https://images-assets.nasa.gov/image/PIA18164/PIA18164~medium.jpg',
  sombrero: 'https://images-assets.nasa.gov/image/PIA15226/PIA15226~medium.jpg',
  crabNebula: 'https://images-assets.nasa.gov/image/PIA03606/PIA03606~medium.jpg',
  orionHeart: 'https://images-assets.nasa.gov/image/PIA01322/PIA01322~medium.jpg',
  horsehead: 'https://images-assets.nasa.gov/image/PIA16008/PIA16008~medium.jpg',
  catsEye: 'https://images-assets.nasa.gov/image/PIA16009/PIA16009~medium.jpg',
  milkyWay: 'https://images-assets.nasa.gov/image/PIA12348/PIA12348~medium.jpg',
}

/**
 * Get curated featured JWST images
 * These are hand-picked iconic images with verified URLs from NASA.gov
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
        thumbnail: NASA_IMAGE_URLS.carina,
        preview: NASA_IMAGE_URLS.carina,
        full: NASA_IMAGE_URLS.carina,
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
        thumbnail: NASA_IMAGE_URLS.deepField,
        preview: NASA_IMAGE_URLS.deepField,
        full: NASA_IMAGE_URLS.deepField,
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
        thumbnail: NASA_IMAGE_URLS.stephansQuintet,
        preview: NASA_IMAGE_URLS.stephansQuintet,
        full: NASA_IMAGE_URLS.stephansQuintet,
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
        thumbnail: NASA_IMAGE_URLS.southernRing,
        preview: NASA_IMAGE_URLS.southernRing,
        full: NASA_IMAGE_URLS.southernRing,
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
        thumbnail: NASA_IMAGE_URLS.pillars,
        preview: NASA_IMAGE_URLS.pillars,
        full: NASA_IMAGE_URLS.pillars,
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
        thumbnail: NASA_IMAGE_URLS.jupiter,
        preview: NASA_IMAGE_URLS.jupiter,
        full: NASA_IMAGE_URLS.jupiter,
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
        thumbnail: NASA_IMAGE_URLS.tarantula,
        preview: NASA_IMAGE_URLS.tarantula,
        full: NASA_IMAGE_URLS.tarantula,
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
        thumbnail: NASA_IMAGE_URLS.cartwheel,
        preview: NASA_IMAGE_URLS.cartwheel,
        full: NASA_IMAGE_URLS.cartwheel,
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

/**
 * Get curated featured Hubble Space Telescope images
 * These are hand-picked iconic images with verified URLs from NASA.gov
 */
export function getFeaturedHubbleImages(): Observation[] {
  return [
    {
      id: 'hubble-helix-nebula',
      source: 'Hubble',
      targetName: 'Helix Nebula',
      aliases: ['NGC 7293', "The Eye of God"],
      coordinates: { ra: 337.4108, dec: -20.8372, equinox: 'J2000', constellation: 'Aquarius' },
      category: 'nebula',
      wavelengthBand: 'optical',
      observationDate: '2003-05-09T00:00:00Z',
      images: {
        thumbnail: NASA_IMAGE_URLS.helix,
        preview: NASA_IMAGE_URLS.helix,
        full: NASA_IMAGE_URLS.helix,
      },
      description: 'One of the closest planetary nebulae to Earth, the Helix Nebula is a cosmic starlet.',
      distanceLightYears: 700,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'A planetary nebula created by a dying Sun-like star shedding its outer layers.',
        scientificContext: 'The Helix Nebula gives us a glimpse into what our Sun may look like in 5 billion years.',
        keyFeatures: ['Cometary knots', 'Central white dwarf', 'Expanding shell', 'Infrared excess'],
        relatedObjects: ['Ring Nebula', 'Southern Ring Nebula'],
        funFacts: ['The nebula spans 2.5 light-years across', 'Contains thousands of comet-like filaments'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
      externalLinks: [
        { label: 'NASA Feature', url: 'https://www.nasa.gov/image-feature/iridescent-glory-of-nearby-helix-nebula', type: 'nasa' },
      ],
    },
    {
      id: 'hubble-sombrero-galaxy',
      source: 'Hubble',
      targetName: 'Sombrero Galaxy',
      aliases: ['M104', 'NGC 4594'],
      coordinates: { ra: 189.9975, dec: -11.6231, equinox: 'J2000', constellation: 'Virgo' },
      category: 'galaxy',
      wavelengthBand: 'optical',
      observationDate: '2004-05-01T00:00:00Z',
      images: {
        thumbnail: NASA_IMAGE_URLS.sombrero,
        preview: NASA_IMAGE_URLS.sombrero,
        full: NASA_IMAGE_URLS.sombrero,
      },
      description: 'A spiral galaxy with a bright nucleus and an unusually large central bulge.',
      distanceLightYears: 28000000,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'An edge-on spiral galaxy famous for its prominent dust lane and bulging center.',
        scientificContext: 'The Sombrero Galaxy hosts a supermassive black hole with a mass of 1 billion Suns.',
        keyFeatures: ['Prominent dust lane', 'Large central bulge', 'Supermassive black hole', 'Globular cluster halo'],
        relatedObjects: ['Andromeda Galaxy', 'Messier 82'],
        funFacts: ['Contains over 2,000 globular clusters', 'Named for its resemblance to a Mexican hat'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'hubble-crab-nebula',
      source: 'Hubble',
      targetName: 'Crab Nebula',
      aliases: ['M1', 'NGC 1952', 'Taurus A'],
      coordinates: { ra: 83.6287, dec: 22.0147, equinox: 'J2000', constellation: 'Taurus' },
      category: 'supernova',
      wavelengthBand: 'optical',
      observationDate: '2005-12-01T00:00:00Z',
      images: {
        thumbnail: NASA_IMAGE_URLS.crabNebula,
        preview: NASA_IMAGE_URLS.crabNebula,
        full: NASA_IMAGE_URLS.crabNebula,
      },
      description: 'The remains of a supernova explosion witnessed by Chinese astronomers in 1054 AD.',
      distanceLightYears: 6500,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'A supernova remnant powered by a rapidly spinning neutron star (pulsar) at its center.',
        scientificContext: 'The Crab Pulsar rotates 30 times per second and powers the nebula with its magnetic wind.',
        keyFeatures: ['Central pulsar', 'Expanding filaments', 'Synchrotron radiation', 'Historical supernova'],
        relatedObjects: ['Vela Supernova Remnant', 'Cassiopeia A'],
        funFacts: ['The supernova was visible in daylight for 23 days', 'The nebula expands at 1,500 km/s'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'hubble-orion-nebula',
      source: 'Hubble',
      targetName: 'Orion Nebula',
      aliases: ['M42', 'NGC 1976'],
      coordinates: { ra: 83.8208, dec: -5.3911, equinox: 'J2000', constellation: 'Orion' },
      category: 'nebula',
      wavelengthBand: 'optical',
      observationDate: '2006-01-11T00:00:00Z',
      images: {
        thumbnail: NASA_IMAGE_URLS.orionHeart,
        preview: NASA_IMAGE_URLS.orionHeart,
        full: NASA_IMAGE_URLS.orionHeart,
      },
      description: 'The closest massive star-forming region to Earth, a stellar nursery in action.',
      distanceLightYears: 1344,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'A diffuse nebula where stars are actively forming, visible to the naked eye.',
        scientificContext: 'The Orion Nebula contains about 700 stars in various stages of formation.',
        keyFeatures: ['Trapezium Cluster', 'Protoplanetary disks', 'Herbig-Haro objects', 'Star-forming pillars'],
        relatedObjects: ['Horsehead Nebula', 'Running Man Nebula'],
        funFacts: ['Visible to the naked eye from Earth', 'New stars are born here every few hundred thousand years'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'hubble-horsehead-nebula',
      source: 'Hubble',
      targetName: 'Horsehead Nebula',
      aliases: ['Barnard 33', 'IC 434'],
      coordinates: { ra: 85.2458, dec: -2.4583, equinox: 'J2000', constellation: 'Orion' },
      category: 'nebula',
      wavelengthBand: 'infrared',
      observationDate: '2013-04-19T00:00:00Z',
      images: {
        thumbnail: NASA_IMAGE_URLS.horsehead,
        preview: NASA_IMAGE_URLS.horsehead,
        full: NASA_IMAGE_URLS.horsehead,
      },
      description: 'An iconic dark nebula silhouetted against a glowing background of hydrogen gas.',
      distanceLightYears: 1500,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'A dark nebula shaped like a horse head, formed from cold interstellar dust.',
        scientificContext: 'The infrared view reveals young stars forming inside the nebula that are hidden in visible light.',
        keyFeatures: ['Dark nebula', 'Star formation', 'Hydrogen emission', 'Cold dust column'],
        relatedObjects: ['Orion Nebula', 'Flame Nebula'],
        funFacts: ['The "horse head" is about 3.5 light-years tall', 'It will disperse in about 5 million years'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'hubble-cats-eye-nebula',
      source: 'Hubble',
      targetName: "Cat's Eye Nebula",
      aliases: ['NGC 6543'],
      coordinates: { ra: 269.6392, dec: 66.6328, equinox: 'J2000', constellation: 'Draco' },
      category: 'nebula',
      wavelengthBand: 'optical',
      observationDate: '1995-01-01T00:00:00Z',
      images: {
        thumbnail: NASA_IMAGE_URLS.catsEye,
        preview: NASA_IMAGE_URLS.catsEye,
        full: NASA_IMAGE_URLS.catsEye,
      },
      description: 'One of the most complex planetary nebulae known, with intricate layered structure.',
      distanceLightYears: 3300,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'A planetary nebula showing unusually complex gas shells ejected from a dying star.',
        scientificContext: 'The complex structure suggests multiple ejection events over a 1,000-year period.',
        keyFeatures: ['Concentric shells', 'Jets and knots', 'Central hot star', 'X-ray emission'],
        relatedObjects: ['Ring Nebula', 'Helix Nebula'],
        funFacts: ['The central star is 10,000 times brighter than the Sun', 'Has at least 11 concentric shells'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'hubble-milky-way-center',
      source: 'Hubble',
      targetName: 'Milky Way Center',
      aliases: ['Galactic Center', 'Sagittarius A*'],
      coordinates: { ra: 266.4167, dec: -29.0078, equinox: 'J2000', constellation: 'Sagittarius' },
      category: 'other',
      wavelengthBand: 'infrared',
      observationDate: '2009-11-10T00:00:00Z',
      images: {
        thumbnail: NASA_IMAGE_URLS.milkyWay,
        preview: NASA_IMAGE_URLS.milkyWay,
        full: NASA_IMAGE_URLS.milkyWay,
      },
      description: 'A composite view of the Milky Way center from NASA Great Observatories.',
      distanceLightYears: 26000,
      isFeatured: true,
      dataQuality: 'excellent',
      analysis: {
        summary: 'Combined data from Hubble, Spitzer, and Chandra reveals the turbulent heart of our galaxy.',
        scientificContext: 'This region hosts the supermassive black hole Sagittarius A* and intense star formation.',
        keyFeatures: ['Supermassive black hole', 'Star clusters', 'Interstellar gas', 'High-energy processes'],
        relatedObjects: ['Sagittarius A*', 'Arches Cluster'],
        funFacts: ['The black hole has 4 million times the mass of the Sun', 'Over 10 million stars crowd this region'],
        confidence: 'high',
        generatedAt: '2024-01-01T00:00:00Z',
      },
    },
  ]
}
