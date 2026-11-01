'use client'

import { useLiveTelemetry } from '@/hooks/useLiveTelemetry'

export type { LiveTelemetry as TelemetryData } from '@/hooks/useLiveTelemetry'

export const useTelemetryData = useLiveTelemetry
