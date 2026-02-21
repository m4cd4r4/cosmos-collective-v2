import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'JWST Explorer | Cosmos Collective',
  description:
    'Explore iconic James Webb Space Telescope observations with wavelength band switching, feature annotations, and scientific analysis. NIRCam and MIRI infrared views of nebulae, galaxies, and solar system objects.',
  keywords: [
    'JWST',
    'James Webb Space Telescope',
    'infrared astronomy',
    'NIRCam',
    'MIRI',
    'nebula',
    'deep field',
    'NASA',
    'space telescope',
  ],
  openGraph: {
    title: 'JWST Explorer | Cosmos Collective',
    description: 'Interactive explorer for James Webb Space Telescope observations — wavelength switching, feature annotations, and scientific analysis.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const JWSTViewer = dynamic(
  () => import('@/components/features/jwst/JWSTViewer').then(m => ({ default: m.JWSTViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#4a5580]">
        <div className="w-10 h-10 rounded-full border-2 border-[rgba(212,175,55,0.15)] border-t-[#d4af37] animate-spin" />
        <span className="font-mono text-xs tracking-wider">Loading JWST Explorer…</span>
      </div>
    ),
  },
)

export default function JWSTPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        id="main-content"
        className="flex-1 overflow-hidden"
        style={{ height: 'calc(100vh - 64px)' }}
        aria-label="JWST Explorer"
      >
        <JWSTViewer />
      </main>
    </div>
  )
}
