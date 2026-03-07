'use client'

import { useState, useEffect, useCallback } from 'react'
import { getISSPosition, getAstronomyPictureOfTheDay, getSolarWeather, getUpcomingEvents } from '@/services/real-time-events'
import type { APODData } from '@/services/real-time-events'
import type { AstronomicalEvent } from '@/types/astronomy'

export interface TelemetryData {
  issPosition: { lat: number; lon: number } | null
  apod: APODData | null
  solarWeather: { flareLevel: string; currentFlux: number } | null
  upcomingEvents: AstronomicalEvent[]
  utcTime: string
  isLoading: boolean
}

function formatUTC(): string {
  return new Date().toISOString().slice(11, 19)
}

export function useTelemetryData(): TelemetryData {
  const [issPosition, setIssPosition] = useState<TelemetryData['issPosition']>(null)
  const [apod, setApod] = useState<APODData | null>(null)
  const [solarWeather, setSolarWeather] = useState<TelemetryData['solarWeather']>(null)
  const [upcomingEvents] = useState(() => getUpcomingEvents(5))
  const [utcTime, setUtcTime] = useState(formatUTC)
  const [isLoading, setIsLoading] = useState(true)

  const fetchISS = useCallback(async () => {
    const result = await getISSPosition()
    if (result.success && result.data) {
      setIssPosition({ lat: result.data.position.lat, lon: result.data.position.lon })
    }
  }, [])

  useEffect(() => {
    async function init() {
      const [issResult, apodResult, solarResult] = await Promise.allSettled([
        getISSPosition(),
        getAstronomyPictureOfTheDay(),
        getSolarWeather(),
      ])

      if (issResult.status === 'fulfilled' && issResult.value.success && issResult.value.data) {
        setIssPosition({ lat: issResult.value.data.position.lat, lon: issResult.value.data.position.lon })
      }
      if (apodResult.status === 'fulfilled' && apodResult.value.success && apodResult.value.data) {
        setApod(apodResult.value.data)
      }
      if (solarResult.status === 'fulfilled' && solarResult.value.success && solarResult.value.data) {
        setSolarWeather({
          flareLevel: solarResult.value.data.flareLevel,
          currentFlux: solarResult.value.data.currentFlux,
        })
      }
      setIsLoading(false)
    }

    init()

    // Poll ISS every 30s
    const interval = setInterval(fetchISS, 30000)
    return () => clearInterval(interval)
  }, [fetchISS])

  // UTC clock — ticks every second
  useEffect(() => {
    const interval = setInterval(() => setUtcTime(formatUTC()), 1000)
    return () => clearInterval(interval)
  }, [])

  return { issPosition, apod, solarWeather, upcomingEvents, utcTime, isLoading }
}
