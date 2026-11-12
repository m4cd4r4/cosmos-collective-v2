/**
 * Lunar Descent Page
 * "Descent to Shackleton": fly the powered descent to the Moon's south pole.
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { LunarDescentViewer } from '@/components/features/lunar-descent/LunarDescentViewer'

export const metadata: Metadata = {
  title: 'Descent to Shackleton',
  description:
    'Fly a lunar lander down to the rim of Shackleton crater at the south pole of the Moon, over real NASA LOLA terrain, and compare your touchdown with published figures.',
}

export default function LunarDescentPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] pb-16 lg:pb-0">
      <Header />

      <div className="flex-1 relative overflow-hidden min-h-[70vh] lg:min-h-[500px]">
        <h1 className="sr-only">Descent to Shackleton: a lunar landing game</h1>
        <LunarDescentViewer />
      </div>
    </div>
  )
}
