/**
 * Explore Page
 * Full gallery experience with advanced filtering and search
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ExploreGallery } from '@/components/features/explore/ExploreGallery'
import { ExploreFilters } from '@/components/features/explore/ExploreFilters'
import { ExploreSearch } from '@/components/features/explore/ExploreSearch'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse thousands of astronomical observations from JWST, Hubble, and Australian radio telescopes. Filter by category, wavelength, and more.',
}

// Loading skeleton for gallery
function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-video rounded-xl skeleton" />
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="py-8 px-4 md:px-6 lg:px-8 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Explore the <span className="text-gradient-stellar">Cosmos</span>
            </h1>
            <p className="text-gray-400 max-w-2xl">
              Browse observations from JWST, Hubble, and Australian radio telescopes.
              Click any image to view details and analysis.
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-6 px-4 md:px-6 lg:px-8 border-b border-white/10 bg-cosmos-surface/30">
          <div className="max-w-7xl mx-auto space-y-4">
            <ExploreSearch initialQuery={query} />
            <ExploreFilters
              initialSource={source}
              initialCategory={category}
              initialWavelength={wavelength}
            />
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-8 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<GallerySkeleton />}>
              <ExploreGallery
                source={source}
                category={category}
                wavelength={wavelength}
                query={query}
              />
            </Suspense>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
