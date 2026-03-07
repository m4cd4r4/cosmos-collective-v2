'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PLANET_HERO_IMAGES } from '@/components/features/HeroSection'
import { Telescope, Globe, Search, Radio, Orbit, Sun } from 'lucide-react'

const FEATURES = [
  {
    title: 'Observatory',
    href: '/observatory',
    description: '33 iconic observations plotted on an all-sky Aitoff chart',
    image: PLANET_HERO_IMAGES.pillars,
    icon: Telescope,
    color: '#4a90e2',
  },
  {
    title: 'Sky Map',
    href: '/sky-map',
    description: 'Real-time interactive sky with multi-wavelength switching',
    image: PLANET_HERO_IMAGES.deepField,
    icon: Globe,
    color: '#8b5cf6',
  },
  {
    title: 'Explore',
    href: '/explore',
    description: '132+ JWST, Hubble, and Australian radio observations',
    image: PLANET_HERO_IMAGES.carina,
    icon: Search,
    color: '#d4af37',
  },
  {
    title: 'Live Events',
    href: '/events',
    description: 'ISS tracker, solar weather, meteor showers in real time',
    image: PLANET_HERO_IMAGES.earthBlueMarble,
    icon: Radio,
    color: '#ef4444',
  },
  {
    title: 'Kepler Explorer',
    href: '/kepler',
    description: '2,600+ exoplanets in an interactive stellar field',
    image: PLANET_HERO_IMAGES.jupiter,
    icon: Sun,
    color: '#f59e0b',
  },
  {
    title: 'Solar System',
    href: '/solar-system',
    description: 'Photorealistic 3D orbits with Earth Dive experience',
    image: PLANET_HERO_IMAGES.saturnRings,
    icon: Orbit,
    color: '#22c55e',
  },
]

export function FeatureShowcase() {
  return (
    <section id="features" className="bg-[#0a0e1a] px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#4a5580]">Modules</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-2">
            Explore Every Corner of the Universe
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ title, href, description, image, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group relative rounded-xl overflow-hidden border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.6)] hover:border-[rgba(212,175,55,0.25)] transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-36 sm:h-40 overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,12,28,0.9)] via-[rgba(8,12,28,0.3)] to-transparent" />

                {/* Icon badge */}
                <div
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>

              {/* Text */}
              <div className="px-4 py-3">
                <h3 className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors">
                  {title}
                </h3>
                <p className="text-[11px] text-[#4a5580] mt-1 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 30px ${color}08, 0 0 20px ${color}06` }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
