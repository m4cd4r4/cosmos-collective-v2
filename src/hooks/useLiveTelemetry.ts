'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import {
  getISSPosition,
  getAstronomyPictureOfTheDay,
  getSolarWeather,
  getAllCurrentEvents,
  getUpcomingEvents,
  type APODData,
} from '@/services/real-time-events'
import type { AstronomicalEvent } from '@/types/astronomy'
import { fetchUpcomingLaunches, type LiveLaunch } from '@/services/launch-api'

export type { LiveLaunch } from '@/services/launch-api'

export interface LiveTelemetry {
  issPosition: { lat: number; lon: number; alt: number } | null
  issVelocity: number | null
  issError: boolean
  apod: APODData | null
  solarWeather: { flareLevel: string; currentFlux: number } | null
  events: AstronomicalEvent[]
  upcomingEvents: AstronomicalEvent[]
  launches: LiveLaunch[]
  utcTime: string
  isLoading: boolean
}

function formatUTC(): string {
  return new Date().toISOString().slice(11, 19)
}

export function useLiveTelemetry(): LiveTelemetry {
  const [utcTime, setUtcTime] = useState(formatUTC)

  // ISS position - poll every 30s
  const iss = useQuery({
    queryKey: ['iss-position'],
    queryFn: async () => {
      const result = await getISSPosition()
      if (!result.success || !result.data) throw new Error('ISS unavailable')
      return result.data
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 2,
  })

  // APOD - fetch once, stale for 1 hour
  const apod = useQuery({
    queryKey: ['apod'],
    queryFn: async () => {
      const result = await getAstronomyPictureOfTheDay()
      if (!result.success || !result.data) throw new Error('APOD unavailable')
      return result.data
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })

  // Solar weather - refresh every 5 min
  const solar = useQuery({
    queryKey: ['solar-weather'],
    queryFn: async () => {
      const result = await getSolarWeather()
      if (!result.success || !result.data) throw new Error('Solar unavailable')
      return { flareLevel: result.data.flareLevel, currentFlux: result.data.currentFlux }
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    retry: 1,
  })

  // Events - refresh every 10 min
  const events = useQuery({
    queryKey: ['live-events'],
    queryFn: async () => {
      const result = await getAllCurrentEvents()
      if (!result.success || !result.data) return []
      return result.data
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  })

  // Upcoming launches - refresh every 15 min (API limit: 15 req/hr)
  const launches = useQuery({
    queryKey: ['upcoming-launches'],
    queryFn: fetchUpcomingLaunches,
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 1,
  })

  // Upcoming events (static, computed once)
  const [upcomingEvents] = useState(() => getUpcomingEvents(10))

  // UTC clock
  useEffect(() => {
    const interval = setInterval(() => setUtcTime(formatUTC()), 1000)
    return () => clearInterval(interval)
  }, [])

  const isLoading = iss.isLoading || apod.isLoading || solar.isLoading

  return {
    issPosition: iss.data
      ? { lat: iss.data.position.lat, lon: iss.data.position.lon, alt: iss.data.position.alt }
      : null,
    issVelocity: iss.data?.velocity ?? null,
    issError: iss.isError,
    apod: apod.data ?? null,
    solarWeather: solar.data ?? null,
    events: events.data ?? [],
    upcomingEvents,
    launches: launches.data ?? [],
    utcTime,
    isLoading,
  }
}
