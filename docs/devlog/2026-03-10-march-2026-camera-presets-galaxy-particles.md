---
title: "March 2026: Camera Presets, Novel Orbit Paths, and Galaxy View Particles"
slug: march-2026-camera-presets-galaxy-particles
date: 2026-03-10
category: visualization
tags: [Three.js, Camera, Presets, Galaxy, Particles, Cinematic]
author: "Developer"
reading_time: 6
excerpt: "Six new camera presets give the solar system distinct cinematic personalities — lemniscate, satellite drift, breathing vortex, immersive chase, Surfboard, and Helix — plus the galaxy view gained a full particle system with halo, core bloom, and 52,000 stars."
---# March 2026: Camera Presets, Novel Orbit Paths, and Galaxy View Particles

## Six New Camera Presets

The camera system already had basic orbit controls. This update added six distinct presets that each give the viewer a fundamentally different feel:

| Preset | Motion | Character |
|--------|--------|-----------|
| **Cinema** | Lemniscate (figure-eight) path, 60° elevation | Sweeping cinematic orbit |
| **Satellite** | Top-down drift, low altitude | Engineering overview |
| **Breathing Vortex** | Spiral in/out with pulsing FOV | Hypnotic, meditative |
| **Immersive Chase** | Close behind planet, FOV 85° | Action-camera energy |
| **Surfboard** | Flat lateral slide across the ecliptic | Unique side-on perspective |
| **Helix** | Helical path along the orbital axis | DNA-like motion |

Each preset defines its own `update(t)` function called each animation frame, modifying camera position, look-at target, and field-of-view. Transitions between presets use a 2-second lerp to avoid jarring cuts.

## Aladin Lite WebAssembly CSP Fix

The sky-map view embeds Aladin Lite for interactive HiPS sky surveys. Aladin compiles critical path-finding code to WebAssembly at runtime. The Content Security Policy was blocking this with:

```
Refused to compile or instantiate WebAssembly module because 'wasm-unsafe-eval' is not allowed
```

Fix: add `wasm-unsafe-eval` to the `script-src` CSP directive specifically for the sky-map route. Elsewhere the directive remains strict.

## Galaxy View Particle System

The galaxy view existed as a flat disk with a JPEG texture. Three canvas-drawn procedural meshes were added on top:

- **Stellar halo** — a 512×512 radial gradient plane (5.5× galaxy diameter) giving the soft violet glow of the old stellar population
- **Core bloom** — a 256×256 concentrated warm gradient centred on Sagittarius A*, simulating the dense bulge luminosity
- **Edge glow** — a narrow tilted plane perpendicular to the disk, giving the galaxy apparent thickness when viewed at low elevation angles

On top of the meshes: **40,000 disk star particles** (blue-white, HSL 0.6–0.7) plus **12,000 brighter core particles** (orange/golden, HSL 0.12). Both sets use an additive blending point material with a soft radial canvas texture so individual points render as glowing circles rather than hard squares.
