import { NextResponse } from 'next/server';
import { getLL2Client } from '@/lib/api/launch-library';
import { transformLaunch } from '@/lib/utils/transforms';
import { getNextLaunch } from '@/lib/data/mock-launches';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

/**
 * GET /api/launches/next
 * Returns the next upcoming launch
 */
export async function GET() {
  try {
    const client = getLL2Client();
    const response = await client.getUpcomingLaunches({ limit: 1 });

    if (response.results.length === 0) {
      return NextResponse.json(null, { status: 404 });
    }

    const launch = transformLaunch(response.results[0]);

    return NextResponse.json(launch, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Failed to fetch next launch from API, using mock data:', error);

    // Fallback to mock data
    const mockLaunch = getNextLaunch();

    if (!mockLaunch) {
      return NextResponse.json(
        { error: 'No upcoming launches available' },
        { status: 404 }
      );
    }

    return NextResponse.json(mockLaunch, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Data-Source': 'mock',
      },
    });
  }
}
