---
title: "March 2026: Dwarf Planets, Dive Mode, JWST Deep Zoom, and Kepler 3D"
slug: march-2026-solar-system-feature-surge
date: 2026-03-11
category: visualization
tags: [Three.js, Solar System, JWST, Kepler, Dwarf Planets, Dive Mode]
author: "Developer"
reading_time: 7
featured: true
excerpt: "The biggest single-session solar system update yet — dwarf planets, dive mode lighting, a redesigned JWST viewer with multi-wavelength channels and deep zoom, a Hubble brightness slider, and an interactive Kepler system diagram."
---# March 2026: Dwarf Planets, Dive Mode, JWST Deep Zoom, and Kepler 3D

## Solar System: Six New Features

### Dwarf Planets

Pluto, Eris, Haumea, Makemake, and Ceres are now in the scene — correctly scaled, textured, and orbiting beyond Neptune. Haumea's elongated shape (it rotates so fast it's visibly oblate) is approximated with a scaled ellipsoid geometry. Pluto's moon Charon is also present and tidally locked.

### Dive Mode

Pressing **D** near a planet launches a cinematic dive sequence — the camera transitions from the orbital overview down through the planet's atmosphere to close orbit. A fill light attached to the camera illuminates the planet surface during the dive, and tone-mapping exposure adjusts to simulate the transition from black space to lit atmosphere.

Implementing this required adding a `DirectionalLight` tied to the dive camera position, separate from the scene's ambient lighting. The light uses `decay = 0` (no distance falloff) so it illuminates the planet regardless of its orbital position.

### Smoother Orbit Rings at Large Radii

Neptune's orbit ring was visibly faceted at 128 segments. All outer planet rings now use 256 segments, and a resolution-multiplier formula scales segment count with orbital radius. The change is imperceptible on inner planets and eliminates faceting on Neptune and the dwarf planet orbits.

## JWST Viewer: Deep Zoom and Wavelength Channels

The JWST viewer was rebuilt with two major improvements:

**Deep zoom** — a custom zoom/pan implementation on the canvas element, separate from the browser's native scroll, allowing magnification up to 8× without blurring. Implements momentum after pointer lift.

**Wavelength channels** — each JWST observation can now expose 2–4 wavelength composites side by side: NIRCam short, NIRCam long, MIRI mid-infrared, and in some cases NIRSpec. A channel switcher renders each composite at full resolution and cross-fades on selection. This makes it immediately obvious how different wavelength choices change what structures are visible in the same target.

## Hubble Brightness Slider

The Hubble image viewer gained a brightness/contrast adjustment slider — a CSS `filter: brightness()` + `contrast()` combination applied live to the image element. Useful for bringing out faint outer structures in galaxy images where the core would otherwise blow out.

## Kepler 3D Orbital Diagram

The Kepler exoplanet explorer at `/kepler` gained an interactive orbital system diagram. For any selected star, the diagram renders all confirmed planets as circles on scaled orbital paths, with period labels. Clicking a planet highlights it and shows its parameters (radius, mass, equilibrium temperature, insolation flux, habitable zone status).

The diagram uses SVG rather than canvas, which makes the orbital paths crisp at any DPI and makes hit-testing trivial.
