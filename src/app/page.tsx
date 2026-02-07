/**
 * Cosmos Collective - Homepage
 * Multi-spectrum astronomical data exploration platform
 */

import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { HeroSection } from '@/components/features/HeroSection'
import { FeaturedObservations } from '@/components/features/FeaturedObservations'
import { LiveEventsBar } from '@/components/features/LiveEventsBar'
import { TelescopeShowcase } from '@/components/features/TelescopeShowcase'
import { CitizenSciencePreview } from '@/components/features/CitizenSciencePreview'
import { SKASection } from '@/components/features/SKASection'
import { SolarSystemPreview } from '@/components/features/SolarSystemPreview'
import { Footer } from '@/components/layout/Footer'

// Loading fallbacks
function SectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-video bg-white/5 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Navigation */}
      <Header />

      {/* Live Events Ticker */}
      <Suspense fallback={<div className="h-10 bg-cosmos-surface" />}>
        <LiveEventsBar />
      </Suspense>

      <main className="flex-1">
        {/* Hero Section with Mars Background */}
        <HeroSection backgroundKey="mars" backgroundBrightness={0.35} />

        {/* Featured JWST Observations */}
        <section className="py-16 px-4 md:px-6 lg:px-8" aria-labelledby="featured-heading">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<SectionSkeleton />}>
              <FeaturedObservations />
            </Suspense>
          </div>
        </section>

        {/* Australian Telescopes & SKA */}
        <section
          className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-transparent via-cosmos-nebula-blue/5 to-transparent"
          aria-labelledby="aussie-telescopes-heading"
        >
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<SectionSkeleton />}>
              <TelescopeShowcase />
            </Suspense>
          </div>
        </section>

        {/* SKA Deep Dive */}
        <section className="py-16 px-4 md:px-6 lg:px-8" aria-labelledby="ska-heading">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<SectionSkeleton />}>
              <SKASection />
            </Suspense>
          </div>
        </section>

        {/* Interactive Solar System */}
        <section
          className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-transparent via-cosmos-amber/5 to-transparent"
          aria-labelledby="solar-system-heading"
        >
          <div className="max-w-7xl mx-auto">
            <SolarSystemPreview />
          </div>
        </section>

        {/* Citizen Science */}
        <section
          className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-transparent via-cosmos-gold/5 to-transparent"
          aria-labelledby="citizen-science-heading"
        >
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<SectionSkeleton />}>
              <CitizenSciencePreview />
            </Suspense>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
