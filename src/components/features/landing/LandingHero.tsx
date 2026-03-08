'use client'

import { ChevronDown, Sparkles } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative h-screen overflow-hidden flex items-end justify-center" aria-labelledby="hero-heading">
      {/* Background — uses the global Starfield from layout, just add a nebula gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(74,144,226,0.06)] via-[rgba(212,175,55,0.04)] to-[#0a0e1a]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[rgba(212,175,55,0.03)] blur-[120px]" />
      </div>

      {/* Title overlay */}
      <div className="relative z-10 text-center px-4 pb-20">
        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.15)] to-transparent animate-shimmer bg-[length:200%_100%]" />
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37] relative z-10" />
          <span className="text-xs sm:text-sm text-[#d4af37] font-medium relative z-10">
            Live Multi-Wavelength Observatory
          </span>
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3"
        >
          <span className="text-white">Explore the </span>
          <span className="text-gradient-stellar">Cosmos</span>
          <span className="text-white"> in Real Time</span>
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-lg text-gray-400 font-light tracking-wide mb-1">
          Your window into the universe
        </p>
        <p className="hidden sm:block text-sm text-gray-500 max-w-lg mx-auto">
          Track the ISS, browse JWST observations, monitor solar weather — powered by 11 live data sources
        </p>
      </div>

      {/* Scroll-down chevron */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
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
