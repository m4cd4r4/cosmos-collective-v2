'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { BookMarked, X, ChevronRight, ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { TOOLS, INFO_PANELS } from '@/lib/mission-control-data'
import { StatPopover } from '@/components/ui/StatPopover'
import { useMCStore } from '@/lib/mc-store'

export function MissionControlFAB() {
  const { open, toggle, close: closeStore } = useMCStore()
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    closeStore()
    setTimeout(() => fabRef.current?.focus(), 50)
  }, [closeStore])

  // Close on route change
  useEffect(() => {
    closeStore()
  }, [pathname, closeStore])

  // Close on Escape / click outside
  useEffect(() => {
    if (!open) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }

    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open, close])

  // Focus close button when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => closeRef.current?.focus(), 100)
    }
  }, [open])

  // Hide on Mission Control page and Solar System page (FAB obscures solar system's own UI toggle)
  if (pathname === '/mission-control' || pathname === '/solar-system') return null

  return (
    <>
      {/* ── FAB Button ────────────────────────────────────────────── */}
      <button
        ref={fabRef}
        onClick={toggle}
        className="fixed z-40 bottom-20 right-4 lg:bottom-6 lg:right-6 w-12 h-12 rounded-full hidden lg:flex items-center justify-center cursor-pointer transition-all duration-300 group"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.08) 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          boxShadow: open
            ? '0 0 20px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 4px 16px rgba(0,0,0,0.4), 0 0 12px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
        aria-label={open ? 'Close Mission Control' : 'Open Mission Control'}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {open ? (
          <X className="w-5 h-5 text-[#d4af37]" />
        ) : (
          <>
            <BookMarked className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
            {/* Pulse ring - 3 iterations then stops */}
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                border: '1px solid rgba(212,175,55,0.2)',
                animationDuration: '3s',
                animationIterationCount: 3,
              }}
            />
          </>
        )}
      </button>

      {/* ── Backdrop ──────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* ── Panel ─────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Mission Control quick access"
          className="fixed z-60 bottom-20 right-4 lg:bottom-6 lg:right-6 w-[calc(100vw-2rem)] max-w-sm animate-fab-panel-enter"
          style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
          <div
            className="rounded-2xl overflow-hidden flex flex-col glass-panel-strong"
            style={{
              maxHeight: 'calc(100vh - 8rem)',
              border: '1px solid rgba(212,175,55,0.2)',
            }}
          >
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="px-4 py-3 border-b border-[rgba(212,175,55,0.12)] flex items-center justify-between shrink-0 bg-[rgba(4,6,18,0.6)]">
              <div className="flex items-center gap-2.5">
                <BookMarked className="w-4 h-4 text-[#d4af37]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#e0e8ff]">
                  Mission Control
                </span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                  <span className="text-[8px] uppercase tracking-[0.12em] text-[#d4af37]">Online</span>
                </div>
              </div>
              <button
                ref={closeRef}
                onClick={close}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5 text-[#6070a0]" />
              </button>
            </div>

            {/* ── Scrollable body ─────────────────────────────────── */}
            <div className="overflow-y-auto overscroll-contain flex-1">
              {/* Module cards */}
              <div className="px-3 pt-3 pb-2 space-y-1.5">
                {TOOLS.map(({ label, href, icon: Icon, badge, badgeColor, badgePulse, stat, color }, i) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[rgba(212,175,55,0.08)] hover:border-[rgba(212,175,55,0.2)] bg-[rgba(8,12,28,0.4)] hover:bg-[rgba(8,12,28,0.7)] transition-all duration-200 animate-slide-up"
                    style={{
                      animationDelay: `${i * 50}ms`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#e0e8ff] uppercase tracking-[0.08em]">
                          {label}
                        </span>
                        <div
                          className="flex items-center gap-1 px-1.5 py-px rounded"
                          style={{ background: `${badgeColor}15`, border: `1px solid ${badgeColor}20` }}
                        >
                          {badgePulse && (
                            <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: badgeColor }} />
                          )}
                          <span className="text-[7px] uppercase tracking-[0.1em] font-semibold" style={{ color: badgeColor }}>
                            {badge}
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] uppercase tracking-[0.1em] text-[#4a5580] mt-0.5 block">
                        {stat}
                      </span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-3.5 h-3.5 text-[#4a5580] group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2 px-4 py-1.5">
                <span className="text-[8px] uppercase tracking-[0.2em] text-[#4a5580]">Telemetry</span>
                <div className="flex-1 h-px bg-[rgba(212,175,55,0.06)]" />
              </div>

              {/* Stat badges — 2x2 grid */}
              <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
                {INFO_PANELS.map(({ icon: Icon, label, value, color, popoverItems }, i) => (
                  <StatPopover key={label} items={popoverItems}>
                    <div
                      className="rounded-lg border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.4)] px-2.5 py-2 flex flex-col items-center text-center animate-slide-up"
                      style={{
                        animationDelay: `${(TOOLS.length + i) * 50}ms`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      <Icon className="w-3 h-3 mb-1" style={{ color }} />
                      <span className="text-sm font-bold" style={{ color }}>{value}</span>
                      <span className="text-[7px] uppercase tracking-[0.12em] text-[#4a5580] mt-0.5 whitespace-nowrap">
                        {label}
                      </span>
                    </div>
                  </StatPopover>
                ))}
              </div>
            </div>

            {/* ── Footer ──────────────────────────────────────────── */}
            <div className="px-3 py-2.5 border-t border-[rgba(212,175,55,0.1)] bg-[rgba(4,6,18,0.4)] shrink-0">
              <Link
                href="/mission-control"
                onClick={close}
                className="flex items-center justify-center gap-2 py-2 rounded-lg border border-[rgba(212,175,55,0.15)] hover:border-[rgba(212,175,55,0.3)] hover:bg-[rgba(212,175,55,0.06)] transition-all group"
              >
                <BookMarked className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#d4af37] group-hover:text-[#e0c060] transition-colors">
                  Open Full Mission Control
                </span>
                <ExternalLinkIcon className="w-3 h-3 text-[#d4af37] opacity-50" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
