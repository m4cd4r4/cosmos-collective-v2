/**
 * Accessibility Page — app-style full-window panel
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import {
  Accessibility,
  Eye,
  Keyboard,
  Monitor,
  MousePointer,
  Volume2,
  Contrast,
  Type,
  CheckCircle2,
  Github,
  ExternalLink,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Learn about accessibility features and our commitment to making astronomy accessible to everyone.',
}

const features = [
  {
    icon: Keyboard,
    title: 'Keyboard Navigation',
    description: 'Full keyboard navigation support. Use Tab to move between elements and Enter to activate.',
    color: '#4a90e2',
  },
  {
    icon: Eye,
    title: 'Screen Reader Support',
    description: 'Semantic HTML and ARIA labels ensure compatibility with NVDA, JAWS, and VoiceOver.',
    color: '#e040fb',
  },
  {
    icon: Contrast,
    title: 'High Contrast',
    description: 'Colour combinations meet WCAG AA contrast requirements for readability.',
    color: '#d4af37',
  },
  {
    icon: Type,
    title: 'Scalable Text',
    description: 'All text scales properly with browser zoom settings up to 200% without loss of functionality.',
    color: '#4caf93',
  },
  {
    icon: MousePointer,
    title: 'Focus Indicators',
    description: 'Clear visual focus indicators help keyboard users track their position on the page.',
    color: '#f59e0b',
  },
  {
    icon: Monitor,
    title: 'Responsive Design',
    description: 'Adapts to different screen sizes and orientations for optimal viewing on any device.',
    color: '#64d8cb',
  },
]

const standards = [
  'Semantic HTML5 markup for proper document structure',
  'ARIA landmarks and labels for assistive technology',
  'Colour contrast ratios meeting WCAG 2.1 AA requirements',
  'Descriptive alt text for all meaningful images',
  'Visible focus states for interactive elements',
  'Consistent and predictable navigation',
  'No content that flashes more than three times per second',
]

export default function AccessibilityPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* App Header Strip */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Accessibility className="w-4 h-4 text-[#d4af37]" />
          <span className="text-base font-bold tracking-[0.15em] uppercase text-[#e0e8ff]">Accessibility</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(74,144,226,0.12)] border border-[rgba(74,144,226,0.25)]">
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#4a90e2]">WCAG 2.1 AA</span>
          </div>
        </div>
        <span className="hidden sm:block text-[9px] uppercase tracking-wider text-[#4a5580]">
          Universal Design
        </span>
      </div>

      {/* Stats Bar */}
      <div className="bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.08)] flex shrink-0">
        {[
          { label: 'Features', value: String(features.length), color: '#d4af37' },
          { label: 'Standards', value: String(standards.length), color: '#4a90e2' },
          { label: 'Compliance', value: 'AA', color: '#4caf93' },
          { label: 'Guideline', value: 'WCAG 2.1', color: '#e040fb' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center px-6 lg:px-10 py-2 border-r border-[rgba(212,175,55,0.06)] last:border-0">
            <span className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</span>
            <span className="text-[9px] uppercase tracking-[0.13em] text-[#4a5580] mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* Left: Commitment + Features */}
          <div className="space-y-5">

            {/* Commitment */}
            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4caf93]" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#4caf93]">Our Commitment</span>
              </div>
              <div className="px-4 py-4 space-y-2.5">
                <p className="text-[12px] text-[#8090b0] leading-relaxed">
                  We believe the wonders of the universe should be accessible to everyone. Cosmos Collective is committed to ensuring digital accessibility for people with disabilities.
                </p>
                <p className="text-[12px] text-[#8090b0] leading-relaxed">
                  We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, which explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map(({ icon: Icon, title, description, color }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(8,12,28,0.7)] px-4 py-3.5 hover:border-[rgba(212,175,55,0.25)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-[#c8d4f0] mb-0.5">{title}</div>
                      <div className="text-[10px] text-[#4a5580] leading-relaxed">{description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Technical Standards + Feedback */}
          <div className="space-y-5">

            {/* Technical Standards */}
            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4caf93]" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#4caf93]">Technical Standards</span>
              </div>
              <div className="px-4 py-3">
                <ul className="space-y-2.5">
                  {standards.map((s) => (
                    <li key={s} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4caf93] shrink-0 mt-0.5" />
                      <span className="text-[11px] text-[#6070a0] leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feedback */}
            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#d4af37]">Feedback</span>
              </div>
              <div className="px-4 py-4">
                <p className="text-[11px] text-[#6070a0] leading-relaxed mb-3">
                  We welcome your feedback on the accessibility of Cosmos Collective. If you encounter any barriers or have suggestions for improvement, please let us know.
                </p>
                <a
                  href="https://github.com/m4cd4r4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#d4af37] hover:text-[#e0c060] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  Report via GitHub
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
