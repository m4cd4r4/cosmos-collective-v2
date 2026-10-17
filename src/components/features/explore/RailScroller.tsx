'use client'

/**
 * Horizontal scroll container with snap, swipe and arrow buttons.
 * Cards inside are plain links, so keyboard users tab through them and the
 * browser scrolls each focused card into view.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RailScroller({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update])

  const page = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: smooth ? 'smooth' : 'auto' })
  }

  const arrow = 'hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-[#0a0e1a]/85 border border-white/15 text-white hover:border-[#d4af37] hover:text-[#d4af37] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white'

  return (
    <div className="relative">
      <ul
        ref={ref}
        onScroll={update}
        aria-label={label}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-8 px-4 sm:px-8 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <button
        type="button"
        onClick={() => page(-1)}
        aria-label={`Scroll ${label} left`}
        tabIndex={-1}
        className={cn(arrow, 'left-2', !canPrev && '!hidden')}
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label={`Scroll ${label} right`}
        tabIndex={-1}
        className={cn(arrow, 'right-2', !canNext && '!hidden')}
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  )
}
