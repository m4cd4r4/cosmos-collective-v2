'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { useTelemetryData } from '@/components/features/mission-control/useTelemetryData'
import { getMoonIllumination, type MoonIllumination } from '@/lib/celestial'

/**
 * Landing hero: the solar system as the centre of gravity.
 * On capable desktops the Earth and Moon are rendered live for the current
 * instant (real day/night terminator, real Moon phase); mobile and
 * reduced-motion keep the static poster. Real UTC clock, ISS position, and
 * Moon phase make "right now" verifiable.
 */

const HeroScene = dynamic(
  () => import('./HeroScene').then((m) => m.HeroScene),
  { ssr: false },
)

const SECONDARY_LINKS = [
  { label: 'Latest from JWST', href: '/jwst' },
  { label: '2,700+ exoplanets', href: '/kepler' },
  { label: 'String of Pearls', href: '/gravitational-lens' },
]

export function LandingHero() {
  const { utcTime, issPosition, issVelocity } = useTelemetryData()
  const [mounted, setMounted] = useState(false)
  const [showScene, setShowScene] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [moon, setMoon] = useState<MoonIllumination | null>(null)

  useEffect(() => {
    setMounted(true)
    setMoon(getMoonIllumination(new Date()))
    // Desktops get the live scene. HeroScene renders a single static frame
    // when the user prefers reduced motion, so no animation is forced and the
    // orbit-line poster fallback is only for mobile / no-WebGL.
    if (window.innerWidth >= 1024) setShowScene(true)
    const id = setInterval(() => setMoon(getMoonIllumination(new Date())), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      className="relative h-[100svh] min-h-[560px] overflow-hidden -mt-16"
      aria-labelledby="hero-heading"
    >
      {/* Scene: Earth and Moon, live on capable desktops, static poster otherwise */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-earth-close.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          unoptimized
          className={`object-cover object-[70%_center] transition-opacity duration-700 ${sceneReady ? 'opacity-0' : 'opacity-100'}`}
          sizes="100vw"
        />
        {showScene && <HeroScene onReady={() => setSceneReady(true)} />}
        {/* Scrim: readable text on the left, scene untouched on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,14,26,0.88)] via-[rgba(10,14,26,0.45)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0e1a] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col justify-center pb-20">
        <div className="max-w-2xl">
          {/* Live status line: real clock, not a badge */}
          <div className="flex items-center gap-2.5 mb-5">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-300/90 font-semibold">
              Live
            </span>
            <span
              className="text-xs font-mono tabular-nums text-gray-400"
              suppressHydrationWarning
            >
              {mounted ? `${utcTime} UTC` : 'UTC'}
            </span>
            {moon && (
              <span className="hidden sm:inline text-xs text-gray-500 border-l border-white/10 pl-2.5">
                {moon.phaseName} · {Math.round(moon.fraction * 100)}% lit
              </span>
            )}
          </div>

          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white leading-[1.05] mb-5"
          >
            Earth and Moon,
            <br />
            right about now.
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mb-8">
            Planetary positions, JWST imagery, and solar weather from NASA,
            ESA, and CSIRO. Real data from 11 live sources, updated
            continuously.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/solar-system"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cosmos-gold text-cosmos-void font-semibold text-sm sm:text-base hover:bg-cosmos-amber transition-colors focus-visible:ring-2 focus-visible:ring-cosmos-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cosmos-void"
            >
              Enter the Solar System
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <nav aria-label="Featured destinations" className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {SECONDARY_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-gray-300 hover:text-white underline decoration-white/25 underline-offset-4 hover:decoration-cosmos-gold transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Instrument readout: real ISS telemetry, bottom-right */}
      {issPosition && (
        <div
          className="absolute bottom-6 right-4 md:right-8 z-10 hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-md border border-white/10 bg-[rgba(10,14,26,0.72)] backdrop-blur-sm"
          role="status"
          aria-label="Current International Space Station position"
        >
          <span className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">
            ISS
          </span>
          <span className="text-xs font-mono tabular-nums text-gray-200">
            {issPosition.lat.toFixed(2)}°, {issPosition.lon.toFixed(2)}°
          </span>
          {issVelocity != null && (
            <span className="text-xs font-mono tabular-nums text-gray-400 border-l border-white/10 pl-3">
              {Math.round(issVelocity).toLocaleString()} km/h
            </span>
          )}
        </div>
      )}

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors motion-safe:animate-bounce"
          aria-label="Scroll to features"
        >
          <ChevronDown className="w-5 h-5 text-gray-300" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
