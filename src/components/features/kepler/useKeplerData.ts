'use client'

import { useState, useEffect } from 'react'
import type { KeplerPlanetRow, StarSystem } from './types'
import { groupByHost } from './utils'

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export function useKeplerData() {
  const [planets, setPlanets] = useState<KeplerPlanetRow[]>([])
  const [stars, setStars] = useState<StarSystem[]>([])
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    fetch('/api/proxy/kepler')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then(data => {
        if (cancelled) return
        if (data.error) throw new Error(data.error)
        const rows = data as KeplerPlanetRow[]
        setPlanets(rows)
        setStars(groupByHost(rows))
        setStatus('success')
      })
      .catch(err => {
        if (cancelled) return
        console.error('Kepler data fetch failed:', err)
        setError(err.message)
        const sample = getSampleData()
        setPlanets(sample)
        setStars(groupByHost(sample))
        setStatus('success')
      })

    return () => { cancelled = true }
  }, [])

  return { planets, stars, status, error }
}

// ── Sample data (11 planets, 5 famous systems) ─────────────────────────────
function getSampleData(): KeplerPlanetRow[] {
  return [
    { pl_name: 'Kepler-22 b',   hostname: 'Kepler-22',   pl_rade: 2.4,  pl_orbper: 289.9,  pl_eqt: 262,  pl_bmasse: null, pl_insol: 1.1,  pl_orbsmax: 0.849, st_teff: 5518, st_rad: 0.979, st_mass: 0.97,  st_lum: 0.79, sy_dist: 190,  ra: 290.97, dec: 47.88, sy_pnum: 1, disc_year: 2011 },
    { pl_name: 'Kepler-452 b',  hostname: 'Kepler-452',  pl_rade: 1.63, pl_orbper: 384.8,  pl_eqt: 265,  pl_bmasse: 5,    pl_insol: 1.1,  pl_orbsmax: 1.046, st_teff: 5757, st_rad: 1.11,  st_mass: 1.04,  st_lum: 1.2,  sy_dist: 430,  ra: 292.16, dec: 44.32, sy_pnum: 1, disc_year: 2015 },
    { pl_name: 'Kepler-186 b',  hostname: 'Kepler-186',  pl_rade: 1.07, pl_orbper: 3.887,  pl_eqt: null, pl_bmasse: null, pl_insol: null, pl_orbsmax: 0.034, st_teff: 3755, st_rad: 0.47,  st_mass: 0.478, st_lum: 0.04, sy_dist: 151,  ra: 296.17, dec: 43.95, sy_pnum: 5, disc_year: 2014 },
    { pl_name: 'Kepler-186 c',  hostname: 'Kepler-186',  pl_rade: 1.25, pl_orbper: 7.267,  pl_eqt: null, pl_bmasse: null, pl_insol: null, pl_orbsmax: 0.052, st_teff: 3755, st_rad: 0.47,  st_mass: 0.478, st_lum: 0.04, sy_dist: 151,  ra: 296.17, dec: 43.95, sy_pnum: 5, disc_year: 2014 },
    { pl_name: 'Kepler-186 d',  hostname: 'Kepler-186',  pl_rade: 1.40, pl_orbper: 13.342, pl_eqt: null, pl_bmasse: null, pl_insol: null, pl_orbsmax: 0.078, st_teff: 3755, st_rad: 0.47,  st_mass: 0.478, st_lum: 0.04, sy_dist: 151,  ra: 296.17, dec: 43.95, sy_pnum: 5, disc_year: 2014 },
    { pl_name: 'Kepler-186 e',  hostname: 'Kepler-186',  pl_rade: 1.27, pl_orbper: 22.407, pl_eqt: null, pl_bmasse: null, pl_insol: null, pl_orbsmax: 0.110, st_teff: 3755, st_rad: 0.47,  st_mass: 0.478, st_lum: 0.04, sy_dist: 151,  ra: 296.17, dec: 43.95, sy_pnum: 5, disc_year: 2014 },
    { pl_name: 'Kepler-186 f',  hostname: 'Kepler-186',  pl_rade: 1.17, pl_orbper: 129.95, pl_eqt: null, pl_bmasse: null, pl_insol: 0.32, pl_orbsmax: 0.356, st_teff: 3755, st_rad: 0.47,  st_mass: 0.478, st_lum: 0.04, sy_dist: 151,  ra: 296.17, dec: 43.95, sy_pnum: 5, disc_year: 2014 },
    { pl_name: 'Kepler-442 b',  hostname: 'Kepler-442',  pl_rade: 1.34, pl_orbper: 112.3,  pl_eqt: 233,  pl_bmasse: null, pl_insol: 0.7,  pl_orbsmax: 0.409, st_teff: 4402, st_rad: 0.598, st_mass: 0.609, st_lum: 0.11, sy_dist: 342,  ra: 294.86, dec: 39.27, sy_pnum: 1, disc_year: 2015 },
    { pl_name: 'Kepler-62 b',   hostname: 'Kepler-62',   pl_rade: 1.31, pl_orbper: 5.714,  pl_eqt: null, pl_bmasse: null, pl_insol: null, pl_orbsmax: 0.055, st_teff: 4925, st_rad: 0.64,  st_mass: 0.69,  st_lum: 0.22, sy_dist: 368,  ra: 289.31, dec: 45.35, sy_pnum: 5, disc_year: 2013 },
    { pl_name: 'Kepler-62 e',   hostname: 'Kepler-62',   pl_rade: 1.61, pl_orbper: 122.39, pl_eqt: null, pl_bmasse: null, pl_insol: 1.2,  pl_orbsmax: 0.427, st_teff: 4925, st_rad: 0.64,  st_mass: 0.69,  st_lum: 0.22, sy_dist: 368,  ra: 289.31, dec: 45.35, sy_pnum: 5, disc_year: 2013 },
    { pl_name: 'Kepler-62 f',   hostname: 'Kepler-62',   pl_rade: 1.41, pl_orbper: 267.29, pl_eqt: null, pl_bmasse: null, pl_insol: 0.41, pl_orbsmax: 0.718, st_teff: 4925, st_rad: 0.64,  st_mass: 0.69,  st_lum: 0.22, sy_dist: 368,  ra: 289.31, dec: 45.35, sy_pnum: 5, disc_year: 2013 },
  ]
}
