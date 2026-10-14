---
title: "December 2025: Real Radio Astronomy Imagery"
slug: december-2025-radio-imagery-upgrade
date: 2025-12-23
category: radio-astronomy
tags: [ASKAP, Parkes, MWA, ATCA, Radio Astronomy, Imagery, CSIRO]
author: "Developer"
reading_time: 5
featured: true
excerpt: "Replacing placeholder graphics with genuine radio telescope imagery from CSIRO and international observatories, bringing the invisible universe to life."
---# December 2025: Real Radio Astronomy Imagery

One of the limitations of the Explore gallery has been the use of placeholder SVG graphics for radio telescope observations. While these placeholders conveyed the concept of radio astronomy, they didn't capture the stunning reality of what these telescopes reveal. Today, we're replacing those placeholders with genuine radio astronomy imagery.

## The Challenge of Radio Imagery

Radio telescopes don't capture "photos" in the traditional sense. Instead, they measure radio waves and construct images through sophisticated processing:

- **Interferometry**: Combining signals from multiple antennas to create high-resolution images
- **Aperture synthesis**: Building up an image over time as Earth rotates
- **Spectral processing**: Converting frequency data into visual representations

The resulting images often use false colour to represent intensity or frequency, creating the distinctive look of radio astronomy.

## New Imagery Sources

We've sourced authentic imagery from several archives:

### CSIRO ATNF Media
The Australia Telescope National Facility maintains a media archive with publication-quality images from all Australian radio telescopes:

| Telescope | Sample Targets |
|-----------|---------------|
| **ASKAP** | EMU all-sky survey mosaics, Odd Radio Circles |
| **Parkes** | Pulsar timing arrays, Fast Radio Burst localisations |
| **MWA** | GLEAM survey tiles, Epoch of Reionisation fields |
| **ATCA** | Supernova remnants, Active galactic nuclei |

### NRAO Archive
The National Radio Astronomy Observatory provides high-quality imagery from the VLA and ALMA, useful for comparison with Australian observations.

### ESO Archive
The European Southern Observatory hosts ALMA imagery at multiple wavelengths.

## Technical Implementation

Updating the imagery required changes to the Australian telescopes service:

```typescript
// Before: Generic SVG placeholders
images: {
  thumbnail: '/images/askap-placeholder.svg',
  preview: '/images/askap-placeholder.svg',
  full: '/images/askap-placeholder.svg',
}

// After: Real observatory imagery
images: {
  thumbnail: 'https://www.atnf.csiro.au/images/emu_pilot_thumbnail.jpg',
  preview: 'https://www.atnf.csiro.au/images/emu_pilot_preview.jpg',
  full: 'https://www.atnf.csiro.au/images/emu_pilot_full.jpg',
}
```

### Image Optimisation

To ensure fast loading while maintaining quality:

1. **Multiple resolutions**: Thumbnails (200px), previews (800px), full-size (original)
2. **Lazy loading**: Images load only when visible in viewport
3. **Fallback handling**: SVG placeholders remain as fallbacks if remote images fail
4. **CDN caching**: Next.js image optimisation with remote patterns configured

## Observations Updated

The following observations now feature real imagery:

### ASKAP Observations
- **EMU Pilot Survey**: Wide-field radio continuum mosaic
- **WALLABY HI Survey**: Neutral hydrogen distribution maps
- **VAST Transient Discovery**: Variable and transient radio sources
- **Odd Radio Circles**: Mysterious circular radio structures
- **Fornax Cluster**: Deep radio view of nearby galaxy cluster
- **Centaurus A Radio Lobes**: Giant radio lobes from nearest AGN

### Parkes Observations
- **Lorimer Burst**: First fast radio burst discovery
- **Pulsar Timing Array**: Millisecond pulsar monitoring
- **Vela Pulsar**: Brightest radio pulsar
- **Crab Pulsar**: Supernova remnant pulsar

### MWA Observations
- **GLEAM All-Sky Survey**: Low-frequency radio sky
- **Epoch of Reionisation**: Cosmic dawn signatures
- **Solar Radio Bursts**: Space weather monitoring

### ATCA Observations
- **Supernova 1987A**: Ongoing radio evolution
- **GRB Afterglow**: Gamma-ray burst follow-up

## Visual Impact

The difference is striking. Where before we had abstract representations of radio waves, we now have:

- **False-colour intensity maps** showing radio source brightness
- **Contour overlays** revealing magnetic field structures
- **Multi-frequency composites** highlighting spectral variations
- **Wide-field mosaics** demonstrating survey coverage

## Looking Forward

This update brings the Explore gallery closer to our vision of truly multi-spectrum astronomy. Users can now compare:

- JWST infrared imagery of a galaxy
- Hubble optical view of the same target
- ASKAP radio continuum emission

Each wavelength reveals different physics - from stellar populations to magnetic fields to relativistic jets.

## Acknowledgments

Thanks to CSIRO ATNF for making their imagery publicly available, and to the teams behind ASKAP, Parkes, MWA, and ATCA for producing such stunning science.

The invisible universe is now visible to everyone.
