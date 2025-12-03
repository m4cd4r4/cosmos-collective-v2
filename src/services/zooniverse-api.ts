/**
 * Zooniverse API Service
 * Integration with Zooniverse citizen science platform
 *
 * Note: Zooniverse has a complex authentication system. This service provides
 * mock data for demonstration while showing the structure for real integration.
 */

import type { ClassificationTask, UserStats } from '@/types'

// ============================================
// Types
// ============================================

export interface ZooniverseProject {
  id: string
  slug: string
  displayName: string
  description: string
  introduction: string
  researcherQuote?: string
  avatar?: string
  background?: string
  classifications_count: number
  subjects_count: number
  retired_subjects_count: number
  completeness: number
  workflow_description?: string
  urls: {
    external?: { label: string; url: string }[]
  }
  tags: string[]
  state: 'live' | 'paused' | 'finished'
}

export interface ZooniverseSubject {
  id: string
  locations: {
    'image/jpeg'?: string
    'image/png'?: string
    'application/json'?: string
  }[]
  metadata: Record<string, string | number | boolean>
  created_at: string
  updated_at: string
}

export interface ZooniverseWorkflow {
  id: string
  display_name: string
  tasks: Record<string, ZooniverseTask>
  first_task: string
  version: string
  classifications_count: number
  retired_subjects_count: number
}

export interface ZooniverseTask {
  type: 'single' | 'multiple' | 'drawing' | 'text' | 'survey'
  question?: string
  answers?: { value: string; label: string }[]
  instruction?: string
  help?: string
}

export interface ClassificationSubmission {
  projectId: string
  subjectId: string
  workflowId: string
  annotations: {
    task: string
    value: string | string[] | number
  }[]
  startedAt: string
  finishedAt: string
}

// ============================================
// Featured Astronomy Projects
// ============================================

export const FEATURED_ZOONIVERSE_PROJECTS: ZooniverseProject[] = [
  {
    id: 'galaxy-zoo-jwst',
    slug: 'zooniverse/galaxy-zoo-cosmic-dawn',
    displayName: 'Galaxy Zoo: Cosmic Dawn',
    description: 'Help us classify the earliest galaxies seen by the James Webb Space Telescope',
    introduction: `The James Webb Space Telescope is revealing galaxies from the cosmic dawn -
    the first billion years after the Big Bang. These galaxies look different from nearby ones,
    and we need your help to understand their shapes and features.`,
    researcherQuote: 'Each classification brings us closer to understanding how galaxies formed.',
    classifications_count: 245789,
    subjects_count: 15000,
    retired_subjects_count: 12450,
    completeness: 0.83,
    tags: ['galaxies', 'JWST', 'morphology', 'deep-field'],
    state: 'live',
  },
  {
    id: 'radio-galaxy-zoo',
    slug: 'zooniverse/radio-galaxy-zoo',
    displayName: 'Radio Galaxy Zoo: LOFAR',
    description: 'Match radio emissions to their host galaxies in LOFAR survey data',
    introduction: `Radio telescopes like LOFAR see the universe in a completely different way.
    Giant jets of radio emission shoot out from galaxies, but matching these emissions to the
    galaxy that created them is tricky. Help us connect the dots!`,
    researcherQuote: 'Radio data reveals hidden activity that optical telescopes miss entirely.',
    classifications_count: 567234,
    subjects_count: 45000,
    retired_subjects_count: 38000,
    completeness: 0.84,
    tags: ['radio', 'galaxies', 'jets', 'LOFAR', 'SKA-pathfinder'],
    state: 'live',
  },
  {
    id: 'supernova-hunters',
    slug: 'zooniverse/supernova-hunters',
    displayName: 'Supernova Hunters',
    description: 'Discover exploding stars before automated systems can',
    introduction: `When massive stars die, they explode as supernovae - some of the most energetic
    events in the universe. Finding them quickly is crucial for understanding stellar evolution.
    You can spot supernovae that computers miss!`,
    researcherQuote: 'Citizen scientists have discovered dozens of supernovae before our algorithms.',
    classifications_count: 890123,
    subjects_count: 75000,
    retired_subjects_count: 71000,
    completeness: 0.95,
    tags: ['supernovae', 'transients', 'stellar-evolution'],
    state: 'live',
  },
  {
    id: 'planet-hunters-tess',
    slug: 'zooniverse/planet-hunters-tess',
    displayName: 'Planet Hunters TESS',
    description: 'Search for exoplanets in TESS space telescope data',
    introduction: `NASA's TESS mission is surveying the sky for planets orbiting other stars.
    When a planet crosses in front of its star, the light dims slightly. Help us find these
    tiny dips that could reveal new worlds!`,
    researcherQuote: 'Planet Hunters volunteers have confirmed several new exoplanets.',
    classifications_count: 1234567,
    subjects_count: 100000,
    retired_subjects_count: 95000,
    completeness: 0.95,
    tags: ['exoplanets', 'TESS', 'transit', 'NASA'],
    state: 'live',
  },
  {
    id: 'muon-hunters',
    slug: 'zooniverse/muon-hunters-2',
    displayName: 'Muon Hunters 2.0',
    description: 'Identify cosmic ray signatures from the depths of space',
    introduction: `High-energy particles from distant cosmic events rain down on Earth.
    Help us identify the patterns they create and trace them back to their mysterious origins -
    black holes, neutron stars, and unknown phenomena.`,
    classifications_count: 456789,
    subjects_count: 30000,
    retired_subjects_count: 28500,
    completeness: 0.95,
    tags: ['cosmic-rays', 'particle-physics', 'high-energy'],
    state: 'live',
  },
  {
    id: 'askap-emu',
    slug: 'csiro/askap-emu-morphology',
    displayName: 'ASKAP EMU Morphology',
    description: 'Classify radio sources from Australia\'s ASKAP telescope',
    introduction: `The Evolutionary Map of the Universe (EMU) survey uses ASKAP to create the
    most sensitive radio survey ever. Help classify the millions of radio sources being discovered!
    This directly supports Australian radio astronomy research.`,
    researcherQuote: 'ASKAP is detecting radio sources 5x faster than any previous survey.',
    classifications_count: 123456,
    subjects_count: 50000,
    retired_subjects_count: 25000,
    completeness: 0.50,
    tags: ['radio', 'ASKAP', 'Australia', 'EMU', 'SKA-pathfinder'],
    state: 'live',
  },
]

// ============================================
// Sample Classification Tasks
// ============================================

export function getClassificationTasks(projectId?: string): ClassificationTask[] {
  const allTasks: ClassificationTask[] = [
    {
      id: 'galaxy-classify-001',
      projectId: 'galaxy-zoo-jwst',
      projectName: 'Galaxy Zoo: Cosmic Dawn',
      type: 'galaxy-morphology',
      subjectUrl: 'https://panoptes-uploads.zooniverse.org/production/subject_location/jwst-galaxy-001.jpg',
      instructions: 'Is this galaxy smooth and rounded, or does it have features like spiral arms?',
      options: [
        { value: 'smooth', label: 'Smooth', description: 'Round or elliptical with no visible features' },
        { value: 'features', label: 'Features or Disk', description: 'Has spiral arms, disk, or other structure' },
        { value: 'artifact', label: 'Star or Artifact', description: 'Not a galaxy - star, artifact, or noise' },
      ],
      difficulty: 'beginner',
      estimatedTime: 15,
      metadata: {
        ra: 53.1625,
        dec: -27.7914,
        survey: 'JWST CEERS',
        redshift: 2.5,
      },
    },
    {
      id: 'radio-match-001',
      projectId: 'radio-galaxy-zoo',
      projectName: 'Radio Galaxy Zoo: LOFAR',
      type: 'source-matching',
      subjectUrl: 'https://panoptes-uploads.zooniverse.org/production/subject_location/lofar-radio-001.jpg',
      instructions: 'Which optical galaxy (if any) is the source of this radio emission?',
      options: [
        { value: 'single', label: 'Single Source', description: 'One clear host galaxy' },
        { value: 'double', label: 'Double Lobed', description: 'Two lobes from a single galaxy' },
        { value: 'complex', label: 'Complex', description: 'Multiple sources or unclear' },
        { value: 'no-match', label: 'No Optical Match', description: 'No visible galaxy at this location' },
      ],
      difficulty: 'intermediate',
      estimatedTime: 30,
      metadata: {
        ra: 180.456,
        dec: 45.123,
        survey: 'LOFAR Two-metre Sky Survey',
        frequency: '144 MHz',
      },
    },
    {
      id: 'supernova-001',
      projectId: 'supernova-hunters',
      projectName: 'Supernova Hunters',
      type: 'transient-detection',
      subjectUrl: 'https://panoptes-uploads.zooniverse.org/production/subject_location/supernova-candidate-001.jpg',
      instructions: 'Compare the two images. Is there a new bright object (supernova candidate)?',
      options: [
        { value: 'yes', label: 'Yes - New Object', description: 'A new bright source appears' },
        { value: 'no', label: 'No Change', description: 'Images look the same' },
        { value: 'artifact', label: 'Artifact', description: 'Difference is due to image artifact' },
        { value: 'variable', label: 'Variable Star', description: 'Known variable, not supernova' },
      ],
      difficulty: 'beginner',
      estimatedTime: 20,
      metadata: {
        ra: 120.789,
        dec: 15.456,
        survey: 'Pan-STARRS',
        dateRef: '2024-01-15',
        dateNew: '2024-01-20',
      },
    },
    {
      id: 'planet-transit-001',
      projectId: 'planet-hunters-tess',
      projectName: 'Planet Hunters TESS',
      type: 'light-curve',
      subjectUrl: 'https://panoptes-uploads.zooniverse.org/production/subject_location/tess-lightcurve-001.png',
      instructions: 'Does this light curve show a transit (a planet crossing in front of the star)?',
      options: [
        { value: 'yes-clear', label: 'Yes - Clear Transit', description: 'Obvious, box-like dip' },
        { value: 'maybe', label: 'Maybe', description: 'Possible dip, uncertain' },
        { value: 'no', label: 'No Transit', description: 'No transit-like features' },
        { value: 'eclipsing-binary', label: 'Eclipsing Binary', description: 'Two stars orbiting each other' },
      ],
      difficulty: 'intermediate',
      estimatedTime: 45,
      metadata: {
        ticId: 'TIC 123456789',
        sector: 45,
        magnitude: 11.5,
      },
    },
    {
      id: 'askap-001',
      projectId: 'askap-emu',
      projectName: 'ASKAP EMU Morphology',
      type: 'radio-morphology',
      subjectUrl: 'https://panoptes-uploads.zooniverse.org/production/subject_location/askap-emu-001.jpg',
      instructions: 'What is the morphology of this ASKAP radio source?',
      options: [
        { value: 'compact', label: 'Compact', description: 'Point-like or barely resolved' },
        { value: 'extended', label: 'Extended', description: 'Resolved structure' },
        { value: 'double', label: 'Double', description: 'Two distinct lobes' },
        { value: 'bent', label: 'Bent/WAT', description: 'Bent tail morphology' },
        { value: 'head-tail', label: 'Head-Tail', description: 'One-sided tail' },
      ],
      difficulty: 'intermediate',
      estimatedTime: 25,
      metadata: {
        ra: 220.123,
        dec: -45.678,
        survey: 'EMU Pilot',
        flux: '2.5 mJy',
      },
    },
  ]

  if (projectId) {
    return allTasks.filter((task) => task.projectId === projectId)
  }

  return allTasks
}

// ============================================
// Mock User Stats
// ============================================

export function getUserStats(userId?: string): UserStats {
  // In production, this would fetch from the Zooniverse API
  return {
    classificationsCount: 127,
    projectsContributed: 4,
    hoursSpent: 8.5,
    rank: 'Space Explorer',
    badges: [
      { id: 'first-classification', name: 'First Steps', description: 'Made your first classification', icon: 'star' },
      { id: 'century-club', name: 'Century Club', description: 'Made 100 classifications', icon: 'trophy' },
      { id: 'galaxy-guru', name: 'Galaxy Guru', description: 'Classified 50 galaxies', icon: 'galaxy' },
      { id: 'radio-ranger', name: 'Radio Ranger', description: 'Classified radio sources', icon: 'radio' },
    ],
    recentActivity: [
      { date: '2024-01-20', project: 'Galaxy Zoo: Cosmic Dawn', count: 15 },
      { date: '2024-01-19', project: 'Radio Galaxy Zoo: LOFAR', count: 8 },
      { date: '2024-01-18', project: 'Planet Hunters TESS', count: 12 },
    ],
    favoriteProjects: ['galaxy-zoo-jwst', 'askap-emu'],
  }
}

// ============================================
// API Functions
// ============================================

/**
 * Get project details from Zooniverse
 * In production, this would call: GET https://www.zooniverse.org/api/projects/{id}
 */
export async function getProject(projectId: string): Promise<ZooniverseProject | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  return FEATURED_ZOONIVERSE_PROJECTS.find((p) => p.id === projectId) || null
}

/**
 * Get all featured astronomy projects
 */
export async function getFeaturedProjects(): Promise<ZooniverseProject[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return FEATURED_ZOONIVERSE_PROJECTS
}

/**
 * Submit a classification
 * In production, this would call: POST https://www.zooniverse.org/api/classifications
 */
export async function submitClassification(
  submission: ClassificationSubmission
): Promise<{ success: boolean; classificationId: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In production, this would actually submit to Zooniverse
  console.log('Classification submitted:', submission)

  return {
    success: true,
    classificationId: `clf-${Date.now()}`,
  }
}

/**
 * Get next subject for classification
 * In production, this would call: GET https://www.zooniverse.org/api/subjects/queued
 */
export async function getNextSubject(projectId: string): Promise<ClassificationTask | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const tasks = getClassificationTasks(projectId)
  if (tasks.length === 0) return null

  // Return a random task for demo purposes
  return tasks[Math.floor(Math.random() * tasks.length)]
}

/**
 * Get user's classification history
 */
export async function getClassificationHistory(
  userId: string,
  limit = 10
): Promise<
  {
    id: string
    projectName: string
    classifiedAt: string
    thumbnailUrl?: string
  }[]
> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Mock history
  return [
    {
      id: 'clf-001',
      projectName: 'Galaxy Zoo: Cosmic Dawn',
      classifiedAt: '2024-01-20T10:30:00Z',
    },
    {
      id: 'clf-002',
      projectName: 'Radio Galaxy Zoo: LOFAR',
      classifiedAt: '2024-01-19T15:45:00Z',
    },
    {
      id: 'clf-003',
      projectName: 'Planet Hunters TESS',
      classifiedAt: '2024-01-18T09:15:00Z',
    },
  ]
}

// ============================================
// Ranking System
// ============================================

export const RANKS = [
  { name: 'Stargazer', minClassifications: 0, icon: 'eye' },
  { name: 'Space Cadet', minClassifications: 10, icon: 'rocket' },
  { name: 'Space Explorer', minClassifications: 50, icon: 'telescope' },
  { name: 'Cosmic Voyager', minClassifications: 100, icon: 'orbit' },
  { name: 'Galaxy Navigator', minClassifications: 250, icon: 'compass' },
  { name: 'Stellar Scientist', minClassifications: 500, icon: 'atom' },
  { name: 'Cosmic Pioneer', minClassifications: 1000, icon: 'flag' },
  { name: 'Universe Explorer', minClassifications: 2500, icon: 'globe' },
  { name: 'Galaxy Guardian', minClassifications: 5000, icon: 'shield' },
  { name: 'Cosmic Legend', minClassifications: 10000, icon: 'crown' },
]

export function getRankForClassifications(count: number): (typeof RANKS)[0] {
  let rank = RANKS[0]
  for (const r of RANKS) {
    if (count >= r.minClassifications) {
      rank = r
    }
  }
  return rank
}

export function getNextRank(count: number): { rank: (typeof RANKS)[0]; classificationsNeeded: number } | null {
  const currentIndex = RANKS.findIndex((r) => r.minClassifications > count) - 1
  if (currentIndex >= RANKS.length - 1) return null

  const nextRank = RANKS[currentIndex + 1]
  return {
    rank: nextRank,
    classificationsNeeded: nextRank.minClassifications - count,
  }
}
