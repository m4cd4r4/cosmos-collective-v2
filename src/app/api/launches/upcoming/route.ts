import { NextRequest, NextResponse } from 'next/server';
import { getLL2Client } from '@/lib/api/launch-library';
import { transformLaunch } from '@/lib/utils/transforms';
import { getUpcomingLaunches } from '@/lib/data/mock-launches';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * GET /api/launches/upcoming
 * Returns upcoming launches
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    const client = getLL2Client();
    const response = await client.getUpcomingLaunches({ limit, offset });

    const launches = response.results.map(transformLaunch);

    return NextResponse.json(launches, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch upcoming launches from API, using mock data:', error);

    // Fallback to mock data
    const mockLaunches = getUpcomingLaunches(limit, offset);

    return NextResponse.json(mockLaunches, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Data-Source': 'mock',
      },
    });
  }
}
