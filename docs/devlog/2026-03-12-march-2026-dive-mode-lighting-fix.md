---
title: "March 2026: Fixing Dive Mode Lighting and Mobile Control Panel"
slug: march-2026-dive-mode-lighting-fix
date: 2026-03-12
category: architecture
tags: [Three.js, Lighting, Dive Mode, Mobile, Bug Fix]
author: "Developer"
reading_time: 4
excerpt: "Dive mode was overexposing the entire scene white — tracked down to a DirectionalLight illuminating all planets simultaneously. Fixed with calibrated ambient, exposure, and emissive values across all three entry and exit code paths."
---# March 2026: Fixing Dive Mode Lighting and Mobile Control Panel

## The Dive Whitewash Bug

Entering dive mode was turning every planet in the scene almost completely white. The investigation traced through three separate subsystems.

### Root Cause

The dive camera light (`diveCamLight`) was declared as a `DirectionalLight`. Unlike a `SpotLight` or `PointLight`, a DirectionalLight in Three.js has infinite reach and no falloff — it illuminates every surface in the scene equally. When `diveCamLight.intensity` was set to 1.5 and combined with the boosted ambient (`intensity = 1.2`) and a tone-mapping exposure of 3.0, every planet in the scene became blown out, not just the one being dived into.

### Fix

Recalibrated all three lighting parameters for dive entry:

```javascript
ambientLight.color.set(0x334466)  // cool tint, was white
ambientLight.intensity = 0.3      // was 1.2
diveFillLight.intensity = 0.15    // was 0.4
renderer.toneMappingExposure = 1.5 // was 3.0
diveCamLight.intensity = 0.55     // was 1.5
```

Also added a subtle emissive component to the target planet's material during dive (`emissive: 0x111122, emissiveIntensity: 0.1`) so it doesn't go dead-dark if the camera light undershoots.

### Three Exit Paths

The dive has three ways to end — user presses Escape, timer expires, or clicking away. All three were restoring ambient to stale pre-fix values (`0x333344 / 0.4`). All three were updated to the correct post-fix restoration values (`0x111122 / 0.15`).

## Mobile Control Panel Fix

The solar system control panel was not visible on initial mobile load. The panel's `display` state was managed via a CSS class that toggled on first scroll — but the scroll event never fired on touch devices because the canvas consumed all touch input. Fixed by initialising the panel as visible on viewport widths below 768px.

## API Cleanup

Removed three sources of console noise: next-auth 404s (routes were registered but the package was removed), React hydration mismatches in the APOD widget (server timestamp differed from client), and ESAWebb CORS errors (requests now go through the existing server-side proxy).
