import type { Observation, ObjectCategory, WavelengthBand } from '@/types'

/** Observation augmented with canvas rendering data */
export interface PlottedObservation extends Observation {
  /** Canvas x position (computed each frame) */
  x: number
  /** Canvas y position (computed each frame) */
  y: number
  /** Rendered node radius */
  drawR: number
  /** Hex color derived from wavelength band */
  nodeColor: string
}

export type ObservatoryViewMode = 'sky' | 'distance' | 'timeline'

export interface ObservatoryFilters {
  search: string
  telescope: 'all' | 'JWST' | 'Hubble'
  category: 'all' | ObjectCategory
  wavelength: 'all' | WavelengthBand
  distanceMax: number
}
