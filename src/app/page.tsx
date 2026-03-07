'use client'

/**
 * Cosmos Collective — Landing Page
 * Full scrolling page: Solar System hero → feature showcase → live data → quality badges → footer
 */

import { Header } from '@/components/layout/Header'
import { LandingHero } from '@/components/features/landing/LandingHero'
import { FeatureShowcase } from '@/components/features/landing/FeatureShowcase'
import { LiveDataPreview } from '@/components/features/landing/LiveDataPreview'
import { QualitySealBadges } from '@/components/features/landing/QualitySealBadges'
import { LandingFooter } from '@/components/features/landing/LandingFooter'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#c8d4f0]">
      <Header />
      <LandingHero />
      <FeatureShowcase />
      <LiveDataPreview />
      <QualitySealBadges />
      <LandingFooter />
    </div>
  )
}
