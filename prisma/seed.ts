/**
 * Prisma Seed Script
 * Seeds initial badges and data
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed badges
  const badges = [
    {
      name: 'First Steps',
      description: 'Complete your first classification',
      icon: 'star',
      rarity: 'common',
      requirementType: 'classification_count',
      requirementValue: 1,
    },
    {
      name: 'Getting Started',
      description: 'Complete 10 classifications',
      icon: 'rocket',
      rarity: 'common',
      requirementType: 'classification_count',
      requirementValue: 10,
    },
    {
      name: 'Contributor',
      description: 'Complete 50 classifications',
      icon: 'trophy',
      rarity: 'uncommon',
      requirementType: 'classification_count',
      requirementValue: 50,
    },
    {
      name: 'Dedicated',
      description: 'Complete 100 classifications',
      icon: 'award',
      rarity: 'uncommon',
      requirementType: 'classification_count',
      requirementValue: 100,
    },
    {
      name: 'Expert',
      description: 'Complete 500 classifications',
      icon: 'shield',
      rarity: 'rare',
      requirementType: 'classification_count',
      requirementValue: 500,
    },
    {
      name: 'Master Classifier',
      description: 'Complete 1000 classifications',
      icon: 'crown',
      rarity: 'epic',
      requirementType: 'classification_count',
      requirementValue: 1000,
    },
    {
      name: 'Cosmic Legend',
      description: 'Complete 10000 classifications',
      icon: 'sparkles',
      rarity: 'legendary',
      requirementType: 'classification_count',
      requirementValue: 10000,
    },
    {
      name: 'Explorer',
      description: 'Contribute to 5 different projects',
      icon: 'compass',
      rarity: 'uncommon',
      requirementType: 'project_count',
      requirementValue: 5,
    },
    {
      name: 'Polymath',
      description: 'Contribute to 10 different projects',
      icon: 'globe',
      rarity: 'rare',
      requirementType: 'project_count',
      requirementValue: 10,
    },
    {
      name: 'Week Streak',
      description: 'Classify for 7 consecutive days',
      icon: 'flame',
      rarity: 'uncommon',
      requirementType: 'streak',
      requirementValue: 7,
    },
    {
      name: 'Month Streak',
      description: 'Classify for 30 consecutive days',
      icon: 'calendar',
      rarity: 'rare',
      requirementType: 'streak',
      requirementValue: 30,
    },
    {
      name: 'Century Streak',
      description: 'Classify for 100 consecutive days',
      icon: 'fire',
      rarity: 'epic',
      requirementType: 'streak',
      requirementValue: 100,
    },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    })
  }

  console.log(`✅ Created ${badges.length} badges`)
  console.log('🎉 Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
