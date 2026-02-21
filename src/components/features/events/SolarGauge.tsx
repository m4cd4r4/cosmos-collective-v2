'use client'

/**
 * Solar Activity Gauge
 * Semi-circle arc gauge showing current solar activity level
 */

const LEVELS = ['quiet', 'minor', 'moderate', 'strong', 'severe'] as const
type FlareLevel = (typeof LEVELS)[number]

const LEVEL_COLORS: Record<FlareLevel, string> = {
  quiet: '#22c55e',
  minor: '#eab308',
  moderate: '#f97316',
  strong: '#ef4444',
  severe: '#dc2626',
}

const LEVEL_LABELS: Record<FlareLevel, string> = {
  quiet: 'Quiet',
  minor: 'Minor',
  moderate: 'Moderate',
  strong: 'Strong',
  severe: 'Severe',
}

interface SolarGaugeProps {
  flareLevel: string
  currentFlux: number
  className?: string
}

export function SolarGauge({ flareLevel, currentFlux, className }: SolarGaugeProps) {
  const level = (LEVELS.includes(flareLevel as FlareLevel) ? flareLevel : 'quiet') as FlareLevel
  const levelIndex = LEVELS.indexOf(level)

  // Gauge geometry
  const cx = 100
  const cy = 90
  const r = 70
  const startAngle = Math.PI // 180° (left)
  const endAngle = 0 // 0° (right)
  const totalArc = Math.PI // 180° sweep

  // Needle position: map level index (0-4) to angle
  const needleAngle = startAngle - (levelIndex / (LEVELS.length - 1)) * totalArc
  const needleLen = r - 8
  const needleX = cx + needleLen * Math.cos(needleAngle)
  const needleY = cy - needleLen * Math.sin(needleAngle)

  // Arc segments
  const segments = LEVELS.map((_, i) => {
    const segStart = startAngle - (i / LEVELS.length) * totalArc
    const segEnd = startAngle - ((i + 1) / LEVELS.length) * totalArc
    return {
      d: describeArc(cx, cy, r, segEnd, segStart),
      color: LEVEL_COLORS[LEVELS[i]],
    }
  })

  return (
    <div className={className}>
      <svg viewBox="0 0 200 110" className="w-full h-auto">
        {/* Arc segments */}
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.d}
            fill="none"
            stroke={seg.color}
            strokeWidth={8}
            strokeLinecap="round"
            opacity={i <= levelIndex ? 1 : 0.15}
          />
        ))}

        {/* Level labels along arc */}
        {LEVELS.map((lvl, i) => {
          const angle = startAngle - ((i + 0.5) / LEVELS.length) * totalArc
          const lx = cx + (r + 14) * Math.cos(angle)
          const ly = cy - (r + 14) * Math.sin(angle)
          return (
            <text
              key={lvl}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={i === levelIndex ? LEVEL_COLORS[lvl] : 'rgba(255,255,255,0.2)'}
              fontSize={5}
              fontWeight={i === levelIndex ? 'bold' : 'normal'}
            >
              {LEVEL_LABELS[lvl]}
            </text>
          )
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={LEVEL_COLORS[level]}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4} fill={LEVEL_COLORS[level]} />
        <circle cx={cx} cy={cy} r={2} fill="#fff" opacity={0.8} />

        {/* Center label */}
        <text x={cx} y={cy + 16} textAnchor="middle" fill={LEVEL_COLORS[level]} fontSize={10} fontWeight="bold">
          {LEVEL_LABELS[level]}
        </text>
        <text x={cx} y={cy + 26} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={6}>
          {currentFlux.toExponential(1)} W/m²
        </text>
      </svg>
    </div>
  )
}

// Utility: describe an SVG arc path
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy - r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy - r * Math.sin(endAngle)
  const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0
  // SVG arcs go clockwise when sweep=1; we want clockwise from start to end
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`
}
