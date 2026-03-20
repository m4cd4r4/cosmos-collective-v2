'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Satellite, Maximize2, X, ExternalLink } from 'lucide-react'

const WorldMapLeaflet = dynamic(
  () => import('@/components/ui/WorldMapLeaflet').then(mod => ({ default: mod.WorldMapLeaflet })),
  { ssr: false, loading: () => <div className="w-full h-[200px] rounded-lg bg-[rgba(10,20,40,0.4)] animate-pulse" /> }
)

interface ISSTrackerProps {
  issPosition: { lat: number; lon: number; alt: number } | null
  issVelocity: number | null
  issError: boolean
}

export function ISSTracker({ issPosition, issVelocity, issError }: ISSTrackerProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-[0.15em] text-[#4a5580] font-semibold flex items-center gap-2">
          <Satellite className="w-3.5 h-3.5 text-[#22c55e]" />
          ISS Tracker
        </h2>
        {issPosition && (
          <button
            onClick={() => setModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[#4a5580] hover:text-[#d4af37]"
            aria-label="Expand ISS tracker"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] overflow-hidden">
        {/* Map */}
        <div className="relative flex items-center justify-center p-3">
          {issPosition ? (
            <button
              onClick={() => setModalOpen(true)}
              className="w-full cursor-pointer rounded-lg hover:ring-1 hover:ring-[rgba(212,175,55,0.2)] transition-all"
            >
              <WorldMapLeaflet
                issPosition={issPosition}
                height={200}
                className="rounded-lg"
              />
            </button>
          ) : issError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#4a5580]">ISS tracking temporarily unavailable</p>
              <a
                href="https://spotthestation.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#d4af37] hover:underline mt-1 inline-block"
              >
                View on NASA Spot the Station →
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-5 h-5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#4a5580]">Acquiring signal...</p>
            </div>
          )}
        </div>

        {/* Stats row */}
        {issPosition && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[rgba(255,255,255,0.04)] border-t border-[rgba(255,255,255,0.06)]">
            <StatCell label="Latitude" value={`${issPosition.lat.toFixed(2)}°`} />
            <StatCell label="Longitude" value={`${issPosition.lon.toFixed(2)}°`} />
            <StatCell label="Altitude" value={`${issPosition.alt.toFixed(0)} km`} accent />
            <StatCell label="Speed" value={issVelocity ? `${issVelocity.toFixed(0)} km/h` : '~27,600 km/h'} accent />
          </div>
        )}
      </div>

      {/* Expanded Modal */}
      {modalOpen && issPosition && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-label="ISS Tracker expanded view"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setModalOpen(false) }}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          />
          <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0a0e1a]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                  <Satellite className="w-4 h-4 text-[#22c55e]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">International Space Station</h2>
                  <p className="text-xs text-[#4a5580]">Real-time orbital position · Updates every 30s</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-5 pb-3">
              <WorldMapLeaflet
                issPosition={issPosition}
                height={400}
                className="rounded-xl"
              />
            </div>

            <div className="px-6 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ModalStat label="Latitude" value={`${issPosition.lat.toFixed(4)}°`} />
              <ModalStat label="Longitude" value={`${issPosition.lon.toFixed(4)}°`} />
              <ModalStat label="Altitude" value={`${issPosition.alt.toFixed(0)} km`} accent />
              <ModalStat label="Speed" value={issVelocity ? `${issVelocity.toFixed(0)} km/h` : '~27,600 km/h'} accent />
            </div>

            <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-[#4a5580]">Orbits Earth every ~92 minutes · Crew of 7</p>
              <a
                href="https://spotthestation.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
              >
                NASA Spot the Station
                <ExternalLink className="w-3 h-3" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3 py-2.5 text-center bg-[rgba(255,255,255,0.02)]">
      <div className="text-[8px] uppercase tracking-[0.15em] text-[#4a5580] mb-0.5">{label}</div>
      <div className={`text-sm font-bold font-mono ${accent ? 'text-[#d4af37]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function ModalStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
      <div className="text-xs text-[#4a5580] mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${accent ? 'text-[#d4af37]' : 'text-white'}`}>{value}</div>
    </div>
  )
}
