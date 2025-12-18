'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Rocket, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agency } from '@/types/agency';

export interface AgencyCardProps {
  agency: Agency;
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * AgencyCard component for displaying agency information
 *
 * Features:
 * - Agency logo
 * - Name and country
 * - Launch statistics
 * - Success rate badge
 * - Founded year
 * - Type badge (government, commercial, etc.)
 * - Links to detail page
 * - Two variants: default and compact
 */
export function AgencyCard({ agency, variant = 'default', className }: AgencyCardProps): JSX.Element {
  const isCompact = variant === 'compact';

  // Calculate success rate
  const successRate = agency.totalLaunches > 0
    ? Math.round((agency.successfulLaunches / agency.totalLaunches) * 100)
    : 0;

  // Get success rate color
  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 90) return 'text-aurora-teal';
    if (rate >= 75) return 'text-solar-gold';
    return 'text-mars-red';
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: string): 'upcoming' | 'success' | 'tbd' => {
    switch (type) {
      case 'government':
        return 'tbd';
      case 'commercial':
        return 'success';
      case 'international':
        return 'upcoming';
      default:
        return 'tbd';
    }
  };

  return (
    <Link href={`/agencies/${agency.id}`}>
      <Card
        variant="interactive"
        className={cn(isCompact && 'p-4', className)}
      >
        <CardHeader className={cn(isCompact && 'p-0 pb-3')}>
          {/* Agency Logo */}
          <div className="mb-4 flex items-center justify-center">
            <div className="relative h-24 w-24 rounded-lg bg-nebula p-3">
              <Image
                src={agency.logo}
                alt={`${agency.name} logo`}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            </div>
          </div>

          {/* Agency Name */}
          <CardTitle className={cn('text-center', isCompact ? 'text-lg' : 'text-xl')}>
            {agency.shortName || agency.name}
          </CardTitle>

          {/* Country and Type */}
          <CardDescription className="flex items-center justify-center gap-2">
            <span>{agency.country}</span>
            <Badge variant={getTypeBadgeVariant(agency.type)} className="capitalize">
              {agency.type}
            </Badge>
          </CardDescription>
        </CardHeader>

        {!isCompact && (
          <CardContent>
            {/* Launch Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-starlight">{agency.totalLaunches}</div>
                <div className="text-xs text-stardust">Total Launches</div>
              </div>

              <div className="text-center">
                <div className={cn('text-2xl font-bold', getSuccessRateColor(successRate))}>
                  {successRate}%
                </div>
                <div className="text-xs text-stardust">Success Rate</div>
              </div>
            </div>

            {/* Success/Fail/Pending */}
            <div className="flex items-center justify-around text-sm">
              <div className="flex items-center gap-1 text-aurora-teal">
                <CheckCircle className="h-4 w-4" />
                <span>{agency.successfulLaunches}</span>
              </div>

              <div className="flex items-center gap-1 text-mars-red">
                <XCircle className="h-4 w-4" />
                <span>{agency.failedLaunches}</span>
              </div>

              <div className="flex items-center gap-1 text-solar-gold">
                <Clock className="h-4 w-4" />
                <span>{agency.pendingLaunches}</span>
              </div>
            </div>

            {/* Founded Year */}
            {agency.foundedYear && (
              <div className="mt-4 text-center text-xs text-stardust">
                Founded {agency.foundedYear}
              </div>
            )}

            {/* Vehicles Count */}
            {agency.vehicles && agency.vehicles.length > 0 && (
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-stardust">
                <Rocket className="h-3 w-3" />
                <span>{agency.vehicles.length} {agency.vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}</span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
