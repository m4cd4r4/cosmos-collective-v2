/**
 * Starship Catch Page
 * "Return to the Tower": fly a Super Heavy booster from liftoff back to the launch tower arms.
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { StarshipCatchViewer } from '@/components/features/starship-catch/StarshipCatchViewer'

export const metadata: Metadata = {
  title: 'Return to the Tower',
  description:
    'Fly a Super Heavy booster from liftoff at Starbase back to the arms of the launch tower, on the timeline SpaceX published for Starship Flight 8, and compare your run with the real one.',
}

export default function StarshipCatchPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] pb-16 lg:pb-0">
      <Header />

      <div className="flex-1 relative overflow-hidden min-h-[70vh] lg:min-h-[500px]">
        <h1 className="sr-only">Return to the Tower: a Starship booster catch game</h1>
        <StarshipCatchViewer />
      </div>
    </div>
  )
}
