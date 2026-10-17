'use client'

/**
 * Explore Hero
 * Full-bleed slideshow of real JWST and Hubble images. Slow crossfade and drift,
 * pauses on hover/focus and via an explicit control, static under reduced motion.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import { ArrowRight, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HeroSlide {
  id: string
  name: string
  telescope: string
  caption: string
  image: string
}

const SLIDE_MS = 7000

export function ExploreHero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [reduced, setReduced] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const playing = !reduced && !userPaused && !hovered && !focused && slides.length > 1

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS)
    return () => clearTimeout(t)
  }, [playing, index, slides.length])

  const go = useCallback((i: number) => setIndex(i), [])

  if (slides.length === 0) return null
  const active = slides[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured observations"
      className="relative w-full h-[72dvh] min-h-[420px] max-h-[820px] overflow-hidden bg-[#0a0e1a]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== index}
          className={cn(
            'absolute inset-0 transition-opacity duration-[1600ms] ease-in-out',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
        >
          <NextImage
            src={s.image}
            alt={i === index ? `${s.name}, observed by ${s.telescope}` : ''}
            fill
            sizes="100vw"
            priority={i === 0}
            loading={i <= 1 ? 'eager' : 'lazy'}
            className={cn('object-cover', i === index && 'hero-drift')}
            style={i === index && !playing ? { animationPlayState: 'paused' } : undefined}
          />
        </div>
      ))}

      {/* Legibility scrim: bottom for text, soft top for the header */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/35 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0a0e1a]/70 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 px-4 sm:px-8 pb-8 sm:pb-12 max-w-7xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37] mb-2">
          {active.telescope} · Real data
        </p>
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-white font-semibold leading-tight max-w-3xl">
          {active.name}
        </h1>
        <p
          className="mt-3 text-sm sm:text-base text-gray-200 max-w-xl line-clamp-2"
          aria-live={playing ? 'off' : 'polite'}
        >
          {active.caption}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link
            href={`/explore/${active.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d4af37] text-[#0a0e1a] text-sm font-semibold hover:bg-[#e6c24a] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explore this
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <a
            href="#browse"
            className="text-sm text-gray-300 hover:text-white underline-offset-4 hover:underline"
          >
            Browse all observations
          </a>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {slides.length > 1 && !reduced && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              {userPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          )}
          <div className="flex items-center" role="group" aria-label="Choose slide">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${s.name}`}
                aria-current={i === index ? 'true' : undefined}
                className="p-2 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
              >
                <span
                  className={cn(
                    'block h-1 rounded-full transition-all',
                    i === index ? 'w-8 bg-[#d4af37]' : 'w-4 bg-white/30 group-hover:bg-white/60',
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
