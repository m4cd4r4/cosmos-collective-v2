/**
 * Cosmos Collective - Utility Functions
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SkyCoordinates, SexagesimalCoordinates, WavelengthBand } from '@/types'

// ============================================
// Class Name Utilities
// ============================================

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Coordinate Conversion Utilities
// ============================================

/**
 * Convert decimal degrees to sexagesimal (HMS/DMS) format
 */
export function decimalToSexagesimal(coords: SkyCoordinates): SexagesimalCoordinates {
  // Right Ascension: convert degrees to hours (divide by 15)
  const raHours = coords.ra / 15
  const raH = Math.floor(raHours)
  const raM = Math.floor((raHours - raH) * 60)
  const raS = ((raHours - raH) * 60 - raM) * 60

  // Declination: degrees, minutes, seconds
  const decSign = coords.dec >= 0 ? '+' : '-'
  const decAbs = Math.abs(coords.dec)
  const decD = Math.floor(decAbs)
  const decM = Math.floor((decAbs - decD) * 60)
  const decS = ((decAbs - decD) * 60 - decM) * 60

  return {
    ra: { hours: raH, minutes: raM, seconds: raS },
    dec: { degrees: decD, minutes: decM, seconds: decS, sign: decSign as '+' | '-' },
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  coords: SkyCoordinates,
  format: 'decimal' | 'sexagesimal' = 'sexagesimal'
): string {
  if (format === 'decimal') {
    return `RA: ${coords.ra.toFixed(4)}°, Dec: ${coords.dec >= 0 ? '+' : ''}${coords.dec.toFixed(4)}°`
  }

  const sex = decimalToSexagesimal(coords)
  const raStr = `${sex.ra.hours}h ${sex.ra.minutes}m ${sex.ra.seconds.toFixed(2)}s`
  const decStr = `${sex.dec.sign}${sex.dec.degrees}° ${sex.dec.minutes}' ${sex.dec.seconds.toFixed(1)}"`

  return `RA: ${raStr}, Dec: ${decStr}`
}

/**
 * Calculate angular separation between two sky positions (in degrees)
 */
export function angularSeparation(coord1: SkyCoordinates, coord2: SkyCoordinates): number {
  const ra1 = (coord1.ra * Math.PI) / 180
  const dec1 = (coord1.dec * Math.PI) / 180
  const ra2 = (coord2.ra * Math.PI) / 180
  const dec2 = (coord2.dec * Math.PI) / 180

  const cosAngle =
    Math.sin(dec1) * Math.sin(dec2) +
    Math.cos(dec1) * Math.cos(dec2) * Math.cos(ra1 - ra2)

  return (Math.acos(Math.min(1, Math.max(-1, cosAngle))) * 180) / Math.PI
}

// ============================================
// Astronomy Calculations
// ============================================

/**
 * Convert redshift to distance (simplified Hubble law, for z < 0.1)
 * Returns distance in millions of light years
 */
export function redshiftToDistance(z: number): number {
  const H0 = 70 // Hubble constant in km/s/Mpc
  const c = 299792 // Speed of light in km/s

  // For small z, distance ≈ c * z / H0 in Mpc
  // Convert Mpc to million light years (1 Mpc ≈ 3.26 million light years)
  const distanceMpc = (c * z) / H0
  return distanceMpc * 3.26
}

/**
 * Convert light years to parsecs
 */
export function lightYearsToParsecs(ly: number): number {
  return ly / 3.26156
}

/**
 * Convert parsecs to light years
 */
export function parsecsToLightYears(pc: number): number {
  return pc * 3.26156
}

/**
 * Format large distances for display
 */
export function formatDistance(lightYears: number): string {
  if (lightYears < 1000) {
    return `${lightYears.toFixed(1)} light years`
  } else if (lightYears < 1_000_000) {
    return `${(lightYears / 1000).toFixed(1)} thousand light years`
  } else if (lightYears < 1_000_000_000) {
    return `${(lightYears / 1_000_000).toFixed(1)} million light years`
  } else {
    return `${(lightYears / 1_000_000_000).toFixed(2)} billion light years`
  }
}

// ============================================
// Wavelength Band Utilities
// ============================================

/**
 * Get display info for wavelength bands
 */
export function getWavelengthInfo(band: WavelengthBand): {
  name: string
  wavelengthRange: string
  color: string
  pattern: string
  description: string
} {
  const info: Record<WavelengthBand, ReturnType<typeof getWavelengthInfo>> = {
    radio: {
      name: 'Radio',
      wavelengthRange: '> 1 mm',
      color: '#22c55e',
      pattern: 'spectrum-radio',
      description: 'Longest wavelengths, used by SKA and ASKAP',
    },
    microwave: {
      name: 'Microwave',
      wavelengthRange: '1 mm - 1 m',
      color: '#84cc16',
      pattern: 'spectrum-microwave',
      description: 'Reveals cosmic microwave background',
    },
    infrared: {
      name: 'Infrared',
      wavelengthRange: '700 nm - 1 mm',
      color: '#ef4444',
      pattern: 'spectrum-infrared',
      description: 'JWST\'s primary range, sees through dust',
    },
    optical: {
      name: 'Visible Light',
      wavelengthRange: '400 - 700 nm',
      color: '#f59e0b',
      pattern: 'spectrum-visible',
      description: 'What human eyes can see',
    },
    ultraviolet: {
      name: 'Ultraviolet',
      wavelengthRange: '10 - 400 nm',
      color: '#8b5cf6',
      pattern: 'spectrum-ultraviolet',
      description: 'Hot stars and active galaxies',
    },
    xray: {
      name: 'X-ray',
      wavelengthRange: '0.01 - 10 nm',
      color: '#3b82f6',
      pattern: 'spectrum-xray',
      description: 'Black holes and neutron stars',
    },
    gamma: {
      name: 'Gamma Ray',
      wavelengthRange: '< 0.01 nm',
      color: '#06b6d4',
      pattern: 'spectrum-gamma',
      description: 'Most energetic phenomena',
    },
  }

  return info[band]
}

// ============================================
// Date & Time Utilities
// ============================================

/**
 * Format date for display
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Date(dateString).toLocaleDateString('en-US', options)
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? '' : 's'} ago`
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? '' : 's'} ago`
}

/**
 * Convert to Julian Date
 */
export function toJulianDate(date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()
  const h = date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400

  const a = Math.floor((14 - m) / 12)
  const y2 = y + 4800 - a
  const m2 = m + 12 * a - 3

  const jdn =
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045

  return jdn + h - 0.5
}

// ============================================
// Number Formatting Utilities
// ============================================

/**
 * Format large numbers with SI prefixes
 */
export function formatNumber(num: number, precision: number = 2): string {
  const units = ['', 'K', 'M', 'B', 'T']
  let unitIndex = 0

  while (Math.abs(num) >= 1000 && unitIndex < units.length - 1) {
    num /= 1000
    unitIndex++
  }

  return `${num.toFixed(precision)}${units[unitIndex]}`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// ============================================
// String Utilities
// ============================================

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

// ============================================
// Validation Utilities
// ============================================

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(coords: Partial<SkyCoordinates>): boolean {
  if (coords.ra === undefined || coords.dec === undefined) return false
  if (coords.ra < 0 || coords.ra >= 360) return false
  if (coords.dec < -90 || coords.dec > 90) return false
  return true
}

/**
 * Check if a URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============================================
// Debounce & Throttle
// ============================================

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ============================================
// Local Storage Utilities
// ============================================

/**
 * Safely get item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

// ============================================
// Accessibility Utilities
// ============================================

/**
 * Generate unique IDs for accessibility
 */
let idCounter = 0
export function generateId(prefix: string = 'cosmos'): string {
  return `${prefix}-${++idCounter}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: more)').matches
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return

  const announcer = document.createElement('div')
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.setAttribute('class', 'sr-only')
  announcer.textContent = message

  document.body.appendChild(announcer)
  setTimeout(() => document.body.removeChild(announcer), 1000)
}
