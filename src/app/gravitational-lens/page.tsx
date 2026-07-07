/**
 * Gravitational Lens Telescope Page
 * Embeds the standalone 550-AU Solar Gravitational Lens mission simulation.
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { GravitationalLensViewer } from '@/components/features/gravitational-lens/GravitationalLensViewer'

export const metadata: Metadata = {
  title: 'Gravitational Lens Telescope',
  description:
    'Fly a solar-sail spacecraft to 650 AU and use the Sun itself as a telescope. An interactive walkthrough of the Solar Gravitational Lens mission concept (NASA/JPL NIAC, Turyshev et al): how gravity bends light, the focal line, the sundiver trajectory, and imaging an exoplanet through an Einstein ring. Real physics, dramatised visuals.',
  keywords: [
    'Solar Gravitational Lens',
    'SGL telescope',
    'gravitational lensing',
    'exoplanet imaging',
    'Einstein ring',
    'solar sail',
    'NASA NIAC',
    'Turyshev',
    '550 AU',
  ],
  openGraph: {
    title: 'Gravitational Lens Telescope | Cosmos Collective',
    description:
      'Fly to 650 AU and use the Sun as a telescope to image an exoplanet\'s surface. An interactive walkthrough of the Solar Gravitational Lens mission concept.',
    images: [{ url: '/images/gravitational-lens-card.webp', width: 1280, height: 720 }],
  },
}

export default function GravitationalLensPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] pb-16 lg:pb-0">
      <Header />

      <div className="flex-1 relative overflow-hidden min-h-[70vh] lg:min-h-[500px]">
        <h1 className="sr-only">Solar Gravitational Lens Telescope</h1>
        <GravitationalLensViewer />
      </div>
    </div>
  )
}
