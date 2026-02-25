/**
 * Observation Detail Page
 * Full view of an observation with pan/zoom and analysis
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { ObservationViewer } from '@/components/features/explore/ObservationViewer'
import { ObservationInfo } from '@/components/features/explore/ObservationInfo'
import { getFeaturedJWSTImages, getFeaturedHubbleImages } from '@/services/mast-api'
import { getFeaturedRadioObservations } from '@/services/australian-telescopes'

// Generate static params for featured images
export function generateStaticParams() {
  const allObservations = [
    ...getFeaturedJWSTImages(),
    ...getFeaturedHubbleImages(),
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
    ...getFeaturedHubbleImages(),
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
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* App Header Strip */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center gap-3 shrink-0">
        <a href="/explore" className="text-[10px] uppercase tracking-wider text-[#4a5580] hover:text-[#c8d4f0] transition-colors">
          ← Explore
        </a>
        <span className="text-[#3a4560]">/</span>
        <span className="text-[11px] font-semibold text-[#c8d4f0] truncate">{observation.targetName}</span>
      </div>

      <main className="flex-1 overflow-auto px-4 md:px-5 py-4">
        <div className="max-w-7xl mx-auto h-full">
          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-5 h-full">
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
    </div>
  )
}
