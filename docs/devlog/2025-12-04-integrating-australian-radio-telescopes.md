---
title: "Integrating Australian Radio Telescope Data"
slug: integrating-australian-radio-telescopes
date: 2025-12-04
category: radio-astronomy
tags: [ASKAP, CASDA, TAP, Radio Astronomy, SKA]
author: "Developer"
reading_time: 10
excerpt: "How I connected to CASDA and the Australian SKA Pathfinder data archives to bring radio astronomy to the web."
---# Integrating Australian Radio Telescope Data

Australia hosts some of the world's most advanced radio astronomy facilities, and with the Square Kilometre Array (SKA) under construction, it's at the forefront of radio astronomy innovation. This post details how I integrated data from these facilities into Cosmos Collective.

## The Australian Radio Astronomy Landscape

Australia operates several major radio telescope facilities:

- **ASKAP** (Australian SKA Pathfinder) - 36 dish array in Western Australia
- **MWA** (Murchison Widefield Array) - Low-frequency aperture array
- **Parkes** (Murriyang) - The iconic 64m "Dish"
- **ATCA** (Australia Telescope Compact Array) - 6-antenna interferometer

These are SKA precursors, developing technologies that will eventually power the world's largest radio telescope.

## CASDA: The Gateway to Australian Radio Data

The CSIRO ASKAP Science Data Archive (CASDA) provides public access to radio astronomy data. It implements the Virtual Observatory (VO) standards, particularly TAP (Table Access Protocol).

### ADQL Queries

ADQL (Astronomical Data Query Language) is SQL-like but astronomy-specific:

```sql
SELECT TOP 100
  ra_deg_cont, dec_deg_cont,
  flux_peak, flux_int,
  source_name
FROM casda.continuum_component
WHERE flux_peak > 0.01
  AND quality_flag = 0
ORDER BY flux_peak DESC
```

### Implementation

```typescript
const CASDA_TAP_ENDPOINT = 'https://casda.csiro.au/casda_vo_tools/tap/sync'

export async function queryRadioSources(options: RadioQueryOptions) {
  const adql = buildADQL(options)

  const response = await fetch(
    `${CASDA_TAP_ENDPOINT}?${new URLSearchParams({
      query: adql,
      lang: 'ADQL',
      format: 'json',
    })}`
  )

  if (!response.ok) {
    throw new Error(`CASDA query failed: ${response.status}`)
  }

  const data = await response.json()
  return transformVOTableToSources(data)
}
```

## Understanding Radio Astronomy Data

Radio data differs fundamentally from optical:

| Aspect | Optical | Radio |
|--------|---------|-------|
| Resolution | High (subarcsec) | Variable (arcsec to arcmin) |
| Color | RGB composite | Intensity/contours |
| Sources | Stars, galaxies | Jets, pulsars, HII regions |
| Confusion | Rare | Common at low resolution |

### Flux Density

Radio sources are characterised by flux density (Jy or mJy):

- 1 Jy = 10⁻²⁶ W m⁻² Hz⁻¹
- Most EMU sources are 0.1-10 mJy

### Spectral Index

The spectral index α describes how flux varies with frequency:

S ∝ ν^α

- Steep spectrum (α < -0.5): typically synchrotron (AGN jets)
- Flat spectrum (α ≈ 0): compact cores
- Inverted (α > 0): self-absorbed or thermal

## The SKA Connection

The Square Kilometre Array will be transformative:

- 131,000 antennas (SKA-Low, WA)
- 197 dishes (SKA-Mid, South Africa)
- Sensitivity 50x better than any current telescope
- 1 million sources per hour survey speed

Building tools that work with SKA pathfinder data prepares us for the data deluge coming in the 2030s.

## Challenges Faced

### CORS and Authentication

CASDA's TAP service doesn't include CORS headers by default. Solutions:
1. Server-side API route proxy
2. CASDA's CORS-enabled endpoints for public data

### Data Volume

Radio catalogs contain millions of sources. Strategies:
- Server-side pagination
- Spatial indexing (HEALPix)
- Client-side virtualisation

### Visualisation

Radio images need different visualisation than optical:
- Logarithmic scaling
- Contour overlays
- Colour maps (viridis, plasma)

## Future Work

- Real-time pulsar timing displays
- Cross-matching radio/optical sources
- HI spectral line data visualisation
- Integration with SKA Regional Centres (when available)

Radio astronomy reveals a hidden universe of energetic phenomena. By making this data accessible through modern web interfaces, we can share these discoveries with everyone.
