'use client'

import { useLiveTelemetry } from '@/hooks/useLiveTelemetry'

export type { LiveTelemetry as TelemetryData } from '@/hooks/useLiveTelemetry'
export type { APODData } from '@/services/real-time-events'

export const useTelemetryData = useLiveTelemetry
