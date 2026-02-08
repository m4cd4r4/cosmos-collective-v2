/**
 * Zooniverse API Client
 * Real integration with Panoptes API v2
 *
 * API Docs: https://github.com/zooniverse/panoptes/blob/master/docs/source/index.html.md
 */

import axios, { type AxiosInstance } from 'axios'
import type {
  ZooniverseProject,
  ZooniverseSubject,
  ClassificationSubmission,
  UserStats,
  ZooniverseTask,
} from '@/types/astronomy'

const API_BASE = 'https://www.zooniverse.org/api'

export class ZooniverseClient {
  private client: AxiosInstance
  private accessToken?: string

  constructor(accessToken?: string) {
    this.accessToken = accessToken
    this.client = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.api+json; version=1',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      timeout: 30000,
    })
  }

  /**
   * Get project details by ID or slug
   */
  async getProject(idOrSlug: string): Promise<ZooniverseProject | null> {
    try {
      const response = await this.client.get(`/projects/${idOrSlug}`)
      const project = response.data.projects[0]

      if (!project) return null

      return {
        id: project.id,
        slug: project.slug,
        displayName: project.display_name,
        description: project.description,
        introduction: project.introduction,
        classification_count: project.classifications_count || 0,
        subjects_count: project.subjects_count || 0,
        completeness: project.completeness || 0,
        tags: project.tags || [],
        links: project.links || {},
        avatar: project.avatar,
        background: project.background,
      }
    } catch (error) {
      console.error(`Failed to fetch project ${idOrSlug}:`, error)
      return null
    }
  }

  /**
   * Get featured astronomy projects
   */
  async getFeaturedProjects(): Promise<ZooniverseProject[]> {
    try {
      const response = await this.client.get('/projects', {
        params: {
          launch_approved: true,
          discipline: 'astronomy',
          page_size: 20,
          sort: '-updated_at',
        },
      })

      return response.data.projects.map((project: any) => ({
        id: project.id,
        slug: project.slug,
        displayName: project.display_name,
        description: project.description,
        introduction: project.introduction,
        classification_count: project.classifications_count || 0,
        subjects_count: project.subjects_count || 0,
        completeness: project.completeness || 0,
        tags: project.tags || [],
        links: project.links || {},
        avatar: project.avatar,
        background: project.background,
      }))
    } catch (error) {
      console.error('Failed to fetch featured projects:', error)
      return []
    }
  }

  /**
   * Get next subject from workflow queue
   */
  async getNextSubject(
    workflowId: string,
    projectId?: string
  ): Promise<ZooniverseSubject | null> {
    try {
      const params: any = {
        workflow_id: workflowId,
        page_size: 1,
      }

      if (projectId) {
        params.project_id = projectId
      }

      const response = await this.client.get('/subjects/queued', { params })
      const subject = response.data.subjects[0]

      if (!subject) return null

      return {
        id: subject.id,
        metadata: subject.metadata || {},
        locations: subject.locations || [],
        already_seen: subject.already_seen || false,
        retired: subject.retired || false,
      }
    } catch (error) {
      console.error(`Failed to fetch next subject for workflow ${workflowId}:`, error)
      return null
    }
  }

  /**
   * Submit a classification
   */
  async submitClassification(submission: ClassificationSubmission): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('Authentication required to submit classifications')
    }

    try {
      const payload = {
        classifications: [
          {
            annotations: submission.annotations,
            metadata: {
              started_at: submission.metadata.started_at,
              finished_at: submission.metadata.finished_at,
              user_agent: submission.metadata.user_agent,
              user_language: submission.metadata.user_language,
              utc_offset: submission.metadata.utc_offset,
              subject_dimensions: submission.metadata.subject_dimensions,
            },
            links: {
              project: submission.links.project,
              workflow: submission.links.workflow,
              subjects: submission.links.subjects,
            },
          },
        ],
      }

      const response = await this.client.post('/classifications', payload)
      const classificationId = response.data.classifications[0]?.id

      return classificationId || null
    } catch (error) {
      console.error('Failed to submit classification:', error)
      throw error
    }
  }

  /**
   * Get current user's stats
   */
  async getUserStats(userId?: string): Promise<UserStats | null> {
    try {
      const endpoint = userId ? `/users/${userId}` : '/me'
      const response = await this.client.get(endpoint)
      const user = response.data.users[0]

      if (!user) return null

      return {
        classificationsCount: user.classifications_count || 0,
        projectsContributed: user.project_contributions?.length || 0,
        hoursSpent: Math.round((user.classifications_count || 0) * 0.5 * 60) / 60, // Estimate
        rank: this.calculateRank(user.classifications_count || 0),
        badges: [], // Badges are tracked in our own DB
        recentActivity: [],
        favoriteProjects: [],
        externalProfiles: {
          zooniverse: {
            id: user.id,
            username: user.login,
            profileUrl: `https://www.zooniverse.org/users/${user.login}`,
          },
        },
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      return null
    }
  }

  /**
   * Get classification history for a user
   */
  async getClassificationHistory(
    userId?: string,
    limit: number = 10
  ): Promise<Array<{ id: string; projectName: string; timestamp: string }>> {
    try {
      const params: any = {
        page_size: limit,
        sort: '-created_at',
      }

      if (userId) {
        params.user_id = userId
      }

      const response = await this.client.get('/classifications', { params })
      const classifications = response.data.classifications || []

      return classifications.map((c: any) => ({
        id: c.id,
        projectName: c.links?.project || 'Unknown Project',
        timestamp: c.created_at,
      }))
    } catch (error) {
      console.error('Failed to fetch classification history:', error)
      return []
    }
  }

  /**
   * Get workflows for a project
   */
  async getProjectWorkflows(projectId: string): Promise<any[]> {
    try {
      const response = await this.client.get('/workflows', {
        params: {
          project_id: projectId,
          active: true,
        },
      })

      return response.data.workflows || []
    } catch (error) {
      console.error(`Failed to fetch workflows for project ${projectId}:`, error)
      return []
    }
  }

  /**
   * Helper: Calculate rank based on classification count
   */
  private calculateRank(count: number): number {
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
}

/**
 * Create a Zooniverse client with user's access token from session
 */
export function createZooniverseClient(accessToken?: string): ZooniverseClient {
  return new ZooniverseClient(accessToken)
}
