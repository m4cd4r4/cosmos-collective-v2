import type { AgeAdaptedContent } from './common';
import type { AgencySummary } from './agency';

export interface Vehicle {
  id: string;
  name: string;
  slug: string;
  type: 'rocket' | 'capsule' | 'station' | 'probe' | 'lander';
  status: 'active' | 'retired' | 'development' | 'planned';

  provider: AgencySummary;
  specs: VehicleSpecs;
  description: string | AgeAdaptedContent;

  image?: string;
  silhouette?: string;

  totalLaunches: number;
  successfulLaunches: number;
  failedLaunches: number;
  firstFlight?: Date;
  lastFlight?: Date;

  // Fun comparisons for Explorer/Cadet
  comparisons?: VehicleComparisons;
}

export interface VehicleSpecs {
  height?: number;
  diameter?: number;
  mass?: number;
  massToLEO?: number;
  massToGTO?: number;
  stages?: number;
  boosters?: number;
  reusable: boolean;
  thrust?: number;
  engines?: EngineConfig[];
}

export interface EngineConfig {
  name: string;
  count: number;
  type: string;
  fuel: string;
}

export interface VehicleComparisons {
  heightComparison: string;
  massComparison: string;
  speedComparison: string;
}

export interface VehicleSummary {
  id: string;
  name: string;
  image?: string;
  provider: string;
}

// Launch Library 2 API response types
export interface LL2Vehicle {
  id: number;
  name: string;
  family: string;
  full_name: string;
  variant: string;
  description: string;
  launch_service_provider: {
    id: number;
    name: string;
    type: string;
  };
  maiden_flight: string | null;
  height: number | null;
  diameter: number | null;
  launch_mass: number | null;
  leo_capacity: number | null;
  gto_capacity: number | null;
  to_thrust: number | null;
  reusable: boolean;
  successful_launches: number;
  failed_launches: number;
  pending_launches: number;
  image_url: string | null;
}

export interface LL2VehicleResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LL2Vehicle[];
}
