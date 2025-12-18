'use client'

/**
 * Launch Calendar Page
 * Displays upcoming space launches with detailed information
 */

import { useNextLaunch, useUpcomingLaunches } from '@/lib/queries/launches'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { format, parseISO } from 'date-fns'
import { Rocket, MapPin, Calendar, ExternalLink } from 'lucide-react'

export default function LaunchPage() {
  const { data: nextLaunch, isLoading: isLoadingNext, error: nextError } = useNextLaunch()
  const {
    data: upcomingLaunches,
    isLoading: isLoadingUpcoming,
    error: upcomingError,
  } = useUpcomingLaunches(10)

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 font-display">
          Launch Calendar
        </h1>
        <p className="text-gray-300">
          Track every space launch, past, present, and future
        </p>
      </div>

      {/* Next Launch Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4 font-display">
          Next Launch
        </h2>

        {isLoadingNext && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Spinner size="large" />
            </CardContent>
          </Card>
        )}

        {nextError && (
          <Card variant="elevated">
            <CardContent className="py-8 text-center">
              <p className="text-red-400">Failed to load next launch</p>
            </CardContent>
          </Card>
        )}

        {nextLaunch && (
          <Card variant="elevated" className="border-rocket-orange/20">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2 text-white">
                    {nextLaunch.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-gray-400">
                    <Rocket className="h-4 w-4" />
                    {nextLaunch.provider.name} • {nextLaunch.vehicle.name}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    nextLaunch.status.name === 'Go'
                      ? 'success'
                      : nextLaunch.status.name === 'TBD'
                      ? 'tbd'
                      : 'upcoming'
                  }
                >
                  {nextLaunch.status.abbrev}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Launch Time */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-rocket-orange mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Launch Time</p>
                    <p className="text-sm text-gray-400">
                      {format(parseISO(nextLaunch.net), 'PPpp')}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-cosmos-cyan mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Location</p>
                    <p className="text-sm text-gray-400">
                      {nextLaunch.launchSite.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission Description */}
              {nextLaunch.mission && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-white mb-2">Mission</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {typeof nextLaunch.mission.description === 'string'
                      ? nextLaunch.mission.description
                      : nextLaunch.mission.description?.explorer || nextLaunch.mission.description?.cadet || ''}
                  </p>
                </div>
              )}

              {/* Webcast Link */}
              {nextLaunch.webcastUrl && (
                <div className="mt-6">
                  <Button variant="primary" size="md" asChild>
                    <a
                      href={nextLaunch.webcastUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Watch Webcast
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* Upcoming Launches Section */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-4 font-display">
          Upcoming Launches
        </h2>

        {isLoadingUpcoming && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="large" />
          </div>
        )}

        {upcomingError && (
          <Card variant="elevated">
            <CardContent className="py-8 text-center">
              <p className="text-red-400">Failed to load upcoming launches</p>
            </CardContent>
          </Card>
        )}

        {upcomingLaunches && (
          <div className="grid gap-4">
            {upcomingLaunches.map((launch) => (
              <Card
                key={launch.id}
                variant="default"
                className="hover:border-rocket-orange/30 transition-colors cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-white">{launch.name}</CardTitle>
                      <CardDescription className="mt-1 text-gray-400">
                        {launch.provider.name} • {launch.vehicle.name}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        launch.status.name === 'Go'
                          ? 'success'
                          : launch.status.name === 'TBD'
                          ? 'tbd'
                          : 'upcoming'
                      }
                    >
                      {launch.status.abbrev}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-rocket-orange" />
                      {format(parseISO(launch.net), 'PPp')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-cosmos-cyan" />
                      <span className="truncate">{launch.launchSite.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
