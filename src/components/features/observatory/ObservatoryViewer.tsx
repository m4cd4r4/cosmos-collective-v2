'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import type { PlottedObservation, ObservatoryViewMode, ObservatoryFilters } from './types'
import { wavelengthToColor, formatDistance, CATEGORY_ORDER } from './utils'
import { ObservatoryCanvas } from './ObservatoryCanvas'
import { useObservatoryData } from './useObservatoryData'

// ── Default filters ──────────────────────────────────────────────────────

const DEFAULT_FILTERS: ObservatoryFilters = {
  search: '',
  telescope: 'all',
  category: 'all',
  wavelength: 'all',
  distanceMax: 1_000_000_000,
}

// ── Main component ───────────────────────────────────────────────────────

export function ObservatoryViewer({ preview = false }: { preview?: boolean }) {
  const { observations, stats } = useObservatoryData()
  const [viewMode, setViewMode] = useState<ObservatoryViewMode>('sky')
  const [filters, setFilters] = useState<ObservatoryFilters>(DEFAULT_FILTERS)
  const [hovered, setHovered] = useState<PlottedObservation | null>(null)
  const [selected, setSelected] = useState<PlottedObservation | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)

  // Filtered observations
  const filtered = useMemo(() => {
    const f = filters
    return observations.filter(obs => {
      if (f.telescope !== 'all' && obs.source !== f.telescope) return false
      if (f.category !== 'all' && obs.category !== f.category) return false
      if (f.wavelength !== 'all' && obs.wavelengthBand !== f.wavelength) return false
      if (obs.distanceLightYears != null && obs.distanceLightYears > f.distanceMax) return false
      if (f.search) {
        const q = f.search.toLowerCase()
        if (
          !obs.targetName.toLowerCase().includes(q) &&
          !obs.aliases?.some(a => a.toLowerCase().includes(q))
        ) return false
      }
      return true
    })
  }, [observations, filters])

  const setFilter = useCallback(
    <K extends keyof ObservatoryFilters>(key: K, value: ObservatoryFilters[K]) =>
      setFilters(prev => ({ ...prev, [key]: value })),
    [],
  )

  const handleHover = useCallback(
    (obs: PlottedObservation | null, e?: React.MouseEvent) => {
      setHovered(obs)
      if (obs && e) setTooltip({ x: e.clientX, y: e.clientY })
      else setTooltip(null)
    },
    [],
  )

  const handleSelect = useCallback(
    (obs: PlottedObservation | null) => {
      if (!preview) setSelected(obs)
    },
    [preview],
  )

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] text-[#c8d4f0] font-mono text-xs select-none overflow-hidden">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 h-[52px] bg-[rgba(4,6,18,0.97)] border-b border-[rgba(74,144,226,0.15)] shrink-0 z-20">
        <div className="flex items-center gap-3.5">
          <TelescopeLogo />
          <span className="text-sm font-bold tracking-[0.2em] uppercase text-[#e0e8ff]">
            Deep Space Observatory
          </span>
          <Badge gold>JWST</Badge>
          <Badge>Hubble</Badge>
        </div>
        <span className="text-[9px] text-[#4a5580] tracking-wider">
          Data: NASA / STScI · {stats.total} observations
        </span>
      </header>

      {/* ── STATS BAR ───────────────────────────────────────────────── */}
      {!preview && (
        <div className="flex bg-[rgba(8,12,28,0.9)] border-b border-[rgba(74,144,226,0.15)] shrink-0">
          <Stat label="Total Observations" value={stats.total} color="gold" />
          <Stat label="JWST" value={stats.jwst} color="amber" />
          <Stat label="Hubble" value={stats.hubble} color="purple" />
          <Stat label="Nebulae" value={stats.nebulae} color="blue" />
          <Stat label="Galaxies" value={stats.galaxies} color="cyan" />
          <Stat label="Showing" value={`${filtered.length} / ${stats.total}`} color="dim" />
        </div>
      )}

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <div className={`flex-1 min-h-0 ${preview ? '' : 'grid grid-cols-[210px_1fr_290px]'}`}>

        {/* SIDEBAR */}
        {!preview && (
          <aside className="bg-[rgba(13,18,35,0.92)] border-r border-[rgba(74,144,226,0.15)] p-3 overflow-y-auto flex flex-col gap-[18px]">

            <FilterGroup title="Search">
              <input
                className="w-full bg-white/[0.03] border border-[rgba(74,144,226,0.15)] rounded px-2 py-1 text-[#c8d4f0] text-[10px] font-mono outline-none focus:border-[#4a90e2] transition-colors"
                placeholder="Name or alias..."
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
              />
            </FilterGroup>

            <FilterGroup title="View Mode">
              <div className="flex border border-[rgba(74,144,226,0.15)] rounded overflow-hidden">
                {(['sky', 'distance', 'timeline'] as ObservatoryViewMode[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={`flex-1 py-1 text-[8px] uppercase tracking-wider transition-colors border-none ${
                      viewMode === v
                        ? 'bg-[rgba(74,144,226,0.18)] text-[#a0c8ff]'
                        : 'bg-transparent text-[#4a5580] hover:text-[#4a90e2]'
                    } ${v !== 'timeline' ? 'border-r border-[rgba(74,144,226,0.15)]' : ''}`}
                  >
                    {v === 'sky' ? 'Sky Map' : v === 'distance' ? 'Distance' : 'Timeline'}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Telescope">
              <ChipGroup
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'JWST', label: 'JWST', style: { color: '#d4af37' } },
                  { value: 'Hubble', label: 'Hubble', style: { color: '#b088f9' } },
                ]}
                active={filters.telescope}
                onChange={v => setFilter('telescope', v as ObservatoryFilters['telescope'])}
              />
            </FilterGroup>

            <FilterGroup title="Category">
              <ChipGroup
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'nebula', label: 'Nebulae' },
                  { value: 'galaxy', label: 'Galaxies' },
                  { value: 'deep-field', label: 'Deep Fields' },
                  { value: 'solar-system', label: 'Planets' },
                  { value: 'supernova', label: 'Supernovae' },
                  { value: 'star-cluster', label: 'Clusters' },
                ]}
                active={filters.category}
                onChange={v => setFilter('category', v as ObservatoryFilters['category'])}
              />
            </FilterGroup>

            <FilterGroup title="Wavelength">
              <ChipGroup
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'infrared', label: 'Infrared', style: { color: '#d4af37' } },
                  { value: 'optical', label: 'Optical', style: { color: '#b088f9' } },
                ]}
                active={filters.wavelength}
                onChange={v => setFilter('wavelength', v as ObservatoryFilters['wavelength'])}
              />
            </FilterGroup>

            <FilterGroup title="Max Distance">
              <input
                type="range"
                min={2}
                max={9}
                step={0.1}
                value={Math.log10(Math.max(100, filters.distanceMax))}
                className="w-full accent-[#4a90e2]"
                onChange={e => setFilter('distanceMax', Math.pow(10, +e.target.value))}
              />
              <div className="flex justify-between text-[8px] text-[#4a5580] mt-0.5">
                <span>100 ly</span>
                <span>≤ {formatDistance(filters.distanceMax)}</span>
              </div>
            </FilterGroup>

            <FilterGroup title="Wavelength Color">
              {[
                { c: '#d4af37', label: 'Infrared (JWST primary)' },
                { c: '#b088f9', label: 'Optical (visible light)' },
                { c: '#4af0e2', label: 'Radio' },
              ].map(({ c, label }) => (
                <div key={c} className="flex items-center gap-2 text-[9px] text-[#4a5580]">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c, boxShadow: `0 0 5px ${c}` }} />
                  <span>{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-[9px] text-[#4a5580] mt-1">
                <div className="w-2 h-2 rounded-full shrink-0 border border-dashed border-white/30" />
                <span>Featured observation</span>
              </div>
            </FilterGroup>

          </aside>
        )}

        {/* CANVAS */}
        <div className="relative overflow-hidden bg-[#050810]">
          <ObservatoryCanvas
            observations={observations}
            filtered={filtered}
            viewMode={viewMode}
            hoveredObs={hovered}
            selectedObs={selected}
            onHover={handleHover}
            onSelect={handleSelect}
          />

          {/* Hover Tooltip */}
          {hovered && tooltip && (
            <div
              className="absolute pointer-events-none z-50 bg-[rgba(4,7,25,0.95)] border border-[rgba(74,144,226,0.3)] rounded-lg px-3 py-2.5 text-[10px] leading-[1.7] max-w-[220px] backdrop-blur-lg"
              style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
            >
              <div className="text-[11px] font-bold text-[#e0e8ff] mb-1">{hovered.targetName}</div>
              <div className="flex justify-between gap-3">
                <span className="text-[#4a5580]">Telescope</span>
                <span style={{ color: hovered.source === 'JWST' ? '#d4af37' : '#b088f9' }}>
                  {hovered.source}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#4a5580]">Wavelength</span>
                <span style={{ color: wavelengthToColor(hovered.wavelengthBand) }}>
                  {hovered.wavelengthBand}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#4a5580]">Distance</span>
                <span>{formatDistance(hovered.distanceLightYears)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#4a5580]">Category</span>
                <span>{hovered.category}</span>
              </div>
            </div>
          )}
        </div>

        {/* DETAIL PANEL */}
        {!preview && (
          <aside className="bg-[rgba(13,18,35,0.92)] border-l border-[rgba(74,144,226,0.15)] p-3.5 overflow-y-auto flex flex-col gap-3.5">
            {!selected ? <EmptyDetail /> : <ObservationDetail obs={selected} />}
          </aside>
        )}

      </div>

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite">
        {selected
          ? `Selected: ${selected.targetName}, observed by ${selected.source}`
          : `Deep Space Observatory showing ${filtered.length} observations in ${viewMode} view`
        }
      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────

function TelescopeLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
      <circle cx="15" cy="15" r="12" stroke="#d4af37" strokeWidth="0.8" fill="none" opacity="0.3" />
      <circle cx="15" cy="15" r="7" stroke="#4a90e2" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="15" cy="15" r="2.5" fill="#d4af37" opacity="0.9" />
      <line x1="15" y1="2" x2="15" y2="6" stroke="#4a90e2" strokeWidth="0.8" opacity="0.5" />
      <line x1="15" y1="24" x2="15" y2="28" stroke="#4a90e2" strokeWidth="0.8" opacity="0.5" />
      <line x1="2" y1="15" x2="6" y2="15" stroke="#4a90e2" strokeWidth="0.8" opacity="0.5" />
      <line x1="24" y1="15" x2="28" y2="15" stroke="#4a90e2" strokeWidth="0.8" opacity="0.5" />
      <circle cx="22" cy="9" r="1.2" fill="#b088f9" opacity="0.7" />
      <circle cx="8" cy="21" r="0.9" fill="#d4af37" opacity="0.6" />
    </svg>
  )
}

function Badge({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded border tracking-[0.12em] uppercase ${
      gold
        ? 'bg-[rgba(212,175,55,0.1)] border-[rgba(212,175,55,0.25)] text-[#d4af37]'
        : 'bg-[rgba(176,136,249,0.1)] border-[rgba(176,136,249,0.25)] text-[#b088f9]'
    }`}>
      {children}
    </span>
  )
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    gold: '#d4af37', amber: '#f59e0b', purple: '#b088f9',
    blue: '#7fbfff', cyan: '#4af0e2', dim: '#4a5580',
  }
  return (
    <div className="flex-1 px-3.5 py-[7px] border-r border-[rgba(74,144,226,0.15)] last:border-r-0 flex flex-col gap-0.5">
      <div className="text-[8px] uppercase tracking-[0.14em] text-[#4a5580]">{label}</div>
      <div
        className={`font-bold ${color === 'dim' ? 'text-[13px]' : 'text-base'}`}
        style={{ color: colorMap[color] }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[8px] uppercase tracking-[0.18em] text-[#4a5580] pb-1.5 border-b border-[rgba(74,144,226,0.12)]">
        {title}
      </div>
      {children}
    </div>
  )
}

function ChipGroup({
  options, active, onChange,
}: {
  options: Array<{ value: string; label: string; style?: React.CSSProperties }>
  active: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={o.style}
          className={`text-[9px] px-2.5 py-1 rounded-full border transition-all font-mono ${
            active === o.value
              ? 'bg-[rgba(74,144,226,0.18)] border-[#4a90e2] text-[#a0c8ff]'
              : 'bg-transparent border-[rgba(74,144,226,0.15)] text-[#4a5580] hover:border-[#4a90e2] hover:text-[#4a90e2]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function EmptyDetail() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[#4a5580] text-center gap-3">
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
        <circle cx="26" cy="26" r="20" stroke="rgba(74,144,226,0.15)" strokeWidth="1" />
        <circle cx="26" cy="26" r="12" stroke="rgba(212,175,55,0.15)" strokeWidth="0.8" />
        <circle cx="26" cy="26" r="4" fill="rgba(212,175,55,0.2)" />
        <circle cx="38" cy="18" r="2" fill="rgba(176,136,249,0.2)" />
        <circle cx="16" cy="34" r="1.5" fill="rgba(212,175,55,0.15)" />
        <circle cx="34" cy="36" r="1.8" fill="rgba(74,144,226,0.15)" />
      </svg>
      <p className="text-[10px] leading-loose max-w-[175px]">
        Click any observation to explore its scientific analysis and imagery
      </p>
    </div>
  )
}

function ObservationDetail({ obs }: { obs: PlottedObservation }) {
  const bandColor = wavelengthToColor(obs.wavelengthBand)

  return (
    <>
      {/* Image */}
      <div
        className="rounded-lg overflow-hidden border"
        style={{ borderColor: `${bandColor}33` }}
      >
        <img
          src={obs.images.preview}
          alt={obs.targetName}
          className="w-full aspect-square object-cover"
          loading="lazy"
          onError={e => {
            (e.target as HTMLImageElement).src = '/images/cosmos-placeholder.svg'
          }}
        />
      </div>

      {/* Title */}
      <div>
        <div className="text-[15px] font-bold text-[#e8f0ff] tracking-[0.04em]">
          {obs.targetName}
        </div>
        {obs.aliases && obs.aliases.length > 0 && (
          <div className="text-[9px] text-[#4a5580] mt-0.5">
            {obs.aliases.join(' · ')}
          </div>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="text-[8px] px-1.5 py-0.5 rounded border"
            style={{
              color: obs.source === 'JWST' ? '#d4af37' : '#b088f9',
              borderColor: obs.source === 'JWST' ? 'rgba(212,175,55,0.3)' : 'rgba(176,136,249,0.3)',
              backgroundColor: obs.source === 'JWST' ? 'rgba(212,175,55,0.08)' : 'rgba(176,136,249,0.08)',
            }}
          >
            {obs.source}
          </span>
          {obs.instrument && (
            <span className="text-[8px] text-[#4a5580]">{obs.instrument}</span>
          )}
          <span
            className="text-[8px] px-1.5 py-0.5 rounded"
            style={{ color: bandColor, backgroundColor: `${bandColor}15` }}
          >
            {obs.wavelengthBand}
          </span>
        </div>
      </div>

      {/* Description */}
      {obs.description && (
        <p className="text-[10px] leading-relaxed text-[#8a96b8] italic">
          {obs.description}
        </p>
      )}

      {/* Scientific Context */}
      {obs.analysis && (
        <section>
          <SectionHeader>Scientific Context</SectionHeader>
          <p className="text-[10px] leading-relaxed text-[#8a96b8]">
            {obs.analysis.scientificContext}
          </p>
        </section>
      )}

      {/* Key Features */}
      {obs.analysis?.keyFeatures && obs.analysis.keyFeatures.length > 0 && (
        <section>
          <SectionHeader>Key Features</SectionHeader>
          <div className="flex flex-wrap gap-1.5">
            {obs.analysis.keyFeatures.map(f => (
              <span
                key={f}
                className="text-[8px] px-2 py-0.5 rounded-full border border-[rgba(74,144,226,0.2)] text-[#7a8aaa] bg-white/[0.02]"
              >
                {f}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Fun Facts */}
      {obs.analysis?.funFacts && obs.analysis.funFacts.length > 0 && (
        <section>
          <SectionHeader>Fun Facts</SectionHeader>
          <div className="flex flex-col gap-1.5">
            {obs.analysis.funFacts.map((fact, i) => (
              <div key={i} className="flex gap-2 text-[9px] text-[#7a8aaa]">
                <span className="text-[#d4af37] shrink-0">*</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Data */}
      <section>
        <SectionHeader>Observation Data</SectionHeader>
        {[
          { label: 'Distance', value: formatDistance(obs.distanceLightYears) },
          { label: 'Coordinates', value: `${obs.coordinates.ra.toFixed(2)}° RA, ${obs.coordinates.dec.toFixed(2)}° Dec`, small: true },
          { label: 'Constellation', value: obs.coordinates.constellation ?? '—' },
          { label: 'Observed', value: new Date(obs.observationDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }) },
          ...(obs.filters ? [{ label: 'Filters', value: obs.filters.join(', '), small: true }] : []),
        ].map(p => (
          <div key={p.label} className="flex justify-between items-center py-[5px] border-b border-white/[0.03] text-[10px]">
            <span className="text-[#4a5580]">{p.label}</span>
            <span className={`font-medium text-right ${p.small ? 'text-[9px]' : ''}`}>{p.value}</span>
          </div>
        ))}
      </section>

      {/* Link to full explore page */}
      <Link
        href={`/explore/${obs.id}`}
        className="flex items-center justify-center gap-2 mt-2 py-2 rounded border border-[rgba(74,144,226,0.25)] text-[10px] text-[#4a90e2] hover:bg-[rgba(74,144,226,0.08)] transition-colors"
      >
        View Full Detail
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[8px] uppercase tracking-[0.18em] text-[#4a5580] pb-1.5 border-b border-[rgba(74,144,226,0.1)] mb-2">
      {children}
    </div>
  )
}
