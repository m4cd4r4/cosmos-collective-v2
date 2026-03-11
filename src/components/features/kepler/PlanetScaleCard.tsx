'use client'

import type { Planet } from './types'
import { PLANET_COLORS } from './utils'

interface Props {
  planet: Planet
  starName: string
}

const EARTH_R = 24 // px baseline radius for Earth circle

function categoryLabel(rade: number | null): { label: string; detail: string } {
  if (!rade) return { label: 'Unknown', detail: '' }
  if (rade <= 1.25) return { label: 'Earth-size', detail: 'likely rocky' }
  if (rade <= 2.0)  return { label: 'Super-Earth', detail: 'rocky or water world' }
  if (rade <= 6.0)  return { label: 'Neptune-size', detail: 'thick atmosphere' }
  return { label: 'Jupiter-size', detail: `~${Math.round(rade ** 3)} × Earth's volume` }
}

export function PlanetScaleCard({ planet, starName }: Props) {
  const rade = planet.rade ?? 1
  // Clamp visual radius: show at least 4px, at most 80px
  const planetR = Math.max(4, Math.min(80, EARTH_R * rade))
  const { label, detail } = categoryLabel(planet.rade)
  const dotColor = PLANET_COLORS[planet.cat]

  // Container height: enough for the larger circle + labels
  const maxR = Math.max(EARTH_R, planetR)
  const svgH = maxR * 2 + 28

  return (
    <div className="bg-white/[0.02] rounded-lg border border-[rgba(74,144,226,0.12)] p-3">
      <div className="text-[9px] uppercase tracking-[0.18em] text-[#4a5580] mb-2">Scale vs Earth</div>

      <div className="flex items-end justify-center gap-6" style={{ height: svgH + 8 }}>
        {/* Earth */}
        <div className="flex flex-col items-center gap-1">
          <svg width={EARTH_R * 2 + 4} height={svgH} viewBox={`0 0 ${EARTH_R * 2 + 4} ${svgH}`}>
            <circle
              cx={EARTH_R + 2}
              cy={svgH - EARTH_R - 14}
              r={EARTH_R}
              fill="#4488cc"
              opacity={0.85}
            />
            <circle
              cx={EARTH_R + 2}
              cy={svgH - EARTH_R - 14}
              r={EARTH_R}
              fill="none"
              stroke="rgba(68,136,204,0.4)"
              strokeWidth="1"
            />
          </svg>
          <div className="text-[10px] text-[#8090b0] text-center -mt-1">Earth</div>
          <div className="text-[9px] text-[#4a5580]">1.0 R⊕</div>
        </div>

        {/* Planet */}
        <div className="flex flex-col items-center gap-1">
          <svg width={Math.max(planetR * 2 + 4, 20)} height={svgH} viewBox={`0 0 ${Math.max(planetR * 2 + 4, 20)} ${svgH}`}>
            <defs>
              <radialGradient id={`grad-${planet.name.replace(/\s/g, '')}`} cx="35%" cy="30%">
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor={dotColor} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle
              cx={Math.max(planetR + 2, 12)}
              cy={svgH - planetR - 14}
              r={planetR}
              fill={dotColor}
              opacity={0.9}
            />
            <circle
              cx={Math.max(planetR + 2, 12)}
              cy={svgH - planetR - 14}
              r={planetR}
              fill={`url(#grad-${planet.name.replace(/\s/g, '')})`}
            />
            <circle
              cx={Math.max(planetR + 2, 12)}
              cy={svgH - planetR - 14}
              r={planetR}
              fill="none"
              stroke={dotColor}
              strokeWidth="0.8"
              opacity="0.5"
            />
          </svg>
          <div className="text-[10px] font-bold text-[#e0e8ff] text-center -mt-1 max-w-[80px] truncate">{planet.name}</div>
          <div className="text-[9px] text-[#4a5580]">{rade.toFixed(2)} R⊕</div>
        </div>
      </div>

      {/* Category badge */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded"
          style={{ background: `${dotColor}22`, color: dotColor, border: `1px solid ${dotColor}44` }}
        >
          {label}
        </span>
        {detail && <span className="text-[10px] text-[#6a7890]">{detail}</span>}
        {planet.hz && (
          <span className="text-[10px] text-[#7fbf7f] flex items-center gap-0.5">
            ★ habitable zone
          </span>
        )}
      </div>

      {/* Extra context */}
      {planet.rade && planet.rade > 6 && (
        <p className="text-[10px] text-[#4a5580] mt-1.5 leading-relaxed">
          Gas giant — about {Math.round(planet.rade ** 3)}× Earth&apos;s volume.
        </p>
      )}
      {planet.eqt && (
        <div className="flex justify-between text-[10px] mt-1.5 border-t border-[rgba(74,144,226,0.06)] pt-1.5">
          <span className="text-[#4a5580]">Eq. temperature</span>
          <span style={{ color: planet.eqt > 800 ? '#ff7744' : planet.eqt < 200 ? '#aaddff' : '#88cc88' }}>
            {Math.round(planet.eqt)} K
          </span>
        </div>
      )}
    </div>
  )
}
