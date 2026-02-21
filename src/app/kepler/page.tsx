import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Kepler Exoplanet Explorer',
  description:
    'Explore 2,600+ confirmed exoplanets discovered by the Kepler Space Telescope. Interactive star field visualization with stellar temperature color-coding, habitable zone filtering, and orbital system diagrams. Data live from the NASA Exoplanet Archive.',
  keywords: [
    'Kepler telescope',
    'exoplanets',
    'NASA',
    'star field',
    'habitable zone',
    'planetary systems',
    'HR diagram',
    'exoplanet explorer',
  ],
  openGraph: {
    title: 'Kepler Exoplanet Explorer | Cosmos Collective',
    description: 'Interactive map of 2,600+ confirmed exoplanets discovered by NASA\'s Kepler mission — color-coded by stellar temperature, filterable by planet size and orbital period.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

// Lazy-load the viewer so canvas code never runs on the server
const KeplerViewer = dynamic(
  () => import('@/components/features/kepler/KeplerViewer').then(m => ({ default: m.KeplerViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#4a5580]">
        <div className="w-10 h-10 rounded-full border-2 border-[rgba(74,144,226,0.15)] border-t-[#4a90e2] animate-spin" />
        <span className="font-mono text-xs tracking-wider">Loading Kepler Explorer…</span>
      </div>
    ),
  },
)

export default function KeplerPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        id="main-content"
        className="flex-1 overflow-hidden"
        style={{ height: 'calc(100vh - 64px)' }}
        aria-label="Kepler Exoplanet Explorer"
      >
        <KeplerViewer />
      </main>
    </div>
  )
}
