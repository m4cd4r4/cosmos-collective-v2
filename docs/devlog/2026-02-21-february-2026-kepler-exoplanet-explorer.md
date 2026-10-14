---
title: "February 2026: Kepler Exoplanet Explorer"
slug: february-2026-kepler-exoplanet-explorer
date: 2026-02-21
category: data-integration
tags: [Kepler, Exoplanets, NASA, Canvas, Star Field, Habitable Zone, HR Diagram, TAP API]
author: "Developer"
reading_time: 6
featured: true
excerpt: "A live star field of 2,600+ confirmed exoplanets from NASA's Kepler mission — colour-coded by stellar temperature, filterable by planet size and habitable zone, with orbital system diagrams and an HR diagram mode."
---# February 2026: Kepler Exoplanet Explorer

The Kepler Space Telescope operated from 2009 to 2018, staring at a single patch of sky in the Cygnus constellation and recording the brightness of over 150,000 stars every 30 minutes. When a planet crossed in front of its host star, the starlight dimmed slightly — a transit. By the end of the mission, Kepler had confirmed **2,600+ exoplanets**, revolutionising our understanding of how common planetary systems are.

The new Kepler Explorer at `/kepler` makes this dataset interactive.

## Data Source: NASA Exoplanet Archive TAP API

All data is fetched live from the **NASA Exoplanet Archive** via their Table Access Protocol (TAP) endpoint. No static JSON, no stale snapshots — every load pulls the current confirmed planet table and filters it to Kepler discoveries.

```
https://exoplanetarchive.ipac.caltech.edu/TAP/sync?
  QUERY=SELECT+pl_name,hostname,pl_rade,pl_orbper,pl_eqt,pl_bmasse,
        pl_insol,pl_orbsmax,st_teff,st_rad,st_mass,st_lum,sy_dist,
        ra,dec,sy_pnum,disc_year
  +FROM+pscomppars
  +WHERE+disc_facility+like+%27Kepler%27
  +AND+pl_controv_flag=0
  &FORMAT=json
```

A Next.js API route at `/api/proxy/kepler` handles the fetch server-side, avoiding CORS issues and caching the response.

If the live API is unreachable, the viewer falls back to 11 sample planets across 5 famous systems (Kepler-22, Kepler-186, Kepler-452, Kepler-442, Kepler-62) so the interface is never empty.

## The Star Field Canvas

The main view renders the Kepler field-of-view (a ~115 square degree region in Cygnus, roughly centred at RA 290°, Dec 44°) as a **Canvas 2D star field**. Each dot represents a host star with at least one confirmed planet.

### Colour-Coding by Stellar Temperature

Stars aren't white — their colour tells you their surface temperature and spectral type. The canvas maps effective temperature (`st_teff`) to the same colour scale used by astronomers:

| Temperature | Spectral Type | Colour |
|-------------|---------------|--------|
| < 3,500 K   | M dwarf       | Deep orange-red |
| 3,500–5,000 K | K dwarf     | Amber-orange |
| 5,000–6,000 K | G (Sun-like) | Pale yellow |
| 6,000–7,500 K | F dwarf      | Yellow-white |
| > 7,500 K   | A dwarf       | Blue-white |

Hover over any star to see the host name, number of planets, temperature, and distance in parsecs. Click to open the orbital system diagram.

## Filters

The left sidebar exposes six independent filters that compose with each other:

- **Search** — planet or star name substring match
- **View Mode** — Sky (2D field), Galaxy (position in Milky Way context), HR Diagram
- **Planet Size** — Earth, Super-Earth (1.25–2 R⊕), Neptune-class (2–6 R⊕), Jupiter-class (> 6 R⊕)
- **Stellar Temperature** — Cool M/K, Sun-like G, Hot F/A
- **Max Orbital Period** — slider from 1 to 730 days (two Earth years)
- **Habitable Zone** — filter to only show systems with a planet receiving 0.2–2× Earth's insolation flux

The stats bar at the top updates live as filters change: confirmed planets, host stars, multi-planet systems, Earth-sized planets (≤ 1.5 R⊕), and planets in the habitable zone.

## Orbital System Diagram

Clicking a star opens a panel on the right showing all planets in that system arranged as concentric orbits. Planet size is proportional to radius, and the habitable zone is shaded in green. For famous systems like Kepler-186 (five planets, one in the HZ), this is immediately legible.

## HR Diagram Mode

Switch to HR Diagram mode and the canvas redraws as a **Hertzsprung-Russell diagram** — luminosity (y-axis) vs. temperature (x-axis). Host stars cluster along the main sequence. Red giants and subgiants that Kepler also observed fall in the expected upper-right region. It's the same dataset, but a completely different lens: from "where are these stars in the sky?" to "what kind of stars are they?".

## Galaxy View

The third view mode shows the Kepler field of view in galactic context — a representation of the Milky Way disc with the 10° × 10° Kepler field highlighted in Cygnus, roughly 1–3 kiloparsecs from the Sun. This gives a sense of how narrow Kepler's stare was: one tiny window into the galaxy, 150,000 stars, nine years.

## Performance

The planet table for Kepler returns ~2,600 rows of JSON. Grouping by host star (to build the `StarSystem[]` array for the canvas), computing habitable zone membership, and calculating spectral categories all happen client-side in a single `useMemo`. On a modern machine this resolves in < 5ms; on slower devices it's still < 30ms. The canvas itself renders in a single `drawFrame()` call — no per-planet React state, no virtual DOM overhead.
