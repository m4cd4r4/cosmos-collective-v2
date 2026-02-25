'use client'

/**
 * Cosmos Collective — Homepage
 * Solar System 3D as full-window background with dismissible hero card overlay
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { useCountUp } from '@/hooks/useCountUp'
import { Telescope, Globe, Sparkles, X, Eye, EyeOff, Radio } from 'lucide-react'

// ── Stats ──────────────────────────────────────────────────────────────────

const stats = [
  { label: 'Live Data Sources', target: 11, suffix: '', icon: '📡' },
  { label: 'Light Years Deep',  target: 13, suffix: 'B+', icon: '✨' },
  { label: 'JWST Observations', target: 50000, suffix: '+', icon: '🛰️' },
  { label: 'Kepler Exoplanets', target: 2600,  suffix: '+', icon: '🪐' },
]

function CountUpStat({ target, suffix, label, icon, enabled, delay }: {
  target: number; suffix: string; label: string; icon: string; enabled: boolean; delay: number
}) {
  const display = useCountUp({ target, suffix, duration: 2000, delay, enabled })
  return (
    <div className="rounded-xl bg-white/8 backdrop-blur-sm p-4 text-center border border-white/5">
      <span className="text-xl mb-1 block" aria-hidden="true">{icon}</span>
      <div className="text-xl md:text-2xl font-bold text-white tabular-nums">{display}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [cardDismissed, setCardDismissed] = useState(false)
  const [cardRevealed, setCardRevealed] = useState(false)
  const [uiHidden, setUiHidden] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setCardRevealed(true), 3500)
    return () => clearTimeout(timer)
  }, [])

  const showCard = cardRevealed && !cardDismissed && !uiHidden

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header />

      {/* ── Solar System fills remaining height ─────────────────────────── */}
      <div className="flex-1 relative overflow-hidden" aria-labelledby="hero-heading">

        {/* Solar System 3D iframe — full background */}
        <iframe
          src="/solar-system/index.html"
          title="Interactive 3D Solar System"
          className="absolute inset-0 w-full h-full border-0"
          style={{ zIndex: 1, background: '#000' }}
          loading="eager"
          allow="fullscreen"
        />

        {/* Dismissible Hero Card Overlay */}
        {showCard && (
          <>
            {/* Click-outside backdrop */}
            <div
              className="absolute inset-0 z-10 cursor-pointer animate-[fade-in_1.5s_ease-out]"
              onClick={() => setCardDismissed(true)}
              role="button"
              tabIndex={0}
              aria-label="Dismiss overlay to interact with Solar System"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setCardDismissed(true)
              }}
            />

            {/* Hero card */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div
                className="relative max-w-3xl mx-4 pointer-events-auto animate-[fade-in_1.5s_ease-out]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setCardDismissed(true)}
                  className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full bg-cosmos-void/80 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Close overlay"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Glass card */}
                <div className="glass-panel-strong rounded-2xl p-8 md:p-12 text-center backdrop-blur-md bg-cosmos-void/40 border border-white/10">
                  {/* Badge */}
                  <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-gold/10 border border-cosmos-gold/30 mb-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cosmos-gold/15 to-transparent animate-shimmer bg-[length:200%_100%]" />
                    <Sparkles className="w-4 h-4 text-cosmos-gold relative z-10" />
                    <span className="text-sm text-cosmos-gold font-medium relative z-10">
                      Live Multi-Wavelength Observatory
                    </span>
                  </div>

                  {/* Heading */}
                  <h1
                    id="hero-heading"
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4"
                  >
                    <span className="text-white">Explore the</span>
                    <br />
                    <span className="text-gradient-stellar">Cosmos</span>
                    <br />
                    <span className="text-white">in Real Time</span>
                  </h1>

                  {/* Tagline */}
                  <p className="text-lg md:text-xl text-gray-400 font-light tracking-wide mb-4">
                    Your window into the universe
                  </p>

                  {/* Description */}
                  <p className="text-base md:text-lg text-gray-300 max-w-xl mx-auto mb-6">
                    Track the ISS, browse JWST observations, monitor solar weather,
                    and explore the sky — all powered by live data from 11 space agencies.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                    <Button size="lg" leftIcon={<Telescope className="w-5 h-5" />} asChild>
                      <Link href="/observatory">Deep Space Observatory</Link>
                    </Button>
                    <Button variant="outline" size="lg" leftIcon={<Globe className="w-5 h-5" />} asChild>
                      <Link href="/sky-map">Open Sky Map</Link>
                    </Button>
                    <Button variant="outline" size="lg" leftIcon={<Radio className="w-5 h-5" />} asChild>
                      <Link href="/events">Live Events</Link>
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {stats.map((stat, i) => (
                      <CountUpStat
                        key={stat.label}
                        target={stat.target}
                        suffix={stat.suffix}
                        label={stat.label}
                        icon={stat.icon}
                        enabled={cardRevealed}
                        delay={i * 200}
                      />
                    ))}
                  </div>

                  {/* Dismiss hint */}
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cosmos-gold/60 animate-pulse" />
                      Click anywhere or press{' '}
                      <kbd className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-gray-300 text-xs font-mono">Esc</kbd>{' '}
                      to fly through the Solar System
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hide / Show UI toggle */}
        <button
          onClick={() => setUiHidden(!uiHidden)}
          className={`absolute z-30 transition-all duration-300 rounded-lg p-2 backdrop-blur-sm hover:bg-white/10 ${
            uiHidden
              ? 'bottom-6 right-6 bg-white/5 opacity-50 hover:opacity-100'
              : 'bottom-6 right-6 bg-white/10'
          }`}
          aria-label={uiHidden ? 'Show controls' : 'Hide controls'}
          title={uiHidden ? 'Show controls' : 'Hide controls'}
        >
          {uiHidden ? (
            <Eye className="w-5 h-5 text-white" />
          ) : (
            <EyeOff className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  )
}
