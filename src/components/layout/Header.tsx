'use client'

/**
 * Header Component
 * Main navigation header with responsive design
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  Telescope,
  Globe,
  Calendar,
  Users,
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  Settings,
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
        <span className="text-xl font-display font-bold text-gradient-stellar">
          Cosmos
        </span>
        <span className="text-xl font-display font-light text-white ml-1">
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
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-cosmos-cyan/10 text-cosmos-cyan'
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
// Mobile Navigation
// ============================================

function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-72 bg-cosmos-depth border-l border-white/10 z-50 lg:hidden',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Close button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-semibold text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-cosmos-cyan/10 text-cosmos-cyan'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User section - Hidden for now, see FUTURE_FEATURES.md */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {session ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-2">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 p-1.5 rounded-full bg-cosmos-surface" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {session.user?.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {session.user?.email}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => signOut()}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="primary" fullWidth onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </div> */}
      </div>
    </>
  )
}

// ============================================
// User Menu (Desktop)
// ============================================

function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (status === 'loading') {
    return <div className="w-9 h-9 rounded-full skeleton" />
  }

  if (!session) {
    return (
      <Button variant="primary" size="sm" onClick={() => signIn()}>
        Sign In
      </Button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors focus-ring"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full ring-2 ring-white/10"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-cosmos-surface flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-56 glass-panel rounded-lg shadow-cosmic z-50">
            <div className="p-3 border-b border-white/10">
              <div className="font-medium text-white">{session.user?.name}</div>
              <div className="text-sm text-gray-400">{session.user?.email}</div>
            </div>
            <div className="p-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
            <div className="p-2 border-t border-white/10">
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// Main Header Component
// ============================================

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* User Menu (Desktop) - Hidden for now, see FUTURE_FEATURES.md */}
            {/* <div className="hidden lg:block">
              <UserMenu />
            </div> */}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}
