'use client'

/**
 * Hero Section Component
 * Stunning intro section with animated elements and planetary backgrounds
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Telescope, Globe, Sparkles, ChevronDown } from 'lucide-react'

// ============================================
// High-Resolution Planet Hero Images
// Using NASA's highest quality images for dramatic hero backgrounds
// ============================================

export const PLANET_HERO_IMAGES = {
  // Mars - Stunning red planet views
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

  // Jupiter - Gas giant with stunning atmospheric details
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

  // Saturn - The ringed planet
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

  // Earth - Our pale blue dot
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

  // Neptune & Uranus - Ice giants
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

  // Deep Space - Nebulae and galaxies
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
  { label: 'JWST Observations', value: '50,000+', icon: '🛰️' },
  { label: 'Light Years Explored', value: '13B+', icon: '✨' },
  { label: 'Citizen Scientists', value: '2M+', icon: '👥' },
  { label: 'Australian Dishes', value: '36', icon: '📡' },
]

// ============================================
// Hero Section Props
// ============================================

export interface HeroSectionProps {
  /** Planet/space image to use as background */
  backgroundKey?: PlanetHeroKey
  /** Custom background image URL (overrides backgroundKey) */
  customBackgroundUrl?: string
  /** Brightness filter for background (0-1, default 0.3) */
  backgroundBrightness?: number
  /** Show parallax effect (default true) */
  enableParallax?: boolean
}

// ============================================
// Hero Section Component
// ============================================

export function HeroSection({
  backgroundKey = 'carina',
  customBackgroundUrl,
  backgroundBrightness = 0.3,
  enableParallax = true,
}: HeroSectionProps = {}) {
  const [scrollY, setScrollY] = useState(0)

  // Get background image URL
  const backgroundImageUrl = customBackgroundUrl || PLANET_HERO_IMAGES[backgroundKey].url
  const backgroundInfo = PLANET_HERO_IMAGES[backgroundKey]

  useEffect(() => {
    if (!enableParallax) return
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enableParallax])

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: enableParallax ? `translateY(${scrollY * 0.3}px)` : undefined }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${backgroundImageUrl}')`,
            filter: `brightness(${backgroundBrightness})`,
          }}
          role="img"
          aria-label={`Background: ${backgroundInfo.name} - ${backgroundInfo.description}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cosmos-void via-cosmos-void/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-cosmos-void via-transparent to-cosmos-void" />
      </div>

      {/* Image credit (optional display) */}
      <div className="absolute bottom-2 right-4 z-20 text-xs text-white/30 font-mono">
        {backgroundInfo.credit}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-cyan/10 border border-cosmos-cyan/30 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-cosmos-gold" />
          <span className="text-sm text-cosmos-cyan font-medium">
            Multi-Spectrum Astronomical Explorer
          </span>
        </div>

        {/* Main Heading */}
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-slide-up"
        >
          <span className="text-white">Explore the</span>
          <br />
          <span className="text-gradient-stellar-animated">Universe</span>
          <br />
          <span className="text-white">Together</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 animate-slide-up animation-delay-200">
          From JWST&apos;s infrared eyes to Australian radio telescopes,
          journey through the cosmos across all wavelengths.
          Contribute to real science as a citizen astronomer.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up animation-delay-300">
          <Button
            size="lg"
            leftIcon={<Telescope className="w-5 h-5" />}
            asChild
          >
            <Link href="/explore">Start Exploring</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            leftIcon={<Globe className="w-5 h-5" />}
            asChild
          >
            <Link href="/sky-map">Open Sky Map</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 animate-fade-in animation-delay-500">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-panel rounded-xl p-4 text-center"
            >
              <span className="text-2xl mb-1 block" aria-hidden="true">
                {stat.icon}
              </span>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <button
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Scroll to content"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  )
}
