/**
 * Observation Detail Page
 * Full view of an observation with pan/zoom and analysis
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ObservationViewer } from '@/components/features/explore/ObservationViewer'
import { ObservationInfo } from '@/components/features/explore/ObservationInfo'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { getFeaturedRadioObservations } from '@/services/australian-telescopes'

// Generate static params for featured images
export function generateStaticParams() {
  const allObservations = [
    ...getFeaturedJWSTImages(),
    ...getFeaturedRadioObservations(),
  ]

  return allObservations.map((obs) => ({
    id: obs.id,
  }))
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const observation = getObservation(params.id)

  if (!observation) {
    return { title: 'Observation Not Found' }
  }

  return {
    title: observation.targetName,
    description: observation.description || observation.analysis?.summary,
    openGraph: {
      title: `${observation.targetName} | Cosmos Collective`,
      description: observation.description || observation.analysis?.summary,
      images: [observation.images.preview],
    },
  }
}

// Helper to get observation
function getObservation(id: string) {
  const allObservations = [
    ...getFeaturedJWSTImages(),
    ...getFeaturedRadioObservations(),
  ]

  return allObservations.find((obs) => obs.id === id)
}

// Loading skeleton
function ViewerSkeleton() {
  return (
    <div className="aspect-video bg-cosmos-surface rounded-xl skeleton" />
  )
}

export default function ObservationPage({
  params,
}: {
  params: { id: string }
}) {
  const observation = getObservation(params.id)

  if (!observation) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-400">
              <li>
                <a href="/explore" className="hover:text-white transition-colors">
                  Explore
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white" aria-current="page">
                {observation.targetName}
              </li>
            </ol>
          </nav>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Image Viewer (2/3 width) */}
            <div className="lg:col-span-2">
              <Suspense fallback={<ViewerSkeleton />}>
                <ObservationViewer observation={observation} />
              </Suspense>
            </div>

            {/* Info Panel (1/3 width) */}
            <aside className="lg:col-span-1">
              <ObservationInfo observation={observation} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
