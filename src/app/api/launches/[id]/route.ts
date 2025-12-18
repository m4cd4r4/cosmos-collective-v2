import { NextRequest, NextResponse } from 'next/server';
import { getLL2Client } from '@/lib/api/launch-library';
import { transformLaunch } from '@/lib/utils/transforms';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * GET /api/launches/:id
 * Returns a single launch by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const client = getLL2Client();
    const ll2Launch = await client.getLaunch(id);

    const launch = transformLaunch(ll2Launch);

    return NextResponse.json(launch, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error(`Failed to fetch launch ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Launch not found' },
      { status: 404 }
    );
  }
}
