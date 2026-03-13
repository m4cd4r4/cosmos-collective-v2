# Cosmos Collective v2 - Full Design & UX Audit Report

**Date:** 2026-03-13
**Auditors:** 8 specialist AI agents (Frontend Dev, UX Researcher, UI Designer x2, Accessibility Auditor, UX Architect, Code Reviewer)
**Skills covered:** /teach-impeccable, /frontend-design, /critique, /bolder, /quieter, /colorize, /animate, /delight, /clarify, /harden, /onboard, /normalize, /distill, /extract, /polish, /adapt, /optimize + bug hunt
**Files analyzed:** 70+ source files across all directories
**Overall score:** 7.9/10 (B+) - Production-quality with specific areas needing attention

---

## Executive Summary

Cosmos Collective v2 is a well-architected, visually polished astronomy platform. The design system foundations are strong (astronomy-authentic colors, glassmorphism, consistent typography). The main issues cluster into 5 themes:

1. **Broken/stale data** - Missing placeholder images, hardcoded 2025 astronomical dates serving wrong data in 2026, stale GCN circular IDs
2. **No onboarding** - Zero first-visit guidance on complex features (JWST, Kepler). Scientific jargon unexplained.
3. **Mobile gaps** - Canvas components lack touch support, hero iframe not responsive, 3 pages missing bottom nav padding
4. **Design token bypass** - 351 hardcoded hex colors across feature components instead of using the Tailwind theme
5. **Accessibility blockers** - Canvas visualizations are mouse-only, no `<main>` landmark, skip link target not focusable

---

## CRITICAL ISSUES (Fix immediately)

### BUG-01: Missing placeholder images (404s in production)
**File:** `src/services/nasa-images.ts:262-263`
`/images/loading-placeholder.svg` and `/images/error-placeholder.svg` referenced but don't exist on disk. Any component falling back to these shows a broken image.

### BUG-02: 2025 astronomical dates served as 2026 data
**File:** `src/services/real-time-events.ts:400-422`
Lunar events, eclipses, and planetary conjunctions are hardcoded for 2025 with naive year string-replace for other years. Users see astronomically incorrect dates for full moons, eclipses, and conjunctions in 2026.

### BUG-03: GCN proxy serving only fallback data
**File:** `src/app/api/proxy/gcn/route.ts:52`
Hardcoded `estimatedLatest = 43010` (from Dec 2025) means the proxy can't find current circulars and falls back to stale data. The real ID is likely 1000+ higher now.

### ACC-01: Canvas visualizations inaccessible
**Files:** `src/components/features/kepler/StarCanvas.tsx`, `src/components/features/observatory/ObservatoryCanvas.tsx`
Mouse-only interaction (onMouseMove, onClick). No keyboard navigation, no touch events, no screen reader access. WCAG 2.1 AA cannot be claimed for these pages.

### ACC-02: No `<main>` landmark + skip link broken
**File:** `src/app/layout.tsx`
The `#main-content` div is a `<div>`, not `<main>`. The skip link (`SkipToContent.tsx`) targets `#main-content` but divs aren't natively focusable - the skip link doesn't actually move focus.

---

## HIGH PRIORITY (Should fix soon)

### RESPONSIVE: Hero iframe not mobile-adapted
**File:** `src/components/features/landing/LandingHero.tsx:42`
`style={{ width: '75vw', height: '62vh' }}` with no breakpoints. Loads full Three.js + 11MB of planetary textures on mobile (pointer-events-none, so it's purely decorative). Replace with static image/poster on mobile.

### RESPONSIVE: 3 pages missing mobile bottom nav padding
**Files:** `src/app/kepler/page.tsx:47`, `src/app/jwst/page.tsx:47`, `src/app/observatory/page.tsx:54`
Height calc is `100vh - 64px` (header only). Mobile bottom nav is 64px. Content clipped behind it. Need `pb-16 lg:pb-0`.

### RESPONSIVE: Canvas components lack touch support
**Files:** `StarCanvas.tsx:196-211`, `ObservatoryCanvas.tsx:171-186`
Only mouse events. No touch handlers. Hit targets too small (14-18px vs 44px WCAG minimum).

### PERF: TypeScript/ESLint errors suppressed in build
**File:** `next.config.js:117-118`
`ignoreBuildErrors: true` and `ignoreDuringBuilds: true` mask potential runtime errors. Should be fixed and re-enabled.

### PERF: Canvas recomputes positions every frame (O(n^2))
**File:** `src/components/features/kepler/StarCanvas.tsx:82`
`computePositions()` runs inside every animation frame for 2,600+ stars. `stars.indexOf(s)` inside draw loop makes it O(n^2). Only needs recalculating on resize/view change.

### BUG-04: Sitemap missing major routes
**File:** `src/app/sitemap.ts`
Missing: `/jwst`, `/solar-system`, `/observatory`, `/mission-control`, `/credits`, `/privacy`, `/terms`, `/accessibility`. Two primary nav pages absent from sitemap.

### BUG-05: NASA API key exposed client-side
**File:** `src/services/real-time-events.ts:13`
`NEXT_PUBLIC_NASA_API_KEY` bundled into client JS. Should use server-side proxy like existing Kepler/ALeRCE proxies.

### SECURITY: Rate limiter defined but never wired
**File:** `src/lib/rate-limit.ts`
Rate limiting utility exists but no API route handler imports or uses it. All API routes are unprotected.

### SECURITY: CSP uses `unsafe-inline`
**File:** `src/middleware.ts`
Content Security Policy includes `unsafe-inline` for styles in production. Security headers also skip all API routes entirely.

---

## MEDIUM PRIORITY (Polish items)

### ONBOARD: Zero first-visit guidance
No onboarding tooltips, guided tours, or first-visit overlays anywhere. Users land on complex features (JWST 3-column viewer, Kepler spectral filters) with no explanation. Add dismissible intro panels stored in localStorage.

### CLARITY: Scientific jargon unexplained
| Term | Location | Fix |
|------|----------|-----|
| NIRCam, MIRI, NIRSpec, NIRISS | JWST filters | Expand on first use: "NIRCam (Near-Infrared Camera)" |
| Cool M/K, Sun-like G, Hot F/A | Kepler filters | Add tooltip: "M and K type stars are cooler and redder" |
| HR Diagram | Kepler view mode | "HR Diagram (Star brightness vs temperature)" |
| Aitoff chart | Feature showcase | "All-sky projection map" |
| W/m^2 | Solar weather | Add unit label tooltip |

### CLARITY: "JWST" opaque in mobile nav
Mobile bottom nav shows "JWST" with no expansion. Change to "Webb" or "Webb Telescope".

### CLARITY: Mission Control hub missing 3 features
**File:** `src/app/mission-control/page.tsx`
Only shows Explore, Live Events, Observatory, Dashboard. Missing Solar System, Sky Map, Kepler, JWST from the hub tiles.

### CLARITY: "Modules" developer jargon
**File:** `src/components/features/landing/FeatureShowcase.tsx:65`
Section label "Modules" should be "Features" or "Experiences".

### BOLDER: Landing hero headline undersized
**File:** `src/components/features/landing/LandingHero.tsx:28`
H1 caps at `lg:text-5xl` (48px) for a full-viewport hero. Scale to `lg:text-6xl xl:text-7xl`. Subtitle at `text-xs sm:text-sm` is barely legible - increase to `sm:text-base`.

### BOLDER: Nebula glow overlays nearly invisible
**File:** `LandingHero.tsx:12`
Gold glow at `rgba(212,175,55,0.03)` - 3% opacity is imperceptible. Increase to 6-8%.

### QUIETER: FAB ping animation runs indefinitely
**File:** `src/components/ui/MissionControlFAB.tsx:89`
`animate-ping` with 3s duration pulses forever. Limit to 3-5 iterations then stop.

### CODE: 351 hardcoded hex colors bypass design system
Feature components use raw hex (`#0a0e1a`, `#d4af37`, `#4a90e2`) instead of Tailwind tokens. Create a shared `src/lib/design-tokens.ts` for canvas components.

### CODE: 3 files exceed 500 lines
| File | Lines | Action |
|------|-------|--------|
| JWSTViewer.tsx | 948 | Split into Gallery, ImageViewer, FilterBar, useJWSTViewer hook |
| mast-api.ts | 2,453 | Move static observation data to JSON files |
| real-time-events.ts | 1,063 | Move static calendar data to `src/data/` |

### CODE: 5 duplicate utility functions
| Function | Copies | Files |
|----------|--------|-------|
| `formatCountdown()` | 3 | EventsTimeline, DashboardContent, LiveEventsWidget |
| `getEventIcon()` | 2 | events/page, EventsTimeline (different icons!) |
| `getSeverityColor()` | 2 | events/page, EventsTimeline (different signatures!) |
| `severityOrder` | 2 | real-time-events, LiveEventsBar |
| `mjdToDate()` | 2 | alerce/route, mast-api |

Extract to shared `src/lib/event-utils.ts` and `src/lib/astronomy-utils.ts`.

### BUG-06: Memory leak in PWAProvider
**File:** `src/components/PWAProvider.tsx:28-30`
`setInterval` created but interval ID never captured or cleared in useEffect cleanup.

### BUG-07: Kepler proxy has no fallback data
**File:** `src/app/api/proxy/kepler/route.ts:32-38`
Returns raw 502 when NASA TAP API is down. ALeRCE and GCN proxies handle this with fallback data.

### BUG-08: Stale rocket launch data
**File:** `src/services/real-time-events.ts:607-655`
Hardcoded 2025 launches (Artemis II, Europa Clipper). All in the past. Dead code.

---

## LOW PRIORITY (Nice to have)

- **PERF:** Starfield canvas runs continuous animation on all pages including data-heavy ones
- **PERF:** Dashboard hook triggers 7+ state updates on mount, UTC clock re-renders all children every second
- **PERF:** Canvas components don't check `prefers-reduced-motion`
- **POLISH:** PWA install prompt triggers immediately - add 30s delay or scroll-depth trigger
- **POLISH:** Solar System hero iframe has `pointer-events-none` but looks interactive - add visible CTA without hover
- **POLISH:** Privacy/Terms show "Last updated: Dec 7, 2025" - stale
- **POLISH:** Error pages (root, explore) should add troubleshooting tips like sky-map error page does
- **POLISH:** Nav item descriptions exist in data but never rendered as visible tooltips
- **CODE:** 5 production `console.log` statements (PWAProvider, WebVitals, Sentry)
- **CODE:** 15 `any` type usages (mostly Aladin Lite external library casts)
- **CODE:** `imoSlug` variable computed but never used in real-time-events.ts:673
- **CODE:** GA measurement ID hardcoded instead of env var
- **CODE:** Aladin Lite type declarations duplicated across 4 sky map components

---

## WHAT'S WORKING WELL

- **Design system foundations** - Astronomy-authentic color palette with real-science rationale. Glass panels, glow shadows, grain textures create a cohesive telescope aesthetic.
- **Error boundaries** - Every major route has a custom error page with contextual recovery options. Sky Map error includes troubleshooting steps.
- **Loading states** - Thematic loading messages ("Acquiring signal...", "Reading sensors..."). Full skeleton UIs for Sky Map and Explore.
- **Service worker caching** - Tiered strategy (CacheFirst for assets, NetworkFirst for APIs) with appropriate TTLs.
- **Dynamic imports** - All heavy components (Three.js, Leaflet, Aladin) are properly lazy-loaded with SSR disabled.
- **Font loading** - display:swap on all 3 fonts prevents FOIT.
- **Image optimization** - AVIF/WebP formats, NASA image proxy with retry, proper fallback chains.
- **Viewport config** - `userScalable: true`, `maximumScale: 5`, `viewportFit: cover` - all correct.
- **Safe area support** - Notched device padding on mobile bottom nav.
- **Accessibility infrastructure** - Focus rings, reduced motion in CSS, live announcer region, skip link (needs fix), high contrast overrides.
- **Data-dense page restraint** - Kepler and Observatory viewers show excellent visual discipline. Chrome stays out of the way.

---

## RECOMMENDED FIX ORDER

**Week 1 - Critical bugs + accessibility blockers:**
1. Create missing placeholder SVGs
2. Fix 2026 astronomical data (or add 2026 data set)
3. Fix GCN proxy to discover latest circular ID
4. Change `<div id="main-content">` to `<main id="main-content" tabIndex={-1}>`
5. Add touch events to canvas components
6. Add `pb-16 lg:pb-0` to Kepler, JWST, Observatory pages

**Week 2 - Performance + security:**
7. Replace hero iframe with static poster on mobile
8. Move `computePositions()` out of animation frame loop
9. Wire rate limiter into API routes
10. Move NASA API key to server-side proxy
11. Fix CSP to remove `unsafe-inline` where possible
12. Re-enable TypeScript/ESLint build checks

**Week 3 - Onboarding + clarity:**
13. Add dismissible first-visit intro panels to JWST and Kepler
14. Expand scientific abbreviations (NIRCam, MIRI, spectral classes)
15. Add missing features to Mission Control hub
16. Scale up hero headline and nebula glows
17. Fix FAB ping to limited iterations

**Week 4 - Code quality:**
18. Extract duplicate utilities to shared modules
19. Create design-tokens.ts for canvas components
20. Split oversized files (JWSTViewer, mast-api, real-time-events)
21. Add sitemap entries for missing routes
22. Clean up production console.log statements
