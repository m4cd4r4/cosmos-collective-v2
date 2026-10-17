/**
 * Explore Page
 * Full gallery experience with advanced filtering and search
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { ExploreGallery } from '@/components/features/explore/ExploreGallery'
import { ExploreFilters } from '@/components/features/explore/ExploreFilters'
import { ExploreSearch } from '@/components/features/explore/ExploreSearch'
import { ExploreHero, type HeroSlide } from '@/components/features/explore/ExploreHero'
import { ExploreRails } from '@/components/features/explore/ExploreRails'
import { WebbExplorerPanel } from '@/components/features/explore/WebbExplorerPanel'
import { getFeaturedJWSTImages, getFeaturedHubbleImages } from '@/services/mast-api'
import { getFeaturedRadioObservations } from '@/services/australian-telescopes'
import Link from 'next/link'
import { Telescope, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsBar } from '@/components/ui/StatsBar'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse thousands of astronomical observations from JWST, Hubble, and Australian radio telescopes. Filter by category, wavelength, and more.',
}

const HERO_CATEGORIES = ['nebula', 'galaxy', 'deep-field', 'star-cluster']

// NASA serves ~medium (about 1000px) everywhere, but that is soft at full-bleed.
// Each id below was HEAD-checked 2026-10-17; a slide not listed keeps its ~medium URL.
const HERO_NASA_IDS_LARGE = ['carina_nebula', 'webb_first_deep_field', 'PIA15985', 'PIA04201', 'PIA15810']
const HERO_NASA_IDS_ORIG = ['PIA15226'] // no ~large exists; ~orig is only 422 KB
function heroImageUrl(url: string): string {
  const id = url.match(/\/image\/([^/]+)\/[^/]+~medium\.jpg$/)?.[1]
  if (!id) return url
  if (HERO_NASA_IDS_LARGE.includes(id)) return url.replace('~medium', '~large')
  if (HERO_NASA_IDS_ORIG.includes(id)) return url.replace('~medium', '~orig')
  return url
}

// Hero slides: real JWST and Hubble images only. Radio tiles reuse generic
// stand-in images, so they never appear here. Duplicated image URLs are dropped.
function buildHeroSlides(): HeroSlide[] {
  const seen = new Set<string>()
  const pick = (list: ReturnType<typeof getFeaturedJWSTImages>) =>
    list
      .filter((o) => HERO_CATEGORIES.includes(o.category) && o.images.full)
      .filter((o) => {
        if (seen.has(o.images.full)) return false
        seen.add(o.images.full)
        return true
      })
  const jwst = pick(getFeaturedJWSTImages())
  const hubble = pick(getFeaturedHubbleImages())
  const mixed = []
  for (let i = 0; mixed.length < 6 && (i < jwst.length || i < hubble.length); i++) {
    if (jwst[i]) mixed.push(jwst[i])
    if (hubble[i] && mixed.length < 6) mixed.push(hubble[i])
  }
  return mixed.slice(0, 6).map((o) => ({
    id: o.id,
    name: o.targetName,
    telescope: o.source,
    caption: o.description ?? o.analysis?.summary ?? '',
    image: heroImageUrl(o.images.full),
  }))
}

// Loading skeleton for gallery — dark themed
function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-video rounded-xl bg-[rgba(255,255,255,0.04)] animate-pulse" />
      ))}
    </div>
  )
}

export default function ExplorePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Extract filter parameters from URL
  const source = typeof searchParams.source === 'string' ? searchParams.source : undefined
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined
  const wavelength = typeof searchParams.wavelength === 'string' ? searchParams.wavelength : undefined
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined
  // ?view=webb is the former /jwst page, merged in on 2026-10-14
  const view = searchParams.view === 'webb' ? 'webb' : 'gallery'

  // Get real counts from data layer (server component — free to call directly)
  const jwstCount = getFeaturedJWSTImages().length
  const hubbleCount = getFeaturedHubbleImages().length
  const radioCount = getFeaturedRadioObservations().length
  const totalCount = jwstCount + hubbleCount + radioCount

  // The hero only opens a clean /explore; filtered or searched links go straight to results
  const hasFilters = Boolean(source || category || wavelength || query)
  const showHero = view === 'gallery' && !hasFilters

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {showHero && <ExploreHero slides={buildHeroSlides()} />}
      {showHero && <ExploreRails />}

      {/* ── App Header Strip ──────────────────────────────────────────────── */}
      {!showHero && (
        <PageHeader
          icon={Telescope}
          title="Explore"
          badge={{ text: `${totalCount} Observations`, color: '#d4af37' }}
          subtitle="JWST · Hubble · Radio"
          rightContent={
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-500">
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Multi-source Archive</span>
            </div>
          }
        />
      )}

      {/* ── View Tabs ─────────────────────────────────────────────────────── */}
      <nav
        className="flex items-center gap-1 px-4 sm:px-5 py-2 bg-[rgba(4,6,18,0.97)] border-b border-white/[0.08] shrink-0"
        aria-label="Explore views"
      >
        {([
          { id: 'gallery', label: 'All Observations', href: '/explore', hint: 'JWST, Hubble and radio, filterable' },
          { id: 'webb', label: 'Webb Explorer', href: '/explore?view=webb', hint: 'Wavelength bands and feature annotations' },
        ] as const).map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            title={tab.hint}
            aria-current={view === tab.id ? 'page' : undefined}
            className={cn(
              'px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.12em] transition-colors',
              view === tab.id
                ? 'bg-[rgba(212,175,55,0.15)] text-[#d4af37] border border-[rgba(212,175,55,0.3)]'
                : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      {/* The Webb view carries its own counts, so only the gallery shows these */}
      {view === 'gallery' && (
        <StatsBar items={[
          { label: 'JWST', value: String(jwstCount), color: '#e040fb' },
          { label: 'Hubble', value: String(hubbleCount), color: '#4a90e2' },
          { label: 'Radio', value: String(radioCount), color: '#f59e0b' },
          { label: 'Total', value: String(totalCount), color: '#d4af37' },
        ]} />
      )}

      {view === 'webb' ? (
        <WebbExplorerPanel />
      ) : (
      <div id="browse" className="flex-1 overflow-auto scroll-mt-4 px-4 sm:px-5 py-5 pb-20 lg:pb-5 max-w-7xl mx-auto w-full">

        {/* ── Search + Filters ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-white/[0.08]">
            <ExploreSearch initialQuery={query} />
          </div>
          <div className="px-4 py-3">
            <ExploreFilters
              initialSource={source}
              initialCategory={category}
              initialWavelength={wavelength}
            />
          </div>
        </div>

        {/* ── Gallery Grid ──────────────────────────────────────────────── */}
        <Suspense fallback={<GallerySkeleton />}>
          <ExploreGallery
            source={source}
            category={category}
            wavelength={wavelength}
            query={query}
          />
        </Suspense>
      </div>
      )}

    </div>
  )
}
