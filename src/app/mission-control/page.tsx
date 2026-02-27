'use client'

/**
 * Mission Control — Hub page for tools NOT in the header nav
 * Links to: Explore, Live Events, Devlog, Observatory, Dashboard, Credits
 */

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { StatPopover, type StatPopoverItem } from '@/components/ui/StatPopover'
import {
  Telescope,
  Calendar,
  BookOpen,
  LayoutDashboard,
  Award,
  Radio,
  Satellite,
  Zap,
  Globe,
  BookMarked,
  ChevronRight,
  Activity,
} from 'lucide-react'

// ── Tool tiles shown in Mission Control ────────────────────────────────────

const tools = [
  {
    label: 'Explore',
    href: '/explore',
    icon: Telescope,
    badge: '132 OBS',
    badgeColor: '#d4af37',
    description: 'Browse JWST, Hubble and Australian radio telescope observations with full filtering and sky-map integration.',
    stat: '85 JWST · 18 Hubble · 29 Radio',
    color: '#d4af37',
    glow: 'rgba(212,175,55,0.08)',
  },
  {
    label: 'Live Events',
    href: '/events',
    icon: Calendar,
    badge: 'LIVE',
    badgeColor: '#ef4444',
    badgePulse: true,
    description: 'Real-time astronomical events, ISS live feed, solar weather gauges, and upcoming meteor showers.',
    stat: 'ISS · Solar Activity · NEOs · Showers',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.08)',
  },
  {
    label: 'Devlog',
    href: '/devlog',
    icon: BookOpen,
    badge: 'BLOG',
    badgeColor: '#e040fb',
    description: 'Technical blog documenting the design and engineering decisions behind Cosmos Collective.',
    stat: 'Architecture · APIs · Visualisation',
    color: '#e040fb',
    glow: 'rgba(224,64,251,0.08)',
  },
  {
    label: 'Observatory',
    href: '/observatory',
    icon: Radio,
    badge: 'DEEP SPACE',
    badgeColor: '#4a90e2',
    description: 'Multi-wavelength deep space observatory combining optical, infrared and radio data streams.',
    stat: 'JWST · ASKAP · MWA · Parkes',
    color: '#4a90e2',
    glow: 'rgba(74,144,226,0.08)',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: 'PERSONAL',
    badgeColor: '#4caf93',
    description: 'Your personal space: favourited observations, live ISS position, current events and project progress.',
    stat: 'Favourites · ISS · Events · SKA',
    color: '#4caf93',
    glow: 'rgba(76,175,147,0.08)',
  },
  {
    label: 'Credits',
    href: '/credits',
    icon: Award,
    badge: 'ATTRIBUTION',
    badgeColor: '#64d8cb',
    description: 'Data sources, third-party libraries and acknowledgements powering the platform.',
    stat: 'NASA · ESA · CSIRO · CDS',
    color: '#64d8cb',
    glow: 'rgba(100,216,203,0.08)',
  },
]

// ── Info panels ────────────────────────────────────────────────────────────

const dataSourceItems: StatPopoverItem[] = [
  { label: 'NASA', url: 'https://www.nasa.gov/', detail: 'APOD, ISS tracking, NEO data' },
  { label: 'STScI / MAST', url: 'https://mast.stsci.edu/', detail: 'JWST & Hubble archives' },
  { label: 'ESA', url: 'https://www.esa.int/', detail: 'European Space Agency' },
  { label: 'CSA', url: 'https://www.asc-csa.gc.ca/', detail: 'Canadian Space Agency' },
  { label: 'CSIRO', url: 'https://www.csiro.au/', detail: 'Australian telescopes' },
  { label: 'CDS Strasbourg', url: 'https://cds.u-strasbg.fr/', detail: 'Aladin sky atlas & SIMBAD' },
  { label: 'NASA DONKI', url: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/', detail: 'Solar weather data' },
  { label: 'NASA NEO API', url: 'https://api.nasa.gov/', detail: 'Near-Earth objects' },
  { label: 'ISS Tracker', url: 'https://wheretheiss.at/', detail: 'Real-time ISS position' },
  { label: 'ALeRCE', url: 'https://alerce.online/', detail: 'Astronomical transient broker' },
  { label: 'Open-Meteo', url: 'https://open-meteo.com/', detail: 'Weather & atmospheric data' },
]

const observationItems: StatPopoverItem[] = [
  { label: 'JWST (NIRCam / MIRI)', url: 'https://webbtelescope.org/images', detail: '85 observations' },
  { label: 'Hubble (WFC3 / ACS)', url: 'https://hubblesite.org/images/gallery', detail: '18 observations' },
  { label: 'Radio (ASKAP / Parkes / ATCA)', url: 'https://www.csiro.au/en/about/facilities-collections/atnf', detail: '29 observations' },
]

const wavelengthItems: StatPopoverItem[] = [
  { label: 'Radio', detail: '> 1 mm — ASKAP, Parkes, MWA' },
  { label: 'Infrared', detail: '700 nm – 1 mm — JWST NIRCam & MIRI' },
  { label: 'Visible', detail: '400 – 700 nm — Hubble WFC3' },
  { label: 'Ultraviolet', detail: '10 – 400 nm — Hubble ACS' },
  { label: 'X-ray', detail: '0.01 – 10 nm — Chandra, XMM-Newton' },
]

const coverageItems: StatPopoverItem[] = [
  { label: 'JWST Deep Field', url: 'https://webbtelescope.org/', detail: 'Earliest galaxies, 13.1B+ ly' },
  { label: 'Hubble Ultra Deep Field', url: 'https://hubblesite.org/', detail: 'Deep-sky imaging, 13B+ ly' },
  { label: 'Kepler Field (Cygnus)', detail: '~920 ly average distance' },
  { label: 'Radio Sky', detail: 'All-sky coverage via ASKAP & MWA' },
]

const infoPanels = [
  {
    icon: Satellite,
    label: 'Live Data Sources',
    value: '11',
    detail: 'Space agencies feeding real-time data',
    color: '#d4af37',
    popoverItems: dataSourceItems,
  },
  {
    icon: Globe,
    label: 'Coverage',
    value: '13B+ ly',
    detail: 'Light years of observable universe',
    color: '#4a90e2',
    popoverItems: coverageItems,
  },
  {
    icon: Activity,
    label: 'Observations',
    value: '132+',
    detail: 'Curated telescope observations',
    color: '#4caf93',
    popoverItems: observationItems,
  },
  {
    icon: Zap,
    label: 'Wavelengths',
    value: '5',
    detail: 'Radio · Infrared · Visible · UV · X-ray',
    color: '#e040fb',
    popoverItems: wavelengthItems,
  },
]

// ──────────────────────────────────────────────────────────────────────────

export default function MissionControlPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* App Header Strip */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <BookMarked className="w-4 h-4 text-[#d4af37]" />
          <span className="text-base font-bold tracking-[0.15em] uppercase text-[#e0e8ff]">Mission Control</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#d4af37]">All Systems</span>
          </div>
          <span className="hidden sm:inline text-[9px] uppercase tracking-[0.12em] text-[#4a5580] border border-[rgba(212,175,55,0.1)] px-2 py-0.5 rounded">
            Cosmos Collective Hub
          </span>
        </div>
        <span className="hidden sm:block text-[9px] uppercase tracking-wider text-[#4a5580]">
          6 Modules Active
        </span>
      </div>

      {/* Stats Bar */}
      <div className="bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.08)] flex shrink-0">
        {infoPanels.map(({ label, value, color, popoverItems }) => (
          <StatPopover key={label} items={popoverItems} className="flex-1 border-r border-[rgba(212,175,55,0.06)] last:border-0">
            <div className="flex flex-col items-center px-6 lg:px-10 py-2">
              <span className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</span>
              <span className="text-[9px] uppercase tracking-[0.13em] text-[#4a5580] mt-0.5 whitespace-nowrap">{label}</span>
            </div>
          </StatPopover>
        ))}
      </div>

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-6xl mx-auto w-full">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#4a5580]">Available Modules</span>
          <div className="flex-1 h-px bg-[rgba(212,175,55,0.06)]" />
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(({ label, href, icon: Icon, badge, badgeColor, badgePulse, description, stat, color, glow }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(8,12,28,0.7)] overflow-hidden hover:border-[rgba(212,175,55,0.3)] transition-all duration-200 hover:bg-[rgba(8,12,28,0.9)] flex flex-col"
              style={{ '--glow': glow } as React.CSSProperties}
            >
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-[rgba(212,175,55,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="text-[13px] font-bold text-[#e0e8ff] uppercase tracking-[0.1em]">{label}</span>
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded"
                  style={{ background: `${badgeColor}18`, border: `1px solid ${badgeColor}28` }}
                >
                  {badgePulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badgeColor }} />}
                  <span className="text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: badgeColor }}>{badge}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4 py-3.5 flex-1 flex flex-col gap-2.5">
                <p className="text-[11px] text-[#6070a0] leading-relaxed">{description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.12em] text-[#4a5580]">{stat}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#4a5580] group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom info row */}
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {infoPanels.map(({ icon: Icon, label, detail, color, popoverItems }) => (
            <StatPopover key={label} items={popoverItems}>
              <div className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[rgba(8,12,28,0.5)] px-3.5 py-3 flex items-start gap-2.5 text-left">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${color}15`, border: `1px solid ${color}20` }}
                >
                  <Icon className="w-3 h-3" style={{ color }} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#c8d4f0]">{label}</div>
                  <div className="text-[9px] text-[#4a5580] mt-0.5 leading-relaxed">{detail}</div>
                </div>
              </div>
            </StatPopover>
          ))}
        </div>
      </main>
    </div>
  )
}
