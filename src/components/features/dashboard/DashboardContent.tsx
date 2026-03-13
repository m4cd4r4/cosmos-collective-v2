'use client'

import { useCosmosStore } from '@/store/cosmos-store'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { getFeaturedRadioObservations } from '@/services/australian-telescopes'
import { formatCountdown } from '@/lib/event-utils'
import { useDashboardData } from './useDashboardData'
import { HeroBanner } from './HeroBanner'
import { TelemetryStrip } from './TelemetryStrip'
import { ISSTracker } from './ISSTracker'
import { EventsTimeline } from './EventsTimeline'
import { ObservationHighlights } from './ObservationHighlights'
import { QuickLinksGrid } from './QuickLinksGrid'

function getNextEvent(events: { eventTime: string; title: string }[]): { title: string; eventTime: string } | null {
  const now = Date.now()
  return events.find(e => new Date(e.eventTime).getTime() > now) ?? events[0] ?? null
}

export function DashboardContent() {
  const data = useDashboardData()
  const { favorites } = useCosmosStore()

  const allObservations = [...getFeaturedJWSTImages(), ...getFeaturedRadioObservations()]
  const nextEvent = getNextEvent(data.upcomingEvents)

  return (
    <div className="container mx-auto px-3 sm:px-4 overflow-x-hidden">
      <HeroBanner
        apod={data.apod}
        utcTime={data.utcTime}
        issPosition={data.issPosition}
        isLoading={data.isLoading}
      />

      <TelemetryStrip
        issPosition={data.issPosition}
        solarWeather={data.solarWeather}
        nextEventTitle={nextEvent?.title ?? ''}
        nextEventCountdown={nextEvent ? formatCountdown(nextEvent.eventTime) : ''}
        observationCount={allObservations.length}
        favouriteCount={favorites.length}
      />

      <ISSTracker
        issPosition={data.issPosition}
        issVelocity={data.issVelocity}
        issError={data.issError}
      />

      <EventsTimeline
        events={data.events}
        upcomingEvents={data.upcomingEvents}
      />

      <ObservationHighlights />

      <QuickLinksGrid />
    </div>
  )
}
