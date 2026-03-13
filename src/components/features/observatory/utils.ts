import type { Observation, ObjectCategory } from '@/types'

// Re-export wavelength utilities from shared module
export { wavelengthToColor, wavelengthToRGB } from '@/lib/astronomy-utils'

// ── Aitoff all-sky projection ─────────────────────────────────────────────

export function aitoffProjection(
  raDeg: number,
  decDeg: number,
  W: number,
  H: number,
): { x: number; y: number } {
  // RA: 0-360 -> -180 to +180 (centered at 0h)
  const lambda = ((raDeg > 180 ? raDeg - 360 : raDeg) * Math.PI) / 180
  const phi = (decDeg * Math.PI) / 180

  const halfLambda = lambda / 2
  const cosPhiCosHL = Math.cos(phi) * Math.cos(halfLambda)
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosPhiCosHL)))
  const sinc = alpha === 0 ? 1 : Math.sin(alpha) / alpha

  const px = (2 * Math.cos(phi) * Math.sin(halfLambda)) / sinc
  const py = Math.sin(phi) / sinc

  // Aitoff x range: [-2, 2], y range: [-1, 1]
  const pad = 45
  const scaleX = (W - 2 * pad) / 4
  const scaleY = (H - 2 * pad) / 2

  return {
    x: W / 2 + px * scaleX,
    y: H / 2 - py * scaleY,
  }
}

// ── Distance projection (log scale) ──────────────────────────────────────

const CATEGORY_ORDER: ObjectCategory[] = [
  'nebula', 'galaxy', 'deep-field', 'solar-system',
  'supernova', 'star-cluster', 'star', 'other',
]

export function distanceProjection(
  distanceLY: number | undefined,
  category: ObjectCategory,
  W: number,
  H: number,
): { x: number; y: number } {
  const pad = 55
  const minLog = Math.log10(100)
  const maxLog = Math.log10(1_000_000_000)
  const dist = distanceLY ?? 10000
  const logDist = Math.log10(Math.max(100, dist))
  const tx = Math.max(0, Math.min(1, (logDist - minLog) / (maxLog - minLog)))

  const idx = CATEGORY_ORDER.indexOf(category)
  const catY = idx >= 0 ? idx : CATEGORY_ORDER.length
  const ty = (catY + 0.5) / (CATEGORY_ORDER.length + 1)

  return {
    x: pad + tx * (W - 2 * pad),
    y: pad + ty * (H - 2 * pad),
  }
}

// ── Timeline projection ──────────────────────────────────────────────────

const MIN_DATE = new Date('1995-01-01').getTime()
const MAX_DATE = new Date('2024-06-01').getTime()

export function timelineProjection(
  dateStr: string,
  category: ObjectCategory,
  W: number,
  H: number,
): { x: number; y: number } {
  const pad = 55
  const date = new Date(dateStr).getTime()
  const tx = Math.max(0, Math.min(1, (date - MIN_DATE) / (MAX_DATE - MIN_DATE)))

  const idx = CATEGORY_ORDER.indexOf(category)
  const catY = idx >= 0 ? idx : CATEGORY_ORDER.length
  const ty = (catY + 0.5) / (CATEGORY_ORDER.length + 1)

  return {
    x: pad + tx * (W - 2 * pad),
    y: pad + ty * (H - 2 * pad),
  }
}

// ── Node radius ──────────────────────────────────────────────────────────

export function computeNodeRadius(obs: Observation): number {
  const base = obs.isFeatured ? 4.0 : 3.0
  if (obs.distanceLightYears) {
    const logDist = Math.log10(Math.max(100, obs.distanceLightYears))
    return Math.max(2.5, Math.min(5.5, base + (9 - logDist) * 0.25))
  }
  return base
}

// ── Distance formatting ──────────────────────────────────────────────────

export function formatDistance(ly: number | undefined): string {
  if (ly == null) return '-'
  if (ly >= 1_000_000_000) return `${(ly / 1_000_000_000).toFixed(1)} Gly`
  if (ly >= 1_000_000) return `${(ly / 1_000_000).toFixed(0)} Mly`
  if (ly >= 10_000) return `${(ly / 1_000).toFixed(0)}k ly`
  return `${ly.toLocaleString()} ly`
}

// ── Solar system pseudo-coordinates ──────────────────────────────────────
// Planets have RA/Dec = 0,0 since they move. Assign stable pseudo-positions.

const SOLAR_SYSTEM_OFFSETS: Record<string, { ra: number; dec: number }> = {
  'Jupiter':  { ra: 348, dec: -8 },
  'Neptune':  { ra: 356, dec: -4 },
  'Uranus':   { ra: 42,  dec: 16 },
  'Saturn':   { ra: 330, dec: -14 },
  'Mars':     { ra: 18,  dec: 8 },
}

export function getEffectiveCoordinates(obs: Observation): { ra: number; dec: number } {
  if (obs.coordinates.ra === 0 && obs.coordinates.dec === 0 && obs.category === 'solar-system') {
    const override = SOLAR_SYSTEM_OFFSETS[obs.targetName]
    if (override) return override
    // Fallback: deterministic scatter near ecliptic
    const hash = obs.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return { ra: (hash * 37) % 360, dec: ((hash * 13) % 40) - 20 }
  }
  return { ra: obs.coordinates.ra, dec: obs.coordinates.dec }
}

// ── Category helpers ─────────────────────────────────────────────────────

export { CATEGORY_ORDER }
