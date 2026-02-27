'use client'

/**
 * Inline SVG World Map with ISS position marker
 * Equirectangular projection — viewBox maps to lon/lat space
 * x = lon + 180 (0–360), y = 90 - lat (0–180)
 */

// Simplified but geographically accurate continent outlines
const CONTINENTS = [
  // North America
  'M18,26 L28,28 40,32 50,40 54,44 58,52 64,60 72,66 82,72 90,70 94,76 98,80 98,66 100,58 106,52 112,48 120,45 127,43 120,36 112,28 100,28 92,30 86,22 72,20 52,22 34,25Z',
  // Greenland
  'M126,18 L132,17 138,20 140,26 137,30 131,30 127,24Z',
  // South America
  'M96,80 L108,80 118,82 130,86 138,90 144,96 144,102 140,110 132,120 122,130 112,140 106,144 102,140 98,132 97,122 96,112 98,102 100,96 98,88 96,82Z',
  // Europe (mainland)
  'M172,50 L178,46 184,42 190,38 196,36 200,38 198,44 194,48 188,50 182,50Z',
  // Scandinavia
  'M188,28 L193,22 197,28 193,34 189,32Z',
  // UK + Ireland
  'M176,36 L179,34 180,38 178,40Z',
  // Iberian Peninsula
  'M170,48 L174,52 173,56 169,54 169,50Z',
  // Italy
  'M188,48 L190,52 189,56 186,54 187,50Z',
  // Africa
  'M174,56 L184,54 196,56 206,60 216,68 224,78 228,84 224,94 218,106 208,118 200,124 194,120 190,112 186,100 180,90 170,82 164,76 168,68 172,60Z',
  // Madagascar
  'M225,104 L228,102 228,112 224,110Z',
  // Asia (main mass — Russia through SE Asia)
  'M200,38 L210,34 220,28 232,22 246,18 262,16 278,16 294,18 310,18 326,22 340,26 348,32 340,38 326,42 316,48 308,52 298,60 290,66 282,66 278,72 270,80 260,82 252,78 246,70 240,62 234,56 228,50 222,54 218,62 216,68 212,60 206,50 202,42Z',
  // India
  'M250,66 L256,72 258,82 264,74 268,68 264,62 256,62Z',
  // Arabian Peninsula
  'M218,62 L226,58 234,62 240,68 234,76 226,78 220,72Z',
  // Japan
  'M314,40 L318,36 320,42 318,48 314,46Z',
  // Indonesia archipelago
  'M274,88 L280,86 288,88 296,92 290,94 282,92Z',
  // Australia
  'M290,98 L300,96 310,100 316,106 314,114 308,120 298,124 290,122 284,116 282,110 284,104Z',
  // New Zealand
  'M324,118 L326,114 328,118 326,124Z',
]

interface WorldMapSVGProps {
  issPosition?: { lat: number; lon: number } | null
  width?: number
  height?: number
  className?: string
}

export function WorldMapSVG({ issPosition, width = 320, height = 160, className }: WorldMapSVGProps) {
  const toSVG = (lon: number, lat: number) => ({
    x: lon + 180,
    y: 90 - lat,
  })

  const issPoint = issPosition ? toSVG(issPosition.lon, issPosition.lat) : null

  return (
    <svg
      viewBox="0 0 360 180"
      width={width}
      height={height}
      className={className}
      aria-label={issPosition ? `World map showing ISS at ${issPosition.lat.toFixed(1)}°, ${issPosition.lon.toFixed(1)}°` : 'World map'}
    >
      {/* Ocean background */}
      <rect x={0} y={0} width={360} height={180} fill="rgba(10,20,40,0.4)" rx={4} />

      {/* Grid lines */}
      {[60, 120, 180, 240, 300].map((x) => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={180} stroke="rgba(74,144,226,0.06)" strokeWidth={0.4} />
      ))}
      {[45, 90, 135].map((y) => (
        <line key={`h${y}`} x1={0} y1={y} x2={360} y2={y} stroke="rgba(74,144,226,0.06)" strokeWidth={0.4} />
      ))}
      {/* Equator */}
      <line x1={0} y1={90} x2={360} y2={90} stroke="rgba(74,144,226,0.1)" strokeWidth={0.4} strokeDasharray="4,4" />
      {/* Prime Meridian */}
      <line x1={180} y1={0} x2={180} y2={180} stroke="rgba(74,144,226,0.08)" strokeWidth={0.4} strokeDasharray="4,4" />

      {/* Continents */}
      {CONTINENTS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="rgba(100,160,220,0.08)"
          stroke="rgba(100,160,220,0.2)"
          strokeWidth={0.5}
          strokeLinejoin="round"
        />
      ))}

      {/* ISS orbit track (approximate) */}
      {issPoint && (
        <line
          x1={0}
          y1={issPoint.y}
          x2={360}
          y2={issPoint.y}
          stroke="rgba(212,175,55,0.06)"
          strokeWidth={0.5}
          strokeDasharray="2,6"
        />
      )}

      {/* ISS marker */}
      {issPoint && (
        <g>
          {/* Outer pulse */}
          <circle cx={issPoint.x} cy={issPoint.y} r={8} fill="rgba(212,175,55,0.12)">
            <animate attributeName="r" values="6;12;6" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Inner glow */}
          <circle cx={issPoint.x} cy={issPoint.y} r={4} fill="rgba(212,175,55,0.25)" />
          {/* Core dot */}
          <circle cx={issPoint.x} cy={issPoint.y} r={2.5} fill="#d4af37" />
          <circle cx={issPoint.x} cy={issPoint.y} r={1.2} fill="#fff" opacity={0.9} />
          {/* Label */}
          <text
            x={issPoint.x}
            y={issPoint.y - 7}
            textAnchor="middle"
            fill="#d4af37"
            fontSize={5}
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="0.5"
          >
            ISS
          </text>
        </g>
      )}
    </svg>
  )
}
