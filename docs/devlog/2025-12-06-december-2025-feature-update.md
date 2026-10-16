---
title: "December 2025: ISS Cameras, Expanded Gallery & UI Polish"
slug: december-2025-feature-update
date: 2025-12-06
category: architecture
tags: [Features, ISS, Hubble, Citizen Science, Accessibility]
author: "Developer"
reading_time: 6
excerpt: "Major feature update adding live ISS camera feeds, expanded telescope observations, real images in Citizen Science, and significant UI/UX improvements."
---# December 2025: ISS Cameras, Expanded Gallery & UI Polish

This update brings several exciting new features and improvements to Cosmos Collective, including live ISS camera feeds, expanded telescope coverage, and a streamlined user interface.

## ISS Live Cameras

The Events page now features **live camera feeds from the International Space Station**. Users can watch Earth from space in real-time through three NASA streams:

- **NASA Live** - Official NASA TV featuring ISS views and mission coverage
- **ISS HD Earth Viewing** - High-definition cameras mounted on the ISS exterior
- **NASA Media Channel** - Public affairs events and press conferences

The interface includes:
- Camera selector with descriptions
- Live indicator badge
- Direct YouTube links
- ISS orbital statistics (27,600 km/h, 408 km altitude, 92-min orbit)
- Info card explaining dark/blue screens during orbital night

```typescript
const ISS_CAMERAS = [
  {
    id: 'nasa-live',
    name: 'NASA Live',
    embedUrl: 'https://www.youtube.com/embed/P9C25Un7xaM',
    // ...
  },
  // More cameras...
]
```

## Expanded Telescope Observations

### Hubble Space Telescope

Added **7 new Hubble observations** to the Explore gallery with verified NASA Images API URLs:

- Helix Nebula (NGC 7293)
- Sombrero Galaxy (M104)
- Crab Nebula (M1)
- Orion Nebula (M42)
- Horsehead Nebula
- Cat's Eye Nebula (NGC 6543)
- Milky Way Center

### Australian Radio Telescopes

Expanded radio telescope data with new observations:

**ASKAP** (4 total):
- EMU Pilot Survey
- WALLABY HI Survey
- VAST Transient Discovery
- Odd Radio Circles (ORCs)

**Parkes** (3 total):
- Lorimer Burst (First FRB)
- Pulsar Timing Array
- LMC HI Survey

**MWA** (3 total):
- Epoch of Reionization
- GLEAM All-Sky Survey
- Solar Radio Bursts

## Citizen Science Improvements

The classification interface now displays **real NASA images** instead of placeholder graphics:

```typescript
// Before: Placeholder
subjectUrl: 'https://panoptes-uploads.zooniverse.org/placeholder.jpg'

// After: Real NASA images
subjectUrl: 'https://images-assets.nasa.gov/image/PIA04230/PIA04230~medium.jpg'
```

Added 12 classification tasks across 6 projects, each with verified working image URLs from NASA's Images API.

## Sky Map Fixes

Improved Aladin Lite initialization:

1. **Container dimension check** - Now waits for proper width/height before initializing
2. **Better retry logic** - More robust handling of script loading delays
3. **Layout fixes** - Added `overflow-hidden` and `min-h-[500px]` for proper sizing

## UI Cleanup

### Header
- Removed Sign In button (no authentication required for current features)
- Simplified navigation structure

### Footer
- Removed "Made with heart for space enthusiasts" tagline
- Removed Twitter icon
- Removed Forums & Discord links
- Updated GitHub link to project repository

### New Accessibility Page

Created comprehensive accessibility page at `/accessibility` covering:

- WCAG 2.1 AA compliance commitment
- Feature list (keyboard navigation, screen readers, contrast, etc.)
- Technical standards documentation
- Feedback instructions

## Technical Notes

### Image URL Verification

All NASA image URLs were verified to return HTTP 200:

```bash
# Verification process
curl -sI "https://images-assets.nasa.gov/image/PIA18164/PIA18164~medium.jpg" | head -1
# HTTP/2 200
```

URLs returning 403 Forbidden were replaced with working alternatives.

### Build Optimisation

- Removed unused auth imports (next-auth)
- Cleaned up unused components
- Build size reduced for Header component

## What's Next

- Further Sky Map debugging for survey loading edge cases
- Additional telescope observations
- Performance optimisation for large galleries
- Mobile experience improvements

The platform continues to grow as a comprehensive resource for exploring the universe across multiple wavelengths.
