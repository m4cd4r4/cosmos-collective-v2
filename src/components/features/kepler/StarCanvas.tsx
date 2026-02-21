'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { StarSystem, ViewMode } from './types'
import {
  tempToRGB,
  skyProjection,
  galaxyProjection,
  hrProjection,
} from './utils'

interface Props {
  stars: StarSystem[]
  filtered: StarSystem[]
  viewMode: ViewMode
  onHover: (star: StarSystem | null, e?: React.MouseEvent) => void
  onSelect: (star: StarSystem | null) => void
  hoveredStar: StarSystem | null
  selectedStar: StarSystem | null
}

// Background field stars (generated once)
let bgStars: Array<{ x: number; y: number; r: number; a: number; c: string }> = []
function ensureBgStars() {
  if (bgStars.length) return
  bgStars = Array.from({ length: 700 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 0.9 + 0.2,
    a: Math.random() * 0.4 + 0.07,
    c: ['#fff', '#ddf', '#ffd', '#fdd'][Math.floor(Math.random() * 4)],
  }))
}

export function StarCanvas({
  stars,
  filtered,
  viewMode,
  onHover,
  onSelect,
  hoveredStar,
  selectedStar,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const twinkle   = useRef<Float32Array>(new Float32Array(0))

  // Recompute star canvas positions
  const computePositions = useCallback(
    (W: number, H: number) => {
      for (const s of stars) {
        const p =
          viewMode === 'sky'    ? skyProjection(s.ra ?? 0, s.dec ?? 0, W, H)
          : viewMode === 'galaxy' ? galaxyProjection(s.ra ?? 0, s.dec ?? 0, s.dist, W, H)
          : hrProjection(s.teff, s.slum, s.srad, W, H)
        s.x = p.x
        s.y = p.y
        const r = s.srad ?? 1
        s.drawR = Math.max(1.5, Math.min(4.5, 1.5 + Math.log1p(r) * 1.4))
      }
    },
    [stars, viewMode],
  )

  // Twinkle phases
  useEffect(() => {
    twinkle.current = new Float32Array(stars.length).map(() => Math.random() * Math.PI * 2)
  }, [stars.length])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ensureBgStars()

    function frame(ts: number) {
      if (!canvas) return
      const W = (canvas.width  = canvas.offsetWidth)
      const H = (canvas.height = canvas.offsetHeight)
      computePositions(W, H)

      // ── Background ──────────────────────────────────────
      ctx!.fillStyle = '#050810'
      ctx!.fillRect(0, 0, W, H)

      if (viewMode === 'sky') {
        const g = ctx!.createRadialGradient(W * 0.52, H * 0.45, 0, W * 0.52, H * 0.5, H * 0.85)
        g.addColorStop(0, 'rgba(30,35,100,0.14)')
        g.addColorStop(0.4, 'rgba(18,20,65,0.07)')
        g.addColorStop(1, 'rgba(5,8,25,0)')
        ctx!.fillStyle = g
        ctx!.fillRect(0, 0, W, H)
      }

      if (viewMode === 'galaxy') {
        ctx!.save()
        ctx!.translate(W / 2, H / 2)
        ctx!.rotate(-0.38)
        const dg = ctx!.createLinearGradient(0, -H * 0.12, 0, H * 0.12)
        dg.addColorStop(0, 'rgba(25,35,95,0)')
        dg.addColorStop(0.5, 'rgba(25,35,95,0.11)')
        dg.addColorStop(1, 'rgba(25,35,95,0)')
        ctx!.fillStyle = dg
        ctx!.fillRect(-W, -H * 0.12, W * 2, H * 0.24)
        ctx!.restore()
      }

      if (viewMode === 'hr') drawHRAxes(ctx!, W, H)

      // Field stars
      for (const s of bgStars) {
        ctx!.beginPath()
        ctx!.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx!.fillStyle = s.c
        ctx!.globalAlpha = s.a
        ctx!.fill()
      }
      ctx!.globalAlpha = 1

      // Twinkle factor
      const t = ts * 0.0007
      const tw = twinkle.current

      // Draw stars
      for (let i = 0; i < filtered.length; i++) {
        const s = filtered[i]
        const phase = tw[stars.indexOf(s)] ?? 0
        const twk = 0.82 + 0.18 * Math.sin(t + phase)
        drawStar(ctx!, s, s === hoveredStar, s === selectedStar, twk)
      }

      // Sun (galaxy view)
      if (viewMode === 'galaxy') {
        const cx = W / 2, cy = H / 2
        const sg = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 16)
        sg.addColorStop(0, 'rgba(255,255,255,0.9)')
        sg.addColorStop(0.35, 'rgba(255,220,50,0.5)')
        sg.addColorStop(1, 'rgba(255,220,50,0)')
        ctx!.beginPath()
        ctx!.arc(cx, cy, 4, 0, Math.PI * 2)
        ctx!.fillStyle = sg
        ctx!.fill()
        ctx!.fillStyle = 'rgba(255,220,100,0.65)'
        ctx!.font = '9px monospace'
        ctx!.textAlign = 'center'
        ctx!.fillText('☉ SUN', cx, cy - 11)
      }

      // FOV circle (sky view)
      if (viewMode === 'sky') {
        const r = Math.min(W, H) * 0.41
        ctx!.beginPath()
        ctx!.arc(W / 2, H / 2, r, 0, Math.PI * 2)
        ctx!.strokeStyle = 'rgba(74,144,226,0.07)'
        ctx!.lineWidth = 0.8
        ctx!.stroke()
        ctx!.fillStyle = 'rgba(74,144,226,0.03)'
        ctx!.fill()
        ctx!.fillStyle = 'rgba(74,144,226,0.22)'
        ctx!.font = '8px monospace'
        ctx!.textAlign = 'right'
        ctx!.fillText('KEPLER FIELD OF VIEW — CYGNUS', W / 2 + r, H / 2 - r - 5)
      }

      // Selected star label
      if (selectedStar) {
        ctx!.fillStyle = 'rgba(200,215,255,0.8)'
        ctx!.font = '10px monospace'
        ctx!.textAlign = 'left'
        ctx!.fillText(selectedStar.name, selectedStar.x + 13, selectedStar.y - 4)
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [filtered, hoveredStar, selectedStar, viewMode, computePositions, stars])

  // ── Hit test ────────────────────────────────────────────────────────────
  const hitTest = useCallback(
    (mx: number, my: number): StarSystem | null => {
      let best: StarSystem | null = null
      let bestD = 14
      for (const s of filtered) {
        const d = Math.hypot(s.x - mx, s.y - my)
        if (d < bestD) { best = s; bestD = d }
      }
      return best
    },
    [filtered],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const r = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect()
      onHover(hitTest(e.clientX - r.left, e.clientY - r.top), e)
    },
    [hitTest, onHover],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const r = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect()
      const hit = hitTest(e.clientX - r.left, e.clientY - r.top)
      onSelect(hit)
    },
    [hitTest, onSelect],
  )

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: hoveredStar ? 'pointer' : 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
    />
  )
}

// ── Draw single star ───────────────────────────────────────────────────────
function drawStar(
  ctx: CanvasRenderingContext2D,
  s: StarSystem,
  isHov: boolean,
  isSel: boolean,
  twk: number,
) {
  const { x, y, drawR } = s
  const [cr, cg, cb] = tempToRGB(s.teff)
  const r  = drawR * (isHov || isSel ? 1.5 : 1) * twk
  const gR = r * (isHov || isSel ? 11 : 5.5)

  const gl = ctx.createRadialGradient(x, y, 0, x, y, gR)
  gl.addColorStop(0,    `rgba(${cr},${cg},${cb},${0.55 * twk})`)
  gl.addColorStop(0.25, `rgba(${cr},${cg},${cb},${0.18 * twk})`)
  gl.addColorStop(1,    `rgba(${cr},${cg},${cb},0)`)
  ctx.beginPath()
  ctx.arc(x, y, gR, 0, Math.PI * 2)
  ctx.fillStyle = gl
  ctx.fill()

  const core = ctx.createRadialGradient(x, y, 0, x, y, r)
  core.addColorStop(0,    '#ffffff')
  core.addColorStop(0.35, `rgba(${cr},${cg},${cb},1)`)
  core.addColorStop(1,    `rgba(${cr},${cg},${cb},0.85)`)
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = core
  ctx.fill()

  if (isSel) {
    ctx.beginPath()
    ctx.arc(x, y, r + 4, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.55)`
    ctx.lineWidth = 0.8
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y, r + 9, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.22)`
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  if ((s.pnum ?? s.planets.length) >= 3) {
    ctx.beginPath()
    ctx.arc(x, y, r * 3, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 0.4
    ctx.stroke()
  }

  if (s.hasHZ) {
    ctx.beginPath()
    ctx.arc(x, y, r + (isSel ? 6 : 2.5), 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(100,200,120,0.4)'
    ctx.lineWidth = 0.6
    ctx.setLineDash([2.5, 2.5])
    ctx.stroke()
    ctx.setLineDash([])
  }
}

// ── HR Diagram axes ────────────────────────────────────────────────────────
function drawHRAxes(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const pad = 55
  ctx.save()
  ctx.strokeStyle = 'rgba(74,144,226,0.1)'
  ctx.lineWidth = 0.5
  const temps = [3000, 4000, 5000, 6000, 7000, 8000, 10000]
  for (const t of temps) {
    const x = pad + (1 - (t - 2500) / (12000 - 2500)) * (W - 2 * pad)
    ctx.beginPath()
    ctx.moveTo(x, pad); ctx.lineTo(x, H - pad)
    ctx.stroke()
    ctx.fillStyle = 'rgba(74,144,226,0.4)'
    ctx.font = '8px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${t}K`, x, H - pad + 12)
  }
  const sp: Record<string, number> = { A: 8500, F: 6500, G: 5500, K: 4200, M: 3200 }
  for (const [lbl, t] of Object.entries(sp)) {
    const x = pad + (1 - (t - 2500) / (12000 - 2500)) * (W - 2 * pad)
    ctx.fillStyle = 'rgba(180,200,255,0.5)'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(lbl, x, pad - 8)
  }
  ctx.fillStyle = 'rgba(74,144,226,0.45)'
  ctx.font = '9px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('← Hotter  |  Stellar Temperature  |  Cooler →', W / 2, H - pad + 24)
  ctx.fillText('Hertzsprung–Russell Diagram (Kepler Host Stars)', W / 2, pad - 20)
  ctx.restore()
}
