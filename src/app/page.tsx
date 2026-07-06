'use client'

/**
 * Cosmos Collective — Landing Page
 * Solar System hero → feature showcase → live telemetry → footer
 */

import { Header } from '@/components/layout/Header'
import { LandingHero } from '@/components/features/landing/LandingHero'
import { FeatureShowcase } from '@/components/features/landing/FeatureShowcase'
import { LiveDataPreview } from '@/components/features/landing/LiveDataPreview'
import { LandingFooter } from '@/components/features/landing/LandingFooter'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <LandingHero />
      <FeatureShowcase />
      <LiveDataPreview />
      <LandingFooter />
    </div>
  )
}
