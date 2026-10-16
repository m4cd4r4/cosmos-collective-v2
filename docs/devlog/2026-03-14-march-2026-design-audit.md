---
title: "March 2026: Full Design Audit — Accessibility, Performance, Data Density, UX"
slug: march-2026-design-audit
date: 2026-03-14
category: accessibility
tags: [WCAG, Accessibility, Performance, UX, Design, Lighthouse, ARIA]
author: "Developer"
reading_time: 6
excerpt: "A systematic pass across every page: WCAG AA colour contrast, keyboard navigation, ARIA labelling, reduced motion support, font optimisation, lazy loading, and data density improvements."
---# March 2026: Full Design Audit — Accessibility, Performance, Data Density, UX

## Accessibility

### Colour Contrast

Every text/background pair across the site was checked against WCAG AA (4.5:1 for body text, 3:1 for large text and UI components). The most common failure was mid-grey labels (`#6070a0`) on the dark `#0a0e1a` background — adjusted to `#8090c0` across the design system.

### Keyboard Navigation

Tab order was audited in every modal and overlay. The solar system control panel, JWST viewer, and galaxy info panel all now:
- Trap focus when open (Tab and Shift+Tab cycle within the component)
- Return focus to the trigger element on close
- Close on Escape key

### ARIA Labelling

Added `aria-label`, `aria-expanded`, `aria-controls`, and `role` attributes to all icon-only buttons. Interactive 3D components gained `aria-describedby` pointing to a visually hidden description of available keyboard controls.

### Reduced Motion

Users with `prefers-reduced-motion: reduce` now see static alternatives to:
- The shimmer badge animation on the landing hero
- The breathing vortex camera preset (falls back to a stationary overview)
- Particle opacity fade-in animations in the galaxy view

## Performance

### Font Subsetting

Inter and Space Grotesk were loading full variable font files (~280KB combined). Implemented subsetting to Latin characters only, cutting the combined weight to ~95KB.

### Image Lazy Loading

Below-fold images on the landing page and Explore grid switched to `loading="lazy"`. Hero images retain `priority` loading. The change cut initial page weight by ~400KB on the landing page.

### Component Code Splitting

The galaxy view, JWST viewer, and Kepler explorer are now dynamic imports with `{ ssr: false }`. This moves their Three.js and canvas dependencies out of the initial JS bundle, reducing first-load parse time on the solar system page.

## Data Density

### Compacted Info Panels

Info panels previously used 16px padding and large font sizes that felt appropriate for a dashboard but wasteful at the side of a 3D canvas. Padding reduced to 12px, font sizes tightened, line heights reduced from 1.8 to 1.5. More data visible without scrolling.

### Galaxy Info Panel Expansion

The galaxy info panel gained four new data rows: galactic bar length, number of known globular clusters, estimated dark matter halo radius, and the angular separation to Andromeda (M31).
