'use client';

import Link from 'next/link';
import { useUpcomingLaunches } from '@/lib/queries/launches';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { LaunchCountdown } from './LaunchCountdown';
import { Rocket, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useUserPreferences } from '@/lib/stores/preferences';
import { format, parseISO } from 'date-fns';

export function UpcomingLaunches(): JSX.Element {
  const { data: launches, isLoading, error } = useUpcomingLaunches(6);
  const { ageMode } = useUserPreferences();

  return (
    <section className="container-custom py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-starlight md:text-4xl">
            {ageMode === 'explorer' ? 'More Rocket Launches' : 'Upcoming Launches'}
          </h2>
          <p className="mt-2 text-stardust">
            {ageMode === 'explorer'
              ? 'See what other rockets are launching soon!'
              : 'Track the next space missions'}
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/launches">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="large" />
        </div>
      )}

      {error && (
        <Card variant="elevated">
          <CardContent className="py-8 text-center">
            <p className="text-red-400">Failed to load upcoming launches</p>
          </CardContent>
        </Card>
      )}

      {launches && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {launches.slice(1, 7).map((launch) => (
            <Card key={launch.id} variant="interactive">
              <Link href={`/launches/${launch.id}`}>
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <Badge
                      variant={
                        launch.status.name === 'Go'
                          ? 'success'
                          : launch.status.name === 'TBD'
                          ? 'tbd'
                          : 'upcoming'
                      }
                      size="small"
                    >
                      {launch.status.abbrev}
                    </Badge>
                    {launch.webcastLive && <Badge variant="live" pulse size="small">LIVE</Badge>}
                  </div>

                  <CardTitle className="line-clamp-2">{launch.name}</CardTitle>

                  <CardDescription className="flex items-center gap-1">
                    <Rocket className="h-3.5 w-3.5" />
                    {launch.provider.name}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Countdown */}
                  <div className="mb-4">
                    <LaunchCountdown
                      targetDate={launch.net}
                      size={ageMode === 'explorer' ? 'medium' : 'small'}
                      showLabels={ageMode !== 'missionControl'}
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-stardust">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-plasma-blue" />
                      <span>{format(parseISO(launch.net), 'PPp')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-aurora-teal" />
                      <span className="truncate">{launch.launchSite.name}</span>
                    </div>
                  </div>

                  {/* Mission Description (Cadet & Mission Control only) */}
                  {launch.mission && ageMode !== 'explorer' && (
                    <p className="mt-3 line-clamp-2 text-sm text-stardust">
                      {ageMode === 'cadet'
                        ? launch.mission.description.cadet
                        : launch.mission.description.missionControl}
                    </p>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* View More Button */}
      {launches && launches.length > 6 && (
        <div className="mt-8 text-center">
          <Button variant="secondary" size="lg" asChild>
            <Link href="/launches">
              View All {launches.length}+ Launches
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
