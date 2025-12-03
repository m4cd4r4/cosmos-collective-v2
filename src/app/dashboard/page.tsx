/**
 * User Dashboard Page
 * Personal dashboard showing favorites, activity, and contributions
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Starfield } from '@/components/ui/Starfield'
import { DashboardContent } from '@/components/features/dashboard/DashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal dashboard. Track your contributions, favorites, and exploration journey through the cosmos.',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen relative">
      <Starfield />
      <Header />

      <main className="relative z-10 pt-20 pb-16">
        <DashboardContent />
      </main>

      <Footer />
    </div>
  )
}
