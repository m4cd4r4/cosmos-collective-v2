'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X, ExternalLink, Calendar, MapPin, Radio } from 'lucide-react'
import type { SpacecraftEntry } from '@/data/spacecraft-catalog'
import { STATUS_COLORS } from '@/data/spacecraft-catalog'

interface SpacecraftDetailProps {
  entry: SpacecraftEntry | null
  onClose: () => void
}

export function SpacecraftDetail({ entry, onClose }: SpacecraftDetailProps) {
  if (!entry) return null

  const statusColor = STATUS_COLORS[entry.status]
  const statusLabel = entry.status === 'under-construction' ? 'Under Construction' : entry.status === 'active' ? 'Active' : 'Retired'

  return (
    <Dialog.Root open={!!entry} onOpenChange={open => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-cosmos-gold/[0.2] bg-cosmos-void shadow-2xl">

          {/* Hero image */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            {entry.imageUrl.startsWith('http') ? (
              <img src={entry.imageUrl} alt={entry.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cosmos-depth to-cosmos-void flex items-center justify-center">
                <span className="text-4xl font-bold text-cosmos-gold/20">{entry.shortName}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-cosmos-void via-cosmos-void/50 to-transparent" />

            {/* Close button */}
            <Dialog.Close asChild>
              <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </Dialog.Close>

            {/* Status + name overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                  style={{ background: `${statusColor}25`, color: statusColor, border: `1px solid ${statusColor}40` }}
                >
                  {statusLabel}
                </span>
                <span className="text-[11px] text-white/60">{entry.agency}</span>
              </div>
              <Dialog.Title className="text-xl sm:text-2xl font-display font-bold text-white">
                {entry.name}
              </Dialog.Title>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-5">
            {/* Summary */}
            <p className="text-sm text-gray-300 leading-relaxed">{entry.summary}</p>

            {/* Key info row */}
            <div className="flex flex-wrap gap-3">
              {entry.launchDate && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Calendar className="w-3 h-3 text-cosmos-gold" />
                  Launched {new Date(entry.launchDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
              {entry.orbitType && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <MapPin className="w-3 h-3 text-cosmos-gold" />
                  {entry.orbitType}
                </div>
              )}
              {entry.wavelengthRange && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Radio className="w-3 h-3 text-cosmos-gold" />
                  {entry.wavelengthRange}
                </div>
              )}
            </div>

            {/* Specs grid */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Specifications</h3>
              <div className="grid grid-cols-2 gap-2">
                {entry.specs.map(spec => (
                  <div key={spec.label} className="rounded-lg border border-cosmos-gold/[0.08] bg-cosmos-depth/50 px-3 py-2">
                    <span className="text-[11px] text-gray-500 block">{spec.label}</span>
                    <span className="text-sm text-white font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instruments */}
            {entry.instruments && entry.instruments.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Instruments</h3>
                <div className="flex flex-wrap gap-1.5">
                  {entry.instruments.map(inst => (
                    <span key={inst} className="text-[11px] px-2 py-1 rounded-md bg-cosmos-gold/[0.08] text-cosmos-gold/90 border border-cosmos-gold/[0.15]">
                      {inst}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {entry.highlights.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Key Highlights</h3>
                <ul className="space-y-1.5">
                  {entry.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="w-1 h-1 rounded-full bg-cosmos-gold mt-2 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* External links */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-cosmos-gold/[0.08]">
              {entry.externalLinks.map(link => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cosmos-gold/[0.15] text-[11px] text-cosmos-gold hover:bg-cosmos-gold/[0.08] transition-colors"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
