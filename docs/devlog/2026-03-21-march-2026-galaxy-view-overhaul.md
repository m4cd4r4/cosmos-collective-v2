---
title: "March 2026: Galaxy View Overhaul — Spiral Arms, Scientific Overlays, and Control Panel Redesign"
slug: march-2026-galaxy-view-overhaul
date: 2026-03-21
category: visualization
tags: [Three.js, Galaxy, Milky Way, Procedural, Canvas, Gaia, Kepler, GHZ]
author: "Developer"
reading_time: 8
featured: true
excerpt: "The galaxy view went from a particle blob to a scientifically grounded visualisation — logarithmic spiral arm particle distribution, procedural 2048px disk texture, Galactic Habitable Zone ring, Gaia census boundary, Kepler survey cone, Magellanic Clouds, and JWST/Hubble deep-field beams."
---# March 2026: Galaxy View Overhaul — Spiral Arms, Scientific Overlays, and Control Panel Redesign

## Control Panel: Simple / Advanced Modes

The solar system control panel accumulated ~20 controls across three sessions. The panel was restructured into two tiers:

- **Simple mode** (default) — speed slider, True Scale toggle, orbit ring toggle, planet labels
- **Advanced mode** — camera presets, asteroid belt, dive controls, grid, Milky Way toggle, particle density

A single chevron button switches between modes with a height-animated transition. This keeps the default experience uncluttered while making every option accessible.

## Galaxy View: Scientific Overlays

All six overlays are rendered inside `galaxyGroup` (the galaxy-scale Three.js group) and tagged with `userData` flags so `setGalaxyOpacity()` can fade them in and out with zoom-gated thresholds.

### Galactic Habitable Zone (GHZ)

A `RingGeometry(130, 330, 128)` ring at zero elevation, coloured `0x00eebb` with additive blending at 32% opacity. The GHZ represents the annular region of the galaxy where metallicity is high enough for rocky planet formation but radiation levels from the galactic centre are not prohibitive — estimated to be 25,000–33,000 light-years from the galactic centre. Our solar system sits comfortably within it.

The opacity was carefully calibrated: too high and the cyan ring washes out the warm tones of the galaxy texture (tested at 0.55 — too bright; settled at 0.32).

### Gaia Census Ring

A dashed `LineSegments` circle of radius 300 units (~30,000 light-years) centred on the Sun's position in the galaxy. Represents the rough extent of Gaia's precise astrometric measurements — 1.7 billion star positions, distances, and velocities.

The ring is constructed as 90 dashed segments (3 solid, 1 gap pattern), coloured `0x88ccff`. It fades in only at zoom ≥ 0.8×.

### Kepler Survey Cone

Kepler stared at a 115 square-degree patch of sky toward Cygnus for 9 years. The cone is rendered as a `CylinderGeometry(rFar, rNear, height, 24, 1, true)` (open-ended frustum shell) oriented via quaternion toward galactic coordinates l=76°, b=+13.5°. Inside the cone: 220 point particles representing individual confirmed exoplanet host stars, colour-coded blue-cyan.

A far-cap `CircleGeometry` marks the outer boundary of the survey field. The cone's 3D label reads "Kepler Survey Field — 5,000+ exoplanets found".

### Magellanic Clouds (LMC and SMC)

Placed at their actual galactic coordinates (LMC: l=280°, b=-33°, distance ~160,000 ly; SMC: l=303°, b=-44°, ~200,000 ly) but scaled to visible size in scene units. Each cloud is a `Points` object with 800–1,200 particles in a Gaussian distribution, coloured blue-white. Labelled "satellite galaxy (not to scale)" because at the galaxy's rendering scale they'd be invisible dots.

### JWST and Hubble Deep Field Beams

Two `Line` segments extend from the Sun's position at 210 units (~21,000 light-years) toward:
- **Hubble Ultra Deep Field** — galactic coordinates l=224°, b=-55°
- **JWST GOODS-South** — l=223°, b=-53°

Both point well out of the galactic plane toward intergalactic space, which is correct — deep fields are chosen to look through the minimum amount of galactic foreground dust.

## Galaxy Disk: Procedural Texture Replacement

The previous disk texture was a 1600×1600 JPEG (`milky_way_huge.jpg`). It was replaced with a 2048×2048 canvas-generated texture:

1. **Background glow** — radial gradient from warm orange-gold core to transparent edge
2. **Galactic bulge** — concentrated 255/248/210 white-gold bloom over the central 16% radius
3. **Central bar** — a rotated rectangle at galactic PA 62° (the Milky Way has a prominent bar ~27,000 ly long)
4. **Four spiral arms** — drawn as 280-step logarithmic spirals with `globalCompositeOperation: 'screen'`, each arm widening with radius
5. **120 HII region knots** — random bright dots along arm paths (50% blue-white 180/220/255, 50% warm 255/200/130)

The JPEG hi-res swap function (`loadGalaxyHiRes`) now no-ops, as the procedural texture is already higher quality than the JPEG it replaced.

## Particle Distribution: Logarithmic Spiral Arms

The previous 52,000 particles were distributed uniformly in a circle — giving the galaxy a blob appearance with no visible arm structure.

Replaced with 100,000 particles in three populations:

**65,000 arm stars** — distributed along four logarithmic spirals. Each particle is placed at a random progress `t ∈ [0, 1]` along the arm, at radius `r = innerR + pow(t, 0.6) * (outerR - innerR)` and angle `θ = armOffset + t * 4.5` radians. Perpendicular scatter increases with radius (arms flare outward). Colour: blue-white near outer edges, warming toward golden at inner radii.

**15,000 inter-arm stars** — older, redder population distributed uniformly in the disk at lower opacity.

**20,000 core stars** — highly centre-concentrated (`pow(random, 2.2)`), warm orange/golden HSL.

The result is a galaxy that shows clearly defined spiral structure from the default overview camera position.

## Bug Fixes

### Orbit Ring Bleed into Galaxy View

The galaxy view was calling `referenceGrid.visible = false` to hide the solar system, but planet orbit rings are stored in a separate `orbitRingLines` Map. Added `orbitRingLines.forEach(l => { l.visible = false })` to the galaxy entry transition and the inverse on exit.

### Zoom Direction

Galaxy zoom was panning toward the galactic centre (Sgr A*). Fixed: as zoom increases from 1× to 3.5×, `galaxyLookOffset` linearly interpolates from `(0, 0)` to the Sun's position in galaxy-local coordinates `(cos(SUN_GALACTIC_ANGLE) * SUN_GALACTIC_R, sin(SUN_GALACTIC_ANGLE) * SUN_GALACTIC_R)`. Zoom now brings the camera toward the Orion Arm.

### Dive Mode Lighting (Second Pass)

The dive mode whitewash bug (documented in the March 12 entry) had a second surface: when the galaxy view was active and the user pressed D, the dive lighting was still applying its old aggressive values to the galaxy scene. The dive entry path now checks `galaxyViewActive` before modifying ambient and exposure.
