'use client'

/**
 * Interactive SVG map of Australia with telescope markers
 * Shows 5 radio telescope locations with click-to-select interaction
 */

import type { AustralianTelescope } from '@/types'

// Simplified Australia outline path (Natural Earth)
// viewBox coordinates: lon 110-156, lat -10 to -45 (SVG y inverted)
const AUSTRALIA_PATH =
  'M22,22 L26,20 30,18 34,17 38,17 42,18 46,20 48,22 50,20 52,18 56,16 60,14 64,12 68,10 72,8 76,7 80,8 84,10 86,12 88,14 90,16 92,18 94,20 96,18 98,16 100,14 102,13 104,14 106,16 108,18 110,22 112,26 112,30 110,34 108,36 106,38 104,40 100,42 96,44 92,44 88,46 84,48 80,50 76,52 72,54 68,55 64,54 60,52 56,50 52,48 48,48 44,46 40,44 36,42 32,40 28,38 24,36 22,34 20,30 20,26 22,22Z'

// Tasmania
const TASMANIA_PATH = 'M88,56 L92,54 96,56 96,60 92,62 88,60 88,56Z'

const TELESCOPES: Record<string, { name: string; lat: number; lon: number; shortLabel: string }> = {
  askap: { name: 'ASKAP', lat: -26.697, lon: 116.631, shortLabel: 'ASKAP' },
  mwa: { name: 'MWA', lat: -26.703, lon: 116.671, shortLabel: 'MWA' },
  ska: { name: 'SKA-Low', lat: -26.82, lon: 116.764, shortLabel: 'SKA' },
  parkes: { name: 'Parkes', lat: -32.998, lon: 148.263, shortLabel: 'Parkes' },
  atca: { name: 'ATCA', lat: -30.313, lon: 149.550, shortLabel: 'ATCA' },
}

// Map real coordinates to SVG space
// viewBox 0,0 → 130,70 maps to lon 110-156, lat -8 to -46
function geoToSVG(lon: number, lat: number): { x: number; y: number } {
  return {
    x: ((lon - 110) / 46) * 130,
    y: ((-lat - 8) / 38) * 70,
  }
}

interface AustraliaMapSVGProps {
  selectedTelescope: AustralianTelescope
  onSelectTelescope: (key: AustralianTelescope) => void
  className?: string
}

export function AustraliaMapSVG({ selectedTelescope, onSelectTelescope, className }: AustraliaMapSVGProps) {
  // Murchison cluster center (ASKAP/MWA/SKA are within ~0.15 degrees)
  const murchison = geoToSVG(116.69, -26.74)
  const isMurchisonSelected = ['askap', 'mwa', 'ska'].includes(selectedTelescope)

  return (
    <svg
      viewBox="-5 -5 140 80"
      className={className}
      aria-label="Map of Australia showing radio telescope locations"
    >
      <defs>
        <radialGradient id="aus-glow">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Australia outline */}
      <path d={AUSTRALIA_PATH} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
      <path d={TASMANIA_PATH} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />

      {/* Murchison Radio-astronomy Observatory cluster circle */}
      <circle
        cx={murchison.x}
        cy={murchison.y}
        r={8}
        fill="none"
        stroke={isMurchisonSelected ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}
        strokeWidth={0.5}
        strokeDasharray="2,1.5"
      />
      <text
        x={murchison.x}
        y={murchison.y - 11}
        textAnchor="middle"
        fill={isMurchisonSelected ? '#d4af37' : 'rgba(255,255,255,0.3)'}
        fontSize={3.5}
        fontWeight={isMurchisonSelected ? 'bold' : 'normal'}
      >
        Murchison
      </text>

      {/* Telescope markers */}
      {Object.entries(TELESCOPES).map(([key, tel]) => {
        const pos = geoToSVG(tel.lon, tel.lat)
        const isSelected = selectedTelescope === key
        const isInCluster = ['askap', 'mwa', 'ska'].includes(key)

        // Offset cluster markers slightly so they don't overlap
        let offsetX = 0
        let offsetY = 0
        if (isInCluster) {
          if (key === 'askap') { offsetX = -3; offsetY = -1.5 }
          if (key === 'mwa') { offsetX = 3; offsetY = -1.5 }
          if (key === 'ska') { offsetX = 0; offsetY = 2.5 }
        }

        const cx = pos.x + offsetX
        const cy = pos.y + offsetY

        return (
          <g
            key={key}
            onClick={() => onSelectTelescope(key as AustralianTelescope)}
            className="cursor-pointer"
            role="button"
            aria-label={`Select ${tel.name}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectTelescope(key as AustralianTelescope)
              }
            }}
          >
            {/* Hit area */}
            <circle cx={cx} cy={cy} r={5} fill="transparent" />

            {/* Selection glow */}
            {isSelected && (
              <>
                <circle cx={cx} cy={cy} r={5} fill="url(#aus-glow)">
                  <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={cx} cy={cy} r={3} fill="none" stroke="#d4af37" strokeWidth={0.4} opacity={0.6}>
                  <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* Marker dot */}
            <circle
              cx={cx}
              cy={cy}
              r={isSelected ? 2 : 1.3}
              fill={isSelected ? '#d4af37' : 'rgba(255,255,255,0.5)'}
            />
            {isSelected && <circle cx={cx} cy={cy} r={0.8} fill="#fff" opacity={0.9} />}

            {/* Label */}
            <text
              x={cx}
              y={cy + (isInCluster && key === 'ska' ? 5.5 : isInCluster ? -4 : isSelected ? -5 : -4)}
              textAnchor="middle"
              fill={isSelected ? '#d4af37' : 'rgba(255,255,255,0.4)'}
              fontSize={isSelected ? 3.2 : 2.8}
              fontWeight={isSelected ? 'bold' : 'normal'}
            >
              {tel.shortLabel}
            </text>
          </g>
        )
      })}

      {/* Region labels */}
      <text x={20} y={35} fill="rgba(255,255,255,0.12)" fontSize={3} fontStyle="italic">WA</text>
      <text x={85} y={25} fill="rgba(255,255,255,0.12)" fontSize={3} fontStyle="italic">NSW</text>
    </svg>
  )
}
