/**
 * Explore Page
 * Full gallery experience with advanced filtering and search
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { ExploreGallery } from '@/components/features/explore/ExploreGallery'
import { ExploreFilters } from '@/components/features/explore/ExploreFilters'
import { ExploreSearch } from '@/components/features/explore/ExploreSearch'
import { getFeaturedJWSTImages, getFeaturedHubbleImages } from '@/services/mast-api'
import { getFeaturedRadioObservations } from '@/services/australian-telescopes'
import { Telescope, Layers } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsBar } from '@/components/ui/StatsBar'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse thousands of astronomical observations from JWST, Hubble, and Australian radio telescopes. Filter by category, wavelength, and more.',
}

// Loading skeleton for gallery — dark themed
function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-video rounded-xl bg-[rgba(255,255,255,0.04)] animate-pulse" />
      ))}
    </div>
  )
}

export default function ExplorePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Extract filter parameters from URL
  const source = typeof searchParams.source === 'string' ? searchParams.source : undefined
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined
  const wavelength = typeof searchParams.wavelength === 'string' ? searchParams.wavelength : undefined
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined

  // Get real counts from data layer (server component — free to call directly)
  const jwstCount = getFeaturedJWSTImages().length
  const hubbleCount = getFeaturedHubbleImages().length
  const radioCount = getFeaturedRadioObservations().length
  const totalCount = jwstCount + hubbleCount + radioCount

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* ── App Header Strip ──────────────────────────────────────────────── */}
      <PageHeader
        icon={Telescope}
        title="Explore"
        badge={{ text: `${totalCount} Observations`, color: '#d4af37' }}
        subtitle="JWST · Hubble · Radio"
        rightContent={
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-500">
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Multi-source Archive</span>
          </div>
        }
      />

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <StatsBar items={[
        { label: 'JWST', value: String(jwstCount), color: '#e040fb' },
        { label: 'Hubble', value: String(hubbleCount), color: '#4a90e2' },
        { label: 'Radio', value: String(radioCount), color: '#f59e0b' },
        { label: 'Total', value: String(totalCount), color: '#d4af37' },
      ]} />

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-7xl mx-auto w-full">

        {/* ── Search + Filters ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-[rgba(212,175,55,0.08)]">
            <ExploreSearch initialQuery={query} />
          </div>
          <div className="px-4 py-3">
            <ExploreFilters
              initialSource={source}
              initialCategory={category}
              initialWavelength={wavelength}
            />
          </div>
        </div>

        {/* ── Gallery Grid ──────────────────────────────────────────────── */}
        <Suspense fallback={<GallerySkeleton />}>
          <ExploreGallery
            source={source}
            category={category}
            wavelength={wavelength}
            query={query}
          />
        </Suspense>
      </main>

    </div>
  )
}
