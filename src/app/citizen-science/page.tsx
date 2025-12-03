/**
 * Citizen Science Page
 * Hub for participating in astronomical research projects
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Starfield } from '@/components/ui/Starfield'
import { CitizenScienceHub } from '@/components/features/citizen-science/CitizenScienceHub'

export const metadata: Metadata = {
  title: 'Citizen Science',
  description: 'Contribute to real astronomical research. Help scientists classify galaxies, discover exoplanets, and explore the universe.',
}

export default function CitizenSciencePage() {
  return (
    <div className="min-h-screen relative">
      <Starfield />
      <Header />

      <main className="relative z-10 pt-20 pb-16">
        <CitizenScienceHub />
      </main>

      <Footer />
    </div>
  )
}
