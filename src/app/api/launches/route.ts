import { NextRequest, NextResponse } from 'next/server';
import { getLL2Client } from '@/lib/api/launch-library';
import { transformLaunch } from '@/lib/utils/transforms';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * GET /api/launches
 * Returns all launches with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const client = getLL2Client();
    const response = await client.getUpcomingLaunches({ limit, offset });

    const launches = response.results.map(transformLaunch);

    return NextResponse.json(launches, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Total-Count': String(response.count),
      },
    });
  } catch (error) {
    console.error('Failed to fetch launches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch launches' },
      { status: 500 }
    );
  }
}
