/**
 * User Dashboard Page
 * Personal dashboard showing favorites, activity, and contributions
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Starfield } from '@/components/ui/Starfield'
import { DashboardContent } from '@/components/features/dashboard/DashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal dashboard. Track your contributions, favourites, and exploration journey through the cosmos.',
}

export default function DashboardPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col relative">
      <Starfield />
      <Header />

      <main className="relative z-10 flex-1 overflow-auto">
        <DashboardContent />
      </main>
    </div>
  )
}
