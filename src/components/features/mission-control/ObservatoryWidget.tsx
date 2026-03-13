'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { getFeaturedJWSTImages, getFeaturedHubbleImages } from '@/services/mast-api'
import { wavelengthToRGB, aitoffProjection, getEffectiveCoordinates } from '@/components/features/observatory/utils'
import type { Observation } from '@/types'

interface PlottedObs {
  x: number
  y: number
  r: number
  color: [number, number, number]
  name: string
  phase: number
}

function buildObservations(): Observation[] {
  return [...getFeaturedJWSTImages(), ...getFeaturedHubbleImages()]
}

export function ObservatoryWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const rafRef = useRef<number>(0)

  const observations = useMemo(() => buildObservations(), [])

  // IntersectionObserver to gate animation
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isVisible) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Pre-compute observation positions (will recompute on resize)
    let plotted: PlottedObs[] = []
    let lastW = 0, lastH = 0

    function computePositions(w: number, h: number) {
      plotted = observations.map((obs, i) => {
        const coords = getEffectiveCoordinates(obs)
        const { x, y } = aitoffProjection(coords.ra, coords.dec, w, h)
        const rgb = wavelengthToRGB(obs.wavelengthBand)
        return {
          x, y,
          r: obs.isFeatured ? 3 : 2,
          color: rgb,
          name: obs.targetName,
          phase: (i * 0.7) % (Math.PI * 2),
        }
      })
    }

    function drawAitoffOutline(w: number, h: number) {
      // Draw the Aitoff ellipse boundary
      ctx!.beginPath()
      const pad = 20
      const cx = w / 2, cy = h / 2
      const rx = (w - 2 * pad) / 2, ry = (h - 2 * pad) / 2
      ctx!.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx!.strokeStyle = 'rgba(74,144,226,0.12)'
      ctx!.lineWidth = 1
      ctx!.stroke()

      // Equator line
      ctx!.beginPath()
      ctx!.moveTo(pad, cy)
      ctx!.lineTo(w - pad, cy)
      ctx!.strokeStyle = 'rgba(74,144,226,0.06)'
      ctx!.stroke()

      // Meridian line
      ctx!.beginPath()
      ctx!.moveTo(cx, pad)
      ctx!.lineTo(cx, h - pad)
      ctx!.stroke()
    }

    function draw(time: number) {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Recompute positions on resize
      if (w !== lastW || h !== lastH) {
        computePositions(w, h)
        lastW = w
        lastH = h
      }

      // Background
      ctx!.fillStyle = '#050810'
      ctx!.fillRect(0, 0, w, h)

      // Aitoff outline
      drawAitoffOutline(w, h)

      // Draw observation dots
      for (const obs of plotted) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.0008 + obs.phase)
        const [cr, cg, cb] = obs.color

        // Glow
        const glow = ctx!.createRadialGradient(obs.x, obs.y, 0, obs.x, obs.y, obs.r * 3.5)
        glow.addColorStop(0, `rgba(${cr},${cg},${cb},${0.25 * twinkle})`)
        glow.addColorStop(1, 'transparent')
        ctx!.fillStyle = glow
        ctx!.fillRect(obs.x - obs.r * 4, obs.y - obs.r * 4, obs.r * 8, obs.r * 8)

        // Core dot
        ctx!.beginPath()
        ctx!.arc(obs.x, obs.y, obs.r * twinkle, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${cr},${cg},${cb},${0.8 * twinkle})`
        ctx!.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isVisible, observations])

  // Wavelength legend counts
  const bandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const obs of observations) {
      counts[obs.wavelengthBand] = (counts[obs.wavelengthBand] || 0) + 1
    }
    return counts
  }, [observations])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Stats overlay */}
      <div className="absolute top-2.5 right-3 pointer-events-none">
        <span className="text-[10px] font-mono font-bold text-white/60">
          {observations.length}
        </span>
        <span className="text-[8px] font-mono uppercase tracking-wider text-[#4a5580] ml-1">
          objects
        </span>
      </div>

      {/* Wavelength legend */}
      <div className="absolute bottom-2 left-3 flex gap-2 pointer-events-none">
        {Object.entries(bandCounts).slice(0, 4).map(([band, count]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const [r, g, b] = wavelengthToRGB(band as unknown as Parameters<typeof wavelengthToRGB>[0])
          return (
            <div key={band} className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: `rgb(${r},${g},${b})` }}
              />
              <span className="text-[7px] font-mono uppercase text-[#4a5580]">
                {band.slice(0, 3)} {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
