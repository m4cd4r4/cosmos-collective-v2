'use client'

/**
 * NEO (Near-Earth Object) Approach Diagram
 * SVG visualization showing Earth, Moon orbit, and asteroid approach distances
 */

import { useState } from 'react'
import type { AstronomicalEvent } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MOON_DISTANCE_KM = 384400
const SVG_CENTER = 150
const MOON_ORBIT_R = 50
const MAX_DISPLAY_R = 130

interface NeoApproachDiagramProps {
  events: AstronomicalEvent[]
  className?: string
}

function parseDistanceLD(description: string): number | null {
  // Try to extract lunar distances from description like "0.5 LD" or "2.3 lunar distances"
  const ldMatch = description.match(/([\d.]+)\s*(?:LD|lunar\s*dist)/i)
  if (ldMatch) return parseFloat(ldMatch[1])

  // Try km: "500,000 km" → convert to LD
  const kmMatch = description.match(/([\d,.]+)\s*km/i)
  if (kmMatch) {
    const km = parseFloat(kmMatch[1].replace(/,/g, ''))
    return km / MOON_DISTANCE_KM
  }

  return null
}

export function NeoApproachDiagram({ events, className }: NeoApproachDiagramProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const neoEvents = events.filter((e) => e.type === 'asteroid')
  if (neoEvents.length === 0) return null

  const selected = neoEvents[selectedIndex]
  const distLD = parseDistanceLD(selected.description)

  const prev = () => setSelectedIndex((i) => (i - 1 + neoEvents.length) % neoEvents.length)
  const next = () => setSelectedIndex((i) => (i + 1) % neoEvents.length)

  // Map LD to SVG radius (log scale for extreme distances)
  const ldToR = (ld: number) => {
    const clamped = Math.max(0.1, Math.min(ld, 20))
    return MOON_ORBIT_R + (Math.log(clamped + 1) / Math.log(21)) * (MAX_DISPLAY_R - MOON_ORBIT_R)
  }

  const neoR = distLD ? ldToR(distLD) : MAX_DISPLAY_R * 0.7
  // Random-ish angle based on event id hash
  const angle = (selected.id.charCodeAt(0) * 137.5) % 360
  const rad = (angle * Math.PI) / 180
  const neoX = SVG_CENTER + neoR * Math.cos(rad)
  const neoY = SVG_CENTER + neoR * Math.sin(rad)

  const isHazardous = selected.severity === 'significant' || selected.severity === 'rare' || selected.severity === 'once-in-lifetime'

  return (
    <div className={className}>
      <svg viewBox="0 0 300 300" className="w-full h-auto" aria-label="Near Earth Object approach diagram">
        <defs>
          <radialGradient id="earth-gradient">
            <stop offset="0%" stopColor="#4f8fff" />
            <stop offset="100%" stopColor="#1a3a7a" />
          </radialGradient>
          <radialGradient id="neo-glow-safe">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="neo-glow-hazard">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Distance rings */}
        {[1, 5, 10].map((ld) => (
          <circle
            key={ld}
            cx={SVG_CENTER}
            cy={SVG_CENTER}
            r={ldToR(ld)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
        ))}
        <text x={SVG_CENTER + ldToR(1) + 2} y={SVG_CENTER - 3} fill="rgba(255,255,255,0.2)" fontSize={7}>1 LD</text>
        <text x={SVG_CENTER + ldToR(5) + 2} y={SVG_CENTER - 3} fill="rgba(255,255,255,0.15)" fontSize={6}>5 LD</text>

        {/* Moon orbit */}
        <circle
          cx={SVG_CENTER}
          cy={SVG_CENTER}
          r={MOON_ORBIT_R}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={0.5}
          strokeDasharray="4,3"
        />
        {/* Moon */}
        <circle cx={SVG_CENTER + MOON_ORBIT_R} cy={SVG_CENTER} r={3} fill="#c0c0c0" />
        <text x={SVG_CENTER + MOON_ORBIT_R + 6} y={SVG_CENTER + 3} fill="rgba(255,255,255,0.3)" fontSize={7}>Moon</text>

        {/* Earth */}
        <circle cx={SVG_CENTER} cy={SVG_CENTER} r={10} fill="url(#earth-gradient)" />
        <circle cx={SVG_CENTER} cy={SVG_CENTER} r={10} fill="none" stroke="rgba(100,180,255,0.3)" strokeWidth={0.5} />
        <text x={SVG_CENTER} y={SVG_CENTER + 18} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={7}>Earth</text>

        {/* Approach line */}
        <line
          x1={SVG_CENTER}
          y1={SVG_CENTER}
          x2={neoX}
          y2={neoY}
          stroke={isHazardous ? 'rgba(239,68,68,0.3)' : 'rgba(96,165,250,0.2)'}
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />

        {/* NEO marker */}
        <circle cx={neoX} cy={neoY} r={12} fill={isHazardous ? 'url(#neo-glow-hazard)' : 'url(#neo-glow-safe)'}>
          <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={neoX} cy={neoY} r={4} fill={isHazardous ? '#ef4444' : '#60a5fa'} />
        <circle cx={neoX} cy={neoY} r={1.5} fill="#fff" opacity={0.8} />

        {/* NEO label */}
        <text
          x={neoX}
          y={neoY - 10}
          textAnchor="middle"
          fill={isHazardous ? '#ef4444' : '#60a5fa'}
          fontSize={7}
          fontWeight="bold"
        >
          {selected.title.replace(/^Asteroid\s+/i, '').slice(0, 20)}
        </text>
        {distLD && (
          <text
            x={neoX}
            y={neoY + 14}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize={6}
          >
            {distLD.toFixed(1)} LD
          </text>
        )}
      </svg>

      {/* Navigation */}
      {neoEvents.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-2">
          <button onClick={prev} className="p-1 text-gray-500 hover:text-white transition-colors" aria-label="Previous asteroid">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 tabular-nums">
            {selectedIndex + 1} / {neoEvents.length}
          </span>
          <button onClick={next} className="p-1 text-gray-500 hover:text-white transition-colors" aria-label="Next asteroid">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
