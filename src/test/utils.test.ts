import { describe, it, expect } from 'vitest'
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
    it('should format RA and Dec correctly', () => {
      const result = formatCoordinates(180, 45)
      expect(result).toContain('180')
      expect(result).toContain('45')
    })

    it('should handle negative coordinates', () => {
      const result = formatCoordinates(-90, -30)
      expect(result).toBeTruthy()
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
