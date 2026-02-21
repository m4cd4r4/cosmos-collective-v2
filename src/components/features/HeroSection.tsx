'use client'

/**
 * Hero Section Component
 * Solar System 3D as interactive background with dismissible info card overlay
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Telescope, Globe, Sparkles, ChevronDown, X, Eye, EyeOff, Radio } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'

// ============================================
// Planet Hero Images (kept for re-use elsewhere)
// ============================================

export const PLANET_HERO_IMAGES = {
  mars: {
    url: 'https://images-assets.nasa.gov/image/PIA24420/PIA24420~orig.jpg',
    name: 'Mars',
    description: 'JWST first images of Mars showing the Red Planet in infrared',
    credit: 'NASA/ESA/CSA/STScI',
  },
  marsOlympia: {
    url: 'https://images-assets.nasa.gov/image/PIA24546/PIA24546~orig.jpg',
    name: 'Mars Olympia',
    description: 'Mars surface from Perseverance rover',
    credit: 'NASA/JPL-Caltech',
  },
  jupiter: {
    url: 'https://images-assets.nasa.gov/image/PIA22949/PIA22949~orig.jpg',
    name: 'Jupiter',
    description: 'Jupiter in infrared from JWST showing auroras and storms',
    credit: 'NASA/ESA/CSA/STScI',
  },
  jupiterJuno: {
    url: 'https://images-assets.nasa.gov/image/PIA21973/PIA21973~orig.jpg',
    name: 'Jupiter Juno',
    description: 'Jupiter from Juno spacecraft showing swirling clouds',
    credit: 'NASA/JPL-Caltech/SwRI/MSSS',
  },
  saturn: {
    url: 'https://images-assets.nasa.gov/image/PIA12567/PIA12567~orig.jpg',
    name: 'Saturn',
    description: 'Saturn portrait from Cassini spacecraft',
    credit: 'NASA/JPL-Caltech/SSI',
  },
  saturnRings: {
    url: 'https://images-assets.nasa.gov/image/PIA21046/PIA21046~orig.jpg',
    name: 'Saturn Rings',
    description: 'Saturn with backlit rings from Cassini',
    credit: 'NASA/JPL-Caltech/SSI',
  },
  earth: {
    url: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg',
    name: 'Earth',
    description: 'Earth from Saturn - the Pale Blue Dot',
    credit: 'NASA/JPL-Caltech/SSI',
  },
  earthBlueMarble: {
    url: 'https://images-assets.nasa.gov/image/PIA00342/PIA00342~orig.jpg',
    name: 'Blue Marble',
    description: 'Full Earth from space showing oceans and continents',
    credit: 'NASA',
  },
  neptune: {
    url: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg',
    name: 'Neptune',
    description: 'Neptune from Voyager 2 showing the Great Dark Spot',
    credit: 'NASA/JPL',
  },
  uranus: {
    url: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg',
    name: 'Uranus',
    description: 'Uranus showing rings and atmospheric features',
    credit: 'NASA/JPL/Voyager',
  },
  carina: {
    url: 'https://www.nasa.gov/wp-content/uploads/2023/03/main_image_star-forming_region_carina_702.jpg',
    name: 'Carina Nebula',
    description: 'JWST Cosmic Cliffs in the Carina Nebula',
    credit: 'NASA/ESA/CSA/STScI',
  },
  pillars: {
    url: 'https://images-assets.nasa.gov/image/PIA17563/PIA17563~orig.jpg',
    name: 'Pillars of Creation',
    description: 'The iconic Pillars of Creation in the Eagle Nebula',
    credit: 'NASA/ESA/Hubble',
  },
  deepField: {
    url: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002151/GSFC_20171208_Archive_e002151~orig.jpg',
    name: 'Deep Field',
    description: 'Hubble Ultra Deep Field showing thousands of galaxies',
    credit: 'NASA/ESA/Hubble',
  },
} as const

export type PlanetHeroKey = keyof typeof PLANET_HERO_IMAGES

// ============================================
// Stats Display
// ============================================

const stats = [
  { label: 'Live Data Sources', target: 11, suffix: '', icon: '📡' },
  { label: 'Light Years Deep', target: 13, suffix: 'B+', icon: '✨' },
  { label: 'JWST Observations', target: 50000, suffix: '+', icon: '🛰️' },
  { label: 'Kepler Exoplanets', target: 2600, suffix: '+', icon: '🪐' },
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

// ============================================
// Hero Section Component
// ============================================

export function HeroSection() {
  const [cardDismissed, setCardDismissed] = useState(false)
  const [cardRevealed, setCardRevealed] = useState(false)
  const [uiHidden, setUiHidden] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setCardRevealed(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const showCard = cardRevealed && !cardDismissed && !uiHidden

  return (
    <section
      className="relative min-h-[90vh] overflow-hidden isolate"
      aria-labelledby="hero-heading"
    >
      {/* Solar System 3D Background (always running) */}
      <iframe
        src="/solar-system/index.html"
        title="Interactive 3D Solar System"
        className="absolute inset-0 w-full h-full border-0"
        style={{ zIndex: 1, background: '#000' }}
        loading="eager"
        allow="fullscreen"
      />

      {/* Dismissible Hero Card Overlay - appears after 3.5s delay */}
      {showCard && (
        <>
          {/* Clickable backdrop - click outside card to dismiss */}
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

          {/* Hero content card */}
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

                {/* Main Heading */}
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
                  <Button
                    size="lg"
                    leftIcon={<Telescope className="w-5 h-5" />}
                    asChild
                  >
                    <Link href="/observatory">Deep Space Observatory</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<Globe className="w-5 h-5" />}
                    asChild
                  >
                    <Link href="/sky-map">Open Sky Map</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<Radio className="w-5 h-5" />}
                    asChild
                  >
                    <Link href="/events">Live Events</Link>
                  </Button>
                </div>

                {/* Stats row */}
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
                    Click anywhere or press <kbd className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-gray-300 text-xs font-mono">Esc</kbd> to fly through the Solar System
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce transition-opacity duration-300 ${uiHidden ? 'opacity-0 pointer-events-none' : ''}`}>
        <button
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
          aria-label="Scroll to content"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Hide/Show All UI Toggle */}
      <button
        onClick={() => setUiHidden(!uiHidden)}
        className={`absolute z-30 transition-all duration-300 rounded-lg p-2 backdrop-blur-sm hover:bg-white/10 ${
          uiHidden
            ? 'bottom-6 right-6 bg-white/5 opacity-50 hover:opacity-100'
            : 'bottom-8 right-6 bg-white/10'
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
    </section>
  )
}
