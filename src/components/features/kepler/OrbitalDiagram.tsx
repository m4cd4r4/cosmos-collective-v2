'use client'

import { useEffect, useRef } from 'react'
import type { StarSystem } from './types'
import { tempToRGB, PLANET_COLORS } from './utils'

interface Props {
  star: StarSystem
  size?: number
}

export function OrbitalDiagram({ star, size = 220 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = size, H = size
    canvas.width  = W
    canvas.height = H
    const cx = W / 2, cy = H / 2

    // Background
    ctx.fillStyle = '#060a1a'
    ctx.fillRect(0, 0, W, H)

    // Star glow
    const [cr, cg, cb] = tempToRGB(star.teff)
    const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20)
    sg.addColorStop(0,   '#ffffff')
    sg.addColorStop(0.4, `rgb(${cr},${cg},${cb})`)
    sg.addColorStop(1,   'transparent')
    ctx.beginPath()
    ctx.arc(cx, cy, 15, 0, Math.PI * 2)
    ctx.fillStyle = sg
    ctx.fill()

    const sorted = [...star.planets]
      .filter(p => p.period)
      .sort((a, b) => (a.period ?? 0) - (b.period ?? 0))

    if (!sorted.length) return

    const RMIN = 24
    const RMAX = cy - 10
    const n    = sorted.length

    // Habitable zone annulus
    const hzIn  = RMIN + 0.38 * (RMAX - RMIN)
    const hzOut = RMIN + 0.62 * (RMAX - RMIN)
    ctx.beginPath()
    ctx.arc(cx, cy, hzOut, 0, Math.PI * 2)
    ctx.arc(cx, cy, hzIn, 0, Math.PI * 2, true)
    ctx.fillStyle = 'rgba(80,180,100,0.05)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, hzOut, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(80,180,100,0.1)'
    ctx.lineWidth = 0.5
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, hzIn, 0, Math.PI * 2)
    ctx.stroke()

    sorted.forEach((p, i) => {
      const orR   = RMIN + (i / Math.max(n - 1, 1)) * (RMAX - RMIN)
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2
      const px    = cx + Math.cos(angle) * orR
      const py    = cy + Math.sin(angle) * orR
      const pr    = Math.max(2, Math.min(6, (p.rade ?? 1.5) * 0.85))
      const pc    = PLANET_COLORS[p.cat]

      // Orbit ring
      ctx.beginPath()
      ctx.arc(cx, cy, orR, 0, Math.PI * 2)
      ctx.strokeStyle = p.hz ? 'rgba(100,200,120,0.2)' : 'rgba(74,144,226,0.1)'
      ctx.lineWidth = 0.6
      ctx.stroke()

      // Planet glow
      const [r2, g2, b2] = [
        parseInt(pc.slice(1, 3), 16),
        parseInt(pc.slice(3, 5), 16),
        parseInt(pc.slice(5, 7), 16),
      ]
      const pg = ctx.createRadialGradient(px, py, 0, px, py, pr * 2.8)
      pg.addColorStop(0,   '#fff')
      pg.addColorStop(0.3, pc)
      pg.addColorStop(1,   `rgba(${r2},${g2},${b2},0)`)
      ctx.beginPath()
      ctx.arc(px, py, pr * 2.8, 0, Math.PI * 2)
      ctx.fillStyle = pg
      ctx.fill()

      ctx.beginPath()
      ctx.arc(px, py, pr, 0, Math.PI * 2)
      ctx.fillStyle = pc
      ctx.fill()
    })
  }, [star, size])

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="rounded-full border border-white/5"
      style={{ background: 'radial-gradient(circle, rgba(12,18,45,0.9) 0%, rgba(4,6,18,0.95) 100%)' }}
    />
  )
}
