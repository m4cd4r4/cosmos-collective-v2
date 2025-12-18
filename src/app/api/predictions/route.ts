import { NextResponse } from 'next/server';
import type { ActivePredictionsResponse, RoadClosure, LaunchPrediction } from '@/types/prediction';

export const dynamic = 'force-dynamic';
export const revalidate = 900; // Revalidate every 15 minutes

/**
 * Basic prediction algorithm
 *
 * This is a simple MVP algorithm that will be enhanced with:
 * - Real road closure data from official sources
 * - Historical launch pattern analysis
 * - Machine learning predictions
 * - Integration with Launch Library 2 API
 */
function generatePredictions(): RoadClosure[] {
  const now = new Date();
  const roadClosures: RoadClosure[] = [];

  // Mock road closure data for demonstration
  // In production, this would fetch from:
  // - Cameron County road closure notices
  // - SpaceX official announcements
  // - FAA notices
  // - Community sources (NASASpaceFlight, etc.)

  // Example: Boca Chica road closure (Starship testing)
  const bocaChicaClosure: RoadClosure = {
    id: 'bc-' + Date.now(),
    location: {
      id: 'boca-chica',
      name: 'Boca Chica Beach',
      region: 'Texas',
      country: 'USA',
      relatedSiteId: '143', // Starbase launch site ID from LL2
    },
    startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'scheduled',
    source: 'Cameron County',
    createdAt: now,
    updatedAt: now,
  };

  // Generate prediction for this closure
  bocaChicaClosure.prediction = generatePrediction(bocaChicaClosure);

  roadClosures.push(bocaChicaClosure);

  // Filter to only active/scheduled closures
  return roadClosures.filter(
    (closure) => closure.status === 'scheduled' || closure.status === 'active'
  );
}

/**
 * Generate launch prediction based on road closure data
 */
function generatePrediction(closure: RoadClosure): LaunchPrediction {
  const reasoning: string[] = [];
  let confidence = 0;

  // Algorithm factors (MVP version):

  // 1. Location-based confidence
  if (closure.location.id === 'boca-chica') {
    confidence += 40;
    reasoning.push('Road closure at Boca Chica typically indicates Starship test activity');
  }

  // 2. Duration-based confidence
  const durationHours = (closure.endDate.getTime() - closure.startDate.getTime()) / (1000 * 60 * 60);
  if (durationHours >= 12 && durationHours <= 48) {
    confidence += 25;
    reasoning.push(`Closure duration (${Math.round(durationHours)}h) matches typical test window`);
  }

  // 3. Time of day (launches often in morning/afternoon)
  const startHour = closure.startDate.getHours();
  if (startHour >= 7 && startHour <= 18) {
    confidence += 15;
    reasoning.push('Closure timing aligns with typical launch windows');
  }

  // 4. Source credibility
  if (closure.source === 'Cameron County' || closure.source === 'SpaceX') {
    confidence += 20;
    reasoning.push('Official source increases prediction confidence');
  }

  // Cap confidence at reasonable level for MVP
  confidence = Math.min(confidence, 85);

  return {
    confidence,
    predictedEvent: 'Starship Flight Test',
    predictedVehicle: {
      id: '80',
      name: 'Starship',
      provider: 'SpaceX',
    },
    reasoning,
    algorithmVersion: '1.0.0-mvp',
    generatedAt: new Date(),
  };
}

/**
 * GET /api/predictions
 * Returns active road closure predictions
 */
export async function GET() {
  try {
    const roadClosures = generatePredictions();

    const response: ActivePredictionsResponse = {
      roadClosures,
      lastUpdated: new Date(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Failed to generate predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
