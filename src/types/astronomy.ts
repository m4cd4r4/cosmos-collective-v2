/**
 * Cosmos Collective - Astronomy Type Definitions
 * Comprehensive types for astronomical data, observations, and features
 */

// ============================================
// Core Coordinate Types
// ============================================

export interface SkyCoordinates {
  /** Right Ascension in decimal degrees (0-360) */
  ra: number
  /** Declination in decimal degrees (-90 to +90) */
  dec: number
  /** Galactic longitude (optional) */
  galacticL?: number
  /** Galactic latitude (optional) */
  galacticB?: number
  /** Constellation name (optional) */
  constellation?: string
  /** Equinox of coordinates (default J2000) */
  equinox?: 'J2000' | 'B1950'
}

export interface SexagesimalCoordinates {
  ra: {
    hours: number
    minutes: number
    seconds: number
  }
  dec: {
    degrees: number
    minutes: number
    seconds: number
    sign: '+' | '-'
  }
}

// ============================================
// Observation & Image Types
// ============================================

export type WavelengthBand =
  | 'radio'
  | 'microwave'
  | 'infrared'
  | 'optical'
  | 'ultraviolet'
  | 'xray'
  | 'gamma'

export type ObjectCategory =
  | 'galaxy'
  | 'nebula'
  | 'star'
  | 'star-cluster'
  | 'exoplanet'
  | 'solar-system'
  | 'supernova'
  | 'pulsar'
  | 'quasar'
  | 'black-hole'
  | 'gravitational-lens'
  | 'deep-field'
  | 'other'

export type JWSTInstrument = 'NIRCam' | 'MIRI' | 'NIRSpec' | 'NIRISS' | 'FGS'
export type TelescopeSource = 'JWST' | 'Hubble' | 'Chandra' | 'ASKAP' | 'MWA' | 'Parkes' | 'ATCA' | 'SKA' | 'Other'

export interface Observation {
  /** Unique identifier */
  id: string
  /** Source telescope/mission */
  source: TelescopeSource
  /** Target name */
  targetName: string
  /** Alternative names for the object */
  aliases?: string[]
  /** Sky coordinates */
  coordinates: SkyCoordinates
  /** Object category */
  category: ObjectCategory
  /** Wavelength band */
  wavelengthBand: WavelengthBand
  /** Instrument used (for JWST) */
  instrument?: JWSTInstrument
  /** Filters used */
  filters?: string[]
  /** Observation date (ISO 8601) */
  observationDate: string
  /** Exposure time in seconds */
  exposureTime?: number
  /** Proposal/program ID */
  proposalId?: string
  /** Principal investigator */
  principalInvestigator?: string
  /** Image URLs */
  images: ImageSet
  /** Detected features */
  features?: DetectedFeature[]
  /** AI analysis */
  analysis?: AIAnalysis
  /** Scientific description */
  description?: string
  /** Distance in light years (if known) */
  distanceLightYears?: number
  /** Redshift (if applicable) */
  redshift?: number
  /** Apparent magnitude */
  apparentMagnitude?: number
  /** Size in arcseconds */
  angularSize?: {
    major: number
    minor?: number
    positionAngle?: number
  }
  /** Data quality indicator */
  dataQuality?: 'excellent' | 'good' | 'fair' | 'poor'
  /** Whether this is a featured/showcase image */
  isFeatured?: boolean
  /** External links */
  externalLinks?: ExternalLink[]
  /** Metadata for display */
  metadata?: Record<string, string | number>
}

export interface ImageSet {
  /** Thumbnail URL (small, fast loading) */
  thumbnail: string
  /** Preview URL (medium size) */
  preview: string
  /** Full resolution URL */
  full: string
  /** Raw/FITS data URL (if available) */
  raw?: string
  /** Different wavelength versions */
  wavelengthVersions?: {
    band: WavelengthBand
    url: string
    colorMap?: string
  }[]
}

export interface ExternalLink {
  label: string
  url: string
  type: 'mast' | 'nasa' | 'esa' | 'wikipedia' | 'simbad' | 'ned' | 'other'
}

// ============================================
// Feature Detection Types
// ============================================

export interface BoundingBox {
  /** X position as percentage (0-100) */
  x: number
  /** Y position as percentage (0-100) */
  y: number
  /** Width as percentage (0-100) */
  width: number
  /** Height as percentage (0-100) */
  height: number
}

export interface DetectedFeature {
  /** Unique identifier */
  id: string
  /** Feature label */
  label: string
  /** Detection confidence (0-1) */
  confidence: number
  /** Bounding box coordinates */
  boundingBox: BoundingBox
  /** Feature category */
  category?: ObjectCategory
  /** Detailed description */
  description?: string
  /** Whether this feature is user-contributed */
  isUserContributed?: boolean
  /** User ID if contributed */
  contributorId?: string
}

export interface AIAnalysis {
  /** Summary of the observation */
  summary: string
  /** Scientific context and significance */
  scientificContext: string
  /** Key features identified */
  keyFeatures: string[]
  /** Related astronomical objects */
  relatedObjects: string[]
  /** Educational notes */
  educationalNotes?: string[]
  /** Fun facts for general audience */
  funFacts?: string[]
  /** Technical details */
  technicalDetails?: string
  /** Analysis confidence */
  confidence: 'high' | 'medium' | 'low'
  /** Generated date */
  generatedAt: string
}

// ============================================
// Real-Time Events Types
// ============================================

export type EventType =
  | 'transient'
  | 'supernova'
  | 'grb'          // Gamma-ray burst
  | 'asteroid'
  | 'comet'
  | 'solar'
  | 'aurora'
  | 'satellite'
  | 'launch'
  | 'iss'
  | 'eclipse'
  | 'meteor-shower'

export type EventSeverity = 'info' | 'notable' | 'significant' | 'rare' | 'once-in-lifetime'

export interface AstronomicalEvent {
  id: string
  type: EventType
  title: string
  description: string
  coordinates?: SkyCoordinates
  eventTime: string
  discoveryTime?: string
  source: string
  severity: EventSeverity
  isOngoing: boolean
  endTime?: string
  /** Visibility information */
  visibility?: {
    locations: string[]
    bestViewingTime?: string
    requiredEquipment?: string
  }
  /** Related observations */
  relatedObservationIds?: string[]
  /** External references */
  references?: ExternalLink[]
  /** Live data feed URL if available */
  liveFeedUrl?: string
}

// ============================================
// Citizen Science Types
// ============================================

export type ClassificationTaskType =
  | 'galaxy-morphology'
  | 'radio-source-matching'
  | 'transient-identification'
  | 'feature-marking'
  | 'quality-assessment'

export interface ClassificationQuestion {
  id: string
  question: string
  helpText?: string
  type: 'single-choice' | 'multi-choice' | 'slider' | 'drawing' | 'yes-no'
  options?: {
    id: string
    label: string
    description?: string
    icon?: string
  }[]
  /** For slider type */
  range?: {
    min: number
    max: number
    step: number
    labels?: Record<number, string>
  }
}

export interface ClassificationTask {
  id: string
  type: ClassificationTaskType | string
  /** Subject/observation ID this task is for */
  observationId?: string
  title?: string
  description?: string
  instructions: string
  questions?: ClassificationQuestion[]
  /** Classification options (for simple tasks) */
  options?: ClassificationOption[]
  /** Subject image URL */
  subjectUrl?: string
  /** Estimated time to complete in seconds */
  estimatedTime?: number
  /** Estimated time to complete in minutes */
  estimatedMinutes?: number
  /** Difficulty level */
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  /** Points awarded for completion */
  points?: number
  /** Project this task belongs to */
  projectId: string
  projectName: string
  /** Additional metadata for the subject */
  metadata?: Record<string, string | number | boolean>
}

export interface ClassificationOption {
  value: string
  label: string
  description?: string
  icon?: string
}

export interface ClassificationSubmission {
  id: string
  taskId: string
  userId: string
  answers: Record<string, string | string[] | number | DrawingData>
  submittedAt: string
  /** Time spent on task in seconds */
  timeSpent: number
  /** User's confidence in their answers */
  selfConfidence?: 'low' | 'medium' | 'high'
}

export interface DrawingData {
  type: 'point' | 'rectangle' | 'ellipse' | 'polygon' | 'freehand'
  coordinates: number[][]
  label?: string
}

// ============================================
// User & Contribution Types
// ============================================

export interface UserContribution {
  id: string
  userId: string
  type: 'classification' | 'feature-mark' | 'comment' | 'favorite'
  observationId: string
  data: ClassificationSubmission | DetectedFeature | string
  createdAt: string
  /** Whether this contribution was verified */
  isVerified?: boolean
  /** Points earned */
  pointsEarned?: number
}

export interface UserStats {
  /** Total number of classifications made */
  classificationsCount: number
  totalClassifications?: number
  totalPoints?: number
  /** Number of projects contributed to */
  projectsContributed: number
  /** Total hours spent classifying */
  hoursSpent: number
  /** Current rank title */
  rank: string | number
  accuracy?: number
  streakDays?: number
  /** Badges earned */
  badges: UserBadge[]
  favoriteCategories?: ObjectCategory[]
  /** Recent classification activity */
  recentActivity: {
    date: string
    project: string
    count: number
  }[]
  /** Favorite project IDs */
  favoriteProjects: string[]
  joinedDate?: string
  /** External citizen science profiles */
  externalProfiles?: {
    platform: 'zooniverse' | 'galaxy-zoo' | 'seti-home' | 'folding-home' | 'other'
    username: string
    profileUrl: string
    contributions?: number
  }[]
}

export interface UserBadge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt?: string
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

// ============================================
// Search & Filter Types
// ============================================

export interface SearchFilters {
  query?: string
  categories?: ObjectCategory[]
  sources?: TelescopeSource[]
  wavelengthBands?: WavelengthBand[]
  instruments?: JWSTInstrument[]
  dateRange?: {
    start: string
    end: string
  }
  coordinates?: {
    ra: number
    dec: number
    radius: number // in degrees
  }
  redshiftRange?: {
    min: number
    max: number
  }
  hasFeaturedImage?: boolean
  hasFeatureDetection?: boolean
  sortBy?: 'date' | 'name' | 'popularity' | 'distance' | 'relevance'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult {
  observations: Observation[]
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
  facets?: {
    categories: Record<ObjectCategory, number>
    sources: Record<TelescopeSource, number>
    wavelengthBands: Record<WavelengthBand, number>
  }
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    requestId: string
    timestamp: string
    cached?: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// ============================================
// Analytics Types (Private)
// ============================================

export interface AnalyticsEvent {
  eventType: 'page_view' | 'observation_view' | 'classification_complete' | 'search' | 'feature_use'
  timestamp: string
  sessionId: string
  userId?: string
  data: Record<string, string | number | boolean>
}

export interface AnalyticsSummary {
  totalPageViews: number
  uniqueVisitors: number
  topObservations: { id: string; views: number }[]
  topSearchTerms: { term: string; count: number }[]
  classificationStats: {
    total: number
    byType: Record<ClassificationTaskType, number>
  }
  userEngagement: {
    averageSessionDuration: number
    bounceRate: number
    returnVisitorRate: number
  }
}
