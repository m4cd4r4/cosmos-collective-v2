import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Deep Space Observatory',
  description:
    'Interactive sky chart of 33 iconic JWST and Hubble Space Telescope observations. Explore nebulae, galaxies, deep fields, and more with scientific analysis, fun facts, and NASA imagery.',
  keywords: [
    'JWST',
    'Hubble',
    'deep space',
    'observatory',
    'nebula',
    'galaxy',
    'NASA',
    'astronomy',
    'sky chart',
    'space telescope',
  ],
  openGraph: {
    title: 'Deep Space Observatory | Cosmos Collective',
    description:
      'Explore 33 iconic space telescope observations on an interactive celestial sky chart with Aitoff projection.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const ObservatoryViewer = dynamic(
  () =>
    import('@/components/features/observatory/ObservatoryViewer').then(m => ({
      default: m.ObservatoryViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#4a5580]">
        <div className="w-10 h-10 rounded-full border-2 border-[rgba(74,144,226,0.15)] border-t-[#d4af37] animate-spin" />
        <span className="font-mono text-xs tracking-wider">
          Loading Deep Space Observatory...
        </span>
      </div>
    ),
  },
)

export default function ObservatoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        id="main-content"
        className="flex-1 overflow-hidden"
        style={{ height: 'calc(100vh - 64px)' }}
        aria-label="Deep Space Observatory"
      >
        <ObservatoryViewer />
      </main>
    </div>
  )
}
