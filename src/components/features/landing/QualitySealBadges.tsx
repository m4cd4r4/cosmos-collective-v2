'use client'

import Link from 'next/link'
import { Shield, Accessibility, Gauge, CheckCircle } from 'lucide-react'

const BADGES = [
  {
    label: 'Performance',
    score: 95,
    grade: 'A',
    icon: Gauge,
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
    icon: Shield,
    color: '#8b5cf6',
    detail: 'SSL Labs Grade',
  },
  {
    label: 'Best Practices',
    score: 100,
    grade: 'A',
    icon: CheckCircle,
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
              {/* Score ring */}
              <div className="relative w-16 h-16 mx-auto mb-3">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {/* Background ring */}
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="3"
                  />
                  {/* Score ring */}
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke={scoreColor(score)}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(score ?? 100) * 0.974} 100`}
                    style={{ filter: `drop-shadow(0 0 4px ${scoreColor(score)})` }}
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-mono font-bold" style={{ color: scoreColor(score) }}>
                    {score !== null ? score : grade}
                  </span>
                </div>
              </div>

              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
              <h3 className="text-[11px] font-semibold text-[#c8d4f0]">{label}</h3>
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
