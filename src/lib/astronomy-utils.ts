import type { WavelengthBand } from '@/types'

// ── MJD conversion ───────────────────────────────────────────────────────

export function mjdToDate(mjd: number): Date {
  const jd = mjd + 2400000.5
  const unixTime = (jd - 2440587.5) * 86400000
  return new Date(unixTime)
}

export function mjdToISOString(mjd: number): string {
  return mjdToDate(mjd).toISOString()
}

// ── Wavelength band colors ───────────────────────────────────────────────

const WAVELENGTH_COLORS: Record<string, string> = {
  infrared: '#d4af37',
  optical: '#b088f9',
  radio: '#4af0e2',
  ultraviolet: '#8b5cf6',
  xray: '#3b82f6',
  gamma: '#06b6d4',
  microwave: '#84cc16',
}

export function wavelengthToColor(band: WavelengthBand): string {
  return WAVELENGTH_COLORS[band] ?? '#888888'
}

export function wavelengthToRGB(band: WavelengthBand): [number, number, number] {
  const hex = wavelengthToColor(band)
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}
