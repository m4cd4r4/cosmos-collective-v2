'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PLANET_HERO_IMAGES } from '@/components/features/planet-hero-images'
import { Telescope, Globe, Search, Radio, Orbit, Sun } from 'lucide-react'

const FEATURES = [
  {
    title: 'Solar System',
    href: '/solar-system',
    description: 'Photorealistic 3D orbits of all 8 planets and 16 moons, with an Earth Dive descent',
    image: PLANET_HERO_IMAGES.saturnRings,
    icon: Orbit,
    color: '#d4af37',
    featured: true,
  },
  {
    title: 'JWST',
    href: '/jwst',
    description: 'Webb observations with infrared wavelength band switching',
    image: PLANET_HERO_IMAGES.pillars,
    icon: Telescope,
    color: '#4a90e2',
    featured: true,
  },
  {
    title: 'Explore',
    href: '/explore',
    description: '132 curated JWST, Hubble, and Australian radio observations',
    image: PLANET_HERO_IMAGES.carina,
    icon: Search,
    color: '#d4af37',
  },
  {
    title: 'Live Events',
    href: '/events',
    description: 'ISS position, solar flares, and meteor showers as they happen',
    image: PLANET_HERO_IMAGES.earthBlueMarble,
    icon: Radio,
    color: '#ef4444',
  },
  {
    title: 'Sky Map',
    href: '/sky-map',
    description: 'Interactive sky atlas across radio, infrared, visible, and X-ray',
    image: PLANET_HERO_IMAGES.deepField,
    icon: Globe,
    color: '#8b5cf6',
  },
  {
    title: 'Kepler Exoplanets',
    href: '/kepler',
    description: '2,600+ confirmed worlds in an interactive stellar field',
    image: PLANET_HERO_IMAGES.jupiter,
    icon: Sun,
    color: '#f59e0b',
  },
]

export function FeatureShowcase() {
  return (
    <section id="features" className="bg-[#0a0e1a] px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
            The instruments
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-2">
            Six ways into the universe
          </h2>
        </div>

        {/* 2 featured + 4 standard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ title, href, description, image, icon: Icon, color, featured }) => (
            <Link
              key={href}
              href={href}
              className={
                'group relative rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-cosmos-gold ' +
                (featured ? 'sm:col-span-2 lg:col-span-2' : '')
              }
            >
              <div className={'relative overflow-hidden ' + (featured ? 'h-44 sm:h-56' : 'h-36 sm:h-40')}>
                <Image
                  src={image.url}
                  alt=""
                  aria-hidden="true"
                  fill
                  loading="lazy"
                  className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,14,26,0.92)] via-[rgba(10,14,26,0.25)] to-transparent" />
                <div
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm bg-black/40 border border-white/15"
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>

              <div className="px-4 py-3.5">
                <h3 className="text-base font-display font-bold text-white group-hover:text-cosmos-gold transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
