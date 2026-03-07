'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useCountUp } from '@/hooks/useCountUp'
import { LayoutDashboard, BookMarked, BookOpen, Heart } from 'lucide-react'

const STATS = [
  { label: 'Live Data Sources', target: 11, suffix: '' },
  { label: 'Light Years Deep', target: 13, suffix: 'B+' },
  { label: 'JWST Observations', target: 50000, suffix: '+' },
  { label: 'Kepler Exoplanets', target: 2600, suffix: '+' },
]

const QUICK_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mission Control', href: '/mission-control', icon: BookMarked },
  { label: 'Dev Log', href: '/devlog', icon: BookOpen },
  { label: 'Credits', href: '/credits', icon: Heart },
]

function CountUpCell({ target, suffix, label, enabled, delay }: {
  target: number; suffix: string; label: string; enabled: boolean; delay: number
}) {
  const display = useCountUp({ target, suffix, duration: 2000, delay, enabled })
  return (
    <div className="text-center px-4 py-3">
      <div className="text-xl sm:text-2xl font-bold text-white tabular-nums font-mono">{display}</div>
      <div className="text-[9px] uppercase tracking-[0.13em] text-[#4a5580] mt-1">{label}</div>
    </div>
  )
}

export function LandingFooter() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-[rgba(4,6,18,0.97)] border-t border-[rgba(212,175,55,0.08)] px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10">
          {STATS.map((stat, i) => (
            <CountUpCell
              key={stat.label}
              target={stat.target}
              suffix={stat.suffix}
              label={stat.label}
              enabled={visible}
              delay={i * 200}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[rgba(212,175,55,0.06)] mb-8" />

        {/* Quick links */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.5)] hover:border-[rgba(212,175,55,0.25)] hover:bg-[rgba(212,175,55,0.05)] transition-all text-[11px] font-semibold text-[#c8d4f0]"
            >
              <Icon className="w-3.5 h-3.5 text-[#4a5580]" />
              {label}
            </Link>
          ))}
        </div>

        {/* Attribution */}
        <p className="text-center text-[9px] uppercase tracking-[0.12em] text-[#4a5580]/50">
          Made with real NASA, ESA, CSIRO, and STScI data &middot; Open source under MIT
        </p>
      </div>
    </section>
  )
}
