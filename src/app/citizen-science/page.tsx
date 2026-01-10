/**
 * Citizen Science Page
 * Hub for participating in astronomical research projects
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/features/PageHero'
import { CitizenScienceHub } from '@/components/features/citizen-science/CitizenScienceHub'
import { Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Citizen Science',
  description: 'Contribute to real astronomical research. Help scientists classify galaxies, discover exoplanets, and explore the universe.',
}

export default function CitizenSciencePage() {
  return (
    <div className="min-h-screen relative">
      <Header />

      {/* Page Hero with Earth/Pale Blue Dot Background */}
      <PageHero
        title="Citizen Science"
        titleHighlight="Science"
        description="Contribute to real astronomical research. Help scientists classify galaxies, discover exoplanets, and explore the universe alongside researchers worldwide."
        backgroundKey="earth"
        size="md"
        badge={
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-gold/10 border border-cosmos-gold/30">
            <Users className="w-4 h-4 text-cosmos-gold" />
            <span className="text-sm text-cosmos-gold font-medium">Join 2M+ Citizen Scientists</span>
          </div>
        }
      />

      <main className="relative z-10 pb-16">
        <CitizenScienceHub />
      </main>

      <Footer />
    </div>
  )
}
