/**
 * Classification Submission API Route
 * Handles submitting classifications to Zooniverse and storing them in our database
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createZooniverseClient } from '@/services/zooniverse-client'
import type { ClassificationSubmission } from '@/types/astronomy'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse submission
    const submission: ClassificationSubmission = await request.json()

    // Validate submission
    if (!submission.links?.project || !submission.links?.subjects?.length) {
      return NextResponse.json(
        { error: 'Invalid classification submission' },
        { status: 400 }
      )
    }

    // Get user's Zooniverse token from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { zooniverseToken: true, zooniverseId: true },
    })

    let zooniverseClassificationId: string | null = null
    let submissionError: string | null = null

    // Submit to Zooniverse if user has linked account
    if (user?.zooniverseToken && user?.zooniverseId) {
      try {
        const client = createZooniverseClient(user.zooniverseToken)
        zooniverseClassificationId = await client.submitClassification(submission)
      } catch (error) {
        console.error('Zooniverse submission failed:', error)
        submissionError = error instanceof Error ? error.message : 'Unknown error'
        // Continue to store locally even if Zooniverse submission fails
      }
    }

    // Store classification in our database
    const classification = await prisma.classification.create({
      data: {
        userId: session.user.id,
        zooniverseId: zooniverseClassificationId,
        projectId: submission.links.project,
        projectName: submission.metadata.projectName || 'Unknown Project',
        workflowId: submission.links.workflow,
        subjectId: submission.links.subjects[0],
        taskType: submission.metadata.taskType || 'unknown',
        annotations: submission.annotations as any,
        metadata: submission.metadata as any,
        timeSpent: submission.metadata.timeSpent,
        submittedToZooniverse: !!zooniverseClassificationId,
        submissionError,
      },
    })

    // Update user stats
    await updateUserStats(session.user.id, submission.links.project, submission.metadata.timeSpent)

    // Check and award badges
    await checkAndAwardBadges(session.user.id)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        activityType: 'classification',
        projectId: submission.links.project,
        projectName: submission.metadata.projectName,
        details: {
          classificationId: classification.id,
          taskType: submission.metadata.taskType,
        },
      },
    })

    return NextResponse.json({
      success: true,
      classificationId: classification.id,
      zooniverseId: zooniverseClassificationId,
      submittedToZooniverse: !!zooniverseClassificationId,
    })
  } catch (error) {
    console.error('Classification submission error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit classification' },
      { status: 500 }
    )
  }
}

/**
 * Update user statistics after a classification
 */
async function updateUserStats(userId: string, projectId: string, timeSpent?: number) {
  // Get or create user stats
  let userStats = await prisma.userStats.findUnique({
    where: { userId },
  })

  if (!userStats) {
    userStats = await prisma.userStats.create({
      data: { userId },
    })
  }

  // Count unique projects
  const uniqueProjects = await prisma.classification.groupBy({
    by: ['projectId'],
    where: { userId },
  })

  // Calculate new rank
  const newClassificationCount = userStats.classificationsCount + 1
  const newRank = calculateRank(newClassificationCount)
  const rankIncreased = newRank > userStats.currentRank

  // Check streak
  const now = new Date()
  const lastClassification = userStats.lastClassificationAt
  let currentStreak = userStats.currentStreak

  if (lastClassification) {
    const daysSinceLastClassification =
      (now.getTime() - lastClassification.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceLastClassification <= 1) {
      // Same day or consecutive day
      currentStreak += 1
    } else if (daysSinceLastClassification > 2) {
      // Streak broken
      currentStreak = 1
    }
  } else {
    currentStreak = 1
  }

  // Update stats
  await prisma.userStats.update({
    where: { userId },
    data: {
      classificationsCount: newClassificationCount,
      projectsContributed: uniqueProjects.length,
      totalTimeSpent: userStats.totalTimeSpent + (timeSpent || 0),
      currentRank: newRank,
      currentStreak,
      longestStreak: Math.max(currentStreak, userStats.longestStreak),
      lastClassificationAt: now,
    },
  })

  // Log rank-up activity
  if (rankIncreased) {
    await prisma.activityLog.create({
      data: {
        userId,
        activityType: 'rank_up',
        details: {
          oldRank: userStats.currentRank,
          newRank,
          classificationsCount: newClassificationCount,
        },
      },
    })
  }
}

/**
 * Check if user earned new badges and award them
 */
async function checkAndAwardBadges(userId: string) {
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
  })

  if (!userStats) return

  // Get all badges user hasn't earned yet
  const existingAwards = await prisma.badgeAward.findMany({
    where: { userId },
    select: { badgeId: true },
  })

  const earnedBadgeIds = new Set(existingAwards.map((a) => a.badgeId))

  const allBadges = await prisma.badge.findMany()

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue

    let earned = false

    // Check badge requirements
    switch (badge.requirementType) {
      case 'classification_count':
        earned = userStats.classificationsCount >= (badge.requirementValue || 0)
        break
      case 'project_count':
        earned = userStats.projectsContributed >= (badge.requirementValue || 0)
        break
      case 'streak':
        earned = userStats.longestStreak >= (badge.requirementValue || 0)
        break
      // Add more badge types as needed
    }

    if (earned) {
      await prisma.badgeAward.create({
        data: { userId, badgeId: badge.id },
      })

      await prisma.activityLog.create({
        data: {
          userId,
          activityType: 'badge_earned',
          details: {
            badgeId: badge.id,
            badgeName: badge.name,
          },
        },
      })
    }
  }
}

/**
 * Calculate rank based on classification count
 */
function calculateRank(count: number): number {
  const ranks = [
    { threshold: 0, rank: 0 },
    { threshold: 10, rank: 1 },
    { threshold: 50, rank: 2 },
    { threshold: 100, rank: 3 },
    { threshold: 250, rank: 4 },
    { threshold: 500, rank: 5 },
    { threshold: 1000, rank: 6 },
    { threshold: 2500, rank: 7 },
    { threshold: 5000, rank: 8 },
    { threshold: 7500, rank: 9 },
    { threshold: 10000, rank: 10 },
  ]

  for (let i = ranks.length - 1; i >= 0; i--) {
    if (count >= ranks[i].threshold) {
      return ranks[i].rank
    }
  }

  return 0
}
