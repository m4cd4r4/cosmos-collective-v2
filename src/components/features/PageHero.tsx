'use client'

/**
 * Page Hero Component
 * Compact hero section with planet backgrounds for secondary pages
 */

import { useEffect, useState } from 'react'
import { PLANET_HERO_IMAGES, type PlanetHeroKey } from './HeroSection'

// ============================================
// Page Hero Props
// ============================================

export interface PageHeroProps {
  /** Page title */
  title: string
  /** Highlighted word in title (rendered with gradient) */
  titleHighlight?: string
  /** Page description */
  description?: string
  /** Planet/space image to use as background */
  backgroundKey?: PlanetHeroKey
  /** Custom background image URL (overrides backgroundKey) */
  customBackgroundUrl?: string
  /** Brightness filter for background (0-1, default 0.25) */
  backgroundBrightness?: number
  /** Badge content */
  badge?: React.ReactNode
  /** Additional content (buttons, search, etc.) */
  children?: React.ReactNode
  /** Hero height variant */
  size?: 'sm' | 'md' | 'lg'
  /** Enable parallax effect */
  enableParallax?: boolean
}

// ============================================
// Page Hero Component
// ============================================

export function PageHero({
  title,
  titleHighlight,
  description,
  backgroundKey = 'deepField',
  customBackgroundUrl,
  backgroundBrightness = 0.25,
  badge,
  children,
  size = 'md',
  enableParallax = true,
}: PageHeroProps) {
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

  // Size variants
  const sizeClasses = {
    sm: 'py-16 md:py-20',
    md: 'py-20 md:py-28',
    lg: 'py-28 md:py-36',
  }

  // Render title with optional highlight
  const renderTitle = () => {
    if (!titleHighlight) {
      return <span className="text-white">{title}</span>
    }

    const parts = title.split(titleHighlight)
    return (
      <>
        {parts[0]}
        <span className="text-gradient-stellar">{titleHighlight}</span>
        {parts[1] || ''}
      </>
    )
  }

  return (
    <section className={`relative overflow-hidden ${sizeClasses[size]}`}>
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: enableParallax ? `translateY(${scrollY * 0.2}px)` : undefined }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: `url('${backgroundImageUrl}')`,
            filter: `brightness(${backgroundBrightness})`,
          }}
          role="img"
          aria-label={`Background: ${backgroundInfo.name}`}
        />
        {/* Gradient overlays for smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-cosmos-void via-cosmos-void/70 to-cosmos-void/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-cosmos-void/80 via-transparent to-cosmos-void" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl">
          {/* Optional Badge */}
          {badge && (
            <div className="mb-6 animate-fade-in">
              {badge}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 animate-slide-up">
            {renderTitle()}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl animate-slide-up animation-delay-100">
              {description}
            </p>
          )}

          {/* Additional Content */}
          {children && (
            <div className="mt-6 animate-slide-up animation-delay-200">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Image credit */}
      <div className="absolute bottom-2 right-4 z-20 text-xs text-white/20 font-mono">
        {backgroundInfo.credit}
      </div>
    </section>
  )
}

export { PLANET_HERO_IMAGES, type PlanetHeroKey }
