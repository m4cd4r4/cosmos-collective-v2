'use client'

import type { SpacecraftEntry } from '@/data/spacecraft-catalog'
import { STATUS_COLORS } from '@/data/spacecraft-catalog'

interface SpacecraftCardProps {
  entry: SpacecraftEntry
  onSelect: (entry: SpacecraftEntry) => void
}

export function SpacecraftCard({ entry, onSelect }: SpacecraftCardProps) {
  const statusColor = STATUS_COLORS[entry.status]
  const statusLabel = entry.status === 'under-construction' ? 'Building' : entry.status === 'active' ? 'Active' : 'Retired'

  return (
    <button
      onClick={() => onSelect(entry)}
      className="rounded-xl border border-cosmos-gold/[0.08] bg-[rgba(8,12,28,0.6)] hover:border-cosmos-gold/[0.25] transition-all duration-300 text-left group overflow-hidden w-full"
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-cosmos-depth">
        {entry.imageUrl.startsWith('http') ? (
          <img
            src={entry.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cosmos-depth to-cosmos-void flex items-center justify-center">
            <span className="text-2xl font-bold text-cosmos-gold/20">{entry.shortName}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,12,28,0.9)] via-[rgba(8,12,28,0.3)] to-transparent" />

        {/* Status badge */}
        <div
          className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm"
          style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}30` }}
        >
          {statusLabel}
        </div>

        {/* Agency badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[11px] text-white/70 font-medium">
          {entry.agency}
        </div>
      </div>

      {/* Text */}
      <div className="px-3.5 py-3 space-y-1.5">
        <h3 className="text-sm font-bold text-white group-hover:text-cosmos-gold transition-colors">
          {entry.name}
        </h3>
        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
          {entry.summary}
        </p>

        {/* Spec pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {entry.specs.slice(0, 3).map(spec => (
            <span
              key={spec.label}
              className="text-[10px] px-1.5 py-0.5 rounded bg-cosmos-gold/[0.08] text-cosmos-gold/80 border border-cosmos-gold/[0.12]"
            >
              {spec.value}
            </span>
          ))}
        </div>

        {/* Launch date */}
        {entry.launchDate && (
          <p className="text-[11px] text-gray-500 pt-0.5">
            Launched {new Date(entry.launchDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>
    </button>
  )
}
