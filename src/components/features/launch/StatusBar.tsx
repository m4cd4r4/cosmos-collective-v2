'use client';

import { useUpcomingLaunches } from '@/lib/queries/launches';
import { Badge } from '@/components/ui/Badge';
import { Rocket, Calendar, Radio } from 'lucide-react';
import { useUserPreferences } from '@/lib/stores/preferences';
import { isToday, isThisWeek, parseISO } from 'date-fns';

export function StatusBar(): JSX.Element {
  const { data: launches, isLoading } = useUpcomingLaunches(50);
  const { ageMode } = useUserPreferences();

  if (isLoading || !launches) {
    return (
      <div className="border-y border-nebula bg-cosmos py-4">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-6">
            <div className="h-8 w-32 animate-pulse rounded bg-nebula" />
            <div className="h-8 w-32 animate-pulse rounded bg-nebula" />
            <div className="h-8 w-32 animate-pulse rounded bg-nebula" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const liveLaunches = launches.filter((l) => l.webcastLive).length;
  const launchesToday = launches.filter((l) => isToday(parseISO(l.net))).length;
  const launchesThisWeek = launches.filter((l) => isThisWeek(parseISO(l.net))).length;
  const totalUpcoming = launches.length;

  const stats = [
    {
      icon: Radio,
      label: ageMode === 'explorer' ? 'Live Now' : 'Live',
      value: liveLaunches,
      variant: 'live' as const,
      show: liveLaunches > 0,
    },
    {
      icon: Rocket,
      label: ageMode === 'explorer' ? 'Launches Today' : 'Today',
      value: launchesToday,
      variant: 'upcoming' as const,
      show: launchesToday > 0,
    },
    {
      icon: Calendar,
      label: ageMode === 'explorer' ? 'This Week' : 'This Week',
      value: launchesThisWeek,
      variant: 'success' as const,
      show: true,
    },
  ];

  // If explorer mode, simplify
  const displayStats = ageMode === 'explorer' ? stats.slice(0, 2) : stats;

  return (
    <div className="border-y border-nebula bg-cosmos/50 backdrop-blur-sm">
      <div className="container-custom py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {displayStats
            .filter((stat) => stat.show)
            .map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-2"
                >
                  <Icon
                    className={`h-5 w-5 ${
                      stat.variant === 'live'
                        ? 'text-mars-red'
                        : stat.variant === 'upcoming'
                        ? 'text-plasma-blue'
                        : 'text-aurora-teal'
                    }`}
                  />
                  <span className="font-medium text-starlight">
                    {stat.value}
                  </span>
                  <span className="text-sm text-stardust">{stat.label}</span>
                </div>
              );
            })}

          {/* Total Upcoming (Mission Control only) */}
          {ageMode === 'missionControl' && (
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-nebula-purple" />
              <span className="font-medium text-starlight">{totalUpcoming}</span>
              <span className="text-sm text-stardust">Upcoming</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
