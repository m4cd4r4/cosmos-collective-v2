'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseCountUpOptions {
  target: number
  duration?: number
  delay?: number
  decimals?: number
  suffix?: string
  prefix?: string
  enabled?: boolean
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function useCountUp({
  target,
  duration = 2000,
  delay = 0,
  decimals = 0,
  suffix = '',
  prefix = '',
  enabled = true,
}: UseCountUpOptions): string {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const hasStarted = useRef(false)

  const format = useCallback(
    (value: number) => {
      const rounded = decimals > 0 ? value.toFixed(decimals) : formatter.format(Math.round(value))
      return `${prefix}${rounded}${suffix}`
    },
    [prefix, suffix, decimals],
  )

  useEffect(() => {
    if (!enabled || hasStarted.current) return
    hasStarted.current = true

    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const elapsed = timestamp - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutCubic(progress)
        const current = easedProgress * target

        setDisplay(format(current))

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        } else {
          setDisplay(format(target))
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, target, duration, delay, format])

  return display
}
