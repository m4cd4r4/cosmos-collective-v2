'use client'

import { useMemo } from 'react'
import { getFeaturedJWSTImages, getFeaturedHubbleImages } from '@/services/mast-api'
import type { PlottedObservation } from './types'
import { wavelengthToColor, computeNodeRadius } from './utils'

export function useObservatoryData() {
  const { observations, stats } = useMemo(() => {
    const jwst = getFeaturedJWSTImages()
    const hubble = getFeaturedHubbleImages()
    const all = [...jwst, ...hubble]

    const plotted: PlottedObservation[] = all.map(obs => ({
      ...obs,
      x: 0,
      y: 0,
      drawR: computeNodeRadius(obs),
      nodeColor: wavelengthToColor(obs.wavelengthBand),
    }))

    const distances = all
      .map(o => o.distanceLightYears)
      .filter((d): d is number => d != null)

    return {
      observations: plotted,
      stats: {
        total: all.length,
        jwst: jwst.length,
        hubble: hubble.length,
        nebulae: all.filter(o => o.category === 'nebula').length,
        galaxies: all.filter(o => o.category === 'galaxy').length,
        maxDistance: distances.length ? Math.max(...distances) : 1_000_000_000,
      },
    }
  }, [])

  return { observations, stats, status: 'success' as const }
}
