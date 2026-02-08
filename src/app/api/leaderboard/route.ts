/**
 * Leaderboard API Route
 * Returns top users by classification count
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || 'all-time'
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build where clause based on timeframe
    let dateFilter: any = {}
    const now = new Date()

    if (timeframe === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { lastClassificationAt: { gte: weekAgo } }
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = { lastClassificationAt: { gte: monthAgo } }
    }

    // Get top users
    const topUsers = await prisma.userStats.findMany({
      where: {
        classificationsCount: { gt: 0 },
        ...dateFilter,
      },
      orderBy: {
        classificationsCount: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            user: {
              select: {
                badgeAwards: true,
              },
            },
          },
        },
      },
    })

    // Get badge counts for each user
    const userIds = topUsers.map((u) => u.userId)
    const badgeCounts = await prisma.badgeAward.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: true,
    })

    const badgeCountMap = new Map(badgeCounts.map((bc) => [bc.userId, bc._count]))

    // Format leaderboard
    const leaderboard = topUsers.map((userStat, index) => ({
      rank: index + 1,
      userId: userStat.user.id,
      username: userStat.user.name || 'Anonymous',
      avatar: userStat.user.image,
      classificationsCount: userStat.classificationsCount,
      projectsContributed: userStat.projectsContributed,
      currentStreak: userStat.currentStreak,
      currentRank: userStat.currentRank,
      badgeCount: badgeCountMap.get(userStat.userId) || 0,
    }))

    return NextResponse.json({
      leaderboard,
      timeframe,
      generatedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
