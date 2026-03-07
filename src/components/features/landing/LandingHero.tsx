'use client'

import { useState } from 'react'
import { ChevronDown, Eye, EyeOff, Sparkles } from 'lucide-react'

export function LandingHero() {
  const [uiHidden, setUiHidden] = useState(false)

  return (
    <section className="relative h-screen overflow-hidden" aria-labelledby="hero-heading">
      {/* Solar System 3D iframe — full background */}
      <iframe
        src="/solar-system/index.html"
        title="Interactive 3D Solar System"
        className="absolute inset-0 w-full h-full border-0"
        style={{ zIndex: 1, background: '#000' }}
        loading="eager"
        allow="fullscreen"
      />

      {/* Bottom gradient for text readability */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45%] z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.6) 40%, transparent 100%)' }}
      />

      {/* Title overlay — always visible, anchored to bottom */}
      <div className={`absolute inset-x-0 bottom-20 z-10 text-center px-4 transition-opacity duration-500 ${uiHidden ? 'opacity-0 pointer-events-none' : ''}`}>
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
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce transition-opacity duration-300 ${uiHidden ? 'opacity-0 pointer-events-none' : ''}`}>
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

      {/* Hide/Show UI toggle */}
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
        {uiHidden ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white" />}
      </button>
    </section>
  )
}
