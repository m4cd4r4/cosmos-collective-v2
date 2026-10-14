---
title: "February 2026: JWST Catalogue Expanded to 85 Observations"
slug: february-2026-jwst-catalogue-expansion
date: 2026-02-23
category: data-integration
tags: [JWST, James Webb, NASA, Catalogue, NIRCam, MIRI, NIRSpec, Nebulae, Galaxies]
author: "Developer"
reading_time: 5
featured: true
excerpt: "The JWST Explorer catalogue grew from 14 to 85 observations — covering NIRCam, MIRI, and NIRSpec targets across nebulae, galaxies, star clusters, and planetary systems."
---# February 2026: JWST Catalogue Expanded to 85 Observations

The JWST Explorer launched with 14 curated observations. This week we expanded the catalogue to **85 confirmed JWST targets** — a 6× increase — spanning the full range of instruments and science categories that the James Webb Space Telescope has observed since its first science images in July 2022.

## What Changed

The catalogue lives in `src/services/mast-api.ts` as a static list of `Observation` objects. Each entry maps to a verified NASA image URL and carries rich metadata: instrument, wavelength band, object category, coordinates, and a short description.

Before this expansion, the explorer was dominated by the "greatest hits" — Carina Nebula, Pillars of Creation, the JWST First Deep Field. Accurate, but not representative of the breadth of Webb's science programme.

## New Additions by Category

### Nebulae (Star-Forming Regions)
Webb sees through dust clouds invisible to Hubble. Additions include the **Orion Nebula Bar** (a protoplanetary disk nursery), the **Tarantula Nebula 30 Doradus** in the Large Magellanic Cloud, **NGC 3324 Cosmic Cliffs**, and the **Chamaeleon I molecular cloud** — showing protostars still embedded in their birth clouds.

### Galaxies & Galaxy Groups
The extragalactic programme is where Webb truly shines in the mid-infrared. We added:
- **Cartwheel Galaxy** (MIRI composite — ring structure formed by a collision 440 million years ago)
- **Stephan's Quintet** (five interacting galaxies, one of the largest JWST images released)
- **NGC 7318** merger pair within Stephan's Quintet
- **Phantom Galaxy M74** (MIRI+HST composite, perfect face-on spiral)
- Multiple high-redshift galaxy candidates from the CEERS and PRIMER surveys

### Planetary Nebulae
The Southern Ring Nebula (NGC 3132) revealed a second faint companion star responsible for shaping the nebula — invisible to Hubble. Added both the NIRCam and MIRI versions as separate catalogue entries to illustrate how different wavelengths reveal different structures in the same object.

### Star Clusters & Stellar Evolution
Westerlund 1, NGC 346 in the SMC, and the dense Cosmic Cliffs ridge — regions where hundreds of young stellar objects are actively forming and can be counted individually for the first time.

### Solar System
Webb has observed solar system targets too: **Neptune's rings** (seen clearly for the first time since Voyager 2 in 1989) and **Jupiter's auroras** at the poles in NIRCam/F212N.

## Image Proxy Fix

Alongside the catalogue expansion, we fixed a production bug where the centre viewport of the JWST Explorer showed solid black. The root cause: plain `<img>` tags bypass Next.js's `image-loader.js` in production. Fix: route all image `src` attributes through `/api/image-proxy?url=...` in production builds, keeping direct URLs in development.

```tsx
const proxiedImageUrl = useMemo(() => {
  if (!currentImageUrl) return ''
  if (process.env.NODE_ENV === 'production') {
    return `/api/image-proxy?url=${encodeURIComponent(currentImageUrl)}`
  }
  return currentImageUrl
}, [currentImageUrl])
```

Loading and error states were also added — a spinner while the image loads and a fallback message if the NASA CDN is unreachable.

## Service Worker Precaching Fix

The Vercel deploy logs showed a service worker installation failure on every deploy:

```
workbox bad-precaching-response: _next/app-build-manifest.json returned 404
```

Next.js App Router generates `_next/app-build-manifest.json` as an internal build artefact — it's never publicly served. `next-pwa` was trying to precache it, causing the SW install to fail silently. Fix: add it (and related manifest files) to `buildExcludes` in `next.config.js`.

## What's Next

With 85 observations in the catalogue, the next step is making them discoverable. The Explore page already supports filtering by wavelength (infrared, visible, radio) — but JWST's power is in **multi-wavelength composites**. A side-by-side wavelength comparison mode would let users see the same target in NIRCam vs MIRI, showing how the instrument choice changes what's visible.
