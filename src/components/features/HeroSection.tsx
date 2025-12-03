'use client'

/**
 * Hero Section Component
 * Stunning intro section with animated elements
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Telescope, Globe, Sparkles, ChevronDown } from 'lucide-react'

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
// Hero Section Component
// ============================================

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://stsci-opo.org/STScI-01G8GZR2PM5DH9B8DNSYSCXQ81.png')`,
            filter: 'brightness(0.3)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cosmos-void via-cosmos-void/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-cosmos-void via-transparent to-cosmos-void" />
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
          From JWST's infrared eyes to Australian radio telescopes,
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
