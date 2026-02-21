'use client'

/**
 * Inline SVG World Map with ISS position marker
 * Simplified continent outlines — no external map library needed
 */

// Simplified continent paths (Natural Earth simplified, equirectangular)
// Coordinates are lon,lat pairs mapped to viewBox 0,0 → 360,180
const CONTINENTS = [
  // North America
  'M45,28 L50,30 55,32 58,36 62,38 68,40 73,43 76,48 78,52 80,55 82,58 85,62 88,65 85,68 80,70 76,68 72,72 68,70 62,68 55,66 50,68 46,72 42,74 38,70 35,65 30,62 28,58 25,55 24,50 26,46 30,42 35,36 40,32 45,28Z',
  // South America
  'M72,72 L76,76 78,80 80,85 82,90 84,95 86,100 88,105 88,110 86,115 84,118 80,122 76,125 72,128 68,130 65,128 63,124 62,120 60,115 58,110 58,105 60,100 62,95 64,90 66,85 68,80 70,76 72,72Z',
  // Europe
  'M170,28 L175,30 180,32 185,34 190,36 195,35 198,38 195,42 192,45 188,48 184,50 180,48 176,45 173,42 170,38 168,34 170,28Z',
  // Africa
  'M170,58 L175,56 180,55 185,58 190,62 195,65 198,70 200,76 202,82 204,88 202,94 200,100 196,106 192,110 188,114 184,116 180,114 176,110 172,106 168,100 166,94 164,88 164,82 166,76 168,70 168,64 170,58Z',
  // Asia
  'M195,22 L205,20 215,22 225,20 235,22 245,24 255,28 262,32 268,36 272,40 278,42 285,45 290,48 295,52 298,56 300,60 296,64 290,66 284,68 278,66 272,62 268,58 262,56 258,60 252,62 248,58 242,55 236,52 230,50 226,48 222,52 218,56 214,58 210,56 206,52 202,48 198,44 196,40 195,36 194,30 195,22Z',
  // Australia
  'M270,100 L278,98 286,100 292,104 296,108 298,114 296,118 292,122 286,124 280,124 274,122 270,118 268,114 268,108 270,100Z',
  // Antarctica (simplified)
  'M20,165 L60,162 100,160 140,158 180,158 220,158 260,160 300,162 340,165 300,170 260,172 220,174 180,174 140,172 100,170 60,168 20,165Z',
]

interface WorldMapSVGProps {
  issPosition?: { lat: number; lon: number } | null
  width?: number
  height?: number
  className?: string
}

export function WorldMapSVG({ issPosition, width = 320, height = 160, className }: WorldMapSVGProps) {
  // Map lat/lon to SVG coordinates (equirectangular)
  const toSVG = (lon: number, lat: number) => ({
    x: ((lon + 180) / 360) * 360,
    y: ((90 - lat) / 180) * 180,
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
      {/* Grid lines */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((x) => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={180} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
      ))}
      {[30, 60, 90, 120, 150].map((y) => (
        <line key={`h${y}`} x1={0} y1={y} x2={360} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
      ))}
      {/* Equator */}
      <line x1={0} y1={90} x2={360} y2={90} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} strokeDasharray="4,4" />

      {/* Continents */}
      {CONTINENTS.map((d, i) => (
        <path key={i} d={d} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
      ))}

      {/* ISS marker */}
      {issPoint && (
        <g>
          {/* Glow */}
          <circle cx={issPoint.x} cy={issPoint.y} r={8} fill="rgba(212,175,55,0.15)">
            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Core dot */}
          <circle cx={issPoint.x} cy={issPoint.y} r={3} fill="#d4af37" />
          <circle cx={issPoint.x} cy={issPoint.y} r={1.5} fill="#fff" opacity={0.9} />
          {/* Label */}
          <text
            x={issPoint.x}
            y={issPoint.y - 8}
            textAnchor="middle"
            fill="#d4af37"
            fontSize={6}
            fontFamily="monospace"
            fontWeight="bold"
          >
            ISS
          </text>
        </g>
      )}
    </svg>
  )
}
