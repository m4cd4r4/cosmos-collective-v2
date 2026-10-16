'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Search, Crosshair, ChevronUp, ChevronDown, Globe2, Loader2, AlertTriangle, ExternalLink, BookOpen, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  buildCatalog,
  describe,
  stateOf,
  ORBIT_CLASSES,
  CONSTELLATIONS,
  ISS_NORAD,
  type Catalog,
} from '@/lib/satellites/catalog'
import { ORBIT_CLASS_INFO } from '@/lib/satellites/orbit'
import type { SatellitePayload } from '@/lib/satellites/gp'
import type { EarthMode } from './earth'
import { SpacecraftExplorer } from '@/components/features/spacecraft/SpacecraftExplorer'

const SatelliteGlobe = dynamic(() => import('./SatelliteGlobe').then((m) => ({ default: m.SatelliteGlobe })), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-cosmos-gold/15 border-t-cosmos-gold animate-spin" />
    </div>
  ),
})

const EARTH_LOOKS: Array<{ id: EarthMode; label: string; hint: string }> = [
  { id: 'minimal', label: 'Minimal', hint: 'Dark Earth, satellites first' },
  { id: 'hero', label: 'Day / night', hint: 'Terminator and city lights' },
  { id: 'realism', label: 'Realistic', hint: 'Clouds, relief, ocean glint' },
]

function ageLabel(hours: number) {
  if (hours < 1) return `${Math.max(0, Math.round(hours * 60))} min`
  if (hours < 48) return `${hours.toFixed(1)} h`
  return `${Math.round(hours / 24)} days`
}

export function SatelliteApp() {
  const [payload, setPayload] = useState<SatellitePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [catalog, setCatalog] = useState<Catalog | null>(null)

  const [earthMode, setEarthMode] = useState<EarthMode>('minimal')
  const [classVisible, setClassVisible] = useState<boolean[]>(() => ORBIT_CLASSES.map(() => true))
  const [constellationVisible, setConstellationVisible] = useState<boolean[]>(() => CONSTELLATIONS.map(() => true))
  const [showClassRings, setShowClassRings] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [follow, setFollow] = useState(false)
  const [hover, setHover] = useState<{ index: number; x: number; y: number } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => {
    if (window.location.hash === '#spacecraft') setGuideOpen(true)
  }, [])

  useEffect(() => {
    if (!guideOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setGuideOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [guideOpen])

  useEffect(() => {
    let cancelled = false
    fetch('/api/satellites')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<SatellitePayload>
      })
      .then((p) => {
        if (cancelled) return
        setPayload(p)
        setCatalog(buildCatalog(p.rows))
      })
      .catch((e) => !cancelled && setError(String(e.message ?? e)))
    return () => { cancelled = true }
  }, [])

  const filters = useMemo(
    () => ({ classVisible, constellationVisible, showClassRings }),
    [classVisible, constellationVisible, showClassRings],
  )

  const counts = useMemo(() => {
    const byClass = ORBIT_CLASSES.map(() => 0)
    const byConst = CONSTELLATIONS.map(() => 0)
    if (catalog) {
      for (let i = 0; i < catalog.count; i++) {
        byClass[catalog.orbitClass[i]]++
        byConst[catalog.constellation[i]]++
      }
    }
    return { byClass, byConst }
  }, [catalog])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!catalog || q.length < 2) return []
    const out: number[] = []
    for (let i = 0; i < catalog.count && out.length < 8; i++) {
      if (catalog.names[i].toLowerCase().includes(q) || String(catalog.norad[i]) === q) out.push(i)
    }
    return out
  }, [catalog, query])

  const choose = useCallback((i: number | null, andFollow = false) => {
    setSelected(i)
    setFollow(i !== null && andFollow)
    if (i === null) setPanelOpen(false)
  }, [])

  const toggleClass = (k: number) => setClassVisible((v) => v.map((x, i) => (i === k ? !x : x)))
  const toggleConst = (k: number) => setConstellationVisible((v) => v.map((x, i) => (i === k ? !x : x)))

  const issIndex = catalog?.indexByNorad.get(ISS_NORAD)
  const dataAgeHours = payload && payload.source === 'live' ? (Date.now() - Date.parse(payload.fetchedAt)) / 3_600_000 : null

  return (
    <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-[#0a0e1a] text-[#c8d4f0]">
      <SatelliteGlobe
        catalog={catalog}
        earthMode={earthMode}
        filters={filters}
        selected={selected}
        follow={follow}
        onSelect={(i) => choose(i)}
        onHover={setHover}
        onFollowBroken={() => setFollow(false)}
      />

      {/* Loading / error */}
      {!catalog && !error && (
        <div className="absolute inset-x-0 top-4 flex justify-center pointer-events-none">
          <div className="glass-panel flex items-center gap-2 px-3 py-1.5 text-xs text-cosmos-muted">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading the satellite catalogue
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-x-0 top-4 flex justify-center">
          <div className="glass-panel flex items-center gap-2 px-3 py-1.5 text-xs text-red-300">
            <AlertTriangle className="w-3.5 h-3.5" /> Could not load satellite data ({error}). Try again shortly.
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {hover && catalog && (
        <div
          className="pointer-events-none fixed z-30 px-2 py-1 rounded bg-black/80 border border-white/10 text-[11px] text-[#e0e8ff]"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
        >
          {catalog.names[hover.index]}
          <span className="text-cosmos-muted"> · {ORBIT_CLASSES[catalog.orbitClass[hover.index]]}</span>
        </div>
      )}

      {/* Control panel: left rail on desktop, bottom sheet on mobile */}
      <aside
        className={cn(
          'absolute z-20 flex flex-col gap-3 overflow-y-auto',
          'inset-x-0 bottom-[68px] max-h-[62%] rounded-t-2xl p-4 pb-5', // clear of the mobile tab bar
          'lg:inset-x-auto lg:left-4 lg:top-4 lg:bottom-4 lg:w-[300px] lg:max-h-none lg:rounded-xl',
          'max-lg:rounded-b-none',
          'bg-[rgba(8,12,28,0.88)] backdrop-blur-md border border-[rgba(212,175,55,0.15)]',
          !panelOpen && 'max-lg:max-h-[56px] max-lg:overflow-hidden',
        )}
        aria-label="Satellite controls"
      >
        <button
          type="button"
          className="lg:hidden flex items-center justify-between w-full text-xs uppercase tracking-[0.15em] text-[#e0e8ff]"
          onClick={() => setPanelOpen((o) => !o)}
          aria-expanded={panelOpen}
        >
          <span className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-[#d4af37]" /> Satellites{catalog ? ` · ${catalog.count.toLocaleString()}` : ''}</span>
          {panelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        <div className="hidden lg:block">
          <h1 className="text-sm font-bold tracking-[0.15em] uppercase text-[#e0e8ff] flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#d4af37]" /> Satellites
          </h1>
          <p className="text-[11px] text-cosmos-muted mt-1">
            {catalog ? `${catalog.count.toLocaleString()} active craft at their position right now.` : 'Every active satellite, live.'}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cosmos-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a satellite (ISS, Hubble, 25544)"
            aria-label="Find a satellite"
            className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-2 py-2 text-xs text-[#e0e8ff] placeholder:text-cosmos-muted focus:outline-none focus:border-[#d4af37]/60"
          />
          {matches.length > 0 && (
            <ul className="mt-1 rounded-lg border border-white/10 bg-black/60 divide-y divide-white/5">
              {matches.map((i) => (
                <li key={i}>
                  <button
                    type="button"
                    className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-white/5 flex justify-between gap-2"
                    onClick={() => { choose(i, true); setQuery('') }}
                  >
                    <span className="truncate">{catalog!.names[i]}</span>
                    <span className="text-cosmos-muted shrink-0">{ORBIT_CLASSES[catalog!.orbitClass[i]]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected craft */}
        {selected !== null && catalog && (
          <SelectedCard
            catalog={catalog}
            index={selected}
            follow={follow}
            onFollow={() => setFollow((f) => !f)}
            onClose={() => choose(null)}
          />
        )}
        {selected === null && issIndex !== undefined && (
          <button
            type="button"
            className="text-left text-xs rounded-lg border border-[#d4af37]/25 bg-[#d4af37]/5 px-3 py-2 hover:bg-[#d4af37]/10 transition-colors"
            onClick={() => choose(issIndex, true)}
          >
            <span className="text-[#d4af37] font-semibold">Follow the ISS</span>
            <span className="block text-cosmos-muted mt-0.5">Fly to the station and ride along.</span>
          </button>
        )}

        <button
          type="button"
          className="flex items-center gap-2 text-left text-xs rounded-lg border border-white/15 px-3 py-2 text-[#c8d4f0] hover:bg-white/5 transition-colors"
          onClick={() => setGuideOpen(true)}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" /> Spacecraft guide
        </button>

        {/* Orbit classes */}
        <section aria-label="Orbit classes">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-[11px] uppercase tracking-[0.15em] text-cosmos-muted">Orbit class</h2>
            <label className="flex items-center gap-1.5 text-[11px] text-cosmos-muted cursor-pointer">
              <input type="checkbox" checked={showClassRings} onChange={(e) => setShowClassRings(e.target.checked)} className="accent-[#d4af37]" />
              Class rings
            </label>
          </div>
          <div className="space-y-1">
            {ORBIT_CLASSES.map((cls, k) => (
              <button
                key={cls}
                type="button"
                onClick={() => toggleClass(k)}
                aria-pressed={classVisible[k]}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors',
                  classVisible[k] ? 'border-white/15 bg-white/[0.04]' : 'border-transparent opacity-45 hover:opacity-70',
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ORBIT_CLASS_INFO[cls].color, boxShadow: `0 0 8px ${ORBIT_CLASS_INFO[cls].color}` }} />
                <span className="flex-1 min-w-0">
                  <span className="block text-xs text-[#e0e8ff]">{cls} <span className="text-cosmos-muted">· {ORBIT_CLASS_INFO[cls].range}</span></span>
                </span>
                <span className="text-[11px] text-cosmos-muted tabular-nums">{counts.byClass[k].toLocaleString()}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Constellations */}
        <section aria-label="Constellations">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-cosmos-muted mb-1.5">Constellation</h2>
          <div className="flex flex-wrap gap-1">
            {CONSTELLATIONS.map((c, k) =>
              counts.byConst[k] === 0 ? null : (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleConst(k)}
                  aria-pressed={constellationVisible[k]}
                  className={cn(
                    'px-2 py-1 rounded-md border text-[11px] transition-colors',
                    constellationVisible[k]
                      ? 'border-[#d4af37]/35 bg-[#d4af37]/10 text-[#e8d58a]'
                      : 'border-white/10 text-cosmos-muted hover:text-[#c8d4f0]',
                  )}
                >
                  {c} <span className="opacity-60 tabular-nums">{counts.byConst[k].toLocaleString()}</span>
                </button>
              ),
            )}
          </div>
        </section>

        {/* Earth look */}
        <section aria-label="Earth look">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-cosmos-muted mb-1.5">Earth</h2>
          <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Earth look">
            {EARTH_LOOKS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={earthMode === l.id}
                title={l.hint}
                onClick={() => setEarthMode(l.id)}
                className={cn(
                  'px-1.5 py-1.5 rounded-md border text-[11px] transition-colors',
                  earthMode === l.id ? 'border-[#d4af37]/50 bg-[#d4af37]/15 text-[#f3e3a0]' : 'border-white/10 text-cosmos-muted hover:text-[#c8d4f0]',
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Data status */}
        <section className="text-[11px] text-cosmos-muted leading-relaxed border-t border-white/10 pt-2.5">
          {payload?.source === 'snapshot' ? (
            <p className="text-amber-300/90">Live feed unavailable: showing a saved snapshot of space stations, so positions may be off.</p>
          ) : dataAgeHours !== null ? (
            <p>Orbit data fetched {ageLabel(dataAgeHours)} ago, refreshed about every 2 hours. Positions are computed from it.</p>
          ) : null}
          <p className="mt-1">
            Orbital elements from{' '}
            <a href="https://celestrak.org" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:underline inline-flex items-center gap-0.5">
              CelesTrak <ExternalLink className="w-2.5 h-2.5" />
              <span className="sr-only">(opens in new tab)</span>
            </a>
            . Drag to rotate, scroll or pinch to zoom, tap a dot to select.
          </p>
        </section>
      </aside>

      {guideOpen && (
        <div className="absolute inset-0 z-40 overflow-y-auto bg-[#0a0e1a]/95 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Spacecraft guide">
          <div className="sticky top-0 z-50 flex justify-end px-4 py-2 bg-[#0a0e1a]/90 backdrop-blur-sm border-b border-white/10">
            <button
              type="button"
              onClick={() => setGuideOpen(false)}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-[#e0e8ff] hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" /> Back to globe
            </button>
          </div>
          <div className="mx-auto max-w-6xl px-4 py-6">
            <SpacecraftExplorer />
          </div>
        </div>
      )}
    </div>
  )
}

function SelectedCard({
  catalog,
  index,
  follow,
  onFollow,
  onClose,
}: {
  catalog: Catalog
  index: number
  follow: boolean
  onFollow: () => void
  onClose: () => void
}) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const info = describe(catalog, index, now)
  const live = stateOf(catalog, index, now)
  const color = ORBIT_CLASS_INFO[info.orbitClass].color

  const rows: Array<[string, string]> = [
    ['Latitude', live ? `${live.lat.toFixed(2)}°` : '-'],
    ['Longitude', live ? `${live.lon.toFixed(2)}°` : '-'],
    ['Altitude', live ? `${Math.round(live.altitudeKm).toLocaleString()} km` : '-'],
    ['Speed', live ? `${live.speedKmS.toFixed(2)} km/s` : '-'],
    ['Period', `${info.periodMin >= 120 ? (info.periodMin / 60).toFixed(1) + ' h' : info.periodMin.toFixed(1) + ' min'}`],
    ['Inclination', `${info.inclinationDeg.toFixed(1)}°`],
    ['Perigee / apogee', `${Math.round(info.perigeeKm).toLocaleString()} / ${Math.round(info.apogeeKm).toLocaleString()} km`],
    ['Element age', ageLabel(info.elementAgeHours)],
  ]

  return (
    <section className="rounded-lg border bg-black/25 p-3" style={{ borderColor: `${color}55` }} aria-label="Selected satellite">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[#e0e8ff] truncate">{info.name}</div>
          <div className="text-[11px] text-cosmos-muted">
            <span style={{ color }}>{info.orbitClass}</span> · NORAD {info.norad} · {info.constellation}
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-cosmos-muted hover:text-white text-lg leading-none px-1" aria-label="Clear selection">×</button>
      </div>
      <dl className="mt-2 grid grid-cols-1 gap-y-1 text-[11px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt className="text-cosmos-muted">{k}</dt>
            <dd className="text-[#c8d4f0] tabular-nums text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={onFollow}
        aria-pressed={follow}
        className={cn(
          'mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors',
          follow ? 'border-[#d4af37]/50 bg-[#d4af37]/15 text-[#f3e3a0]' : 'border-white/15 text-cosmos-muted hover:text-white',
        )}
      >
        <Crosshair className="w-3 h-3" /> {follow ? 'Following' : 'Follow'}
      </button>
    </section>
  )
}
