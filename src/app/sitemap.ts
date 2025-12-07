/**
 * Dynamic Sitemap Generation
 * Generates XML sitemap for search engines
 */

import { MetadataRoute } from 'next'
import { getDevlogPosts } from '@/lib/devlog'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { getFeaturedRadioObservations } from '@/services/australian-telescopes'

const BASE_URL = 'https://cosmos-collective.com.au'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sky-map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/citizen-science`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/devlog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Dynamic observation routes
  const jwstObservations = getFeaturedJWSTImages()
  const radioObservations = getFeaturedRadioObservations()
  const allObservations = [...jwstObservations, ...radioObservations]

  const observationRoutes: MetadataRoute.Sitemap = allObservations.map((obs) => ({
    url: `${BASE_URL}/explore/${obs.id}`,
    lastModified: obs.observationDate ? new Date(obs.observationDate) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Dynamic devlog routes
  const devlogPosts = await getDevlogPosts()
  const devlogRoutes: MetadataRoute.Sitemap = devlogPosts.map((post) => ({
    url: `${BASE_URL}/devlog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...observationRoutes, ...devlogRoutes]
}
