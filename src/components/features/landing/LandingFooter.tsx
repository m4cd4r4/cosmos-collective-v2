'use client'

import Link from 'next/link'
import { useInstallPrompt } from '@/components/PWAProvider'

const EXPLORE_LINKS = [
  { label: 'Solar System', href: '/solar-system' },
  { label: 'Webb Explorer', href: '/explore?view=webb' },
  { label: '550-AU', href: '/gravitational-lens' },
  { label: 'Kepler Exoplanets', href: '/kepler' },
  { label: 'Descent to Shackleton', href: '/lunar-descent' },
  { label: 'Return to the Tower', href: '/starship-catch' },
  { label: 'Sky Map', href: '/sky-map' },
  { label: 'Satellites', href: '/satellites' },
  { label: 'Spacecraft', href: '/satellites#spacecraft' },
]

const SITE_LINKS = [
  { label: 'Explore Gallery', href: '/explore' },
  { label: 'Credits & Data Sources', href: '/credits' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

const FACTS = [
  { value: '11', label: 'live data sources' },
  { value: '116', label: 'curated observations' },
  { value: '2,600+', label: 'confirmed exoplanets' },
]

export function LandingFooter() {
  const { canInstall, install } = useInstallPrompt()

  return (
    <footer className="bg-[rgba(4,6,18,0.97)] border-t border-white/[0.06] px-4 sm:px-6 pt-14 pb-24 lg:pb-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 max-w-sm">
            <p className="font-display font-semibold text-white text-lg mb-3">
              Cosmos Collective
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Real astronomical data from NASA, ESA, STScI, NOAA, and CSIRO,
              presented for curious people. Every number has a source.
            </p>
            <dl className="flex gap-8">
              {FACTS.map(({ value, label }) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block text-xl font-mono tabular-nums font-medium text-white">
                      {value}
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <p className="text-sm text-gray-400 font-medium mb-4">
              Explore
            </p>
            <ul className="space-y-2.5">
              {EXPLORE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Site */}
          <nav aria-label="Site">
            <p className="text-sm text-gray-400 font-medium mb-4">
              Site
            </p>
            <ul className="space-y-2.5">
              {SITE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {canInstall && (
                <li>
                  <button
                    type="button"
                    onClick={install}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Install Cosmos Collective
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-gray-500">
            Imagery and data courtesy of NASA, ESA, CSA, STScI, NOAA SWPC, and CSIRO.
          </p>
          <p className="text-xs text-gray-600">Open source under MIT</p>
        </div>
      </div>
    </footer>
  )
}
