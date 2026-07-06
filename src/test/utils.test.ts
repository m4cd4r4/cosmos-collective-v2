import { describe, it, expect, vi } from 'vitest'
import { cn, formatCoordinates, debounce } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible')
    })
  })

  describe('formatCoordinates', () => {
    it('should format decimal RA and Dec correctly', () => {
      const result = formatCoordinates({ ra: 180, dec: 45 }, 'decimal')
      expect(result).toContain('180')
      expect(result).toContain('+45')
    })

    it('should format sexagesimal coordinates', () => {
      const result = formatCoordinates({ ra: 180, dec: 45 })
      expect(result).toContain('12h')
      expect(result).toContain('Dec:')
    })

    it('should handle negative declination', () => {
      const result = formatCoordinates({ ra: 90, dec: -30 }, 'decimal')
      expect(result).toContain('-30')
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      debounced()
      debounced()

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })
  })
})
