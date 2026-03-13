'use client'

const PLANETS = [
  { name: 'Mercury', size: 4, color: '#a0a0a0', orbit: 22 },
  { name: 'Venus', size: 6, color: '#e8c060', orbit: 32 },
  { name: 'Earth', size: 6, color: '#4a90e2', orbit: 42 },
  { name: 'Mars', size: 5, color: '#d4553a', orbit: 52 },
  { name: 'Jupiter', size: 10, color: '#c8a050', orbit: 66 },
  { name: 'Saturn', size: 9, color: '#d4af37', orbit: 80 },
]

export function SolarSystemWidget() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#050810] overflow-hidden">
      {/* Central star */}
      <div className="absolute w-5 h-5 rounded-full bg-[#ffd700]" style={{ boxShadow: '0 0 20px rgba(255,215,0,0.4)' }} />

      {/* Orbits and planets */}
      {PLANETS.map((p) => (
        <div key={p.name} className="absolute" style={{ width: p.orbit * 2, height: p.orbit * 2 }}>
          <div
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: 'rgba(74,144,226,0.08)' }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              top: 0,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 6px ${p.color}60`,
            }}
          />
        </div>
      ))}

      {/* Info pill */}
      <div className="absolute bottom-3 left-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(8,12,28,0.7)] backdrop-blur-sm border border-[rgba(245,158,11,0.2)]">
          <span className="text-[10px] font-bold text-[#f59e0b]">8</span>
          <span className="text-[8px] uppercase tracking-wider text-[#6070a0]">Planets + Earth Dive</span>
        </div>
      </div>
    </div>
  )
}
