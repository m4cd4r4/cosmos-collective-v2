'use client'

import Link from 'next/link'
import { Zap, Accessibility, ShieldCheck, BadgeCheck } from 'lucide-react'

const BADGES = [
  {
    label: 'Performance',
    score: 95,
    grade: 'A',
    icon: Zap,
    color: '#22c55e',
    detail: 'Lighthouse Score',
  },
  {
    label: 'Accessibility',
    score: 100,
    grade: 'AA',
    icon: Accessibility,
    color: '#4a90e2',
    detail: 'WCAG 2.1 Compliant',
  },
  {
    label: 'Security',
    score: null,
    grade: 'A+',
    icon: ShieldCheck,
    color: '#8b5cf6',
    detail: 'SSL Labs Grade',
  },
  {
    label: 'Best Practices',
    score: 100,
    grade: 'A',
    icon: BadgeCheck,
    color: '#d4af37',
    detail: 'Lighthouse Score',
  },
]

function scoreColor(score: number | null): string {
  if (score === null) return '#22c55e'
  if (score >= 90) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export function QualitySealBadges() {
  return (
    <section className="bg-[#0a0e1a] px-4 sm:px-6 py-14 sm:py-18">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#4a5580]">Quality</span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-2">
            Built to the Highest Standards
          </h2>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {BADGES.map(({ label, score, grade, icon: Icon, color, detail }) => (
            <div
              key={label}
              className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.5)] px-4 py-5 text-center"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full border border-[rgba(212,175,55,0.15)]">
                <Icon className="w-6 h-6" style={{ color }} />
              </div>

              {/* Score */}
              <span className="text-lg font-mono font-bold" style={{ color: scoreColor(score) }}>
                {score !== null ? score : grade}
              </span>

              <h3 className="text-[11px] font-semibold text-[#c8d4f0] mt-1">{label}</h3>
              <p className="text-[9px] text-[#4a5580] mt-0.5">{detail}</p>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div className="text-center mt-6">
          <Link
            href="/accessibility"
            className="text-[10px] uppercase tracking-[0.15em] text-[#4a5580] hover:text-[#d4af37] transition-colors"
          >
            View full accessibility report &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
