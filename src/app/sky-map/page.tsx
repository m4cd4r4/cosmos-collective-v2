/**
 * Sky Map Page
 * Interactive celestial map using Aladin Lite
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { SkyMapViewer } from '@/components/features/sky-map/SkyMapViewer'
import { SkyMapSkeleton } from '@/components/loading/SkyMapSkeleton'

export const metadata: Metadata = {
  title: 'Sky Map',
  description: 'Interactive celestial map. Explore the sky across multiple wavelengths, from radio to X-ray. Search for objects, view observation locations, and navigate the cosmos.',
}

export default function SkyMapPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Extract initial coordinates from URL if provided
  const ra = typeof searchParams.ra === 'string' ? parseFloat(searchParams.ra) : undefined
  const dec = typeof searchParams.dec === 'string' ? parseFloat(searchParams.dec) : undefined
  const fov = typeof searchParams.fov === 'string' ? parseFloat(searchParams.fov) : undefined
  const target = typeof searchParams.target === 'string' ? searchParams.target : undefined

  return (
    <div className="flex flex-col h-screen pb-16 lg:pb-0">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Screen reader heading - visually hidden but accessible */}
        <h1 className="sr-only">Interactive Sky Map</h1>

        <Suspense fallback={<SkyMapSkeleton />}>
          <SkyMapViewer
            initialRa={ra}
            initialDec={dec}
            initialFov={fov}
            initialTarget={target}
          />
        </Suspense>
      </main>
    </div>
  )
}
