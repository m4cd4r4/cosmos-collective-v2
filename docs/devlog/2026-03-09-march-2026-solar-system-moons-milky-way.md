---
title: "March 2026: Tidal Locking, True-Scale Moons, and the Milky Way Background"
slug: march-2026-solar-system-moons-milky-way
date: 2026-03-09
category: visualization
tags: [Three.js, Solar System, Moons, Milky Way, Texture, Tidal Lock]
author: "Developer"
reading_time: 5
excerpt: "All 13 moons now tidally lock to their planets, scale correctly with True Scale mode, and the solar system viewer gained a photorealistic Milky Way background with progressive 8K texture loading."
---# March 2026: Tidal Locking, True-Scale Moons, and the Milky Way Background

Three separate improvements landed in the solar system viewer this session, each addressing a physical accuracy or visual quality gap.

## Tidal Locking — All 13 Moons

A tidally locked body always shows the same face to its parent planet — the Moon is the most familiar example. All 13 moons in the solar system viewer now implement this behaviour.

The implementation rotates each moon around its own Y axis at the same angular rate as its orbital revolution, and applies a `lookAt` correction each frame to compensate for Three.js's coordinate conventions. The result is that Io, Europa, Ganymede, Callisto, Titan, and the rest always present their correct hemisphere toward their parent.

## True-Scale Moon Sizes

When the **True Scale** toggle is active, planet radii now scale to physical proportions. Moon radii previously defaulted to a fixed presentational size regardless of this toggle. They now follow the same scale factor — so Ganymede (larger than Mercury) appears noticeably bigger than the Moon when True Scale is enabled, and Deimos appears tiny compared to Phobos.

## Collapsible Control Panels

The solar system control panel previously loaded fully expanded, occupying a significant portion of the viewport on first load. Panels now collapse by default with a smooth slide animation. This gives the 3D canvas more breathing room and reduces visual overwhelm on first visit.

## Milky Way Background Sphere

The deep-space black background was replaced with a photorealistic Milky Way band. The implementation uses an equirectangular map projected onto a large sphere surrounding the solar system, oriented to match the actual galactic plane position relative to Earth's ecliptic.

Progressive loading strategy:
- A 2K texture loads immediately (fast, low bandwidth cost)
- On good network connections (effective type `4g`), an 8K upgrade swaps in silently after the scene stabilises

The sphere is camera-tracked — it follows the camera position so the background never tiles or repeats as the camera moves through the solar system. A `toggle-milky-way` button lets users switch it off if they prefer the original black void.
