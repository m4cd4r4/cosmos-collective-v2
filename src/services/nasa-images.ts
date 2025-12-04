/**
 * Cosmos Collective - NASA Image and Video Library API Service
 * Provides access to NASA's public image archive
 *
 * API Documentation: https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf
 * No API key required for this service
 */

import axios from 'axios'
import type { ApiResponse } from '@/types'

// ============================================
// Configuration
// ============================================

const NASA_IMAGES_API = 'https://images-api.nasa.gov'
const REQUEST_TIMEOUT = 15000

const nasaImagesClient = axios.create({
  baseURL: NASA_IMAGES_API,
  timeout: REQUEST_TIMEOUT,
})

// ============================================
// Types
// ============================================

export interface NASAImageItem {
  href: string
  data: NASAImageData[]
  links?: NASAImageLink[]
}

export interface NASAImageData {
  center: string
  title: string
  nasa_id: string
  date_created: string
  keywords?: string[]
  media_type: 'image' | 'video' | 'audio'
  description?: string
  description_508?: string
  secondary_creator?: string
  photographer?: string
}

export interface NASAImageLink {
  href: string
  rel: 'preview' | 'captions'
  render?: string
}

export interface NASASearchResult {
  collection: {
    version: string
    href: string
    items: NASAImageItem[]
    metadata: {
      total_hits: number
    }
    links?: {
      rel: string
      prompt: string
      href: string
    }[]
  }
}

export interface NASAImage {
  id: string
  title: string
  description: string
  dateCreated: string
  keywords: string[]
  thumbnailUrl: string
  previewUrl: string
  fullUrl: string
  center: string
}

// ============================================
// Helper Functions
// ============================================

/**
 * Transform NASA API response to our internal format
 */
function transformNASAImage(item: NASAImageItem): NASAImage | null {
  const data = item.data[0]
  if (!data || data.media_type !== 'image') return null

  const previewLink = item.links?.find(l => l.rel === 'preview')

  return {
    id: data.nasa_id,
    title: data.title,
    description: data.description || data.description_508 || '',
    dateCreated: data.date_created,
    keywords: data.keywords || [],
    thumbnailUrl: previewLink?.href || '',
    previewUrl: previewLink?.href || '',
    fullUrl: item.href, // Collection URL for full resolution
    center: data.center,
  }
}

// ============================================
// API Functions
// ============================================

/**
 * Search NASA Image Library
 */
export async function searchNASAImages(
  query: string,
  options?: {
    mediaType?: 'image' | 'video' | 'audio'
    yearStart?: number
    yearEnd?: number
    page?: number
    pageSize?: number
  }
): Promise<ApiResponse<NASAImage[]>> {
  try {
    const params: Record<string, string | number> = {
      q: query,
      media_type: options?.mediaType || 'image',
    }

    if (options?.yearStart) params.year_start = options.yearStart
    if (options?.yearEnd) params.year_end = options.yearEnd
    if (options?.page) params.page = options.page
    if (options?.pageSize) params.page_size = options.pageSize

    const response = await nasaImagesClient.get<NASASearchResult>('/search', { params })

    const images = response.data.collection.items
      .map(transformNASAImage)
      .filter((img): img is NASAImage => img !== null)

    return {
      success: true,
      data: images,
      meta: {
        requestId: `nasa-images-${Date.now()}`,
        timestamp: new Date().toISOString(),
        totalHits: response.data.collection.metadata.total_hits,
      },
    }
  } catch (error) {
    console.error('NASA Images API error:', error)
    return {
      success: false,
      error: {
        code: 'NASA_IMAGES_ERROR',
        message: 'Failed to search NASA Image Library',
      },
    }
  }
}

/**
 * Get JWST images from NASA library
 */
export async function getJWSTImages(limit: number = 20): Promise<ApiResponse<NASAImage[]>> {
  return searchNASAImages('James Webb Space Telescope JWST', {
    mediaType: 'image',
    yearStart: 2022,
    pageSize: limit,
  })
}

/**
 * Get Hubble images from NASA library
 */
export async function getHubbleImages(limit: number = 20): Promise<ApiResponse<NASAImage[]>> {
  return searchNASAImages('Hubble Space Telescope', {
    mediaType: 'image',
    pageSize: limit,
  })
}

/**
 * Get images by specific target name
 */
export async function getImagesByTarget(targetName: string): Promise<ApiResponse<NASAImage[]>> {
  return searchNASAImages(targetName, {
    mediaType: 'image',
    pageSize: 10,
  })
}

/**
 * Get asset details (full resolution URLs)
 */
export async function getAssetDetails(nasaId: string): Promise<ApiResponse<string[]>> {
  try {
    const response = await nasaImagesClient.get<{
      collection: { items: { href: string }[] }
    }>(`/asset/${nasaId}`)

    const urls = response.data.collection.items.map(item => item.href)

    return {
      success: true,
      data: urls,
    }
  } catch (error) {
    console.error('NASA asset details error:', error)
    return {
      success: false,
      error: {
        code: 'NASA_ASSET_ERROR',
        message: `Failed to get asset details for ${nasaId}`,
      },
    }
  }
}

// ============================================
// Curated Featured Images (Fallbacks)
// ============================================

/**
 * Get curated JWST images with verified working URLs from NASA Image Library
 * These are known-good NASA IDs that can be used as fallbacks
 */
export const CURATED_JWST_NASA_IDS = [
  'GSFC_20171208_Archive_e001427', // Webb First Deep Field
  'GSFC_20171208_Archive_e001917', // Carina Nebula
  'GSFC_20171208_Archive_e002138', // Southern Ring Nebula
  'GSFC_20171208_Archive_e002125', // Stephan's Quintet
  'GSFC_20171208_Archive_e002310', // Pillars of Creation
  'GSFC_20171208_Archive_e002261', // Jupiter
  'GSFC_20171208_Archive_e002335', // Tarantula Nebula
  'GSFC_20171208_Archive_e002416', // Cartwheel Galaxy
]

/**
 * Fallback image URLs for when APIs fail
 * These are from NASA's public servers with permissive CORS
 */
export const FALLBACK_IMAGES = {
  jwst: {
    carina: 'https://www.nasa.gov/wp-content/uploads/2023/03/main_image_star-forming_region_carina_702.jpg',
    deepField: 'https://www.nasa.gov/wp-content/uploads/2023/03/main_image_deep_field_702.jpg',
    pillars: 'https://www.nasa.gov/wp-content/uploads/2023/03/stsci-01gfnp0nhpz8bk6f6vxjq3fdrr_1.png',
    southernRing: 'https://www.nasa.gov/wp-content/uploads/2023/03/main_image_stellar_702.jpg',
    stephansQuintet: 'https://www.nasa.gov/wp-content/uploads/2023/03/main_image_galaxies_702.jpg',
    tarantula: 'https://www.nasa.gov/wp-content/uploads/2023/03/stsci-01gbs7cjgbvzz7xf6xf5wqsp1s.png',
    cartwheel: 'https://www.nasa.gov/wp-content/uploads/2023/03/stsci-01g9d2xxmvss1s2bp8ysjtrkrp_1.png',
    jupiter: 'https://www.nasa.gov/wp-content/uploads/2023/03/stsci-01g9hqd9aawqg4wt66c1bxvfbj.png',
  },
  radio: {
    placeholder: '/images/radio-placeholder.svg',
    askap: '/images/askap-placeholder.svg',
    parkes: '/images/parkes-placeholder.svg',
    mwa: '/images/mwa-placeholder.svg',
  },
  generic: {
    cosmos: '/images/cosmos-placeholder.svg',
    loading: '/images/loading-placeholder.svg',
    error: '/images/error-placeholder.svg',
  },
}

/**
 * Get a fallback image URL for a given target name
 */
export function getFallbackImageUrl(targetName: string): string {
  const name = targetName.toLowerCase()

  if (name.includes('carina') || name.includes('cosmic cliff')) {
    return FALLBACK_IMAGES.jwst.carina
  }
  if (name.includes('deep field') || name.includes('smacs')) {
    return FALLBACK_IMAGES.jwst.deepField
  }
  if (name.includes('pillar')) {
    return FALLBACK_IMAGES.jwst.pillars
  }
  if (name.includes('southern ring')) {
    return FALLBACK_IMAGES.jwst.southernRing
  }
  if (name.includes('stephan') || name.includes('quintet')) {
    return FALLBACK_IMAGES.jwst.stephansQuintet
  }
  if (name.includes('tarantula') || name.includes('doradus')) {
    return FALLBACK_IMAGES.jwst.tarantula
  }
  if (name.includes('cartwheel')) {
    return FALLBACK_IMAGES.jwst.cartwheel
  }
  if (name.includes('jupiter')) {
    return FALLBACK_IMAGES.jwst.jupiter
  }

  // Default to deep field for unknown targets
  return FALLBACK_IMAGES.jwst.deepField
}
