---
title: "January 2026: High-Resolution Planet Hero Backgrounds"
slug: january-2026-planet-hero-images
date: 2026-01-10
category: visualization
tags: [NASA, Planets, Hero Images, Mars, Jupiter, Saturn, Visual Design, UX]
author: "Developer"
reading_time: 4
featured: true
excerpt: "Adding dramatic high-resolution NASA planet images as hero backgrounds across the site, bringing the solar system to life on every page."
---# January 2026: High-Resolution Planet Hero Backgrounds

Inspired by modern data infrastructure sites like TensorStax that use stunning planetary imagery, we've added high-resolution NASA planet images as dramatic backgrounds across the Cosmos Collective hero sections.

## New Planet Hero Images

We've curated 13 of NASA's highest quality planetary images, all sourced from the official NASA Images API at `images-assets.nasa.gov`:

### Solar System Planets

| Planet | Source | Description |
|--------|--------|-------------|
| **Mars** (2 images) | JWST, Perseverance | Red planet in infrared and surface views |
| **Jupiter** (2 images) | JWST, Juno | Gas giant showing auroras and swirling storms |
| **Saturn** (2 images) | Cassini | Ringed planet portrait and backlit rings |
| **Earth** (2 images) | Cassini | Pale Blue Dot from Saturn, Blue Marble |
| **Neptune** | Voyager 2 | Ice giant with Great Dark Spot |
| **Uranus** | Voyager | Tilted ice giant with rings |

### Deep Space

| Image | Source | Description |
|-------|--------|-------------|
| **Carina Nebula** | JWST | Cosmic Cliffs star-forming region |
| **Pillars of Creation** | Hubble | Iconic Eagle Nebula pillars |
| **Deep Field** | Hubble | Ultra Deep Field with thousands of galaxies |

## Page Assignments

Each page now features a unique planetary background that thematically matches its content:

| Page | Background | Rationale |
|------|------------|-----------|
| **Homepage** | Mars | Dramatic red planet, exploration-focused |
| **Explore** | Jupiter (JWST) | Gas giant representing cosmic discovery |
| **Events** | Saturn Rings | Backlit rings symbolizing celestial events |
| **Citizen Science** | Earth (Pale Blue Dot) | Our home, community-focused |

## Technical Implementation

### HeroSection Component Updates

The `HeroSection` component now accepts configurable props:

```typescript
interface HeroSectionProps {
  backgroundKey?: PlanetHeroKey      // Select from PLANET_HERO_IMAGES
  customBackgroundUrl?: string       // Override with custom URL
  backgroundBrightness?: number      // Control overlay darkness (0-1)
  enableParallax?: boolean           // Toggle parallax scroll effect
}
```

### New PageHero Component

Created a reusable `PageHero` component for secondary pages with:

- Compact hero sizing (small, medium, large variants)
- Parallax scroll effect
- Title with gradient highlight support
- Optional badge and custom children
- NASA image credits displayed subtly

```typescript
<PageHero
  title="Explore the Cosmos"
  titleHighlight="Cosmos"
  description="Browse observations from JWST, Hubble..."
  backgroundKey="jupiter"
  size="sm"
  badge={<Badge icon={Telescope} text="Deep Space Observatory" />}
/>
```

### PLANET_HERO_IMAGES Constant

All images use the highest resolution available (`~orig.jpg` format):

```typescript
export const PLANET_HERO_IMAGES = {
  mars: {
    url: 'https://images-assets.nasa.gov/image/PIA24420/PIA24420~orig.jpg',
    name: 'Mars',
    description: 'JWST first images of Mars...',
    credit: 'NASA/ESA/CSA/STScI',
  },
  // ... 12 more images
}
```

## Visual Design Decisions

### Brightness Control

Each page uses appropriate brightness values to ensure text readability:

- Homepage: 35% brightness (Mars is already quite dark)
- Secondary pages: 25% brightness (default)

### Gradient Overlays

Multiple gradient layers ensure smooth transitions:

1. Bottom-to-top gradient (fade to void)
2. Top-to-bottom gradient (fade from header)

### Image Credits

Small, subtle credits appear in the bottom-right corner, acknowledging NASA/JPL/ESA contributions without distracting from the content.

## Performance Considerations

- Images use CSS `background-image` for efficient loading
- Parallax effect uses `transform: translateY()` for GPU acceleration
- Lazy effect only activates when `enableParallax` is true
- Original resolution images ensure sharp display on retina screens

## Looking Forward

Future enhancements could include:

- Rotating background images on page refresh
- User preference for favourite planet
- Seasonal backgrounds (comet during meteor showers)
- Integration with APOD for daily hero images

The universe is now more visually present throughout the Cosmos Collective experience, inspiring exploration from the very first moment users land on any page.
