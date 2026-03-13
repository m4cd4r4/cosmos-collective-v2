/**
 * Shared Mission Control data — used by the full page AND the floating action button
 */

import type { LucideIcon } from 'lucide-react'
import {
  Telescope,
  Calendar,
  LayoutDashboard,
  Radio,
  Satellite,
  Zap,
  Globe,
  Activity,
  Sun,
  Orbit,
  Hexagon,
} from 'lucide-react'
import type { StatPopoverItem } from '@/components/ui/StatPopover'

// ── Module tiles ────────────────────────────────────────────────────────────

export interface MissionControlTool {
  label: string
  href: string
  icon: LucideIcon
  badge: string
  badgeColor: string
  badgePulse?: boolean
  description: string
  stat: string
  color: string
  glow: string
}

export const TOOLS: MissionControlTool[] = [
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
    label: 'Solar System',
    href: '/solar-system',
    icon: Sun,
    badge: '8 PLANETS',
    badgeColor: '#f59e0b',
    description: 'Photorealistic 3D solar system with real orbital mechanics and an immersive Earth Dive experience.',
    stat: 'Planets · Moons · Orbits · Earth Dive',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.08)',
  },
  {
    label: 'Sky Map',
    href: '/sky-map',
    icon: Globe,
    badge: 'INTERACTIVE',
    badgeColor: '#8b5cf6',
    description: 'Real-time interactive sky atlas with multi-wavelength switching and constellation overlays.',
    stat: 'Aladin · Multi-wavelength · Constellations',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.08)',
  },
  {
    label: 'Kepler',
    href: '/kepler',
    icon: Orbit,
    badge: '2,600+ PLANETS',
    badgeColor: '#4a90e2',
    description: 'Interactive stellar field of 2,600+ confirmed Kepler exoplanets with HR diagrams and orbital viewers.',
    stat: 'Exoplanets · HR Diagram · Habitable Zone',
    color: '#4a90e2',
    glow: 'rgba(74,144,226,0.08)',
  },
  {
    label: 'JWST',
    href: '/jwst',
    icon: Hexagon,
    badge: 'DEEP SPACE',
    badgeColor: '#d4af37',
    description: 'James Webb Space Telescope observation explorer with NIRCam, MIRI, NIRSpec and NIRISS instruments.',
    stat: 'NIRCam · MIRI · NIRSpec · NIRISS',
    color: '#d4af37',
    glow: 'rgba(212,175,55,0.08)',
  },
]

// ── Popover data ────────────────────────────────────────────────────────────

export const DATA_SOURCE_ITEMS: StatPopoverItem[] = [
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

export const OBSERVATION_ITEMS: StatPopoverItem[] = [
  { label: 'JWST (NIRCam / MIRI)', url: 'https://webbtelescope.org/images', detail: '85 observations' },
  { label: 'Hubble (WFC3 / ACS)', url: 'https://hubblesite.org/images/gallery', detail: '18 observations' },
  { label: 'Radio (ASKAP / Parkes / ATCA)', url: 'https://www.csiro.au/en/about/facilities-collections/atnf', detail: '29 observations' },
]

export const WAVELENGTH_ITEMS: StatPopoverItem[] = [
  { label: 'Radio', detail: '> 1 mm — ASKAP, Parkes, MWA' },
  { label: 'Infrared', detail: '700 nm – 1 mm — JWST NIRCam & MIRI' },
  { label: 'Visible', detail: '400 – 700 nm — Hubble WFC3' },
  { label: 'Ultraviolet', detail: '10 – 400 nm — Hubble ACS' },
  { label: 'X-ray', detail: '0.01 – 10 nm — Chandra, XMM-Newton' },
]

export const COVERAGE_ITEMS: StatPopoverItem[] = [
  { label: 'JWST Deep Field', url: 'https://webbtelescope.org/', detail: 'Earliest galaxies, 13.1B+ ly' },
  { label: 'Hubble Ultra Deep Field', url: 'https://hubblesite.org/', detail: 'Deep-sky imaging, 13B+ ly' },
  { label: 'Kepler Field (Cygnus)', detail: '~920 ly average distance' },
  { label: 'Radio Sky', detail: 'All-sky coverage via ASKAP & MWA' },
]

// ── Info panels (stat badges) ───────────────────────────────────────────────

export interface InfoPanel {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  color: string
  popoverItems: StatPopoverItem[]
}

export const INFO_PANELS: InfoPanel[] = [
  {
    icon: Satellite,
    label: 'Live Data Sources',
    value: '11',
    detail: 'Space agencies feeding real-time data',
    color: '#d4af37',
    popoverItems: DATA_SOURCE_ITEMS,
  },
  {
    icon: Globe,
    label: 'Coverage',
    value: '13B+ ly',
    detail: 'Light years of observable universe',
    color: '#4a90e2',
    popoverItems: COVERAGE_ITEMS,
  },
  {
    icon: Activity,
    label: 'Observations',
    value: '132+',
    detail: 'Curated telescope observations',
    color: '#4caf93',
    popoverItems: OBSERVATION_ITEMS,
  },
  {
    icon: Zap,
    label: 'Wavelengths',
    value: '5',
    detail: 'Radio · Infrared · Visible · UV · X-ray',
    color: '#e040fb',
    popoverItems: WAVELENGTH_ITEMS,
  },
]
