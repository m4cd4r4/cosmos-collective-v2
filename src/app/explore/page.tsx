/**
 * Explore Page
 * Full gallery experience with advanced filtering and search
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/features/PageHero'
import { ExploreGallery } from '@/components/features/explore/ExploreGallery'
import { ExploreFilters } from '@/components/features/explore/ExploreFilters'
import { ExploreSearch } from '@/components/features/explore/ExploreSearch'
import { Telescope } from 'lucide-react'

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
        {/* Compact Hero with integrated search */}
        <PageHero
          title="Explore the Cosmos"
          titleHighlight="Cosmos"
          description="Browse observations from JWST, Hubble, and Australian radio telescopes."
          backgroundKey="jupiter"
          size="sm"
          badge={
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-cyan/10 border border-cosmos-cyan/30">
              <Telescope className="w-4 h-4 text-cosmos-cyan" />
              <span className="text-sm text-cosmos-cyan font-medium">61 Observations</span>
            </div>
          }
        >
          {/* Search embedded in hero */}
          <div className="max-w-2xl">
            <ExploreSearch initialQuery={query} />
          </div>
        </PageHero>

        {/* Filters — tight to hero */}
        <section className="py-4 px-4 md:px-6 lg:px-8 border-b border-white/10 bg-cosmos-surface/30">
          <div className="max-w-7xl mx-auto">
            <ExploreFilters
              initialSource={source}
              initialCategory={category}
              initialWavelength={wavelength}
            />
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-6 px-4 md:px-6 lg:px-8">
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
