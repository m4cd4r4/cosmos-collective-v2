'use client'

import { useState, useMemo } from 'react'
import { Search, Satellite } from 'lucide-react'
import { SPACECRAFT_CATALOG, CATEGORY_LABELS, type SpacecraftEntry, type SpacecraftCategory } from '@/data/spacecraft-catalog'
import { SpacecraftCard } from './SpacecraftCard'
import { SpacecraftDetail } from './SpacecraftDetail'

type CategoryFilter = 'all' | SpacecraftCategory
type StatusFilter = 'all' | 'active' | 'retired'

export function SpacecraftExplorer() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SpacecraftEntry | null>(null)

  const filtered = useMemo(() => {
    return SPACECRAFT_CATALOG.filter(entry => {
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false
      if (statusFilter === 'active' && entry.status !== 'active') return false
      if (statusFilter === 'retired' && entry.status !== 'retired' && entry.status !== 'under-construction') return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !entry.name.toLowerCase().includes(q) &&
          !entry.shortName.toLowerCase().includes(q) &&
          !entry.agency.toLowerCase().includes(q) &&
          !entry.summary.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [categoryFilter, statusFilter, search])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: SPACECRAFT_CATALOG.length }
    for (const entry of SPACECRAFT_CATALOG) {
      counts[entry.category] = (counts[entry.category] ?? 0) + 1
    }
    return counts
  }, [])

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="rounded-xl border border-cosmos-gold/[0.15] bg-[rgba(8,12,28,0.7)] overflow-hidden">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-cosmos-gold/[0.08]">
          <FilterButton
            active={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
          >
            All ({categoryCounts.all})
          </FilterButton>
          {(Object.entries(CATEGORY_LABELS) as [SpacecraftCategory, string][]).map(([key, label]) => (
            <FilterButton
              key={key}
              active={categoryFilter === key}
              onClick={() => setCategoryFilter(key)}
            >
              {label} ({categoryCounts[key] ?? 0})
            </FilterButton>
          ))}
        </div>

        {/* Search + status */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search spacecraft..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-cosmos-depth/50 border border-cosmos-gold/[0.1] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cosmos-gold/30"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
              All
            </FilterButton>
            <FilterButton active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>
              Active
            </FilterButton>
            <FilterButton active={statusFilter === 'retired'} onClick={() => setStatusFilter('retired')}>
              Retired
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-widest text-gray-500">
          {filtered.length} spacecraft
        </span>
        <div className="flex-1 h-px bg-cosmos-gold/[0.06]" />
      </div>

      {/* Card grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(entry => (
            <SpacecraftCard key={entry.id} entry={entry} onSelect={setSelected} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-cosmos-gold/[0.08] bg-cosmos-depth/30">
          <Satellite className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No spacecraft match your filters</p>
        </div>
      )}

      {/* Detail modal */}
      <SpacecraftDetail entry={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
        active
          ? 'bg-cosmos-gold/[0.15] text-cosmos-gold border border-cosmos-gold/30'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
      }`}
    >
      {children}
    </button>
  )
}
