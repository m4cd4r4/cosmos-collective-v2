/**
 * Solar System Page
 * Interactive 3D Solar System visualization with photorealistic textures
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { SolarSystemViewer } from '@/components/features/solar-system/SolarSystemViewer'

export const metadata: Metadata = {
  title: 'Solar System',
  description:
    'Explore a photorealistic 3D solar system with NASA textures, orbital mechanics, atmospheric effects, and an Earth Dive experience. Follow any planet through the cosmos.',
}

export default function SolarSystemPage() {
  return (
    <div className="flex flex-col h-screen pb-16 lg:pb-0">
      <Header />

      <main className="flex-1 relative overflow-hidden min-h-[70vh] lg:min-h-[500px]">
        <h1 className="sr-only">Interactive 3D Solar System</h1>
        <SolarSystemViewer />
      </main>
    </div>
  )
}
