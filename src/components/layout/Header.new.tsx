'use client'

/**
 * Header Component (Updated)
 * Tabbed navigation separating Observe (astronomy) and Launch (space industry)
 * Includes Arcade button for games
 */

import { useState } from 'react'
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
  Rocket,
  Radio,
  Building2,
  Plane,
  Video,
  Gamepad2,
} from 'lucide-react'
import { ArcadeModal } from '@/components/features/arcade/ArcadeModal'

// ============================================
// Types
// ============================================

type SectionId = 'observe' | 'launch'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  description: string
}

// ============================================
// Navigation Configuration
// ============================================

const SECTIONS: Record<SectionId, { label: string; icon: React.ElementType; items: NavItem[] }> = {
  observe: {
    label: 'Observe',
    icon: Telescope,
    items: [
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
    ],
  },
  launch: {
    label: 'Launch',
    icon: Rocket,
    items: [
      {
        label: 'Upcoming',
        href: '/launch',
        icon: Rocket,
        description: 'Track upcoming space launches worldwide',
      },
      {
        label: 'Live',
        href: '/live',
        icon: Video,
        description: 'Watch live launch streams',
      },
      {
        label: 'Agencies',
        href: '/agencies',
        icon: Building2,
        description: 'Space agencies and companies',
      },
      {
        label: 'Vehicles',
        href: '/vehicles',
        icon: Plane,
        description: 'Launch vehicle specifications',
      },
    ],
  },
}

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
          <circle cx="20" cy="20" r="3" fill="#06b6d4" />
          <circle cx="20" cy="10" r="1.5" fill="#f59e0b" />
          <circle cx="28" cy="16" r="1.5" fill="#a855f7" />
          <circle cx="28" cy="24" r="1.5" fill="#ec4899" />
          <circle cx="20" cy="30" r="1.5" fill="#06b6d4" />
          <circle cx="12" cy="24" r="1.5" fill="#a855f7" />
          <circle cx="12" cy="16" r="1.5" fill="#f59e0b" />
          {/* Connecting lines */}
          <path
            d="M20 13 L20 17 M26 17 L23 19 M26 23 L23 21 M20 27 L20 23 M14 23 L17 21 M14 17 L17 19"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.5"
          />
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Logo Text */}
      <div className="hidden sm:block">
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
// Section Tabs (Primary Navigation)
// ============================================

interface SectionTabsProps {
  activeSection: SectionId
  onSectionChange: (section: SectionId) => void
}

function SectionTabs({ activeSection, onSectionChange }: SectionTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
      {(Object.keys(SECTIONS) as SectionId[]).map((sectionId) => {
        const section = SECTIONS[sectionId]
        const Icon = section.icon
        const isActive = activeSection === sectionId

        return (
          <button
            key={sectionId}
            type="button"
            onClick={() => onSectionChange(sectionId)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              isActive
                ? sectionId === 'observe'
                  ? 'bg-cosmos-cyan/20 text-cosmos-cyan'
                  : 'bg-rocket-orange/20 text-rocket-orange'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
            aria-pressed={isActive}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            <span>{section.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// Sub Navigation (Secondary Navigation)
// ============================================

interface SubNavProps {
  section: SectionId
}

function SubNav({ section }: SubNavProps) {
  const pathname = usePathname()
  const items = SECTIONS[section].items

  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label={`${SECTIONS[section].label} navigation`}>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? section === 'observe'
                  ? 'bg-cosmos-cyan/10 text-cosmos-cyan'
                  : 'bg-rocket-orange/10 text-rocket-orange'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            )}
            aria-current={isActive ? 'page' : undefined}
            title={item.description}
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
// Arcade Button
// ============================================

interface ArcadeButtonProps {
  onClick: () => void
}

function ArcadeButton({ onClick }: ArcadeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
      aria-label="Open Arcade"
      title="Play space games while you wait!"
    >
      <Gamepad2 className="w-4 h-4" aria-hidden="true" />
      <span className="hidden md:inline">Arcade</span>
    </button>
  )
}

// ============================================
// Mobile Bottom Navigation Bar
// ============================================

const bottomNavItems = [
  { label: 'Home', href: '/', icon: Home, section: null },
  { label: 'Explore', href: '/explore', icon: Telescope, section: 'observe' as const },
  { label: 'Launches', href: '/launch', icon: Rocket, section: 'launch' as const },
  { label: 'Live', href: '/live', icon: Video, section: 'launch' as const },
  { label: 'Science', href: '/citizen-science', icon: Users, section: 'observe' as const },
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

          // Color based on section
          const activeColor = item.section === 'launch'
            ? 'text-rocket-orange'
            : 'text-cosmos-cyan'

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors',
                isActive
                  ? activeColor
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
// Utility: Determine Active Section from Path
// ============================================

function getActiveSectionFromPath(pathname: string): SectionId {
  const launchPaths = ['/launch', '/live', '/agencies', '/vehicles']
  if (launchPaths.some(p => pathname.startsWith(p))) {
    return 'launch'
  }
  return 'observe'
}

// ============================================
// Main Header Component
// ============================================

export function Header() {
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState<SectionId>(
    getActiveSectionFromPath(pathname)
  )
  const [arcadeOpen, setArcadeOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Main Header Row */}
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Logo />

            {/* Section Tabs (Desktop) */}
            <div className="hidden md:block">
              <SectionTabs
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>

            {/* Arcade Button (Desktop) */}
            <div className="hidden md:block">
              <ArcadeButton onClick={() => setArcadeOpen(true)} />
            </div>
          </div>

          {/* Sub Navigation Row (Desktop) */}
          <div className="hidden lg:flex items-center justify-center py-2 border-t border-white/5">
            <SubNav section={activeSection} />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Arcade Modal */}
      <ArcadeModal isOpen={arcadeOpen} onClose={() => setArcadeOpen(false)} />
    </>
  )
}

// ============================================
// Tailwind Config Additions (for reference)
// ============================================
/*
Add to tailwind.config.ts colors:

colors: {
  'rocket-orange': '#ff6b35',
  'cosmos-cyan': '#06b6d4',
  // ... existing colors
}
*/
