'use client'

import Link from 'next/link'
import { ChevronDown, Sparkles, Orbit, ArrowRight } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative h-screen overflow-hidden flex flex-col items-center justify-between pt-6 pb-6" aria-labelledby="hero-heading">
      {/* Nebula gradient overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(74,144,226,0.06)] via-transparent to-[rgba(10,14,26,0.7)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[rgba(212,175,55,0.03)] blur-[120px]" />
      </div>

      {/* Top: Badge + Title */}
      <div className="relative z-10 text-center px-4 pt-2">
        <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] mb-3 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.15)] to-transparent animate-shimmer bg-[length:200%_100%]" />
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37] relative z-10" />
          <span className="text-xs sm:text-sm text-[#d4af37] font-medium relative z-10">
            Live Multi-Wavelength Observatory
          </span>
        </div>

        <h1
          id="hero-heading"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-1"
        >
          <span className="text-white">Explore the </span>
          <span className="text-gradient-stellar">Cosmos</span>
          <span className="text-white"> in Real Time</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-light tracking-wide">
          Track the ISS, browse JWST observations, monitor solar weather — powered by 11 live data sources
        </p>
      </div>

      {/* Center: Solar System preview — 3/4 of viewport */}
      <Link
        href="/solar-system"
        className="relative z-10 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer shadow-[0_0_60px_rgba(212,175,55,0.08)]"
        style={{ width: '75vw', height: '62vh' }}
        aria-label="Open Solar System Explorer"
      >
        <iframe
          src="/solar-system/index.html"
          title="Interactive Solar System"
          className="w-full h-full border-0 pointer-events-none"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm border border-[rgba(212,175,55,0.3)] rounded-lg px-6 py-3 text-white font-medium flex items-center gap-2">
            <Orbit className="w-5 h-5 text-[#d4af37]" />
            Open Solar System Explorer
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* Scroll-down chevron */}
      <div className="relative z-10 animate-bounce">
        <button
          onClick={() => {
            const next = document.getElementById('features')
            next?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
          aria-label="Scroll to content"
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </button>
      </div>
    </section>
  )
}
