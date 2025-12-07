# Hybrid Citizen Science Implementation Plan

## Overview

This plan outlines a hybrid approach that combines **real scientific contribution** through Zooniverse with **custom gamification features** hosted on our platform.

### Goals
1. Submit classifications to Zooniverse for genuine scientific impact
2. Track user progress locally for ranks, badges, and leaderboards
3. Provide secure authentication via GitHub/Google OAuth
4. Create engaging gamification without compromising scientific integrity

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Interface                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Sign In     │  │ Classify    │  │ Dashboard   │  │ Leaderboard │ │
│  │ (NextAuth)  │  │ (Projects)  │  │ (Progress)  │  │ (Rankings)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API Routes (Next.js)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ /api/auth/* │  │ /api/       │  │ /api/       │  │ /api/       │ │
│  │ (NextAuth)  │  │ classify    │  │ progress    │  │ leaderboard │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────────────┐
│   Zooniverse Panoptes API │   │   Local Database (PostgreSQL)     │
│   (Real Science)          │   │   (Gamification)                  │
│                           │   │                                   │
│   • Submit classifications│   │   • User profiles                 │
│   • Fetch subjects        │   │   • Classification history        │
│   • Get project metadata  │   │   • Ranks & badges                │
│                           │   │   • Streaks & achievements        │
└───────────────────────────┘   └───────────────────────────────────┘
```

---

## Phase 1: Authentication Setup

### 1.1 Install Dependencies

```bash
npm install next-auth @auth/prisma-adapter prisma @prisma/client
```

### 1.2 NextAuth Configuration

**File: `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/citizen-science/signin',
    error: '/citizen-science/error',
  },
})

export { handler as GET, handler as POST }
```

### 1.3 Environment Variables

```env
# .env.local
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
GOOGLE_ID=your_google_oauth_client_id
GOOGLE_SECRET=your_google_oauth_client_secret

# Database (Supabase PostgreSQL recommended)
DATABASE_URL="postgresql://user:password@host:5432/cosmos_collective"

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

---

## Phase 2: Database Schema

### 2.1 Prisma Schema

**File: `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// User model (extended for gamification)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())

  // Gamification fields
  rankId        String?
  totalClassifications Int @default(0)
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastClassificationAt DateTime?

  // Relations
  accounts       Account[]
  sessions       Session[]
  classifications Classification[]
  badges         UserBadge[]
  rank           Rank?     @relation(fields: [rankId], references: [id])
}

// Classification record
model Classification {
  id                  String   @id @default(cuid())
  userId              String
  projectId           String   // e.g., "galaxy-zoo", "planet-hunters"
  projectName         String
  subjectId           String   // Zooniverse subject ID
  answers             Json     // The classification answers
  zooniverseSubmitted Boolean  @default(false)
  zooniverseId        String?  // ID returned from Zooniverse
  createdAt           DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([projectId])
}

// Rank system
model Rank {
  id                 String @id @default(cuid())
  name               String @unique
  displayName        String
  minClassifications Int
  icon               String // Emoji or icon name
  colour             String // Hex colour for display
  description        String

  users User[]

  @@index([minClassifications])
}

// Badge definitions
model Badge {
  id          String @id @default(cuid())
  name        String @unique
  displayName String
  description String
  icon        String
  criteria    Json   // Criteria for earning (parsed by app)
  rarity      String // common, uncommon, rare, epic, legendary

  users UserBadge[]
}

// User earned badges
model UserBadge {
  id       String   @id @default(cuid())
  userId   String
  badgeId  String
  earnedAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge Badge @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
}
```

### 2.2 Seed Data for Ranks and Badges

**File: `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed Ranks
  const ranks = [
    { name: 'novice', displayName: 'Novice Explorer', minClassifications: 0, icon: '🔭', colour: '#6B7280', description: 'Just starting your journey' },
    { name: 'apprentice', displayName: 'Apprentice Astronomer', minClassifications: 10, icon: '⭐', colour: '#10B981', description: 'Learning the cosmos' },
    { name: 'observer', displayName: 'Stellar Observer', minClassifications: 50, icon: '🌟', colour: '#3B82F6', description: 'Keen eye for detail' },
    { name: 'analyst', displayName: 'Galaxy Analyst', minClassifications: 100, icon: '🌌', colour: '#8B5CF6', description: 'Mastering classification' },
    { name: 'expert', displayName: 'Cosmic Expert', minClassifications: 250, icon: '🚀', colour: '#EC4899', description: 'Elite contributor' },
    { name: 'master', displayName: 'Universe Master', minClassifications: 500, icon: '🌠', colour: '#F59E0B', description: 'Legendary scientist' },
    { name: 'legend', displayName: 'Celestial Legend', minClassifications: 1000, icon: '✨', colour: '#EF4444', description: 'Among the stars' },
  ]

  for (const rank of ranks) {
    await prisma.rank.upsert({
      where: { name: rank.name },
      update: rank,
      create: rank,
    })
  }

  // Seed Badges
  const badges = [
    { name: 'first_classification', displayName: 'First Light', description: 'Complete your first classification', icon: '🎯', rarity: 'common', criteria: { type: 'total_classifications', count: 1 } },
    { name: 'ten_streak', displayName: 'Dedicated Observer', description: 'Classify for 10 days in a row', icon: '🔥', rarity: 'uncommon', criteria: { type: 'streak', count: 10 } },
    { name: 'galaxy_hunter', displayName: 'Galaxy Hunter', description: 'Classify 50 galaxies', icon: '🌀', rarity: 'rare', criteria: { type: 'project_classifications', project: 'galaxy-zoo', count: 50 } },
    { name: 'planet_seeker', displayName: 'Planet Seeker', description: 'Classify 50 exoplanet transits', icon: '🪐', rarity: 'rare', criteria: { type: 'project_classifications', project: 'planet-hunters', count: 50 } },
    { name: 'century', displayName: 'Century Club', description: 'Complete 100 classifications', icon: '💯', rarity: 'epic', criteria: { type: 'total_classifications', count: 100 } },
    { name: 'night_owl', displayName: 'Night Owl', description: 'Classify between midnight and 4am', icon: '🦉', rarity: 'uncommon', criteria: { type: 'time_of_day', start: 0, end: 4 } },
    { name: 'weekend_warrior', displayName: 'Weekend Warrior', description: 'Classify on 10 weekends', icon: '⚔️', rarity: 'uncommon', criteria: { type: 'weekend_count', count: 10 } },
    { name: 'completionist', displayName: 'Completionist', description: 'Contribute to all available projects', icon: '🏆', rarity: 'legendary', criteria: { type: 'all_projects' } },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: { ...badge, criteria: badge.criteria },
      create: { ...badge, criteria: badge.criteria },
    })
  }

  console.log('Seed data created!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## Phase 3: Zooniverse Integration

### 3.1 Zooniverse Client

**File: `src/lib/zooniverse.ts`**

```typescript
import { auth } from '@panoptes/panoptes-javascript-sdk'

// Note: We submit as anonymous to Zooniverse
// Users are tracked in our local database

interface ZooniverseClassification {
  annotations: Array<{
    task: string
    value: unknown
  }>
  metadata: {
    source: string
    session: string
    viewport: { width: number; height: number }
  }
  links: {
    project: string
    workflow: string
    subjects: string[]
  }
}

// Project mappings to Zooniverse project/workflow IDs
export const ZOONIVERSE_PROJECTS = {
  'galaxy-zoo': {
    projectId: '7929',
    workflowId: '12345', // Get actual workflow ID
    name: 'Galaxy Zoo',
    description: 'Help classify galaxy shapes',
  },
  'planet-hunters': {
    projectId: '4973',
    workflowId: '12346',
    name: 'Planet Hunters TESS',
    description: 'Search for exoplanets in TESS data',
  },
  'supernova-hunters': {
    projectId: '1234',
    workflowId: '12347',
    name: 'Supernova Hunters',
    description: 'Identify supernovae in telescope images',
  },
} as const

export async function submitToZooniverse(
  projectKey: keyof typeof ZOONIVERSE_PROJECTS,
  subjectId: string,
  annotations: Array<{ task: string; value: unknown }>
): Promise<{ success: boolean; classificationId?: string; error?: string }> {
  const project = ZOONIVERSE_PROJECTS[projectKey]

  try {
    const classification: ZooniverseClassification = {
      annotations,
      metadata: {
        source: 'cosmos-collective',
        session: crypto.randomUUID(),
        viewport: { width: 1920, height: 1080 },
      },
      links: {
        project: project.projectId,
        workflow: project.workflowId,
        subjects: [subjectId],
      },
    }

    // Submit to Zooniverse API
    const response = await fetch('https://www.zooniverse.org/api/classifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json; version=1',
      },
      body: JSON.stringify({ classifications: classification }),
    })

    if (!response.ok) {
      throw new Error(`Zooniverse API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      classificationId: data.classifications?.[0]?.id
    }
  } catch (error) {
    console.error('Zooniverse submission error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function fetchSubject(
  projectKey: keyof typeof ZOONIVERSE_PROJECTS
): Promise<{ id: string; imageUrl: string; metadata: Record<string, unknown> } | null> {
  const project = ZOONIVERSE_PROJECTS[projectKey]

  try {
    const response = await fetch(
      `https://www.zooniverse.org/api/subjects?workflow_id=${project.workflowId}&page_size=1`,
      {
        headers: {
          'Accept': 'application/vnd.api+json; version=1',
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const subject = data.subjects?.[0]

    if (!subject) return null

    return {
      id: subject.id,
      imageUrl: subject.locations?.[0]?.['image/png'] || subject.locations?.[0]?.['image/jpeg'],
      metadata: subject.metadata,
    }
  } catch (error) {
    console.error('Failed to fetch subject:', error)
    return null
  }
}
```

---

## Phase 4: API Routes

### 4.1 Classification Submission

**File: `src/app/api/classify/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { submitToZooniverse, ZOONIVERSE_PROJECTS } from '@/lib/zooniverse'
import { checkAndAwardBadges, updateUserRank } from '@/lib/gamification'

export async function POST(req: NextRequest) {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { projectId, subjectId, answers } = body

    if (!projectId || !subjectId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Submit to Zooniverse
    const zooniverseResult = await submitToZooniverse(
      projectId as keyof typeof ZOONIVERSE_PROJECTS,
      subjectId,
      answers
    )

    // Store classification locally
    const classification = await prisma.classification.create({
      data: {
        userId: session.user.id,
        projectId,
        projectName: ZOONIVERSE_PROJECTS[projectId as keyof typeof ZOONIVERSE_PROJECTS]?.name || projectId,
        subjectId,
        answers,
        zooniverseSubmitted: zooniverseResult.success,
        zooniverseId: zooniverseResult.classificationId,
      },
    })

    // Update user stats
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalClassifications: { increment: 1 },
        lastClassificationAt: new Date(),
      },
    })

    // Check for streak update
    await updateStreak(session.user.id)

    // Update rank if needed
    await updateUserRank(session.user.id)

    // Check for new badges
    const newBadges = await checkAndAwardBadges(session.user.id, {
      projectId,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      classificationId: classification.id,
      zooniverseSubmitted: zooniverseResult.success,
      newBadges,
    })
  } catch (error) {
    console.error('Classification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastClassificationAt: true, currentStreak: true, longestStreak: true },
  })

  if (!user) return

  const now = new Date()
  const lastClassification = user.lastClassificationAt

  if (!lastClassification) {
    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: 1, longestStreak: Math.max(1, user.longestStreak) },
    })
    return
  }

  const hoursSinceLastClassification =
    (now.getTime() - lastClassification.getTime()) / (1000 * 60 * 60)

  if (hoursSinceLastClassification < 48) {
    // Within streak window (48 hours for flexibility)
    const isNewDay = now.toDateString() !== lastClassification.toDateString()
    if (isNewDay) {
      const newStreak = user.currentStreak + 1
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak),
        },
      })
    }
  } else {
    // Streak broken
    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: 1 },
    })
  }
}
```

### 4.2 User Progress API

**File: `src/app/api/progress/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        rank: true,
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get next rank
    const nextRank = await prisma.rank.findFirst({
      where: {
        minClassifications: { gt: user.totalClassifications },
      },
      orderBy: { minClassifications: 'asc' },
    })

    // Get classification breakdown by project
    const projectStats = await prisma.classification.groupBy({
      by: ['projectId', 'projectName'],
      where: { userId: session.user.id },
      _count: true,
    })

    // Get recent classifications
    const recentClassifications = await prisma.classification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        totalClassifications: user.totalClassifications,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        memberSince: user.createdAt,
      },
      rank: user.rank,
      nextRank,
      classificationsToNextRank: nextRank
        ? nextRank.minClassifications - user.totalClassifications
        : null,
      badges: user.badges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
      projectStats,
      recentClassifications,
    })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 4.3 Leaderboard API

**File: `src/app/api/leaderboard/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const period = searchParams.get('period') || 'all-time' // 'week', 'month', 'all-time'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

  try {
    let dateFilter = {}

    if (period === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = { createdAt: { gte: weekAgo } }
    } else if (period === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFilter = { createdAt: { gte: monthAgo } }
    }

    if (period === 'all-time') {
      // Use pre-computed totals
      const users = await prisma.user.findMany({
        where: { totalClassifications: { gt: 0 } },
        include: { rank: true },
        orderBy: { totalClassifications: 'desc' },
        take: limit,
      })

      return NextResponse.json({
        leaderboard: users.map((user, index) => ({
          position: index + 1,
          id: user.id,
          name: user.name || 'Anonymous',
          image: user.image,
          classifications: user.totalClassifications,
          rank: user.rank,
          streak: user.currentStreak,
        })),
      })
    }

    // For time-based leaderboards, aggregate classifications
    const classifications = await prisma.classification.groupBy({
      by: ['userId'],
      where: dateFilter,
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: limit,
    })

    const userIds = classifications.map(c => c.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { rank: true },
    })

    const userMap = new Map(users.map(u => [u.id, u]))

    return NextResponse.json({
      leaderboard: classifications.map((c, index) => {
        const user = userMap.get(c.userId)
        return {
          position: index + 1,
          id: c.userId,
          name: user?.name || 'Anonymous',
          image: user?.image,
          classifications: c._count,
          rank: user?.rank,
        }
      }),
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Phase 5: Gamification Logic

### 5.1 Badge & Rank Management

**File: `src/lib/gamification.ts`**

```typescript
import { prisma } from '@/lib/prisma'

interface ClassificationContext {
  projectId: string
  timestamp: Date
}

export async function updateUserRank(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalClassifications: true, rankId: true },
  })

  if (!user) return

  const appropriateRank = await prisma.rank.findFirst({
    where: {
      minClassifications: { lte: user.totalClassifications },
    },
    orderBy: { minClassifications: 'desc' },
  })

  if (appropriateRank && appropriateRank.id !== user.rankId) {
    await prisma.user.update({
      where: { id: userId },
      data: { rankId: appropriateRank.id },
    })
    return appropriateRank
  }

  return null
}

export async function checkAndAwardBadges(
  userId: string,
  context: ClassificationContext
): Promise<Array<{ id: string; name: string; displayName: string }>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: { select: { badgeId: true } },
      classifications: true,
    },
  })

  if (!user) return []

  const earnedBadgeIds = new Set(user.badges.map(b => b.badgeId))
  const allBadges = await prisma.badge.findMany()
  const newBadges: Array<{ id: string; name: string; displayName: string }> = []

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue

    const criteria = badge.criteria as Record<string, unknown>
    let earned = false

    switch (criteria.type) {
      case 'total_classifications':
        earned = user.totalClassifications >= (criteria.count as number)
        break

      case 'streak':
        earned = user.currentStreak >= (criteria.count as number)
        break

      case 'project_classifications':
        const projectCount = user.classifications.filter(
          c => c.projectId === criteria.project
        ).length
        earned = projectCount >= (criteria.count as number)
        break

      case 'time_of_day':
        const hour = context.timestamp.getHours()
        earned = hour >= (criteria.start as number) && hour < (criteria.end as number)
        break

      case 'all_projects':
        const uniqueProjects = new Set(user.classifications.map(c => c.projectId))
        // Assume 3 projects available
        earned = uniqueProjects.size >= 3
        break
    }

    if (earned) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      })
      newBadges.push({
        id: badge.id,
        name: badge.name,
        displayName: badge.displayName,
      })
    }
  }

  return newBadges
}
```

---

## Phase 6: UI Components

### 6.1 Updated Sign-In Page

**File: `src/app/citizen-science/signin/page.tsx`**

```typescript
'use client'

import { signIn } from 'next-auth/react'
import { Github, Mail } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cosmos-void">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Join Citizen Science
            </h1>
            <p className="text-gray-400 mb-8">
              Sign in to track your contributions, earn badges, and help real scientific research.
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => signIn('github', { callbackUrl: '/citizen-science' })}
                className="w-full"
                variant="outline"
              >
                <Github className="w-5 h-5 mr-2" />
                Continue with GitHub
              </Button>

              <Button
                onClick={() => signIn('google', { callbackUrl: '/citizen-science' })}
                className="w-full"
                variant="outline"
              >
                <Mail className="w-5 h-5 mr-2" />
                Continue with Google
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Your classifications are submitted to Zooniverse for real scientific research.
              We store your progress locally for badges and rankings.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
```

### 6.2 Progress Dashboard Component

**File: `src/components/features/citizen-science/ProgressDashboard.tsx`**

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Trophy, Flame, Star, Target } from 'lucide-react'

export function ProgressDashboard() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const res = await fetch('/api/progress')
      if (!res.ok) throw new Error('Failed to fetch progress')
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!progress) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Classifications */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cosmos-cyan/20 rounded-xl">
              <Target className="w-6 h-6 text-cosmos-cyan" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Classifications</p>
              <p className="text-2xl font-bold text-white">
                {progress.user.totalClassifications}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Rank */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cosmos-gold/20 rounded-xl">
              <Trophy className="w-6 h-6 text-cosmos-gold" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Rank</p>
              <p className="text-lg font-bold text-white">
                {progress.rank?.icon} {progress.rank?.displayName || 'Novice'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-white">
                {progress.user.currentStreak} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Earned */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Badges</p>
              <p className="text-2xl font-bold text-white">
                {progress.badges.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress to Next Rank */}
      {progress.nextRank && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Progress to {progress.nextRank.displayName}
              </span>
              <span className="text-sm text-cosmos-cyan">
                {progress.classificationsToNextRank} to go
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cosmos-cyan to-cosmos-gold"
                style={{
                  width: `${Math.min(
                    ((progress.user.totalClassifications - (progress.rank?.minClassifications || 0)) /
                      (progress.nextRank.minClassifications - (progress.rank?.minClassifications || 0))) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

---

## Phase 7: Implementation Steps

### Step-by-Step Checklist

1. **Phase 1: Setup (Day 1)**
   - [ ] Install dependencies (next-auth, prisma, @prisma/client)
   - [ ] Create Prisma schema
   - [ ] Set up PostgreSQL database (Supabase recommended)
   - [ ] Run `prisma migrate dev` to create tables
   - [ ] Seed ranks and badges data

2. **Phase 2: Authentication (Day 1-2)**
   - [ ] Create GitHub OAuth application
   - [ ] Create Google OAuth application
   - [ ] Configure NextAuth with providers
   - [ ] Create sign-in page
   - [ ] Test authentication flow

3. **Phase 3: API Routes (Day 2-3)**
   - [ ] Implement /api/classify endpoint
   - [ ] Implement /api/progress endpoint
   - [ ] Implement /api/leaderboard endpoint
   - [ ] Test all endpoints

4. **Phase 4: Zooniverse Integration (Day 3-4)**
   - [ ] Research Zooniverse project/workflow IDs
   - [ ] Implement subject fetching
   - [ ] Implement classification submission
   - [ ] Handle API errors gracefully
   - [ ] Add fallback for offline/demo mode

5. **Phase 5: Gamification (Day 4-5)**
   - [ ] Implement rank update logic
   - [ ] Implement badge checking logic
   - [ ] Create badge notification system
   - [ ] Test all badge criteria

6. **Phase 6: UI Components (Day 5-6)**
   - [ ] Update Citizen Science page with auth
   - [ ] Create progress dashboard
   - [ ] Create leaderboard component
   - [ ] Create badge display component
   - [ ] Update classification UI to show real subjects

7. **Phase 7: Testing & Polish (Day 7)**
   - [ ] End-to-end testing
   - [ ] Error handling
   - [ ] Loading states
   - [ ] Mobile responsiveness
   - [ ] Performance optimisation

---

## Database Hosting Options

### Recommended: Supabase (Free Tier)
- 500MB database storage
- Unlimited API requests
- Built-in Postgres
- Easy setup with Prisma
- Free tier sufficient for thousands of users

### Alternative: PlanetScale
- MySQL-compatible
- Generous free tier
- Automatic scaling

### Alternative: Neon
- Postgres
- Serverless
- Free tier available

---

## Cost Considerations

| Component | Free Tier Limit | Notes |
|-----------|----------------|-------|
| Vercel Hosting | Unlimited | Current setup |
| Supabase DB | 500MB | Plenty for gamification data |
| NextAuth | Free | Self-hosted |
| Zooniverse API | Free | Public API |

**Total estimated cost: $0/month** for reasonable usage

---

## Security Considerations

1. **Authentication**: OAuth only (no password storage)
2. **Rate Limiting**: Implement on classification endpoint
3. **Input Validation**: Validate all classification data
4. **CSRF Protection**: Built into NextAuth
5. **Data Privacy**: Only store what's needed for gamification

---

## Future Enhancements

- Team/organisation support
- Custom classification campaigns
- Real-time multiplayer classification
- Achievement sharing to social media
- Monthly challenges with prizes
- API for third-party integrations
