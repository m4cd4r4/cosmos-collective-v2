'use client'

/**
 * Animated Starfield Background
 * Creates an immersive space atmosphere
 * Respects reduced motion preferences
 */

import { useEffect, useRef, memo } from 'react'
import { useA11y } from '@/app/providers'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
}

function StarfieldComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationRef = useRef<number>()
  const { reducedMotion } = useA11y()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()

    // Generate stars
    const generateStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 8000) // Density based on screen size
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
      }))
    }
    generateStars()

    // Animation loop
    let lastTime = 0
    const animate = (time: number) => {
      const delta = time - lastTime
      lastTime = time

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#030014')
      gradient.addColorStop(0.5, '#0a0a1a')
      gradient.addColorStop(1, '#030014')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      starsRef.current.forEach((star) => {
        let opacity = star.opacity

        // Twinkle effect (only if motion is not reduced)
        if (!reducedMotion) {
          opacity = star.opacity * (0.7 + 0.3 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset))
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()

        // Add subtle glow for larger stars
        if (star.size > 1.5) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.1})`
          ctx.fill()
        }
      })

      // Draw a few colored stars (representing different star types)
      const coloredStars = [
        { x: canvas.width * 0.1, y: canvas.height * 0.2, color: '#ff6b6b', size: 2 }, // Red giant
        { x: canvas.width * 0.8, y: canvas.height * 0.3, color: '#74b9ff', size: 2.5 }, // Blue star
        { x: canvas.width * 0.5, y: canvas.height * 0.7, color: '#ffeaa7', size: 2 }, // Yellow star
        { x: canvas.width * 0.3, y: canvas.height * 0.8, color: '#a29bfe', size: 1.5 }, // Purple star
      ]

      coloredStars.forEach((star) => {
        const twinkle = reducedMotion ? 1 : 0.8 + 0.2 * Math.sin(time * 0.003 + star.x)
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.globalAlpha = twinkle
        ctx.fill()
        ctx.globalAlpha = 1
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation (or draw once if reduced motion)
    if (reducedMotion) {
      animate(0)
    } else {
      animationRef.current = requestAnimationFrame(animate)
    }

    // Handle resize
    const handleResize = () => {
      setSize()
      generateStars()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      aria-hidden="true"
      role="presentation"
    />
  )
}

// Memoize to prevent unnecessary re-renders
export const Starfield = memo(StarfieldComponent)
