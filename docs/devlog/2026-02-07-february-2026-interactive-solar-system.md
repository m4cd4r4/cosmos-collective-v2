---
title: "February 2026: Interactive 3D Solar System Hero"
slug: february-2026-interactive-solar-system
date: 2026-02-07
category: visualization
tags: [Three.js, WebGL, Solar System, 3D, Hero, Galaxy View, NASA, Animation]
author: "Developer"
reading_time: 7
featured: true
excerpt: "Replacing the static hero with a real-time WebGL solar system built with Three.js — orbiting planets, Galaxy View zoom-out, and a dismissible overlay for the best of both worlds."
---# February 2026: Interactive 3D Solar System Hero

The homepage hero section has been completely reimagined. Instead of a static image with overlaid text, visitors now land on a **real-time 3D solar system** rendered with Three.js and WebGL. The planets orbit the Sun in accurate proportions, and the entire experience is interactive — drag to rotate, scroll to zoom, click planets to learn about them.

## Why a Solar System?

Cosmos Collective is about making the universe accessible. What better first impression than putting the solar system itself in your hands? The hero is the first thing visitors see, and an interactive 3D experience immediately communicates that this isn't a static gallery — it's a living, explorable universe.

## Architecture: Iframe Isolation

The solar system runs as a standalone HTML/Three.js app embedded via iframe:

```tsx
<iframe
  src="/solar-system/index.html"
  title="Interactive 3D Solar System"
  className="absolute inset-0 w-full h-full border-0"
  style={{ zIndex: 1, background: '#000' }}
  loading="eager"
  allow="fullscreen"
/>
```

**Why an iframe?** Three.js scenes with continuous `requestAnimationFrame` loops can interfere with React's rendering lifecycle. Iframe isolation means:
- The WebGL context doesn't compete with React's DOM updates
- The solar system can be developed and tested independently
- Service worker conflicts are avoided (we unregister any SW inside the iframe)
- The 3D scene keeps running smoothly while React handles the overlay

### CSP Configuration

Three.js loads from CDN, so we added `cdnjs.cloudflare.com` to the Content Security Policy to allow the script to execute within the iframe.

## The Dismissible Overlay Pattern

The hero needed to serve two audiences: first-time visitors who need context, and returning users who want to interact with the solar system directly. The solution is a **timed dismissible overlay**:

1. The solar system starts rendering immediately
2. After 5 seconds, a glass-panel card fades in with the site title, description, CTAs, and animated stats
3. Users can dismiss the card by clicking outside, pressing Escape, or hitting the X button
4. Once dismissed, the full solar system is interactive
5. A hide/show toggle lets users bring the overlay back or hide it entirely

```typescript
useEffect(() => {
  const timer = setTimeout(() => setCardRevealed(true), 5000)
  return () => clearTimeout(timer)
}, [])
```

## Solar System Features

### Planetary Orbits
All 8 planets orbit the Sun with proportionally scaled orbital speeds. Mercury zips around while Neptune barely moves — accurate to real ratios (though distances are compressed for visual appeal).

### Interactive Controls
- **Drag** to rotate the camera around the system
- **Scroll** to zoom in/out
- **Speed slider** to control orbital velocity (0.1x to 10x)
- **Follow mode** — lock the camera to follow a specific planet
- **Orbital trails** — toggle visible orbit paths
- **Vortex mode** — artistic spiral trail effect

### Galaxy View
On Feb 19, we added a "Galaxy View" — zoom all the way out and the scene transitions to a NASA/JPL-Caltech Milky Way illustration with a pulsing "You Are Here" marker showing our solar system's position in the galaxy. This gives visitors a sense of cosmic scale.

### Earth Date Counter
A real-time counter shows the current Earth date alongside the simulation, grounding the abstract orbital mechanics in something familiar.

## Mobile Responsiveness

Three.js WebGL on mobile presented challenges:
- **Touch events** — mapped to orbit controls (one finger = rotate, pinch = zoom)
- **Performance** — reduced particle count and simplified shaders for mobile GPUs
- **Viewport** — ensured the iframe fills the viewport correctly on all screen sizes
- **Slider controls** — added large arrow buttons for easier mobile interaction

This was addressed in PR #13 (merged Feb 16).

## Debugging Journey

Getting the solar system to render reliably across browsers took several iterations:

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Black screen on some browsers | Iframe sandbox attribute blocked WebGL | Removed `sandbox` attribute |
| Solar system not loading | Service worker from parent interfered | Unregister SW inside iframe |
| Planets drifting off-screen | Delta time accumulation during tab sleep | Clamped max frame delta |
| White flash on load | Iframe background not set | Added `background: #000` inline style |
| Controls unresponsive after overlay | Event listeners consumed by React overlay | `pointer-events-none` on backdrop after dismiss |

The 5-second failsafe overlay hide was added as a safety net — if the card somehow fails to appear, the solar system remains fully interactive.

## Performance

| Metric | Value |
|--------|-------|
| Initial bundle (iframe) | ~180KB gzipped (Three.js + scene) |
| Frame rate | 60fps on desktop, 30-45fps on mobile |
| Memory | ~50MB GPU, ~30MB heap |
| Load time | < 2s on broadband, WebGL context ready |
| Impact on React app | Zero — fully isolated in iframe |

## What's Next

The solar system hero sets the stage for deeper interactive experiences throughout the site. Since Feb 7, we've added:
- Deep Space Observatory with Canvas 2D wavelength viewer
- ISS world map tracking across multiple pages
- Animated SKA timeline and comparison bars
- NEO approach diagrams on the Events page
- Meteor radiant overlays on the Sky Map

The solar system was the proof that interactive, data-rich visualisations belong at the core of Cosmos Collective — not as decoration, but as the primary way people explore the universe.
