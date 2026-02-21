'use client'

/**
 * Header Component
 * Main navigation header with responsive design
 * Includes mobile bottom navigation bar
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Telescope,
  Aperture,
  Globe,
  Calendar,
  Users,
  BookOpen,
  Home,
  Orbit,
} from 'lucide-react'

// ============================================
// Navigation Items
// ============================================

const navItems = [
  {
    label: 'Explore',
    href: '/explore',
    icon: Telescope,
    description: 'Browse JWST and radio telescope observations',
  },
  {
    label: 'Observatory',
    href: '/observatory',
    icon: Aperture,
    description: 'Interactive sky chart of JWST and Hubble observations',
  },
  {
    label: 'Sky Map',
    href: '/sky-map',
    icon: Globe,
    description: 'Interactive celestial coordinate viewer',
  },
  {
    label: 'Kepler',
    href: '/kepler',
    icon: Orbit,
    description: 'Interactive map of 2,600+ Kepler exoplanets',
  },
  {
    label: 'Live Events',
    href: '/events',
    icon: Calendar,
    description: 'Real-time astronomical events and alerts',
  },
  {
    label: 'Citizen Science',
    href: '/citizen-science',
    icon: Users,
    description: 'Contribute to real astronomy research',
  },
  {
    label: 'Devlog',
    href: '/devlog',
    icon: BookOpen,
    description: 'Technical blog and project updates',
  },
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
      {/* Logo Icon — Armillary Sphere */}
      <div className="relative w-10 h-10">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="cc-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#d4af37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cc-ring-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#ff9a3c" />
            </linearGradient>
            <linearGradient id="cc-ring-blue" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a90e2" />
              <stop offset="100%" stopColor="#7ec4ff" />
            </linearGradient>
            <linearGradient id="cc-ring-red" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
          </defs>

          {/* Core glow */}
          <circle cx="20" cy="20" r="10" fill="url(#cc-core)" />

          {/* Armillary rings */}
          <ellipse
            cx="20" cy="20" rx="17" ry="6"
            stroke="url(#cc-ring-gold)" strokeWidth="1.2"
            opacity="0.65"
            transform="rotate(-25, 20, 20)"
            className="transition-opacity duration-700 group-hover:opacity-100"
          />
          <ellipse
            cx="20" cy="20" rx="17" ry="6"
            stroke="url(#cc-ring-blue)" strokeWidth="1.2"
            opacity="0.65"
            transform="rotate(35, 20, 20)"
            className="transition-opacity duration-700 group-hover:opacity-100"
          />
          <ellipse
            cx="20" cy="20" rx="17" ry="6"
            stroke="url(#cc-ring-red)" strokeWidth="1.2"
            opacity="0.65"
            transform="rotate(90, 20, 20)"
            className="transition-opacity duration-700 group-hover:opacity-100"
          />

          {/* Central star */}
          <circle cx="20" cy="20" r="3.5" fill="#d4af37" />
          <circle cx="20" cy="20" r="1.8" fill="white" opacity="0.85" />

          {/* Celestial bodies on orbits */}
          <circle cx="35" cy="13" r="1.8" fill="#ff9a3c" />
          <circle cx="7" cy="11" r="1.5" fill="#4a90e2" />
          <circle cx="20" cy="3" r="1.5" fill="#ff6b6b" />

          {/* Distant stars */}
          <circle cx="33" cy="32" r="0.6" fill="white" opacity="0.4" />
          <circle cx="8" cy="33" r="0.5" fill="white" opacity="0.3" />
        </svg>

        {/* Hover glow ring */}
        <div className="absolute inset-0 rounded-full border border-cosmos-gold/0 group-hover:border-cosmos-gold/20 transition-all duration-500" />
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
    <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-cosmos-gold/10 text-cosmos-gold'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
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

// Bottom nav items (subset of main nav for mobile)
const bottomNavItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Explore', href: '/explore', icon: Telescope },
  { label: 'Sky Map', href: '/sky-map', icon: Globe },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Science', href: '/citizen-science', icon: Users },
]

function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-panel border-t border-white/10 pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors',
                isActive
                  ? 'text-cosmos-gold'
                  : 'text-gray-400 hover:text-white'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
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
