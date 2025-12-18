import type { AgeAdaptedContent } from './common';
import type { AgencySummary } from './agency';
import type { VehicleSummary } from './vehicle';

export interface Launch {
  id: string;
  name: string;
  slug: string;
  status: LaunchStatus;

  // Timing
  net: string; // No Earlier Than (ISO string from API)
  windowStart?: string;
  windowEnd?: string;
  holdReason?: string;

  // Relations
  provider: AgencySummary;
  vehicle: VehicleSummary;
  launchSite: LaunchSiteSummary;
  mission?: Mission;

  // Media
  image?: string;
  webcastUrl?: string;
  webcastLive: boolean;

  // Metadata
  probability?: number; // Weather probability %

  // Age-adapted content
  description: AgeAdaptedContent;

  createdAt: string;
  updatedAt: string;
}

export interface LaunchStatus {
  id: string;
  name: 'Go' | 'TBD' | 'Hold' | 'In Flight' | 'Success' | 'Failure' | 'Partial Failure';
  abbrev: string;
  description: string;
}

export interface Mission {
  id: string;
  name: string;
  type: string;
  orbit?: Orbit;
  description: AgeAdaptedContent;
}

export interface Orbit {
  name: string;
  abbrev: string;
  altitude?: number;
}

export interface LaunchSiteSummary {
  id: string;
  name: string;
  location: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

// Launch Library 2 API response types
export interface LL2Launch {
  id: string;
  name: string;
  slug: string;
  status: {
    id: number;
    name: string;
    abbrev: string;
    description: string;
  };
  net: string;
  window_start: string | null;
  window_end: string | null;
  hold_reason: string | null;
  launch_service_provider: {
    id: number;
    name: string;
    type: string;
    country_code: string;
    logo_url: string | null;
  };
  rocket: {
    id: number;
    configuration: {
      id: number;
      name: string;
      family: string;
      full_name: string;
      variant: string;
      image_url: string | null;
    };
  };
  pad: {
    id: number;
    name: string;
    latitude: string;
    longitude: string;
    location: {
      id: number;
      name: string;
      country_code: string;
    };
  };
  mission: {
    id: number;
    name: string;
    description: string;
    type: string;
    orbit: {
      id: number;
      name: string;
      abbrev: string;
    } | null;
  } | null;
  image: string | null;
  webcast_live: boolean;
  probability: number | null;
  vidURLs: Array<{
    priority: number;
    source: string;
    publisher: string | null;
    title: string | null;
    url: string;
  }>;
}

export interface LL2LaunchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LL2Launch[];
}
