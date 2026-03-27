'use client'

const STAR_FIELD = Array.from({ length: 60 }, (_, i) => ({
  x: Math.sin(i * 3.14159 * 0.618) * 45 + 50,
  y: Math.cos(i * 2.71828 * 0.382) * 40 + 50,
  size: (i % 7 === 0) ? 2.5 : (i % 3 === 0) ? 1.5 : 0.8,
  color: i % 5 === 0 ? '#ffd700' : i % 3 === 0 ? '#ff8c00' : '#9bb8ff',
  opacity: 0.4 + (i % 4) * 0.15,
}))

export function KeplerWidget() {
  return (
    <div className="absolute inset-0 bg-[#050810] overflow-hidden">
      {/* Star field */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {STAR_FIELD.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.size * 0.4} fill={s.color} opacity={s.opacity} />
        ))}
        {/* Habitable zone indicator */}
        <circle cx="35" cy="40" r="4" fill="none" stroke="rgba(127,191,127,0.3)" strokeWidth="0.5" strokeDasharray="1,1" />
        <circle cx="70" cy="60" r="3" fill="none" stroke="rgba(127,191,127,0.3)" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>

      {/* Info pill */}
      <div className="absolute bottom-3 left-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(8,12,28,0.7)] backdrop-blur-sm border border-[rgba(74,144,226,0.2)]">
          <span className="text-[10px] font-bold text-[#4a90e2]">2,600+</span>
          <span className="text-[8px] uppercase tracking-wider text-[#6070a0]">Exoplanets</span>
        </div>
      </div>

      {/* Mode label */}
      <div className="absolute top-2.5 right-3">
        <span className="text-[11px] font-mono tracking-wider text-white/40">Cygnus Field</span>
      </div>
    </div>
  )
}
