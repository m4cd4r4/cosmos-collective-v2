'use client'

/**
 * Header Component
 * Main navigation header with responsive design
 * Includes mobile bottom navigation bar
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Telescope, Satellite, Globe, Orbit, Sun, Aperture } from 'lucide-react'

const navItems = [
  { label: 'Solar System', href: '/solar-system', icon: Sun, description: 'Interactive 3D solar system' },
  { label: '550-AU', href: '/gravitational-lens', icon: Aperture, description: 'Solar Gravitational Lens telescope mission concept' },
  { label: 'Explore', href: '/explore', icon: Telescope, description: 'Browse JWST, Hubble, and radio telescope observations' },
  { label: 'Satellites', href: '/satellites', icon: Satellite, description: 'Every active satellite at its position right now, by orbit class' },
  { label: 'Sky Map', href: '/sky-map', icon: Globe, description: 'Interactive multi-wavelength sky atlas' },
  { label: 'Kepler', href: '/kepler', icon: Orbit, description: '2,600+ Kepler exoplanets' },
]

// ============================================
// Logo Component
// ============================================

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 group"
      aria-label="Cosmos Collective - Home"
    >
      {/* Logo Icon — Ringed Planet */}
      <div className="relative w-10 h-10">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#f4f1e8]"
          aria-hidden="true"
        >
          <defs>
            <mask id="cc-planet-back">
              <rect width="40" height="40" fill="white" />
              <circle cx="20" cy="20" r="11" fill="black" />
            </mask>
            <mask id="cc-planet-front">
              <rect width="40" height="40" fill="white" />
              <path d="M2 20 A18 5.5 0 0 0 38 20" stroke="black" strokeWidth="5.4" />
            </mask>
          </defs>

          <g transform="rotate(-20, 20, 20)">
            {/* Planet, cut where the ring passes in front */}
            <circle cx="20" cy="20" r="9" fill="currentColor" mask="url(#cc-planet-front)" />

            {/* Ring: front arc, then back arc hidden behind the disc */}
            <path d="M2 20 A18 5.5 0 0 0 38 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M2 20 A18 5.5 0 0 1 38 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" mask="url(#cc-planet-back)" />
          </g>
        </svg>
      </div>

      {/* Logo Text */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg sm:text-xl font-display font-bold text-gradient-stellar">
          Cosmos
        </span>
        <span className="text-lg sm:text-xl font-display font-light text-white/80 group-hover:text-white transition-colors duration-300">
          Collective
        </span>
      </div>
    </Link>
  )
}

// ============================================
// Desktop Navigation
// ============================================

function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            title={item.description}
            className={cn(
              'flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
              isActive
                ? 'bg-cosmos-gold/10 text-cosmos-gold'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

// ============================================
// Mobile Bottom Navigation Bar
// ============================================

const mobileNavItems = [
  { label: 'Solar', href: '/solar-system', icon: Sun },
  { label: '550-AU', href: '/gravitational-lens', icon: Aperture },
  { label: 'Explore', href: '/explore', icon: Telescope },
  { label: 'Orbits', href: '/satellites', icon: Satellite },
  { label: 'Sky', href: '/sky-map', icon: Globe },
  { label: 'Kepler', href: '/kepler', icon: Orbit },
]

function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-panel border-t border-white/10 pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors',
                isActive ? 'text-cosmos-gold' : 'text-gray-400 hover:text-white'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[11px] mt-1 font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ============================================
// Main Header Component
// ============================================

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-30 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <DesktopNav />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </>
  )
}
