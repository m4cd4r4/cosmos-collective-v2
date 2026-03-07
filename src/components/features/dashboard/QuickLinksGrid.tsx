'use client'

import Link from 'next/link'
import { Globe, Map, Telescope, Search, Zap, Orbit } from 'lucide-react'

const LINKS = [
  { href: '/solar-system', icon: Globe, label: 'Solar System' },
  { href: '/sky-map', icon: Map, label: 'Sky Map' },
  { href: '/observatory', icon: Telescope, label: 'Observatory' },
  { href: '/explore', icon: Search, label: 'Explore' },
  { href: '/events', icon: Zap, label: 'Events' },
  { href: '/kepler', icon: Orbit, label: 'Kepler' },
]

export function QuickLinksGrid() {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-[0.15em] text-[#4a5580] font-semibold mb-3">
        Quick Links
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {LINKS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(212,175,55,0.3)] hover:bg-[rgba(212,175,55,0.05)] transition-all"
          >
            <Icon className="w-5 h-5 text-[#4a5580] group-hover:text-[#d4af37] transition-colors" />
            <span className="text-[10px] uppercase tracking-wider text-[#4a5580] group-hover:text-[#d4af37] transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
