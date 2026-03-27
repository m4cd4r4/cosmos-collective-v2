import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/Header'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsBar } from '@/components/ui/StatsBar'
import { Satellite } from 'lucide-react'
import { SPACECRAFT_CATALOG, CATEGORY_LABELS } from '@/data/spacecraft-catalog'

export const metadata: Metadata = {
  title: 'Spacecraft Encyclopedia',
  description:
    'Explore space telescopes, radio observatories, space stations, and planetary probes. Detailed profiles of JWST, Hubble, Chandra, Voyager, Perseverance, ISS, and Australian radio telescopes.',
  keywords: ['spacecraft', 'space telescope', 'JWST', 'Hubble', 'Voyager', 'ISS', 'radio telescope', 'ASKAP', 'Parkes'],
}

const SpacecraftExplorer = dynamic(
  () => import('@/components/features/spacecraft/SpacecraftExplorer').then(m => ({ default: m.SpacecraftExplorer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-cosmos-gold/15 border-t-cosmos-gold animate-spin" />
      </div>
    ),
  },
)

function getCategoryCounts() {
  const counts: Record<string, number> = {}
  for (const entry of SPACECRAFT_CATALOG) {
    const label = CATEGORY_LABELS[entry.category]
    counts[label] = (counts[label] ?? 0) + 1
  }
  return counts
}

export default function SpacecraftPage() {
  const counts = getCategoryCounts()
  const activeCount = SPACECRAFT_CATALOG.filter(e => e.status === 'active').length

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cosmos-void text-gray-100">
      <Header />
      <PageHeader
        icon={Satellite}
        title="Spacecraft"
        badge={{ text: `${SPACECRAFT_CATALOG.length} Profiles` }}
        subtitle="Telescopes - Probes - Stations"
      />
      <StatsBar items={[
        ...Object.entries(counts).map(([label, value]) => ({
          label,
          value: String(value),
          color: label.includes('Space Tel') ? '#d4af37' : label.includes('Radio') ? '#4a90e2' : label.includes('Station') ? '#22c55e' : '#e040fb',
        })),
        { label: 'Active', value: String(activeCount), color: '#22c55e' },
      ]} />
      <main className="flex-1 px-4 sm:px-5 py-5 max-w-7xl mx-auto w-full">
        <SpacecraftExplorer />
      </main>
    </div>
  )
}
