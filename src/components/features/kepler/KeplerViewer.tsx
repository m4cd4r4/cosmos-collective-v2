'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { StarSystem, ViewMode, KeplerFilters, KeplerPlanetRow } from './types'
import { PLANET_COLORS, isInHZ, tempToColor, tempToSpectral } from './utils'
import { StarCanvas } from './StarCanvas'
import { KeplerSkyMap } from './KeplerSkyMap'

const ExoplanetSystemViewer = dynamic(
  () => import('./ExoplanetSystemViewer').then(m => ({ default: m.ExoplanetSystemViewer })),
  { ssr: false, loading: () => <div className="h-80 flex items-center justify-center text-cosmos-muted text-[11px]">Loading 3D viewer...</div> }
)
import type { KeplerSkyMapHandle } from './KeplerSkyMap'
import { useKeplerData } from './useKeplerData'

// ── Default filters ────────────────────────────────────────────────────────
const DEFAULT_FILTERS: KeplerFilters = {
  size: 'all',
  temp: 'all',
  multi: 'all',
  hz: 'all',
  periodMax: 730,
  yearMin: 2009,
  search: '',
}

// ── Main component ─────────────────────────────────────────────────────────
export function KeplerViewer() {
  const { planets, stars, status } = useKeplerData()
  const [viewMode, setViewMode]       = useState<ViewMode>('sky')
  const [filters,  setFilters]        = useState<KeplerFilters>(DEFAULT_FILTERS)
  const [hovered,   setHovered]        = useState<StarSystem | null>(null)
  const [selected,  setSelected]       = useState<StarSystem | null>(null)
  const [tooltip,   setTooltip]        = useState<{ x: number; y: number } | null>(null)
  const [mobileTab, setMobileTab]      = useState<'filters' | 'view'>('view')
  const skyMapRef = useRef<KeplerSkyMapHandle>(null)

  // ── Filtered stars ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const f = filters
    return stars.filter(s => {
      if (f.size !== 'all' && !s.planets.some(p => p.cat === f.size)) return false
      if (f.temp === 'cool'  && (s.teff == null || s.teff >= 5000)) return false
      if (f.temp === 'solar' && (s.teff == null || s.teff < 5000 || s.teff >= 6500)) return false
      if (f.temp === 'hot'   && (s.teff == null || s.teff < 6500)) return false
      if (f.multi === 'multi' && (s.pnum ?? s.planets.length) < 2) return false
      if (f.hz === 'hz' && !s.hasHZ) return false
      if (!s.planets.some(p => !p.period || p.period <= f.periodMax)) return false
      if (s.minYear > 0 && s.minYear < f.yearMin) return false
      if (f.search) {
        const q = f.search.toLowerCase()
        if (!s.name.toLowerCase().includes(q) && !s.planets.some(p => p.name.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [stars, filters])

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    planets:  planets.length,
    stars:    stars.length,
    multi:    stars.filter(s => (s.pnum ?? s.planets.length) >= 2).length,
    earth:    planets.filter((p: KeplerPlanetRow) => p.pl_rade != null && p.pl_rade <= 1.5 && p.pl_rade >= 0.5).length,
    hz:       planets.filter((p: KeplerPlanetRow) => isInHZ(p.pl_insol)).length,
    showing:  filtered.length,
  }), [planets, stars, filtered])

  const setFilter = useCallback(
    <K extends keyof KeplerFilters>(key: K, value: KeplerFilters[K]) =>
      setFilters(prev => ({ ...prev, [key]: value })),
    [],
  )

  const handleHover = useCallback(
    (star: StarSystem | null, e?: React.MouseEvent) => {
      setHovered(star)
      if (star && e) setTooltip({ x: e.clientX, y: e.clientY })
      else setTooltip(null)
    },
    [],
  )

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] text-[#c8d4f0] font-mono text-sm select-none overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 h-[52px] bg-[rgba(4,6,18,0.97)] border-b border-[rgba(74,144,226,0.15)] shrink-0 z-20">
        <div className="flex items-center gap-3.5">
          <KeplerLogo />
          <span className="hidden sm:inline text-base font-bold tracking-[0.2em] uppercase text-[#e0e8ff]">Kepler Mission</span>
          <span className="sm:hidden text-base font-bold tracking-[0.2em] uppercase text-[#e0e8ff]">Kepler</span>
          <span className="hidden sm:inline"><Badge>NASA · 2009–2018</Badge></span>
          <span className="hidden sm:inline"><Badge gold>Cygnus Field</Badge></span>
        </div>
        <span className="text-[11px] text-cosmos-muted tracking-wider">Data: NASA Exoplanet Archive · TAP API</span>
      </header>

      {/* ── STATS BAR ──────────────────────────────────────────────────── */}
      <div className="flex overflow-x-auto bg-[rgba(8,12,28,0.9)] border-b border-[rgba(74,144,226,0.15)] shrink-0">
        <Stat label="Confirmed Planets"       value={stats.planets}  color="gold"   loading={status === 'loading'} />
        <Stat label="Host Stars"              value={stats.stars}    color="blue"   loading={status === 'loading'} />
        <Stat label="Multi-Planet Systems"    value={stats.multi}    color="orange" loading={status === 'loading'} />
        <Stat label="Earth-Sized (≤1.5 R⊕)"  value={stats.earth}    color="green"  loading={status === 'loading'} />
        <Stat label="In Habitable Zone"       value={stats.hz}       color="sky"    loading={status === 'loading'} />
        <Stat label="Showing"                 value={`${stats.showing} / ${stats.stars}`} color="dim" loading={status === 'loading'} />
      </div>

      {/* ── MOBILE TAB BAR ─────────────────────────────────────────────── */}
      <div className="flex lg:hidden bg-[rgba(4,6,18,0.97)] border-b border-[rgba(74,144,226,0.15)] shrink-0">
        <button
          onClick={() => setMobileTab('view')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors border-b-2 ${mobileTab === 'view' ? 'text-[#4a90e2] border-[#4a90e2]' : 'text-cosmos-muted border-transparent'}`}
        >
          Star Map
        </button>
        <button
          onClick={() => setMobileTab('filters')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors border-b-2 ${mobileTab === 'filters' ? 'text-[#4a90e2] border-[#4a90e2]' : 'text-cosmos-muted border-transparent'}`}
        >
          Filters · Details
        </button>
      </div>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[230px_1fr_310px] min-h-0">

        {/* SIDEBAR */}
        <aside className={`bg-[rgba(13,18,35,0.92)] border-r border-[rgba(74,144,226,0.15)] p-3 overflow-y-auto flex-col gap-[18px] ${mobileTab === 'filters' ? 'flex' : 'hidden lg:flex'}`}>

          <FilterGroup title="Search">
            <input
              className="w-full bg-white/[0.03] border border-[rgba(74,144,226,0.15)] rounded px-2.5 py-1.5 text-[#c8d4f0] text-xs font-mono outline-none focus:border-[#4a90e2] transition-colors"
              placeholder="Planet or star name…"
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup title="View Mode">
            <div className="flex flex-wrap gap-1">
              {(['sky', 'galaxy', 'hr', 'aladin'] as ViewMode[]).map(v => {
                const viewLabels: Record<string, { label: string; title?: string }> = {
                  sky: { label: 'Sky' },
                  galaxy: { label: 'Galaxy' },
                  hr: { label: 'HR Diagram', title: 'Hertzsprung-Russell Diagram - plots star brightness vs temperature' },
                  aladin: { label: 'Sky Map', title: 'Interactive sky atlas powered by CDS Aladin Lite' },
                }
                const { label, title } = viewLabels[v] ?? { label: v }
                return (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    title={title}
                    className={`flex-1 min-w-[48%] py-1.5 text-xs uppercase tracking-wider transition-colors rounded border ${
                      viewMode === v
                        ? v === 'aladin'
                          ? 'bg-[rgba(212,175,55,0.18)] text-[#d4af37] border-[rgba(212,175,55,0.3)]'
                          : 'bg-[rgba(74,144,226,0.18)] text-[#a0c8ff] border-[rgba(74,144,226,0.3)]'
                        : 'bg-transparent text-cosmos-muted border-[rgba(74,144,226,0.15)] hover:text-[#4a90e2] hover:border-[rgba(74,144,226,0.3)]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </FilterGroup>

          <FilterGroup title="Planet Size">
            <ChipGroup
              options={[
                { value: 'all',        label: 'All' },
                { value: 'earth',      label: 'Earth' },
                { value: 'superearth', label: 'Super-Earth' },
                { value: 'neptune',    label: 'Neptune' },
                { value: 'jupiter',    label: 'Jupiter' },
              ]}
              active={filters.size}
              onChange={v => setFilter('size', v as KeplerFilters['size'])}
            />
          </FilterGroup>

          <FilterGroup title="Stellar Temperature">
            <ChipGroup
              options={[
                { value: 'all',   label: 'All' },
                { value: 'cool',  label: 'Cool M/K',  style: { color: '#ff8c00' }, title: 'Cool M/K type stars - cooler and redder than our Sun' },
                { value: 'solar', label: 'Sun-like G', style: { color: '#ffd700' }, title: 'Sun-like G type stars - similar temperature to our Sun' },
                { value: 'hot',   label: 'Hot F/A',   style: { color: '#9bb8ff' }, title: 'Hot F/A type stars - hotter and bluer than our Sun' },
              ]}
              active={filters.temp}
              onChange={v => setFilter('temp', v as KeplerFilters['temp'])}
            />
          </FilterGroup>

          <FilterGroup title={`Max Orbital Period`}>
            <input
              type="range" min={1} max={730} value={filters.periodMax}
              className="w-full accent-[#4a90e2]"
              onChange={e => setFilter('periodMax', +e.target.value)}
            />
            <div className="flex justify-between text-[10px] text-cosmos-muted mt-0.5">
              <span>1 day</span>
              <span>≤ {filters.periodMax} days</span>
            </div>
          </FilterGroup>

          <FilterGroup title="Planet Systems">
            <ChipGroup
              options={[
                { value: 'all',   label: 'All Stars' },
                { value: 'multi', label: 'Multi-planet only' },
              ]}
              active={filters.multi}
              onChange={v => setFilter('multi', v as KeplerFilters['multi'])}
            />
          </FilterGroup>

          <FilterGroup title="Habitable Zone">
            <ChipGroup
              options={[
                { value: 'all', label: 'All' },
                { value: 'hz',  label: 'Habitable Zone only', title: 'Habitable Zone - the region around a star where liquid water could exist on a planet\'s surface' },
              ]}
              active={filters.hz}
              onChange={v => setFilter('hz', v as KeplerFilters['hz'])}
            />
          </FilterGroup>

          <FilterGroup title={`Discovery Year ≥ ${filters.yearMin}`}>
            <input
              type="range" min={2009} max={2018} value={filters.yearMin}
              className="w-full accent-[#4a90e2]"
              onChange={e => setFilter('yearMin', +e.target.value)}
            />
            <div className="flex justify-between text-[10px] text-cosmos-muted mt-0.5">
              <span>2009</span><span>2018</span>
            </div>
          </FilterGroup>

          <FilterGroup title="Temperature Color">
            {([
              { c: '#9bb8ff', label: 'Hot >7000 K (A/F)' },
              { c: '#fff0b0', label: 'Warm 6000–7000 K (F)' },
              { c: '#ffd700', label: 'Sun-like 5000–6000 K (G)' },
              { c: '#ff8c00', label: 'Cool 3500–5000 K (K)' },
              { c: '#ff4500', label: 'Red dwarf <3500 K (M)' },
            ] as const).map(({ c, label }) => (
              <div key={c} className="flex items-center gap-2 text-[11px] text-cosmos-muted">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c, boxShadow: `0 0 5px ${c}` }} />
                <span>{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[11px] text-cosmos-muted mt-1">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 border border-dashed border-[#7fbf7f]" />
              <span>Habitable zone planet</span>
            </div>
          </FilterGroup>

          <FilterGroup title="Planet Size Color">
            {(Object.entries(PLANET_COLORS) as [string, string][]).filter(([k]) => k !== 'unknown').map(([k, c]) => (
              <div key={k} className="flex items-center gap-2 text-[11px] text-cosmos-muted">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c, boxShadow: `0 0 5px ${c}` }} />
                <span>{k === 'earth' ? 'Earth ≤1.25 R⊕' : k === 'superearth' ? 'Super-Earth ≤2 R⊕' : k === 'neptune' ? 'Neptune ≤6 R⊕' : 'Jupiter +'}</span>
              </div>
            ))}
          </FilterGroup>

        </aside>

        {/* CANVAS / SKY MAP */}
        <div className={`relative overflow-hidden bg-[#050810] ${mobileTab === 'view' ? 'flex-1 min-h-0' : 'hidden lg:block'}`}>
          {viewMode === 'aladin' ? (
            <KeplerSkyMap
              ref={skyMapRef}
              className="w-full h-full"
              selectedStar={selected}
            />
          ) : (
            <StarCanvas
              stars={stars}
              filtered={filtered}
              viewMode={viewMode}
              hoveredStar={hovered}
              selectedStar={selected}
              onHover={(s, e) => {
                setHovered(s)
                setTooltip(s && e ? { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY } : null)
              }}
              onSelect={s => {
                setSelected(s)
              }}
            />
          )}

          {/* Loading */}
          {status === 'loading' && viewMode !== 'aladin' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-cosmos-muted text-sm tracking-wider">
              <div className="w-9 h-9 rounded-full border-2 border-[rgba(74,144,226,0.15)] border-t-[#4a90e2] animate-spin" />
              <span>Fetching Kepler data from NASA…</span>
            </div>
          )}

          {/* Hover Tooltip (canvas modes only) */}
          {viewMode !== 'aladin' && hovered && tooltip && (
            <div
              className="absolute pointer-events-none z-50 bg-[rgba(4,7,25,0.95)] border border-[rgba(74,144,226,0.3)] rounded-lg px-3 py-2.5 text-xs leading-[1.7] max-w-[230px] backdrop-blur-lg"
              style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
            >
              <div className="text-[13px] font-bold text-[#e0e8ff] mb-1">{hovered.name}</div>
              <div className="flex justify-between gap-3"><span className="text-cosmos-muted">Planets</span><span>{hovered.pnum ?? hovered.planets.length}</span></div>
              <div className="flex justify-between gap-3">
                <span className="text-cosmos-muted">Temperature</span>
                <span style={{ color: hovered.color }}>{hovered.teff ? `${hovered.teff.toLocaleString()} K` : '—'}</span>
              </div>
              <div className="flex justify-between gap-3"><span className="text-cosmos-muted">Distance</span><span>{hovered.dist ? `${Math.round(hovered.dist).toLocaleString()} pc` : '—'}</span></div>
              {hovered.hasHZ && <div className="text-[#7fbf7f] text-[11px] mt-1">◎ Habitable zone planet</div>}
            </div>
          )}
        </div>

        {/* DETAIL PANEL */}
        <aside className={`bg-[rgba(13,18,35,0.92)] border-l border-[rgba(74,144,226,0.15)] p-3.5 overflow-y-auto flex-col gap-3.5 ${mobileTab === 'filters' ? 'flex' : 'hidden lg:flex'}`}>
          {!selected ? (
            <FeaturedPlanet
              stars={stars}
              onSelect={setSelected}
              onSearch={(q) => setFilter('search', q)}
            />
          ) : (
            <>
              <StarDetail star={selected} />
              {selected.ra != null && (
                <button
                  onClick={() => setViewMode('aladin')}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] text-[11px] text-[#d4af37] hover:bg-[rgba(212,175,55,0.15)] transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" fill="none"/>
                    <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
                    <line x1="6" y1="0.5" x2="6" y2="2.5" stroke="currentColor" strokeWidth="1"/>
                    <line x1="6" y1="9.5" x2="6" y2="11.5" stroke="currentColor" strokeWidth="1"/>
                    <line x1="0.5" y1="6" x2="2.5" y2="6" stroke="currentColor" strokeWidth="1"/>
                    <line x1="9.5" y1="6" x2="11.5" y2="6" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                  Locate on Real Sky Map
                </button>
              )}
            </>
          )}
        </aside>

      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KeplerLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
      <circle cx="15" cy="15" r="9" stroke="#4a90e2" strokeWidth="1.2" fill="none" opacity="0.7"/>
      <circle cx="15" cy="15" r="3.5" fill="#d4af37"/>
      <line x1="15" y1="2"  x2="15" y2="7"  stroke="#4a90e2" strokeWidth="1.2"/>
      <line x1="15" y1="23" x2="15" y2="28" stroke="#4a90e2" strokeWidth="1.2"/>
      <line x1="2"  y1="15" x2="7"  y2="15" stroke="#4a90e2" strokeWidth="1.2"/>
      <line x1="23" y1="15" x2="28" y2="15" stroke="#4a90e2" strokeWidth="1.2"/>
      <circle cx="24" cy="15" r="1.5" fill="#ff9a3c" opacity="0.8"/>
      <ellipse cx="15" cy="15" rx="11" ry="3.5" stroke="#4a90e2" strokeWidth="0.6" fill="none" opacity="0.4"/>
    </svg>
  )
}

function Badge({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded border tracking-[0.12em] uppercase ${
      gold
        ? 'bg-[rgba(212,175,55,0.1)] border-[rgba(212,175,55,0.25)] text-[#d4af37]'
        : 'bg-[rgba(74,144,226,0.12)] border-[rgba(74,144,226,0.25)] text-[#4a90e2]'
    }`}>
      {children}
    </span>
  )
}

function Stat({ label, value, color, loading }: { label: string; value: number | string; color: string; loading?: boolean }) {
  const colorMap: Record<string, string> = {
    gold: '#d4af37', blue: '#7fbfff', orange: '#ff9a3c', green: '#7fff7f', sky: '#7fbfff', dim: '#7c88a8',
  }
  return (
    <div className="flex-1 px-3.5 py-[7px] border-r border-[rgba(74,144,226,0.15)] last:border-r-0 flex flex-col gap-0.5">
      <div className="text-xs uppercase tracking-[0.14em] text-cosmos-muted">{label}</div>
      <div className={`font-bold ${color === 'dim' ? 'text-[15px]' : 'text-lg'} ${loading ? 'text-cosmos-muted' : ''}`}
        style={{ color: loading ? undefined : colorMap[color] }}>
        {loading ? '—' : typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs uppercase tracking-[0.18em] text-cosmos-muted pb-1.5 border-b border-[rgba(74,144,226,0.12)]">
        {title}
      </div>
      {children}
    </div>
  )
}

function ChipGroup({
  options, active, onChange,
}: {
  options: Array<{ value: string; label: string; style?: React.CSSProperties; title?: string }>
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
          title={o.title}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all font-mono ${
            active === o.value
              ? 'bg-[rgba(74,144,226,0.18)] border-[#4a90e2] text-[#a0c8ff]'
              : 'bg-transparent border-[rgba(74,144,226,0.15)] text-cosmos-muted hover:border-[#4a90e2] hover:text-[#4a90e2]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// Featured "weird planet" opening state. Kepler-16b - the first confirmed
// circumbinary planet ("Tatooine"). Curated with real, sourced values
// (Doyle et al. 2011, Science; NASA Exoplanet Archive) so the numbers stay
// correct regardless of what the live TAP row carries for this system.
function FeaturedPlanet({
  stars,
  onSelect,
  onSearch,
}: {
  stars: StarSystem[]
  onSelect: (s: StarSystem) => void
  onSearch: (q: string) => void
}) {
  const facts: Array<{ label: string; value: string }> = [
    { label: 'Orbits', value: '2 stars' },
    { label: 'Year', value: '229 days' },
    { label: 'Radius', value: '8.5 R⊕' },
    { label: 'Distance', value: '~245 ly' },
  ]

  const handleExplore = () => {
    const norm = (x: string) => x.toLowerCase().replace(/[\s()_-]/g, '')
    const host = stars.find(
      (s) => norm(s.name) === 'kepler16' || norm(s.name) === 'kepler16ab',
    )
    if (host) onSelect(host)
    else onSearch('Kepler-16')
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#4a90e2]">
        Featured world
      </div>

      {/* Circumbinary illustration: a planet lit by two suns */}
      <div className="relative rounded-lg overflow-hidden border border-[rgba(74,144,226,0.15)] bg-gradient-to-b from-[rgba(74,144,226,0.06)] to-transparent">
        <svg viewBox="0 0 280 120" className="w-full h-auto" role="img" aria-label="Kepler-16b, a gas giant lit by two suns">
          <defs>
            <radialGradient id="kp16-planet" cx="38%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#e6c98a" />
              <stop offset="55%" stopColor="#b98d4e" />
              <stop offset="100%" stopColor="#2a1e12" />
            </radialGradient>
            <radialGradient id="kp16-sunA" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff6e0" />
              <stop offset="60%" stopColor="#ffd27a" />
              <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="kp16-sunB" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd9c2" />
              <stop offset="55%" stopColor="#ff8f6b" />
              <stop offset="100%" stopColor="#ff8f6b" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* stars */}
          <circle cx="228" cy="34" r="16" fill="url(#kp16-sunA)" />
          <circle cx="228" cy="34" r="6" fill="#fff6e0" />
          <circle cx="248" cy="60" r="11" fill="url(#kp16-sunB)" />
          <circle cx="248" cy="60" r="3.5" fill="#ffd9c2" />
          {/* planet */}
          <circle cx="96" cy="62" r="40" fill="url(#kp16-planet)" />
          <ellipse cx="96" cy="62" rx="40" ry="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          {/* faint distant stars */}
          <circle cx="30" cy="20" r="1" fill="#fff" opacity="0.4" />
          <circle cx="160" cy="96" r="1" fill="#fff" opacity="0.3" />
          <circle cx="190" cy="18" r="0.8" fill="#fff" opacity="0.35" />
        </svg>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#e0e8ff] leading-tight">Kepler-16b</h3>
        <div className="text-[11px] text-cosmos-muted mt-0.5">
          &ldquo;Tatooine&rdquo; · circumbinary planet
        </div>
      </div>

      <p className="text-xs leading-relaxed text-[#c8d4f0]">
        The first planet ever found orbiting two stars at once. A cold,
        Saturn-sized world circling a K-dwarf and a red dwarf, where both suns
        rise and set together - the real Tatooine, about 245 light-years away.
      </p>

      <div className="grid grid-cols-2 gap-px bg-[rgba(74,144,226,0.12)] rounded-lg overflow-hidden border border-[rgba(74,144,226,0.12)]">
        {facts.map((f) => (
          <div key={f.label} className="bg-[rgba(13,18,35,0.92)] px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-cosmos-muted">{f.label}</div>
            <div className="text-sm font-bold text-[#a0c8ff] mt-0.5">{f.value}</div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-cosmos-faint">
        Cold gas giant · discovered 2011 · Doyle et al. / NASA Exoplanet Archive
      </div>

      <button
        onClick={handleExplore}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-[rgba(74,144,226,0.1)] border border-[rgba(74,144,226,0.25)] text-[11px] text-[#a0c8ff] hover:bg-[rgba(74,144,226,0.18)] transition-all"
      >
        Find Kepler-16 in the field
        <span aria-hidden>→</span>
      </button>

      <p className="text-[10px] text-cosmos-muted text-center leading-relaxed">
        or click any star to explore all {stars.length.toLocaleString()} systems
      </p>
    </div>
  )
}

function StarDetail({ star }: { star: StarSystem }) {
  const spectral = tempToSpectral(star.teff)
  const n = star.pnum ?? star.planets.length

  return (
    <>
      <div>
        <div className="text-[17px] font-bold text-[#e8f0ff] tracking-[0.04em]">{star.name}</div>
        <div className="text-[11px] text-cosmos-muted mt-0.5">
          {n} confirmed planet{n !== 1 ? 's' : ''} · Spectral type {spectral}
        </div>
      </div>

      <section>
        <div className="text-xs uppercase tracking-[0.18em] text-cosmos-muted pb-1.5 border-b border-[rgba(74,144,226,0.1)] mb-1">Host Star</div>
        {[
          { label: 'Temperature', value: star.teff ? `${star.teff.toLocaleString()} K` : '—', style: { color: tempToColor(star.teff) } },
          { label: 'Radius',      value: star.srad  ? `${star.srad.toFixed(2)} R☉` : '—' },
          { label: 'Mass',        value: star.smass ? `${star.smass.toFixed(2)} M☉` : '—' },
          { label: 'Distance',    value: star.dist  ? `${Math.round(star.dist).toLocaleString()} pc` : '—' },
          { label: 'Coordinates', value: star.ra != null ? `${star.ra.toFixed(3)}°, ${star.dec?.toFixed(3)}°` : '—', small: true },
        ].map(p => (
          <div key={p.label} className="flex justify-between items-center py-[5px] border-b border-white/[0.03] text-xs">
            <span className="text-cosmos-muted">{p.label}</span>
            <span className={`font-medium ${p.small ? 'text-[11px]' : ''}`} style={p.style}>{p.value}</span>
          </div>
        ))}
      </section>

      <section>
        <div className="text-xs uppercase tracking-[0.18em] text-cosmos-muted pb-1.5 border-b border-[rgba(74,144,226,0.1)] mb-2">Orbital System</div>
        <ExoplanetSystemViewer star={star} />
      </section>

      <section>
        <div className="text-xs uppercase tracking-[0.18em] text-cosmos-muted pb-1.5 border-b border-[rgba(74,144,226,0.1)] mb-2">
          Planets ({star.planets.length})
        </div>
        <div className="flex flex-col gap-1.5">
          {star.planets.map(p => (
            <div
              key={p.name}
              className="bg-white/[0.025] border border-[rgba(74,144,226,0.12)] rounded-[5px] px-2.5 py-2 hover:bg-[rgba(74,144,226,0.06)] hover:border-[rgba(74,144,226,0.28)] transition-all cursor-default"
            >
              <div className="text-[13px] font-semibold mb-1" style={{ color: PLANET_COLORS[p.cat] }}>
                {p.name}
              </div>
              <div className="flex flex-wrap gap-2">
                {p.rade   && <PlanetStat label="Radius" value={`${p.rade.toFixed(2)} R⊕`} />}
                {p.period && <PlanetStat label="Period" value={`${p.period.toFixed(1)} d`} />}
                {p.eqt    && <PlanetStat label="Temp"   value={`${Math.round(p.eqt)} K`} />}
                {p.mass   && <PlanetStat label="Mass"   value={`${p.mass.toFixed(1)} M⊕`} />}
                {p.insol  && <PlanetStat label="Flux"   value={`${p.insol.toFixed(2)} S⊕`} />}
                {p.year   && <PlanetStat label="Disc."  value={String(p.year)} />}
              </div>
              {p.hz && (
                <div className="text-[10px] text-[#7fbf7f] mt-1 flex items-center gap-1">
                  ◎ In habitable zone
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function PlanetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[10px] text-cosmos-muted">
      {label} <span className="text-[#c8d4f0] font-semibold">{value}</span>
    </div>
  )
}
