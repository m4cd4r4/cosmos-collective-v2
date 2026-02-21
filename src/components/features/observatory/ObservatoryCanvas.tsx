'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { PlottedObservation, ObservatoryViewMode } from './types'
import {
  wavelengthToRGB,
  aitoffProjection,
  distanceProjection,
  timelineProjection,
  getEffectiveCoordinates,
  CATEGORY_ORDER,
} from './utils'

interface Props {
  observations: PlottedObservation[]
  filtered: PlottedObservation[]
  viewMode: ObservatoryViewMode
  onHover: (obs: PlottedObservation | null, e?: React.MouseEvent) => void
  onSelect: (obs: PlottedObservation | null) => void
  hoveredObs: PlottedObservation | null
  selectedObs: PlottedObservation | null
}

// ── Background field stars (generated once) ──────────────────────────────

let bgStars: Array<{ x: number; y: number; r: number; a: number; c: string }> = []
function ensureBgStars() {
  if (bgStars.length) return
  bgStars = Array.from({ length: 500 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 0.9 + 0.2,
    a: Math.random() * 0.4 + 0.07,
    c: ['#fff', '#ddf', '#ffd', '#fdd'][Math.floor(Math.random() * 4)],
  }))
}

// ── Canvas component ─────────────────────────────────────────────────────

export function ObservatoryCanvas({
  observations,
  filtered,
  viewMode,
  onHover,
  onSelect,
  hoveredObs,
  selectedObs,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const twinkle = useRef<Float32Array>(new Float32Array(0))

  // Recompute positions each frame
  const computePositions = useCallback(
    (W: number, H: number) => {
      for (const obs of observations) {
        const coords = getEffectiveCoordinates(obs)
        const p =
          viewMode === 'sky'
            ? aitoffProjection(coords.ra, coords.dec, W, H)
            : viewMode === 'distance'
              ? distanceProjection(obs.distanceLightYears, obs.category, W, H)
              : timelineProjection(obs.observationDate, obs.category, W, H)
        obs.x = p.x
        obs.y = p.y
      }
    },
    [observations, viewMode],
  )

  // Twinkle phases
  useEffect(() => {
    twinkle.current = new Float32Array(observations.length).map(
      () => Math.random() * Math.PI * 2,
    )
  }, [observations.length])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ensureBgStars()

    function frame(ts: number) {
      if (!canvas) return
      const W = (canvas.width = canvas.offsetWidth)
      const H = (canvas.height = canvas.offsetHeight)
      computePositions(W, H)

      // Background
      ctx!.fillStyle = '#050810'
      ctx!.fillRect(0, 0, W, H)

      // Subtle nebula glow
      if (viewMode === 'sky') {
        const g = ctx!.createRadialGradient(W * 0.35, H * 0.4, 0, W * 0.35, H * 0.4, H * 0.7)
        g.addColorStop(0, 'rgba(40,25,80,0.12)')
        g.addColorStop(0.5, 'rgba(25,20,60,0.06)')
        g.addColorStop(1, 'rgba(5,8,16,0)')
        ctx!.fillStyle = g
        ctx!.fillRect(0, 0, W, H)

        const g2 = ctx!.createRadialGradient(W * 0.7, H * 0.6, 0, W * 0.7, H * 0.6, H * 0.5)
        g2.addColorStop(0, 'rgba(60,40,20,0.08)')
        g2.addColorStop(1, 'rgba(5,8,16,0)')
        ctx!.fillStyle = g2
        ctx!.fillRect(0, 0, W, H)
      }

      // Grid/axes
      if (viewMode === 'sky') drawSkyGrid(ctx!, W, H)
      else if (viewMode === 'distance') drawDistanceAxes(ctx!, W, H)
      else drawTimelineAxes(ctx!, W, H)

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
      const t = ts * 0.0006
      const tw = twinkle.current

      // Draw observation nodes
      for (let i = 0; i < filtered.length; i++) {
        const obs = filtered[i]
        const phase = tw[observations.indexOf(obs)] ?? 0
        const twk = 0.82 + 0.18 * Math.sin(t + phase)
        drawNode(ctx!, obs, obs === hoveredObs, obs === selectedObs, twk)
      }

      // Selected label
      if (selectedObs) {
        ctx!.fillStyle = 'rgba(200,215,255,0.85)'
        ctx!.font = '10px monospace'
        ctx!.textAlign = 'left'
        ctx!.fillText(selectedObs.targetName, selectedObs.x + 14, selectedObs.y - 5)
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [filtered, hoveredObs, selectedObs, viewMode, computePositions, observations])

  // Hit testing
  const hitTest = useCallback(
    (mx: number, my: number): PlottedObservation | null => {
      let best: PlottedObservation | null = null
      let bestD = 18
      for (const obs of filtered) {
        const d = Math.hypot(obs.x - mx, obs.y - my)
        if (d < bestD) {
          best = obs
          bestD = d
        }
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
      style={{ cursor: hoveredObs ? 'pointer' : 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
    />
  )
}

// ── Draw single observation node ─────────────────────────────────────────

function drawNode(
  ctx: CanvasRenderingContext2D,
  obs: PlottedObservation,
  isHov: boolean,
  isSel: boolean,
  twk: number,
) {
  const { x, y, drawR } = obs
  const [cr, cg, cb] = wavelengthToRGB(obs.wavelengthBand)
  const r = drawR * (isHov || isSel ? 1.6 : 1) * twk
  const gR = r * (isHov || isSel ? 12 : 6)

  // Outer glow
  const gl = ctx.createRadialGradient(x, y, 0, x, y, gR)
  gl.addColorStop(0, `rgba(${cr},${cg},${cb},${0.5 * twk})`)
  gl.addColorStop(0.3, `rgba(${cr},${cg},${cb},${0.15 * twk})`)
  gl.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
  ctx.beginPath()
  ctx.arc(x, y, gR, 0, Math.PI * 2)
  ctx.fillStyle = gl
  ctx.fill()

  // Core
  const core = ctx.createRadialGradient(x, y, 0, x, y, r)
  core.addColorStop(0, '#ffffff')
  core.addColorStop(0.4, `rgba(${cr},${cg},${cb},1)`)
  core.addColorStop(1, `rgba(${cr},${cg},${cb},0.8)`)
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = core
  ctx.fill()

  // Selection rings
  if (isSel) {
    ctx.beginPath()
    ctx.arc(x, y, r + 5, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.6)`
    ctx.lineWidth = 0.9
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y, r + 10, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.25)`
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // Featured indicator
  if (obs.isFeatured && !isSel) {
    ctx.beginPath()
    ctx.arc(x, y, r + 3, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 0.4
    ctx.setLineDash([2.5, 2.5])
    ctx.stroke()
    ctx.setLineDash([])
  }
}

// ── Sky grid (Aitoff) ────────────────────────────────────────────────────

function drawSkyGrid(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save()
  ctx.strokeStyle = 'rgba(74,144,226,0.06)'
  ctx.lineWidth = 0.5

  // Aitoff elliptical boundary
  ctx.beginPath()
  for (let dec = -90; dec <= 90; dec += 1) {
    const p = aitoffProjection(180, dec, W, H)
    if (dec === -90) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  }
  for (let dec = 90; dec >= -90; dec -= 1) {
    const p = aitoffProjection(-180, dec, W, H)
    ctx.lineTo(p.x, p.y)
  }
  ctx.closePath()
  ctx.strokeStyle = 'rgba(74,144,226,0.1)'
  ctx.stroke()

  // RA grid lines every 60 degrees
  ctx.strokeStyle = 'rgba(74,144,226,0.04)'
  for (let ra = -120; ra <= 180; ra += 60) {
    ctx.beginPath()
    for (let dec = -90; dec <= 90; dec += 2) {
      const p = aitoffProjection(ra, dec, W, H)
      if (dec === -90) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.stroke()
  }

  // Dec grid lines every 30 degrees
  for (let dec = -60; dec <= 60; dec += 30) {
    ctx.beginPath()
    for (let ra = -180; ra <= 180; ra += 2) {
      const p = aitoffProjection(ra, dec, W, H)
      if (ra === -180) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.stroke()
  }

  // Labels
  ctx.fillStyle = 'rgba(74,144,226,0.25)'
  ctx.font = '8px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('ALL-SKY AITOFF PROJECTION · EQUATORIAL COORDINATES', W / 2, 18)

  // RA labels
  for (let ra = -120; ra <= 180; ra += 60) {
    const p = aitoffProjection(ra, 0, W, H)
    const raHours = ((ra + 360) % 360) / 15
    ctx.fillText(`${raHours.toFixed(0)}h`, p.x, H / 2 + 12)
  }

  // Dec labels
  for (let dec = -60; dec <= 60; dec += 30) {
    if (dec === 0) continue
    const p = aitoffProjection(0, dec, W, H)
    ctx.textAlign = 'right'
    ctx.fillText(`${dec > 0 ? '+' : ''}${dec}°`, p.x - 5, p.y + 3)
  }

  ctx.restore()
}

// ── Distance axes ────────────────────────────────────────────────────────

function drawDistanceAxes(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save()
  const pad = 55

  // Grid lines
  ctx.strokeStyle = 'rgba(74,144,226,0.06)'
  ctx.lineWidth = 0.5

  const distMarkers = [100, 1000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000]
  const minLog = Math.log10(100)
  const maxLog = Math.log10(1_000_000_000)

  for (const d of distMarkers) {
    const tx = (Math.log10(d) - minLog) / (maxLog - minLog)
    const x = pad + tx * (W - 2 * pad)
    ctx.beginPath()
    ctx.moveTo(x, pad)
    ctx.lineTo(x, H - pad)
    ctx.stroke()

    ctx.fillStyle = 'rgba(74,144,226,0.3)'
    ctx.font = '8px monospace'
    ctx.textAlign = 'center'
    const label =
      d >= 1_000_000 ? `${(d / 1_000_000).toFixed(0)}M ly`
      : d >= 1_000 ? `${(d / 1_000).toFixed(0)}k ly`
      : `${d} ly`
    ctx.fillText(label, x, H - pad + 14)
  }

  // Category labels (y-axis)
  const labels: Record<string, string> = {
    'nebula': 'Nebulae', 'galaxy': 'Galaxies', 'deep-field': 'Deep Fields',
    'solar-system': 'Solar System', 'supernova': 'Supernovae',
    'star-cluster': 'Star Clusters', 'star': 'Stars', 'other': 'Other',
  }
  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const ty = (i + 0.5) / (CATEGORY_ORDER.length + 1)
    const y = pad + ty * (H - 2 * pad)
    ctx.strokeStyle = 'rgba(74,144,226,0.03)'
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(W - pad, y)
    ctx.stroke()

    ctx.fillStyle = 'rgba(74,144,226,0.3)'
    ctx.font = '8px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(labels[CATEGORY_ORDER[i]] ?? CATEGORY_ORDER[i], pad - 6, y + 3)
  }

  ctx.fillStyle = 'rgba(74,144,226,0.25)'
  ctx.font = '8px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('DISTANCE FROM EARTH (LOGARITHMIC SCALE)', W / 2, 18)

  ctx.restore()
}

// ── Timeline axes ────────────────────────────────────────────────────────

function drawTimelineAxes(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save()
  const pad = 55
  const minDate = new Date('1995-01-01').getTime()
  const maxDate = new Date('2024-06-01').getTime()

  ctx.strokeStyle = 'rgba(74,144,226,0.06)'
  ctx.lineWidth = 0.5

  const years = [1995, 2000, 2005, 2010, 2015, 2020, 2024]
  for (const yr of years) {
    const t = new Date(`${yr}-01-01`).getTime()
    const tx = (t - minDate) / (maxDate - minDate)
    const x = pad + tx * (W - 2 * pad)
    ctx.beginPath()
    ctx.moveTo(x, pad)
    ctx.lineTo(x, H - pad)
    ctx.stroke()

    ctx.fillStyle = 'rgba(74,144,226,0.3)'
    ctx.font = '8px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(String(yr), x, H - pad + 14)
  }

  // Category labels
  const labels: Record<string, string> = {
    'nebula': 'Nebulae', 'galaxy': 'Galaxies', 'deep-field': 'Deep Fields',
    'solar-system': 'Solar System', 'supernova': 'Supernovae',
    'star-cluster': 'Star Clusters', 'star': 'Stars', 'other': 'Other',
  }
  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const ty = (i + 0.5) / (CATEGORY_ORDER.length + 1)
    const y = pad + ty * (H - 2 * pad)
    ctx.strokeStyle = 'rgba(74,144,226,0.03)'
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(W - pad, y)
    ctx.stroke()

    ctx.fillStyle = 'rgba(74,144,226,0.3)'
    ctx.font = '8px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(labels[CATEGORY_ORDER[i]] ?? CATEGORY_ORDER[i], pad - 6, y + 3)
  }

  ctx.fillStyle = 'rgba(74,144,226,0.25)'
  ctx.font = '8px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('OBSERVATION TIMELINE · 1995–2024', W / 2, 18)

  ctx.restore()
}
