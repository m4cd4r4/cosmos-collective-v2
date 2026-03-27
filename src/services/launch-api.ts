import axios from 'axios'
import { getUpcomingLaunches } from './real-time-events'

const LL2_BASE = 'https://ll.thespacedevs.com/2.3.0'
const LAUNCHES_URL = `${LL2_BASE}/launches/upcoming/?limit=10&mode=detailed`

export interface LiveLaunch {
  id: string
  name: string
  net: string
  windowStart: string
  windowEnd: string
  status: {
    id: number
    name: string
    abbrev: string
  }
  rocket: string
  missionName: string | null
  missionDescription: string | null
  missionType: string | null
  padName: string
  padLocation: string
  provider: string
  providerType: string | null
  imageUrl: string | null
  webcastUrl: string | null
  webcastLive: boolean
}

interface LL2Response {
  count: number
  results: LL2Launch[]
}

interface LL2Launch {
  id: string
  name: string
  net: string
  window_start: string
  window_end: string
  status: { id: number; name: string; abbrev: string }
  rocket?: { configuration?: { full_name?: string; name?: string } }
  mission?: { name?: string; description?: string; type?: string }
  pad?: { name?: string; location?: { name?: string } }
  launch_service_provider?: { name?: string; type?: string }
  image?: string | null
  webcast_live?: boolean
  vidURLs?: { url: string }[]
}

function transformLaunch(raw: LL2Launch): LiveLaunch {
  const webcastUrl = raw.vidURLs?.[0]?.url ?? null
  return {
    id: raw.id,
    name: raw.name,
    net: raw.net,
    windowStart: raw.window_start,
    windowEnd: raw.window_end,
    status: {
      id: raw.status.id,
      name: raw.status.name,
      abbrev: raw.status.abbrev,
    },
    rocket: raw.rocket?.configuration?.full_name ?? raw.rocket?.configuration?.name ?? 'Unknown',
    missionName: raw.mission?.name ?? null,
    missionDescription: raw.mission?.description ?? null,
    missionType: raw.mission?.type ?? null,
    padName: raw.pad?.name ?? 'Unknown',
    padLocation: raw.pad?.location?.name ?? 'Unknown',
    provider: raw.launch_service_provider?.name ?? 'Unknown',
    providerType: raw.launch_service_provider?.type ?? null,
    imageUrl: raw.image ?? null,
    webcastUrl,
    webcastLive: raw.webcast_live ?? false,
  }
}

function hardcodedFallback(): LiveLaunch[] {
  return getUpcomingLaunches().map((l, i) => ({
    id: `fallback-${i}`,
    name: l.name,
    net: l.date,
    windowStart: l.date,
    windowEnd: l.date,
    status: { id: 0, name: 'To Be Determined', abbrev: 'TBD' },
    rocket: l.rocket,
    missionName: l.mission,
    missionDescription: l.description,
    missionType: null,
    padName: l.site,
    padLocation: l.site,
    provider: l.provider,
    providerType: null,
    imageUrl: null,
    webcastUrl: l.webcastUrl ?? null,
    webcastLive: false,
  }))
}

export async function fetchUpcomingLaunches(): Promise<LiveLaunch[]> {
  try {
    const response = await axios.get<LL2Response>(LAUNCHES_URL, { timeout: 10_000 })
    const launches = response.data.results.map(transformLaunch)
    return launches.length > 0 ? launches : hardcodedFallback()
  } catch {
    return hardcodedFallback()
  }
}
