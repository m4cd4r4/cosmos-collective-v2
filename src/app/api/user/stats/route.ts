/**
 * User Stats API Route
 * Fetches user's citizen science statistics
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user stats
    const userStats = await prisma.userStats.findUnique({
      where: { userId: session.user.id },
    })

    // Get recent classifications
    const recentClassifications = await prisma.classification.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        projectName: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Get earned badges
    const badgeAwards = await prisma.badgeAward.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    })

    // Get favorite projects
    const favoriteProjects = await prisma.userFavoriteProject.findMany({
      where: { userId: session.user.id },
      orderBy: { addedAt: 'desc' },
    })

    // Get classification counts by project
    const projectStats = await prisma.classification.groupBy({
      by: ['projectId', 'projectName'],
      where: { userId: session.user.id },
      _count: true,
    })

    return NextResponse.json({
      classificationsCount: userStats?.classificationsCount || 0,
      projectsContributed: userStats?.projectsContributed || 0,
      hoursSpent: Math.round((userStats?.totalTimeSpent || 0) / 3600 * 10) / 10,
      rank: userStats?.currentRank || 0,
      currentStreak: userStats?.currentStreak || 0,
      longestStreak: userStats?.longestStreak || 0,
      accuracyScore: userStats?.accuracyScore,
      badges: badgeAwards.map((award) => ({
        id: award.badge.id,
        name: award.badge.name,
        description: award.badge.description,
        icon: award.badge.icon,
        rarity: award.badge.rarity,
        earnedAt: award.earnedAt,
      })),
      recentActivity: recentClassifications.map((c) => ({
        id: c.id,
        projectName: c.projectName,
        timestamp: c.createdAt,
      })),
      favoriteProjects: favoriteProjects.map((fp) => ({
        projectId: fp.projectId,
        projectName: fp.projectName,
        completeness: projectStats.find((ps) => ps.projectId === fp.projectId)?._count || 0,
      })),
      projectStats: projectStats.map((ps) => ({
        projectId: ps.projectId,
        projectName: ps.projectName,
        count: ps._count,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
