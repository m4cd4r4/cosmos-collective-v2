# Explore redesign: from image directory to an app that opens on awe

Status: slice 1 next (2026-10-17). Owner: Macdara. Route: `/explore`.

## Problem (looked at, 1440px, 2026-10-17)
The first screen is controls: header, view tabs, stats bar, search box and three filter rows. The first image row appears at the bottom edge. Two tiles ("Solar Radio Bursts", "Meteor Radar Detection") show the same nebula thumbnail, which breaks the "real data" principle.

## Goal
Open on a full-bleed, moving, real astronomical image. Filters and the directory remain, but as secondary, compact controls. Dark-first, glass panels, gold accent, reduced-motion respected, WCAG 2.1 AA.

## Slices (one PR each, each visible in the browser)
1. **Cinematic opening.** Full-bleed slideshow at the top of `/explore`: slow crossfade and drift, name, telescope, one-line caption, "Explore this" button. Pause on hover and focus; reduced-motion gets a static image. No filters above it. Fix the duplicate thumbnails here.
2. **Rails.** Horizontally scrolling rows (Nebulae, Galaxies, Exoplanets, Radio, Newest) of large image cards, keyboard and swipe scrollable.
3. **Compact controls.** One sticky chip row plus a search icon. The existing grid stays under "Browse all".
4. **Viewer.** Full-screen viewer (build on `ObservationViewer.tsx`): zoom, swipe or arrow to next and previous, info in a drawer.

## Constraints
- Data: the existing 132 curated observations (`getFeaturedJWSTImages`, `getFeaturedHubbleImages`, `getFeaturedRadioObservations`). No fake images; a tile with no real image is dropped from the hero and rails, not given a stand-in.
- Performance: first slide uses `next/image` with `priority`; preload the next; others lazy. Target LCP under 2.5 s on the first slide.
- Keep `?view=webb` and the filter query params working (old links must not break).
- Mobile: one hero, bottom tab bar clear (`pb-20`), no horizontal page scroll.

## Verification per slice
Screenshots at 1440 and 390, read by eye; `npx tsc --noEmit`; `npm run lint`; Lighthouse or PSI LCP on the first slide; keyboard tab through the hero; reduced-motion check.

## Key files
- `src/app/explore/page.tsx`
- `src/components/features/explore/{ExploreGallery,ExploreFilters,ExploreSearch,ObservationViewer,ObservationInfo}.tsx`
- `src/services/mast-api.ts`, `src/services/australian-telescopes.ts`

## Out of scope here
Satellite 3D models (separate plan: NASA ISS and generic `.glb`, licences to verify first; no real Starlink model found).
