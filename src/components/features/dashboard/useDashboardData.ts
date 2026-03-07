'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getISSPosition,
  getAstronomyPictureOfTheDay,
  getSolarWeather,
  getAllCurrentEvents,
  getUpcomingEvents,
  type APODData,
} from '@/services/real-time-events'
import type { AstronomicalEvent } from '@/types/astronomy'

export interface DashboardData {
  apod: APODData | null
  issPosition: { lat: number; lon: number; alt: number } | null
  issVelocity: number | null
  issError: boolean
  solarWeather: { flareLevel: string; currentFlux: number } | null
  events: AstronomicalEvent[]
  upcomingEvents: AstronomicalEvent[]
  utcTime: string
  isLoading: boolean
}

export function useDashboardData(): DashboardData {
  const [apod, setApod] = useState<APODData | null>(null)
  const [issPosition, setIssPosition] = useState<DashboardData['issPosition']>(null)
  const [issVelocity, setIssVelocity] = useState<number | null>(null)
  const [issError, setIssError] = useState(false)
  const [solarWeather, setSolarWeather] = useState<DashboardData['solarWeather']>(null)
  const [events, setEvents] = useState<AstronomicalEvent[]>([])
  const [upcomingEvents] = useState(() => getUpcomingEvents(10))
  const [utcTime, setUtcTime] = useState(() => formatUTC())
  const [isLoading, setIsLoading] = useState(true)

  const fetchISS = useCallback(async () => {
    const result = await getISSPosition()
    if (result.success && result.data) {
      setIssPosition({
        lat: result.data.position.lat,
        lon: result.data.position.lon,
        alt: result.data.position.alt,
      })
      setIssVelocity(result.data.velocity)
      setIssError(false)
    } else {
      setIssError(true)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    async function init() {
      const [issResult, apodResult, solarResult, eventsResult] = await Promise.allSettled([
        getISSPosition(),
        getAstronomyPictureOfTheDay(),
        getSolarWeather(),
        getAllCurrentEvents(),
      ])

      if (issResult.status === 'fulfilled' && issResult.value.success && issResult.value.data) {
        setIssPosition({
          lat: issResult.value.data.position.lat,
          lon: issResult.value.data.position.lon,
          alt: issResult.value.data.position.alt,
        })
        setIssVelocity(issResult.value.data.velocity)
      } else {
        setIssError(true)
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

      if (eventsResult.status === 'fulfilled' && eventsResult.value.success && eventsResult.value.data) {
        setEvents(eventsResult.value.data)
      }

      setIsLoading(false)
    }

    init()

    // ISS polling every 30s
    const issInterval = setInterval(fetchISS, 30000)
    return () => clearInterval(issInterval)
  }, [fetchISS])

  // UTC clock — ticks every second
  useEffect(() => {
    const interval = setInterval(() => setUtcTime(formatUTC()), 1000)
    return () => clearInterval(interval)
  }, [])

  return { apod, issPosition, issVelocity, issError, solarWeather, events, upcomingEvents, utcTime, isLoading }
}

function formatUTC(): string {
  const now = new Date()
  return now.toISOString().slice(11, 19)
}
