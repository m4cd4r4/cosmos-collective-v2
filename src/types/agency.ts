import type { AgeAdaptedContent } from './common';
import type { VehicleSummary } from './vehicle';
import type { LaunchSiteSummary } from './launch';

export interface Agency {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  type: 'government' | 'commercial' | 'international' | 'educational';

  country: string;
  countryCode: string;

  description: string | AgeAdaptedContent;
  foundedYear?: number;
  administrator?: string;
  website?: string;

  logo: string;
  image?: string;

  totalLaunches: number;
  successfulLaunches: number;
  failedLaunches: number;
  pendingLaunches: number;

  vehicles: VehicleSummary[];
  launchSites: LaunchSiteSummary[];
}

export interface AgencySummary {
  id: string;
  name: string;
  shortName?: string;
  logo: string;
  countryCode: string;
}

// Launch Library 2 API response types
export interface LL2Agency {
  id: number;
  name: string;
  abbrev: string;
  type: string;
  country_code: string;
  description: string;
  administrator: string | null;
  founding_year: string | null;
  logo_url: string | null;
  image_url: string | null;
  total_launch_count: number;
  successful_launches: number;
  failed_launches: number;
  pending_launches: number;
}

export interface LL2AgencyResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LL2Agency[];
}
