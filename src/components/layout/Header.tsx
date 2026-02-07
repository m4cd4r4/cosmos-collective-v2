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
  Globe,
  Calendar,
  Users,
  BookOpen,
  Home,
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
    label: 'Sky Map',
    href: '/sky-map',
    icon: Globe,
    description: 'Interactive celestial coordinate viewer',
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
      className="flex items-center gap-2 group"
      aria-label="Cosmos Collective - Home"
    >
      {/* Logo Icon */}
      <div className="relative w-10 h-10">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Outer ring */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            className="transition-all duration-300 group-hover:stroke-[3]"
          />
          {/* Inner star pattern */}
          <circle cx="20" cy="20" r="3" fill="#d4af37" />
          <circle cx="20" cy="10" r="1.5" fill="#ff9a3c" />
          <circle cx="28" cy="16" r="1.5" fill="#4a90e2" />
          <circle cx="28" cy="24" r="1.5" fill="#ff6b6b" />
          <circle cx="20" cy="30" r="1.5" fill="#d4af37" />
          <circle cx="12" cy="24" r="1.5" fill="#4a90e2" />
          <circle cx="12" cy="16" r="1.5" fill="#ff9a3c" />
          {/* Connecting lines */}
          <path
            d="M20 13 L20 17 M26 17 L23 19 M26 23 L23 21 M20 27 L20 23 M14 23 L17 21 M14 17 L17 19"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.5"
          />
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#ff9a3c" />
              <stop offset="100%" stopColor="#ff6b6b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Logo Text - Always visible */}
      <div>
        <span className="text-lg sm:text-xl font-display font-bold text-gradient-stellar">
          Cosmos
        </span>
        <span className="text-lg sm:text-xl font-display font-light text-white ml-1">
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
