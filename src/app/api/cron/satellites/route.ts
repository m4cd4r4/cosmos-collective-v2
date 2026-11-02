import { NextRequest, NextResponse } from 'next/server'
import { refreshStored } from '@/lib/satellites/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/** Called by the Vercel cron in vercel.json, which sends CRON_SECRET as a bearer token. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return NextResponse.json(await refreshStored())
  } catch (err) {
    console.error('Satellites refresh error:', err)
    return NextResponse.json({ error: 'Refresh failed' }, { status: 502 })
  }
}
