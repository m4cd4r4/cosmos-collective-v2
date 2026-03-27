'use client'

import { useLiveTelemetry, type LiveTelemetry } from '@/hooks/useLiveTelemetry'

export type DashboardData = LiveTelemetry

export function useDashboardData(): DashboardData {
  return useLiveTelemetry()
}
