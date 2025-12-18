import type { VehicleSummary } from './vehicle';

export interface RoadClosure {
  id: string;
  location: RoadClosureLocation;
  startDate: Date;
  endDate: Date;
  status: 'scheduled' | 'active' | 'cancelled' | 'completed';
  source: string;
  prediction?: LaunchPrediction;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadClosureLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  relatedSiteId?: string;
}

export interface LaunchPrediction {
  confidence: number;
  predictedEvent: string;
  predictedVehicle?: VehicleSummary;
  reasoning: string[];
  algorithmVersion: string;
  generatedAt: Date;
}

/**
 * Active road closures with predictions (API response)
 */
export interface ActivePredictionsResponse {
  roadClosures: RoadClosure[];
  lastUpdated: Date;
}
