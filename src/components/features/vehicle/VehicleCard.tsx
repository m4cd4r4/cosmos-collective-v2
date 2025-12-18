'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Ruler, Scale, Users, Rocket, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/lib/stores/preferences';
import type { Vehicle } from '@/types/vehicle';

export interface VehicleCardProps {
  vehicle: Vehicle;
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * VehicleCard component for displaying vehicle/rocket information
 *
 * Features:
 * - Vehicle image
 * - Name and provider
 * - Key specifications (height, mass, capacity)
 * - Launch statistics
 * - Success rate badge
 * - Status badge (active, retired, development)
 * - Age-adaptive content (fun comparisons for Explorer mode)
 * - Links to detail page
 */
export function VehicleCard({ vehicle, variant = 'default', className }: VehicleCardProps): JSX.Element {
  const { ageMode } = useUserPreferences();
  const isCompact = variant === 'compact';

  // Calculate success rate
  const successRate = vehicle.totalLaunches > 0
    ? Math.round((vehicle.successfulLaunches / vehicle.totalLaunches) * 100)
    : 0;

  // Get success rate color
  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 95) return 'text-aurora-teal';
    if (rate >= 80) return 'text-solar-gold';
    return 'text-mars-red';
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'retired':
        return 'tbd';
      case 'development':
        return 'upcoming';
      case 'planned':
        return 'upcoming';
      default:
        return 'tbd';
    }
  };

  // Get age-adapted height comparison
  const getHeightComparison = (): string => {
    if (!vehicle.specs?.height) return '';

    const height = vehicle.specs.height;

    if (ageMode === 'explorer') {
      if (height < 20) return '🏠 As tall as 4 houses!';
      if (height < 50) return '🗼 As tall as 10 houses!';
      if (height < 100) return '🏢 As tall as a skyscraper!';
      return '🗼 Taller than the Statue of Liberty!';
    }

    return `${height}m tall`;
  };

  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      <Card
        variant="interactive"
        className={cn(isCompact && 'p-4', className)}
      >
        <CardHeader className={cn(isCompact && 'p-0 pb-3')}>
          {/* Vehicle Image */}
          {vehicle.image && (
            <div className="mb-4 flex items-center justify-center">
              <div className="relative h-32 w-full rounded-lg bg-gradient-to-b from-void to-cosmos overflow-hidden">
                <Image
                  src={vehicle.image}
                  alt={`${vehicle.name} rocket`}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
          )}

          {/* Vehicle Name */}
          <CardTitle className={cn('text-center', isCompact ? 'text-lg' : 'text-xl')}>
            {vehicle.name}
          </CardTitle>

          {/* Provider and Status */}
          <CardDescription className="flex flex-col items-center gap-2">
            <span>{vehicle.provider.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(vehicle.status)} className="capitalize">
                {vehicle.status}
              </Badge>
              {vehicle.specs.reusable && (
                <Badge variant="success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Reusable
                </Badge>
              )}
            </div>
          </CardDescription>
        </CardHeader>

        {!isCompact && (
          <CardContent>
            {/* Quick Stats */}
            {vehicle.specs && (
              <div className="space-y-3 mb-4">
                {/* Height */}
                {vehicle.specs.height && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-stardust">
                      <Ruler className="h-4 w-4" />
                      <span>Height</span>
                    </div>
                    <span className="font-medium text-starlight">
                      {getHeightComparison()}
                    </span>
                  </div>
                )}

                {/* Mass */}
                {vehicle.specs.mass && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-stardust">
                      <Scale className="h-4 w-4" />
                      <span>Mass</span>
                    </div>
                    <span className="font-medium text-starlight">
                      {ageMode === 'explorer'
                        ? `${Math.round(vehicle.specs.mass / 1000)}t`
                        : `${vehicle.specs.mass.toLocaleString()} kg`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Launch Statistics */}
            {vehicle.totalLaunches > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-nebula">
                <div className="text-center">
                  <div className="text-2xl font-bold text-starlight">{vehicle.totalLaunches}</div>
                  <div className="text-xs text-stardust">
                    {ageMode === 'explorer' ? 'Flights' : 'Launches'}
                  </div>
                </div>

                <div className="text-center">
                  <div className={cn('text-2xl font-bold', getSuccessRateColor(successRate))}>
                    {successRate}%
                  </div>
                  <div className="text-xs text-stardust">Success</div>
                </div>
              </div>
            )}

            {/* First Flight */}
            {vehicle.firstFlight && (
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-stardust">
                <Rocket className="h-3 w-3" />
                <span>First flight {new Date(vehicle.firstFlight).getFullYear()}</span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
