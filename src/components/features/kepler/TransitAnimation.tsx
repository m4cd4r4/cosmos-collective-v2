'use client'

import { useEffect, useRef } from 'react'
import type { Planet, StarSystem } from './types'
import { tempToColor } from './utils'

interface Props {
  planet: Planet
  star: StarSystem
}

// Transit duration in hours (simplified)
function transitDurationHours(
  rStarRsun: number,  // stellar radius in solar radii
  rPlanetRearth: number, // planet radius in earth radii
  sMaxAU: number,     // semi-major axis in AU
): number {
  const R_SUN_AU = 0.00465  // 1 solar radius in AU
  const R_EARTH_AU = 0.0000426 // 1 earth radius in AU
  const rStarAU = rStarRsun * R_SUN_AU
  const rPlanetAU = rPlanetRearth * R_EARTH_AU
  // T = (period / π) * arcsin((rStar + rPlanet) / a)
  // Approximate as: T_hours = 13 * (rStar / 1) * (a / 1AU)^(1/2) hours (solar-like)
  const chord = rStarAU + rPlanetAU
  if (sMaxAU <= 0) return 2
  const arg = Math.min(chord / sMaxAU, 1)
  const periodDays = 365.25 * Math.pow(sMaxAU, 1.5) // Kepler's 3rd law approx
  return ((periodDays * 24) / Math.PI) * Math.asin(arg)
}

// Limb darkening coefficient (linear)
const LD_U = 0.6

function limbDark(r: number): number {
  const mu = Math.sqrt(Math.max(0, 1 - r * r))
  return 1 - LD_U * (1 - mu)
}

// Transit depth: (r_planet / r_star)^2
function transitDepth(radeEarth: number, sradSun: number): number {
  const R_EARTH_TO_SUN = 0.00916  // Earth radii per solar radius
  const ratio = (radeEarth * R_EARTH_TO_SUN) / sradSun
  return ratio * ratio
}

// Draw star circle with limb darkening
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  color: string
): void {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const data = imageData.data

  // Parse star color
  const col = new Uint8Array([
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16),
  ])

  const x0 = Math.floor(cx - r), x1 = Math.ceil(cx + r)
  const y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r)
  const w = ctx.canvas.width

  for (let py = Math.max(0, y0); py <= Math.min(ctx.canvas.height - 1, y1); py++) {
    for (let px = Math.max(0, x0); px <= Math.min(w - 1, x1); px++) {
      const dx = (px - cx) / r
      const dy = (py - cy) / r
      const d2 = dx * dx + dy * dy
      if (d2 > 1) continue
      const ld = limbDark(Math.sqrt(d2))
      const idx = (py * w + px) * 4
      data[idx]     = Math.round(col[0] * ld)
      data[idx + 1] = Math.round(col[1] * ld)
      data[idx + 2] = Math.round(col[2] * ld)
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

export function TransitAnimation({ planet, star }: Props) {
  const viewRef  = useRef<HTMLCanvasElement>(null)
  const curveRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const tRef     = useRef(0)  // phase: 0..1

  const srad    = star.srad ?? 1
  const rade    = planet.rade ?? 1
  const smax    = planet.smax ?? 0.1
  const tEff    = star.teff
  const period  = planet.period ?? 365

  const durHours = transitDurationHours(srad, rade, smax)
  const depth    = transitDepth(rade, srad)
  const starCol  = tempToColor(tEff)

  const R_EARTH_TO_SUN = 0.00916
  const planetRadiusFraction = (rade * R_EARTH_TO_SUN) / srad  // r_planet/r_star

  useEffect(() => {
    const viewCanvas  = viewRef.current
    const curveCanvas = curveRef.current
    if (!viewCanvas || !curveCanvas) return

    const vCtx = viewCanvas.getContext('2d')!
    const cCtx = curveCanvas.getContext('2d')!
    const VW = viewCanvas.width, VH = viewCanvas.height
    const CW = curveCanvas.width, CH = curveCanvas.height

    const starR = VH * 0.34
    const planetR = Math.max(2, Math.min(starR * 0.9, planetRadiusFraction * starR * 3))
    const cx = VW / 2
    const cy = VH / 2

    // Transit phase: -0.5 to 0.5 is full pass (planet enters from left, exits right)
    // totalPhaseWidth: how much of a full orbit the transit takes
    const transitHalfWidth = 0.65  // fraction of animation showing off-transit vs transit

    let lastTs = performance.now()

    function drawFrame() {
      frameRef.current = requestAnimationFrame(drawFrame)
      const now = performance.now()
      const dt = (now - lastTs) / 1000  // seconds
      lastTs = now

      // tRef goes 0..1 for the full transit loop (in + transit + out + pause)
      tRef.current = (tRef.current + dt * 0.12) % 1

      const t = tRef.current  // 0..1

      // Map t to x position of planet center:
      // 0..0.2: approach (off-screen left to contact)
      // 0.2..0.8: transit
      // 0.8..1.0: exit + pause
      const travelWidth = VW + planetR * 4
      const planetX = -planetR * 2 + t * travelWidth
      const transitPhase = (planetX - (cx - starR)) / (2 * starR)  // 0..1 during transit

      // Compute flux (light curve dip)
      let flux = 1.0
      if (planetX + planetR > cx - starR && planetX - planetR < cx + starR) {
        // Planet overlaps star
        const dist = Math.abs(planetX - cx) / starR  // normalized distance from center
        if (dist <= 1 - planetRadiusFraction) {
          // Full transit (planet fully inside star disk)
          flux = 1 - depth
        } else {
          // Ingress/egress — interpolate
          const overlap = Math.max(0, Math.min(1, (1 + planetRadiusFraction - dist) / (2 * planetRadiusFraction)))
          flux = 1 - depth * overlap * overlap
        }
      }

      // ── Left canvas: transit view ───────────────────────────────────────
      vCtx.fillStyle = '#020408'
      vCtx.fillRect(0, 0, VW, VH)

      // Draw dashed reference line (planet path)
      vCtx.setLineDash([3, 4])
      vCtx.strokeStyle = 'rgba(74,144,226,0.25)'
      vCtx.lineWidth = 1
      vCtx.beginPath()
      vCtx.moveTo(0, cy)
      vCtx.lineTo(VW, cy)
      vCtx.stroke()
      vCtx.setLineDash([])

      // Draw star with limb darkening
      drawStar(vCtx, cx, cy, starR, starCol)

      // Draw planet (black circle on top)
      if (planetX + planetR > 0 && planetX - planetR < VW) {
        vCtx.beginPath()
        vCtx.arc(planetX, cy, planetR, 0, Math.PI * 2)
        vCtx.fillStyle = '#000000'
        vCtx.fill()
        // Planet edge glow
        vCtx.strokeStyle = 'rgba(74,144,226,0.4)'
        vCtx.lineWidth = 1
        vCtx.stroke()
      }

      // ── Right canvas: light curve ───────────────────────────────────────
      cCtx.fillStyle = '#020408'
      cCtx.fillRect(0, 0, CW, CH)

      const padL = 32, padR = 8, padT = 8, padB = 24
      const plotW = CW - padL - padR
      const plotH = CH - padT - padB

      // Axes
      cCtx.strokeStyle = 'rgba(74,144,226,0.2)'
      cCtx.lineWidth = 1
      cCtx.beginPath()
      cCtx.moveTo(padL, padT)
      cCtx.lineTo(padL, padT + plotH)
      cCtx.lineTo(padL + plotW, padT + plotH)
      cCtx.stroke()

      // Y-axis labels
      cCtx.fillStyle = '#4a5580'
      cCtx.font = '8px monospace'
      cCtx.textAlign = 'right'
      cCtx.fillText('1.000', padL - 3, padT + 4)
      const dipY = padT + plotH * depth * 20  // scale depth visually (exaggerated)
      const floorLabel = (1 - depth).toFixed(4)
      cCtx.fillText(floorLabel, padL - 3, padT + plotH - 6)

      // X-axis label
      cCtx.textAlign = 'center'
      cCtx.fillStyle = '#4a5580'
      cCtx.font = '8px monospace'
      cCtx.fillText('Time', padL + plotW / 2, CH - 3)
      cCtx.textAlign = 'left'
      cCtx.fillText('Brightness', 2, padT + plotH / 2)

      // Draw the light curve shape
      cCtx.beginPath()
      cCtx.strokeStyle = '#4a90e2'
      cCtx.lineWidth = 1.5
      const steps = plotW
      for (let i = 0; i <= steps; i++) {
        const px_norm = i / steps  // 0..1 across plot
        // Map px_norm to planet x position at that phase
        const fakeX = -planetR * 2 + px_norm * travelWidth
        let fFlux = 1.0
        if (fakeX + planetR > cx - starR && fakeX - planetR < cx + starR) {
          const d = Math.abs(fakeX - cx) / starR
          if (d <= 1 - planetRadiusFraction) {
            fFlux = 1 - depth
          } else {
            const ov = Math.max(0, Math.min(1, (1 + planetRadiusFraction - d) / (2 * planetRadiusFraction)))
            fFlux = 1 - depth * ov * ov
          }
        }
        // Exaggerate depth for visibility (max 40% of plot height)
        const displayDrop = Math.min((1 - fFlux) * 800, 0.4)
        const py = padT + plotH * displayDrop
        if (i === 0) cCtx.moveTo(padL + i, padT)
        else cCtx.lineTo(padL + i, py)
      }
      cCtx.stroke()

      // Live dot on curve
      const currentNorm = (planetX + planetR * 2) / travelWidth
      const clampedNorm = Math.max(0, Math.min(1, currentNorm))
      const displayDrop = Math.min((1 - flux) * 800, 0.4)
      const dotX = padL + clampedNorm * plotW
      const dotY = padT + plotH * displayDrop
      cCtx.beginPath()
      cCtx.arc(dotX, dotY, 3, 0, Math.PI * 2)
      cCtx.fillStyle = '#d4af37'
      cCtx.fill()

      // Depth annotation
      if (depth > 0) {
        const depthPct = (depth * 100).toFixed(3)
        cCtx.fillStyle = '#6a7890'
        cCtx.font = '8px monospace'
        cCtx.textAlign = 'center'
        cCtx.fillText(`Δ ${depthPct}%`, padL + plotW * 0.5, padT + plotH * 0.2)
      }
    }

    drawFrame()
    return () => cancelAnimationFrame(frameRef.current)
  }, [planet, star, starCol, depth, planetRadiusFraction, durHours, srad, rade, smax])

  return (
    <div className="bg-white/[0.02] rounded-lg border border-[rgba(74,144,226,0.12)] p-3">
      <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-2">
        Transit Detection
        <span className="ml-2 normal-case text-[#3a4560]">how Kepler found this planet</span>
      </div>

      <div className="flex gap-2">
        <canvas
          ref={viewRef}
          width={140}
          height={100}
          className="rounded border border-[rgba(74,144,226,0.08)]"
        />
        <canvas
          ref={curveRef}
          width={160}
          height={100}
          className="rounded border border-[rgba(74,144,226,0.08)]"
        />
      </div>

      <div className="flex justify-between mt-2 text-[9px] text-[#4a5580]">
        <span>Transit depth: {(depth * 100).toFixed(4)}%</span>
        <span>Duration: ~{durHours.toFixed(1)} h</span>
        <span>Period: {period.toFixed(1)} d</span>
      </div>
    </div>
  )
}
