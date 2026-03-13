'use client'

const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: Math.sin(i * 2.39996) * 45 + 50,
  y: Math.cos(i * 1.61803) * 40 + 50,
  size: (i % 5 === 0) ? 2 : 1,
  opacity: 0.3 + (i % 3) * 0.25,
}))

export function SkyMapWidget() {
  return (
    <div className="absolute inset-0 bg-[#050810] overflow-hidden">
      {/* Coordinate grid */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[20, 40, 60, 80].map(v => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(139,92,246,0.08)" strokeWidth="0.3" />
            <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(139,92,246,0.08)" strokeWidth="0.3" />
          </g>
        ))}
        {/* Stars */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.size * 0.5} fill="white" opacity={s.opacity} />
        ))}
        {/* Constellation line */}
        <polyline points="30,25 35,30 42,28 48,35 55,32" stroke="rgba(139,92,246,0.2)" strokeWidth="0.4" fill="none" />
      </svg>

      {/* Info pill */}
      <div className="absolute bottom-3 left-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(8,12,28,0.7)] backdrop-blur-sm border border-[rgba(139,92,246,0.2)]">
          <span className="text-[10px] font-bold text-[#8b5cf6]">360</span>
          <span className="text-[8px] uppercase tracking-wider text-[#6070a0]">All-sky view</span>
        </div>
      </div>

      {/* Mode label */}
      <div className="absolute top-2.5 right-3">
        <span className="text-[9px] font-mono tracking-wider text-white/40">Multi-wavelength</span>
      </div>
    </div>
  )
}
