export interface KeplerPlanetRow {
  pl_name: string
  hostname: string
  pl_rade: number | null
  pl_orbper: number | null
  pl_eqt: number | null
  pl_bmasse: number | null
  pl_insol: number | null
  pl_orbsmax: number | null
  st_teff: number | null
  st_rad: number | null
  st_mass: number | null
  st_lum: number | null
  sy_dist: number | null
  ra: number | null
  dec: number | null
  sy_pnum: number | null
  disc_year: number | null
}

export type PlanetCategory = 'earth' | 'superearth' | 'neptune' | 'jupiter' | 'unknown'

export interface Planet {
  name: string
  rade: number | null
  period: number | null
  eqt: number | null
  mass: number | null
  insol: number | null
  smax: number | null
  year: number | null
  cat: PlanetCategory
  hz: boolean
}

export interface StarSystem {
  name: string
  ra: number | null
  dec: number | null
  teff: number | null
  srad: number | null
  smass: number | null
  slum: number | null
  dist: number | null
  pnum: number | null
  planets: Planet[]
  color: string
  hasEarth: boolean
  hasHZ: boolean
  minPeriod: number
  minYear: number
  // Canvas position (set during render)
  x: number
  y: number
  drawR: number
}

export type ViewMode = 'sky' | 'galaxy' | 'hr'

export interface KeplerFilters {
  size: 'all' | PlanetCategory
  temp: 'all' | 'cool' | 'solar' | 'hot'
  multi: 'all' | 'multi'
  hz: 'all' | 'hz'
  periodMax: number
  yearMin: number
  search: string
}
