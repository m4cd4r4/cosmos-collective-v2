'use client'

/**
 * Webb Explorer panel — the former /jwst page, mounted inside /explore.
 *
 * The route was merged away in the 2026-10-14 prune because it browsed the
 * same catalogue as /explore. What it does that the gallery does not is
 * wavelength-band switching and feature annotations on a single observation,
 * so it survives here as a view of the archive rather than a separate page.
 */

import dynamic from 'next/dynamic'

const JWSTViewer = dynamic(
  () => import('@/components/features/jwst/JWSTViewer').then(m => ({ default: m.JWSTViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-cosmos-muted">
        <div className="w-10 h-10 rounded-full border-2 border-[rgba(212,175,55,0.15)] border-t-[#d4af37] animate-spin" />
        <span className="font-mono text-xs tracking-wider">Loading Webb Explorer…</span>
      </div>
    ),
  },
)

export function WebbExplorerPanel() {
  return (
    <div
      className="flex-1 overflow-hidden pb-16 lg:pb-0 min-h-[560px]"
      aria-label="Webb Explorer"
      role="region"
    >
      <JWSTViewer />
    </div>
  )
}
