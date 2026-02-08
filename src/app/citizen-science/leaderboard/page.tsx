/**
 * Citizen Science Leaderboard Page
 * Displays global rankings and top contributors
 */

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/features/PageHero'
import { LeaderboardTable } from '@/components/features/citizen-science/LeaderboardTable'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard - Citizen Science',
  description: 'Top contributors to astronomical citizen science projects',
}

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
      <Header />

      <main className="flex-1 bg-cosmos-void">
        <PageHero
          title="Leaderboard"
          subtitle="Top Contributors to Astronomical Citizen Science"
          backgroundImage="earthBlueMarble"
        />

        <div className="max-w-7xl mx-auto px-4 py-12">
          <LeaderboardTable />
        </div>
      </main>

      <Footer />
    </div>
  )
}
