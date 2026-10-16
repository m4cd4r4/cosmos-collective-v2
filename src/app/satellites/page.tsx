import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { SatelliteApp } from '@/components/features/satellites/SatelliteApp'

export const metadata: Metadata = {
  title: 'Satellites',
  description:
    'Every active satellite at its position right now: Starlink, GPS, the ISS and Tiangong, grouped by orbit class on a rotatable globe.',
}

export default function SatellitesPage() {
  return (
    <div className="h-[100dvh] flex flex-col bg-[#0a0e1a]">
      <Header />
      <SatelliteApp />
    </div>
  )
}
