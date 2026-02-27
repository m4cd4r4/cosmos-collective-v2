'use client'

/**
 * Mission Control — Hub page for tools NOT in the header nav
 * Links to: Explore, Live Events, Devlog, Observatory, Dashboard, Credits
 */

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { StatPopover } from '@/components/ui/StatPopover'
import { BookMarked, ChevronRight } from 'lucide-react'
import { TOOLS, INFO_PANELS } from '@/lib/mission-control-data'

// ──────────────────────────────────────────────────────────────────────────

export default function MissionControlPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* App Header Strip */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <BookMarked className="w-4 h-4 text-[#d4af37]" />
          <span className="text-base font-bold tracking-[0.15em] uppercase text-[#e0e8ff]">Mission Control</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#d4af37]">All Systems</span>
          </div>
          <span className="hidden sm:inline text-[9px] uppercase tracking-[0.12em] text-[#4a5580] border border-[rgba(212,175,55,0.1)] px-2 py-0.5 rounded">
            Cosmos Collective Hub
          </span>
        </div>
        <span className="hidden sm:block text-[9px] uppercase tracking-wider text-[#4a5580]">
          6 Modules Active
        </span>
      </div>

      {/* Stats Bar */}
      <div className="bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.08)] flex shrink-0">
        {INFO_PANELS.map(({ label, value, color, popoverItems }) => (
          <StatPopover key={label} items={popoverItems} className="flex-1 border-r border-[rgba(212,175,55,0.06)] last:border-0">
            <div className="flex flex-col items-center px-6 lg:px-10 py-2">
              <span className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</span>
              <span className="text-[9px] uppercase tracking-[0.13em] text-[#4a5580] mt-0.5 whitespace-nowrap">{label}</span>
            </div>
          </StatPopover>
        ))}
      </div>

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-6xl mx-auto w-full">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#4a5580]">Available Modules</span>
          <div className="flex-1 h-px bg-[rgba(212,175,55,0.06)]" />
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map(({ label, href, icon: Icon, badge, badgeColor, badgePulse, description, stat, color, glow }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(8,12,28,0.7)] overflow-hidden hover:border-[rgba(212,175,55,0.3)] transition-all duration-200 hover:bg-[rgba(8,12,28,0.9)] flex flex-col"
              style={{ '--glow': glow } as React.CSSProperties}
            >
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-[rgba(212,175,55,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="text-[13px] font-bold text-[#e0e8ff] uppercase tracking-[0.1em]">{label}</span>
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded"
                  style={{ background: `${badgeColor}18`, border: `1px solid ${badgeColor}28` }}
                >
                  {badgePulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badgeColor }} />}
                  <span className="text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: badgeColor }}>{badge}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4 py-3.5 flex-1 flex flex-col gap-2.5">
                <p className="text-[11px] text-[#6070a0] leading-relaxed">{description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.12em] text-[#4a5580]">{stat}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#4a5580] group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom info row */}
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {INFO_PANELS.map(({ icon: Icon, label, detail, color, popoverItems }) => (
            <StatPopover key={label} items={popoverItems}>
              <div className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.5)] px-3.5 py-3 flex items-start gap-2.5 text-left">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${color}15`, border: `1px solid ${color}20` }}
                >
                  <Icon className="w-3 h-3" style={{ color }} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#c8d4f0]">{label}</div>
                  <div className="text-[9px] text-[#4a5580] mt-0.5 leading-relaxed">{detail}</div>
                </div>
              </div>
            </StatPopover>
          ))}
        </div>
      </main>
    </div>
  )
}
