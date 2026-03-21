/**
 * Devlog Service
 * Manages development blog posts
 *
 * In production, this could read from MDX files or a CMS.
 * For now, we define posts inline to demonstrate the feature.
 */

// ============================================
// Types
// ============================================

export interface DevlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  author: {
    name: string
    avatar?: string
  }
  category: 'architecture' | 'data-integration' | 'radio-astronomy' | 'visualization' | 'accessibility' | 'performance'
  tags: string[]
  readingTime: number
  featured?: boolean
}

// ============================================
// Sample Posts
// ============================================

const posts: DevlogPost[] = [
  {
    slug: 'february-2026-jwst-catalogue-expansion',
    title: 'February 2026: JWST Catalogue Expanded to 85 Observations',
    excerpt: 'The JWST Explorer catalogue grew from 14 to 85 observations — covering NIRCam, MIRI, and NIRSpec targets across nebulae, galaxies, star clusters, and planetary systems.',
    date: '2026-02-23',
    author: { name: 'Developer' },
    category: 'data-integration',
    tags: ['JWST', 'James Webb', 'NASA', 'Catalogue', 'NIRCam', 'MIRI', 'NIRSpec', 'Nebulae', 'Galaxies'],
    readingTime: 5,
    featured: true,
    content: `
# February 2026: JWST Catalogue Expanded to 85 Observations

The JWST Explorer launched with 14 curated observations. This week we expanded the catalogue to **85 confirmed JWST targets** — a 6× increase — spanning the full range of instruments and science categories that the James Webb Space Telescope has observed since its first science images in July 2022.

## What Changed

The catalogue lives in \`src/services/mast-api.ts\` as a static list of \`Observation\` objects. Each entry maps to a verified NASA image URL and carries rich metadata: instrument, wavelength band, object category, coordinates, and a short description.

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

Alongside the catalogue expansion, we fixed a production bug where the centre viewport of the JWST Explorer showed solid black. The root cause: plain \`<img>\` tags bypass Next.js's \`image-loader.js\` in production. Fix: route all image \`src\` attributes through \`/api/image-proxy?url=...\` in production builds, keeping direct URLs in development.

\`\`\`tsx
const proxiedImageUrl = useMemo(() => {
  if (!currentImageUrl) return ''
  if (process.env.NODE_ENV === 'production') {
    return \`/api/image-proxy?url=\${encodeURIComponent(currentImageUrl)}\`
  }
  return currentImageUrl
}, [currentImageUrl])
\`\`\`

Loading and error states were also added — a spinner while the image loads and a fallback message if the NASA CDN is unreachable.

## Service Worker Precaching Fix

The Vercel deploy logs showed a service worker installation failure on every deploy:

\`\`\`
workbox bad-precaching-response: _next/app-build-manifest.json returned 404
\`\`\`

Next.js App Router generates \`_next/app-build-manifest.json\` as an internal build artefact — it's never publicly served. \`next-pwa\` was trying to precache it, causing the SW install to fail silently. Fix: add it (and related manifest files) to \`buildExcludes\` in \`next.config.js\`.

## What's Next

With 85 observations in the catalogue, the next step is making them discoverable. The Explore page already supports filtering by wavelength (infrared, visible, radio) — but JWST's power is in **multi-wavelength composites**. A side-by-side wavelength comparison mode would let users see the same target in NIRCam vs MIRI, showing how the instrument choice changes what's visible.
`,
  },
  {
    slug: 'february-2026-kepler-exoplanet-explorer',
    title: 'February 2026: Kepler Exoplanet Explorer',
    excerpt: 'A live star field of 2,600+ confirmed exoplanets from NASA\'s Kepler mission — colour-coded by stellar temperature, filterable by planet size and habitable zone, with orbital system diagrams and an HR diagram mode.',
    date: '2026-02-21',
    author: { name: 'Developer' },
    category: 'data-integration',
    tags: ['Kepler', 'Exoplanets', 'NASA', 'Canvas', 'Star Field', 'Habitable Zone', 'HR Diagram', 'TAP API'],
    readingTime: 6,
    featured: true,
    content: `
# February 2026: Kepler Exoplanet Explorer

The Kepler Space Telescope operated from 2009 to 2018, staring at a single patch of sky in the Cygnus constellation and recording the brightness of over 150,000 stars every 30 minutes. When a planet crossed in front of its host star, the starlight dimmed slightly — a transit. By the end of the mission, Kepler had confirmed **2,600+ exoplanets**, revolutionising our understanding of how common planetary systems are.

The new Kepler Explorer at \`/kepler\` makes this dataset interactive.

## Data Source: NASA Exoplanet Archive TAP API

All data is fetched live from the **NASA Exoplanet Archive** via their Table Access Protocol (TAP) endpoint. No static JSON, no stale snapshots — every load pulls the current confirmed planet table and filters it to Kepler discoveries.

\`\`\`
https://exoplanetarchive.ipac.caltech.edu/TAP/sync?
  QUERY=SELECT+pl_name,hostname,pl_rade,pl_orbper,pl_eqt,pl_bmasse,
        pl_insol,pl_orbsmax,st_teff,st_rad,st_mass,st_lum,sy_dist,
        ra,dec,sy_pnum,disc_year
  +FROM+pscomppars
  +WHERE+disc_facility+like+%27Kepler%27
  +AND+pl_controv_flag=0
  &FORMAT=json
\`\`\`

A Next.js API route at \`/api/proxy/kepler\` handles the fetch server-side, avoiding CORS issues and caching the response.

If the live API is unreachable, the viewer falls back to 11 sample planets across 5 famous systems (Kepler-22, Kepler-186, Kepler-452, Kepler-442, Kepler-62) so the interface is never empty.

## The Star Field Canvas

The main view renders the Kepler field-of-view (a ~115 square degree region in Cygnus, roughly centred at RA 290°, Dec 44°) as a **Canvas 2D star field**. Each dot represents a host star with at least one confirmed planet.

### Colour-Coding by Stellar Temperature

Stars aren't white — their colour tells you their surface temperature and spectral type. The canvas maps effective temperature (\`st_teff\`) to the same colour scale used by astronomers:

| Temperature | Spectral Type | Colour |
|-------------|---------------|--------|
| < 3,500 K   | M dwarf       | Deep orange-red |
| 3,500–5,000 K | K dwarf     | Amber-orange |
| 5,000–6,000 K | G (Sun-like) | Pale yellow |
| 6,000–7,500 K | F dwarf      | Yellow-white |
| > 7,500 K   | A dwarf       | Blue-white |

Hover over any star to see the host name, number of planets, temperature, and distance in parsecs. Click to open the orbital system diagram.

## Filters

The left sidebar exposes six independent filters that compose with each other:

- **Search** — planet or star name substring match
- **View Mode** — Sky (2D field), Galaxy (position in Milky Way context), HR Diagram
- **Planet Size** — Earth, Super-Earth (1.25–2 R⊕), Neptune-class (2–6 R⊕), Jupiter-class (> 6 R⊕)
- **Stellar Temperature** — Cool M/K, Sun-like G, Hot F/A
- **Max Orbital Period** — slider from 1 to 730 days (two Earth years)
- **Habitable Zone** — filter to only show systems with a planet receiving 0.2–2× Earth's insolation flux

The stats bar at the top updates live as filters change: confirmed planets, host stars, multi-planet systems, Earth-sized planets (≤ 1.5 R⊕), and planets in the habitable zone.

## Orbital System Diagram

Clicking a star opens a panel on the right showing all planets in that system arranged as concentric orbits. Planet size is proportional to radius, and the habitable zone is shaded in green. For famous systems like Kepler-186 (five planets, one in the HZ), this is immediately legible.

## HR Diagram Mode

Switch to HR Diagram mode and the canvas redraws as a **Hertzsprung-Russell diagram** — luminosity (y-axis) vs. temperature (x-axis). Host stars cluster along the main sequence. Red giants and subgiants that Kepler also observed fall in the expected upper-right region. It's the same dataset, but a completely different lens: from "where are these stars in the sky?" to "what kind of stars are they?".

## Galaxy View

The third view mode shows the Kepler field of view in galactic context — a representation of the Milky Way disc with the 10° × 10° Kepler field highlighted in Cygnus, roughly 1–3 kiloparsecs from the Sun. This gives a sense of how narrow Kepler's stare was: one tiny window into the galaxy, 150,000 stars, nine years.

## Performance

The planet table for Kepler returns ~2,600 rows of JSON. Grouping by host star (to build the \`StarSystem[]\` array for the canvas), computing habitable zone membership, and calculating spectral categories all happen client-side in a single \`useMemo\`. On a modern machine this resolves in < 5ms; on slower devices it's still < 30ms. The canvas itself renders in a single \`drawFrame()\` call — no per-planet React state, no virtual DOM overhead.
`,
  },
  {
    slug: 'february-2026-interactive-solar-system',
    title: 'February 2026: Interactive 3D Solar System Hero',
    excerpt: 'Replacing the static hero with a real-time WebGL solar system built with Three.js — orbiting planets, Galaxy View zoom-out, and a dismissible overlay for the best of both worlds.',
    date: '2026-02-07',
    author: { name: 'Developer' },
    category: 'visualization',
    tags: ['Three.js', 'WebGL', 'Solar System', '3D', 'Hero', 'Galaxy View', 'NASA', 'Animation'],
    readingTime: 7,
    featured: true,
    content: `
# February 2026: Interactive 3D Solar System Hero

The homepage hero section has been completely reimagined. Instead of a static image with overlaid text, visitors now land on a **real-time 3D solar system** rendered with Three.js and WebGL. The planets orbit the Sun in accurate proportions, and the entire experience is interactive — drag to rotate, scroll to zoom, click planets to learn about them.

## Why a Solar System?

Cosmos Collective is about making the universe accessible. What better first impression than putting the solar system itself in your hands? The hero is the first thing visitors see, and an interactive 3D experience immediately communicates that this isn't a static gallery — it's a living, explorable universe.

## Architecture: Iframe Isolation

The solar system runs as a standalone HTML/Three.js app embedded via iframe:

\`\`\`tsx
<iframe
  src="/solar-system/index.html"
  title="Interactive 3D Solar System"
  className="absolute inset-0 w-full h-full border-0"
  style={{ zIndex: 1, background: '#000' }}
  loading="eager"
  allow="fullscreen"
/>
\`\`\`

**Why an iframe?** Three.js scenes with continuous \`requestAnimationFrame\` loops can interfere with React's rendering lifecycle. Iframe isolation means:
- The WebGL context doesn't compete with React's DOM updates
- The solar system can be developed and tested independently
- Service worker conflicts are avoided (we unregister any SW inside the iframe)
- The 3D scene keeps running smoothly while React handles the overlay

### CSP Configuration

Three.js loads from CDN, so we added \`cdnjs.cloudflare.com\` to the Content Security Policy to allow the script to execute within the iframe.

## The Dismissible Overlay Pattern

The hero needed to serve two audiences: first-time visitors who need context, and returning users who want to interact with the solar system directly. The solution is a **timed dismissible overlay**:

1. The solar system starts rendering immediately
2. After 5 seconds, a glass-panel card fades in with the site title, description, CTAs, and animated stats
3. Users can dismiss the card by clicking outside, pressing Escape, or hitting the X button
4. Once dismissed, the full solar system is interactive
5. A hide/show toggle lets users bring the overlay back or hide it entirely

\`\`\`typescript
useEffect(() => {
  const timer = setTimeout(() => setCardRevealed(true), 5000)
  return () => clearTimeout(timer)
}, [])
\`\`\`

## Solar System Features

### Planetary Orbits
All 8 planets orbit the Sun with proportionally scaled orbital speeds. Mercury zips around while Neptune barely moves — accurate to real ratios (though distances are compressed for visual appeal).

### Interactive Controls
- **Drag** to rotate the camera around the system
- **Scroll** to zoom in/out
- **Speed slider** to control orbital velocity (0.1x to 10x)
- **Follow mode** — lock the camera to follow a specific planet
- **Orbital trails** — toggle visible orbit paths
- **Vortex mode** — artistic spiral trail effect

### Galaxy View
On Feb 19, we added a "Galaxy View" — zoom all the way out and the scene transitions to a NASA/JPL-Caltech Milky Way illustration with a pulsing "You Are Here" marker showing our solar system's position in the galaxy. This gives visitors a sense of cosmic scale.

### Earth Date Counter
A real-time counter shows the current Earth date alongside the simulation, grounding the abstract orbital mechanics in something familiar.

## Mobile Responsiveness

Three.js WebGL on mobile presented challenges:
- **Touch events** — mapped to orbit controls (one finger = rotate, pinch = zoom)
- **Performance** — reduced particle count and simplified shaders for mobile GPUs
- **Viewport** — ensured the iframe fills the viewport correctly on all screen sizes
- **Slider controls** — added large arrow buttons for easier mobile interaction

This was addressed in PR #13 (merged Feb 16).

## Debugging Journey

Getting the solar system to render reliably across browsers took several iterations:

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Black screen on some browsers | Iframe sandbox attribute blocked WebGL | Removed \`sandbox\` attribute |
| Solar system not loading | Service worker from parent interfered | Unregister SW inside iframe |
| Planets drifting off-screen | Delta time accumulation during tab sleep | Clamped max frame delta |
| White flash on load | Iframe background not set | Added \`background: #000\` inline style |
| Controls unresponsive after overlay | Event listeners consumed by React overlay | \`pointer-events-none\` on backdrop after dismiss |

The 5-second failsafe overlay hide was added as a safety net — if the card somehow fails to appear, the solar system remains fully interactive.

## Performance

| Metric | Value |
|--------|-------|
| Initial bundle (iframe) | ~180KB gzipped (Three.js + scene) |
| Frame rate | 60fps on desktop, 30-45fps on mobile |
| Memory | ~50MB GPU, ~30MB heap |
| Load time | < 2s on broadband, WebGL context ready |
| Impact on React app | Zero — fully isolated in iframe |

## What's Next

The solar system hero sets the stage for deeper interactive experiences throughout the site. Since Feb 7, we've added:
- Deep Space Observatory with Canvas 2D wavelength viewer
- ISS world map tracking across multiple pages
- Animated SKA timeline and comparison bars
- NEO approach diagrams on the Events page
- Meteor radiant overlays on the Sky Map

The solar system was the proof that interactive, data-rich visualisations belong at the core of Cosmos Collective — not as decoration, but as the primary way people explore the universe.
`,
  },
  {
    slug: 'january-2026-planet-hero-images',
    title: 'January 2026: High-Resolution Planet Hero Backgrounds',
    excerpt: 'Adding dramatic high-resolution NASA planet images as hero backgrounds across the site, bringing the solar system to life on every page.',
    date: '2026-01-10',
    author: { name: 'Developer' },
    category: 'visualization',
    tags: ['NASA', 'Planets', 'Hero Images', 'Mars', 'Jupiter', 'Saturn', 'Visual Design', 'UX'],
    readingTime: 4,
    featured: true,
    content: `
# January 2026: High-Resolution Planet Hero Backgrounds

Inspired by modern data infrastructure sites like TensorStax that use stunning planetary imagery, we've added high-resolution NASA planet images as dramatic backgrounds across the Cosmos Collective hero sections.

## New Planet Hero Images

We've curated 13 of NASA's highest quality planetary images, all sourced from the official NASA Images API at \`images-assets.nasa.gov\`:

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

The \`HeroSection\` component now accepts configurable props:

\`\`\`typescript
interface HeroSectionProps {
  backgroundKey?: PlanetHeroKey      // Select from PLANET_HERO_IMAGES
  customBackgroundUrl?: string       // Override with custom URL
  backgroundBrightness?: number      // Control overlay darkness (0-1)
  enableParallax?: boolean           // Toggle parallax scroll effect
}
\`\`\`

### New PageHero Component

Created a reusable \`PageHero\` component for secondary pages with:

- Compact hero sizing (small, medium, large variants)
- Parallax scroll effect
- Title with gradient highlight support
- Optional badge and custom children
- NASA image credits displayed subtly

\`\`\`typescript
<PageHero
  title="Explore the Cosmos"
  titleHighlight="Cosmos"
  description="Browse observations from JWST, Hubble..."
  backgroundKey="jupiter"
  size="sm"
  badge={<Badge icon={Telescope} text="Deep Space Observatory" />}
/>
\`\`\`

### PLANET_HERO_IMAGES Constant

All images use the highest resolution available (\`~orig.jpg\` format):

\`\`\`typescript
export const PLANET_HERO_IMAGES = {
  mars: {
    url: 'https://images-assets.nasa.gov/image/PIA24420/PIA24420~orig.jpg',
    name: 'Mars',
    description: 'JWST first images of Mars...',
    credit: 'NASA/ESA/CSA/STScI',
  },
  // ... 12 more images
}
\`\`\`

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

- Images use CSS \`background-image\` for efficient loading
- Parallax effect uses \`transform: translateY()\` for GPU acceleration
- Lazy effect only activates when \`enableParallax\` is true
- Original resolution images ensure sharp display on retina screens

## Looking Forward

Future enhancements could include:

- Rotating background images on page refresh
- User preference for favourite planet
- Seasonal backgrounds (comet during meteor showers)
- Integration with APOD for daily hero images

The universe is now more visually present throughout the Cosmos Collective experience, inspiring exploration from the very first moment users land on any page.
`,
  },
  {
    slug: 'december-2025-radio-imagery-upgrade',
    title: 'December 2025: Real Radio Astronomy Imagery',
    excerpt: 'Replacing placeholder graphics with genuine radio telescope imagery from CSIRO and international observatories, bringing the invisible universe to life.',
    date: '2025-12-23',
    author: { name: 'Developer' },
    category: 'radio-astronomy',
    tags: ['ASKAP', 'Parkes', 'MWA', 'ATCA', 'Radio Astronomy', 'Imagery', 'CSIRO'],
    readingTime: 5,
    featured: true,
    content: `
# December 2025: Real Radio Astronomy Imagery

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

\`\`\`typescript
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
\`\`\`

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
`,
  },
  {
    slug: 'december-2025-events-expansion',
    title: 'December 2025: Expanded Events Calendar & Smart Banner',
    excerpt: 'Major expansion of the Live Events system with 50+ astronomical events including lunar phases, eclipses, planetary conjunctions, and rocket launches.',
    date: '2025-12-08',
    author: { name: 'Developer' },
    category: 'data-integration',
    tags: ['Events', 'Astronomy', 'Meteor Showers', 'Eclipses', 'Lunar', 'Conjunctions', 'Launches', 'UX'],
    readingTime: 4,
    featured: true,
    content: `
# December 2025: Expanded Events Calendar

The Live Events system has received a major overhaul, expanding from a handful of events to over 50 astronomical phenomena throughout the year.

## New Event Types

### Lunar Events
- Full moons with traditional names (Wolf Moon, Snow Moon, etc.)
- Supermoons highlighted with special severity
- New moons for optimal deep-sky observation

### Eclipses
- Solar eclipses (total, partial, annular) through 2026
- Lunar eclipses with Blood Moon visibility
- Visibility regions and peak times included

### Planetary Conjunctions
- Close approaches between planets
- Planet-Moon conjunctions
- Opposition events (Saturn, Jupiter at peak brightness)

### Rocket Launches
- Major upcoming launches (Starship, Artemis II)
- Links to live webcasts
- Crewed missions highlighted

## Smart Banner Filtering

The scrolling live events banner now intelligently filters events:

- Prioritizes ongoing events (shown first)
- Shows only notable+ severity to reduce noise
- Sorts by date proximity for relevance
- Caps at 10 events for smooth animation

## UX Improvements

### Click-to-Scroll
Clicking an event in the banner now scrolls directly to that event on the Events page with a temporary highlight effect.

### Show More Pagination
Events page now loads 8 events initially with a "Show More" button to progressively reveal the full list.

### Responsive Cards
All event cards are now clickable, linking to relevant external resources (IMO, NASA, TimeAndDate, etc.).

## Technical Details

| Component | Changes |
|-----------|---------|
| \`real-time-events.ts\` | Added getLunarEvents(), getEclipses(), getPlanetaryConjunctions(), getUpcomingLaunches() |
| \`LiveEventsBar.tsx\` | Priority filtering, limit to 10 events |
| \`events/page.tsx\` | Pagination state, Show More button, scroll-to behavior |
| \`astronomy.ts\` | New EventTypes: 'lunar', 'conjunction' |

## What's Next

- Integration with launch APIs for real-time schedule updates
- User location-based visibility filtering
- Event reminders and notifications
`,
  },
  {
    slug: 'december-2025-domain-launch',
    title: 'December 2025: Custom Domain, 75 Observations & Community Features',
    excerpt: 'Launching cosmos-collective.com.au with custom domain setup, tripling observations from 25 to 75, adding accessibility improvements, and Ko-fi support integration.',
    date: '2025-12-07',
    author: { name: 'Developer' },
    category: 'architecture',
    tags: ['Domain', 'DNS', 'Accessibility', 'Community', 'Ko-fi', 'JWST', 'Hubble', 'ASKAP', 'Radio Astronomy'],
    readingTime: 6,
    featured: true,
    content: `
# December 2025: Custom Domain & Community Features

Today marks an exciting milestone for Cosmos Collective - we've launched our custom domain **cosmos-collective.com.au**! This update also brings accessibility improvements and community support features.

## Custom Domain Launch

The site is now live at [cosmos-collective.com.au](https://cosmos-collective.com.au), giving us a professional Australian presence that reflects our focus on Australian radio astronomy and the SKA project.

### Technical Setup

| Component | Configuration |
|-----------|---------------|
| **Domain** | cosmos-collective.com.au |
| **Registrar** | Hostinger |
| **Hosting** | Vercel (Free Hobby tier) |
| **SSL** | Auto-provisioned via Let's Encrypt |

### DNS Configuration

Configured through Hostinger's DNS management:

\`\`\`
A     @      76.76.21.21          (Vercel's IP)
CNAME www    cname.vercel-dns.com (Vercel's CNAME)
\`\`\`

The www subdomain automatically redirects to the apex domain for a consistent user experience.

### Files Updated

All references to the old Vercel URL were updated across the codebase:

- \`src/app/layout.tsx\` - OpenGraph URLs, canonical links, JSON-LD schema
- \`src/app/sitemap.ts\` - BASE_URL constant
- \`public/robots.txt\` - Sitemap URL
- \`docs/FUTURE_FEATURES.md\` - OAuth callback URLs
- \`README.md\` - Live demo links

## Accessibility Improvements

### Filter Tooltips

Added \`title\` and \`aria-label\` attributes to all filter buttons on the Explore page. This improves accessibility for:

- **Screen reader users** - Clear labels describe each filter option
- **Mobile users** - Long-press reveals tooltip text
- **Keyboard navigators** - Better context when tabbing through filters

\`\`\`tsx
<button
  onClick={() => updateFilter('source', source.value)}
  aria-pressed={currentSource === source.value}
  aria-label={source.label}
  title={source.label}
>
  {source.icon}
  <span className="hidden sm:inline">{source.label}</span>
</button>
\`\`\`

Filter groups updated:
- **Telescope sources** - JWST, Hubble, ASKAP, MWA, Parkes
- **Object categories** - Galaxies, Nebulae, Stars, etc.
- **Wavelength bands** - Radio, Infrared, Visible, UV, X-ray

## Community Features

### Ko-fi Support Integration

Added a Ko-fi donation link to the footer, allowing supporters to contribute to the project's development:

\`\`\`tsx
<a
  href="https://ko-fi.com/m4cd4r4"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Support on Ko-fi"
>
  <Heart className="w-5 h-5" />
</a>
\`\`\`

### "Available for Hire" Badge

Added a professional hire badge to the footer for potential collaboration opportunities:

\`\`\`tsx
<a href="https://github.com/m4cd4r4" className="...">
  <Briefcase className="w-3.5 h-3.5" />
  <span>Available for hire</span>
</a>
\`\`\`

## SEO & Metadata Updates

With the new domain, all SEO-related metadata was updated:

### JSON-LD Schema

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Cosmos Collective",
  "url": "https://cosmos-collective.com.au",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://cosmos-collective.com.au/explore?search={search_term_string}"
  }
}
\`\`\`

### robots.txt

Updated sitemap reference:
\`\`\`
Sitemap: https://cosmos-collective.com.au/sitemap.xml
\`\`\`

## Observation Expansion - 3x More Content

Later in the day, we tripled the observation catalogue from ~25 to ~75 astronomical objects:

### New JWST Observations (+6)
| Target | Type | Description |
|--------|------|-------------|
| **Phantom Galaxy (M74)** | Galaxy | Face-on spiral showing intricate dust lanes |
| **Neptune** | Planet | Ice giant with rings and moons |
| **Uranus** | Planet | Tilted ice giant with ring system |
| **Saturn** | Planet | Ring system in infrared detail |
| **Mars** | Planet | Detailed surface features |
| **Rho Ophiuchi** | Nebula | Closest star-forming region to Earth |

### New Hubble Observations (+11)
| Target | Type | Highlights |
|--------|------|------------|
| **Andromeda Galaxy (M31)** | Galaxy | Our nearest major galactic neighbour |
| **Whirlpool Galaxy (M51)** | Galaxy | Classic spiral interacting with companion |
| **Antennae Galaxies** | Galaxy | Spectacular merger in progress |
| **Eagle Nebula** | Nebula | Home of the Pillars of Creation |
| **Lagoon Nebula** | Nebula | Giant stellar nursery |
| **Bubble Nebula** | Nebula | Stellar wind-blown cavity |
| **Westerlund 2** | Star Cluster | Massive young star cluster |
| **Veil Nebula** | Supernova Remnant | Ancient supernova debris |
| **Centaurus A** | Galaxy | Nearest giant elliptical galaxy |
| **Cigar Galaxy (M82)** | Galaxy | Starburst with galactic superwind |
| **Cosmic Reef (NGC 2014)** | Nebula | 30 Doradus region in LMC |

### New Radio Telescope Observations (+20)

**ASKAP (+5):**
- Fornax Galaxy Cluster, Centaurus A Radio Lobes, Small Magellanic Cloud Survey, Galactic Center Survey, Sculptor Galaxy

**Parkes (+5):**
- Galactic All-Sky Survey (GASS), Vela Pulsar, Crab Pulsar, Double Pulsar System, Repeating Fast Radio Burst

**MWA (+4):**
- Ionospheric Studies, Meteor Radar Detection, Low-Frequency Pulsar Survey, Cygnus A

**ATCA (+5):**
- Supernova 1987A, GRB Afterglow Detection, HL Tauri Protoplanetary Disk, NGC 4945 Starburst, Circinus Galaxy

### Performance Note

No significant performance impact expected because:
- Images use \`loading="lazy"\` for deferred loading
- Data is bundled at build time (static generation)
- Client-side filtering operates on small in-memory dataset
- Pagination via "Load More" button limits initial render

## What's Next

- Implement user authentication for personalised features
- Add more citizen science classification projects
- Performance optimisations for the gallery
- Real-time data integration improvements

The custom domain establishes Cosmos Collective as a permanent home for exploring the universe through Australian and international telescope data.
`,
  },
  {
    slug: 'december-2025-feature-update',
    title: 'December 2025: ISS Cameras, Expanded Gallery & UI Polish',
    excerpt: 'Major feature update adding live ISS camera feeds, expanded telescope observations, real images in Citizen Science, and significant UI/UX improvements.',
    date: '2025-12-06',
    author: { name: 'Developer' },
    category: 'architecture',
    tags: ['Features', 'ISS', 'Hubble', 'Citizen Science', 'Accessibility'],
    readingTime: 6,
    content: `
# December 2025: ISS Cameras, Expanded Gallery & UI Polish

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

\`\`\`typescript
const ISS_CAMERAS = [
  {
    id: 'nasa-live',
    name: 'NASA Live',
    embedUrl: 'https://www.youtube.com/embed/P9C25Un7xaM',
    // ...
  },
  // More cameras...
]
\`\`\`

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

\`\`\`typescript
// Before: Placeholder
subjectUrl: 'https://panoptes-uploads.zooniverse.org/placeholder.jpg'

// After: Real NASA images
subjectUrl: 'https://images-assets.nasa.gov/image/PIA04230/PIA04230~medium.jpg'
\`\`\`

Added 12 classification tasks across 6 projects, each with verified working image URLs from NASA's Images API.

## Sky Map Fixes

Improved Aladin Lite initialization:

1. **Container dimension check** - Now waits for proper width/height before initializing
2. **Better retry logic** - More robust handling of script loading delays
3. **Layout fixes** - Added \`overflow-hidden\` and \`min-h-[500px]\` for proper sizing

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

Created comprehensive accessibility page at \`/accessibility\` covering:

- WCAG 2.1 AA compliance commitment
- Feature list (keyboard navigation, screen readers, contrast, etc.)
- Technical standards documentation
- Feedback instructions

## Technical Notes

### Image URL Verification

All NASA image URLs were verified to return HTTP 200:

\`\`\`bash
# Verification process
curl -sI "https://images-assets.nasa.gov/image/PIA18164/PIA18164~medium.jpg" | head -1
# HTTP/2 200
\`\`\`

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
`,
  },
  {
    slug: 'building-multi-spectrum-data-platform',
    title: 'Building a Multi-Spectrum Astronomical Data Platform',
    excerpt: 'The technical architecture behind integrating data from JWST, Australian radio telescopes, and real-time event feeds into a cohesive exploration experience.',
    date: '2025-12-05',
    author: { name: 'Developer' },
    category: 'architecture',
    tags: ['Next.js', 'TypeScript', 'API Integration', 'Architecture'],
    readingTime: 12,
    featured: true,
    content: `
# Building a Multi-Spectrum Astronomical Data Platform

When I started building Cosmos Collective, I knew I wanted to create something that went beyond a simple image gallery. The goal was ambitious: create a platform that could seamlessly integrate data from multiple astronomical sources across the electromagnetic spectrum, while remaining accessible and engaging for both space enthusiasts and citizen scientists.

## The Challenge

Modern astronomy produces vast amounts of data from instruments operating across the electromagnetic spectrum. The James Webb Space Telescope captures stunning infrared images, while Australian radio telescopes like ASKAP and MWA observe phenomena invisible to optical telescopes. Unifying these data sources presents several challenges:

1. **Different coordinate systems** - Various surveys use different epochs and reference frames
2. **Varied data formats** - From FITS files to JSON APIs to TAP services
3. **Real-time vs archival** - Some data is historical, some streams in real-time
4. **Scale differences** - Radio surveys cover millions of sources, JWST focuses on specific targets

## Architecture Overview

The platform uses Next.js 14 with the App Router, providing a modern React foundation with server-side rendering capabilities. Here's the high-level architecture:

\`\`\`
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Sky Map   │  │   Gallery   │  │  Classify   │ │
│  │  (Aladin)   │  │   (React)   │  │  (React)    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│                   API Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  MAST API   │  │  CASDA TAP  │  │  NASA APIs  │ │
│  │  (JWST)     │  │  (ASKAP)    │  │  (Events)   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│                   State Layer                        │
│  ┌─────────────────────────────────────────────────┐│
│  │  Zustand Store (Persisted to LocalStorage)      ││
│  │  - User preferences, favorites, view state      ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
\`\`\`

## Key Technical Decisions

### Why Next.js 14?

The App Router provides excellent patterns for:
- **Server Components** - Fetch data on the server, reducing client bundle size
- **Streaming** - Progressive loading for better perceived performance
- **Route Handlers** - API routes for proxying external services
- **Metadata API** - SEO-friendly page metadata

### Zustand for State Management

I chose Zustand over Redux for its simplicity and built-in persistence:

\`\`\`typescript
export const useCosmosStore = create<CosmosState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
      // ... more state
    }),
    { name: 'cosmos-storage' }
  )
)
\`\`\`

### Aladin Lite for Sky Mapping

Rather than building a custom sky viewer, I integrated Aladin Lite from CDS Strasbourg. It provides:
- Multi-wavelength survey overlays
- SIMBAD/NED object lookups
- Smooth pan/zoom interactions
- Mobile touch support

## Data Integration Patterns

### MAST API (JWST/Hubble)

The MAST portal provides a comprehensive API for accessing JWST observations:

\`\`\`typescript
async function queryMAST(params: MASTQuery): Promise<Observation[]> {
  const response = await fetch('https://mast.stsci.edu/api/v0/invoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      request: JSON.stringify({
        service: 'Mast.Caom.Filtered',
        format: 'json',
        params: {
          filters: [
            { paramName: 'obs_collection', values: ['JWST'] },
            { paramName: 'dataproduct_type', values: ['image'] },
          ],
        },
      }),
    }),
  })
  // Transform MAST response to our Observation type
}
\`\`\`

### CASDA TAP Service (Australian Radio)

The CSIRO ASKAP Science Data Archive uses TAP (Table Access Protocol):

\`\`\`typescript
async function queryCADSA(adql: string): Promise<RadioSource[]> {
  const response = await fetch(
    \`https://casda.csiro.au/casda_vo_tools/tap/sync?\${new URLSearchParams({
      query: adql,
      lang: 'ADQL',
      format: 'json',
    })}\`
  )
  // Parse VOTable response
}
\`\`\`

## Looking Forward

Future plans include:
- 3D visualisation of galaxy distributions using Three.js
- WebGL-accelerated radio image processing
- Integration with more SKA precursor data
- Enhanced citizen science classification tools

The platform demonstrates that modern web technologies can create compelling experiences for exploring astronomical data - making the universe more accessible to everyone.
`,
  },
  {
    slug: 'integrating-australian-radio-telescopes',
    title: 'Integrating Australian Radio Telescope Data',
    excerpt: 'How I connected to CASDA and the Australian SKA Pathfinder data archives to bring radio astronomy to the web.',
    date: '2025-12-04',
    author: { name: 'Developer' },
    category: 'radio-astronomy',
    tags: ['ASKAP', 'CASDA', 'TAP', 'Radio Astronomy', 'SKA'],
    readingTime: 10,
    content: `
# Integrating Australian Radio Telescope Data

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

\`\`\`sql
SELECT TOP 100
  ra_deg_cont, dec_deg_cont,
  flux_peak, flux_int,
  source_name
FROM casda.continuum_component
WHERE flux_peak > 0.01
  AND quality_flag = 0
ORDER BY flux_peak DESC
\`\`\`

### Implementation

\`\`\`typescript
const CASDA_TAP_ENDPOINT = 'https://casda.csiro.au/casda_vo_tools/tap/sync'

export async function queryRadioSources(options: RadioQueryOptions) {
  const adql = buildADQL(options)

  const response = await fetch(
    \`\${CASDA_TAP_ENDPOINT}?\${new URLSearchParams({
      query: adql,
      lang: 'ADQL',
      format: 'json',
    })}\`
  )

  if (!response.ok) {
    throw new Error(\`CASDA query failed: \${response.status}\`)
  }

  const data = await response.json()
  return transformVOTableToSources(data)
}
\`\`\`

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
`,
  },
  {
    slug: 'accessible-space-data-visualization',
    title: 'Making Space Data Accessible to Everyone',
    excerpt: 'Designing astronomical data visualisations that work for users of all abilities, with a focus on WCAG compliance and inclusive design.',
    date: '2025-12-04',
    author: { name: 'Developer' },
    category: 'accessibility',
    tags: ['Accessibility', 'WCAG', 'Inclusive Design', 'UX'],
    readingTime: 8,
    content: `
# Making Space Data Accessible to Everyone

The universe belongs to everyone. When building Cosmos Collective, accessibility wasn't an afterthought - it was a core design principle. Here's how I approached making astronomical data accessible to users of all abilities.

## The Challenge

Astronomy is inherently visual. Images of galaxies, nebulae, and deep fields are the primary way we share discoveries. But what about users who:
- Have low vision or blindness?
- Have colour vision deficiency?
- Use screen readers?
- Navigate with keyboards only?
- Have cognitive or learning differences?

## WCAG 2.1 AA Compliance

We target WCAG 2.1 Level AA compliance across the platform:

### Perceivable

**Colour Contrast**: All text meets 4.5:1 minimum contrast ratio:

\`\`\`css
/* High contrast against dark background */
--text-primary: #ffffff;        /* 21:1 on void */
--text-secondary: #9ca3af;      /* 5.5:1 on void */
--cosmos-gold: #d4af37;         /* 6.2:1 on void */
\`\`\`

**Non-colour indicators**: Information isn't conveyed by colour alone:

\`\`\`tsx
{/* Uses both color AND pattern */}
<span
  className="w-2 h-2 rounded-full"
  style={{
    backgroundColor: wavelengthInfo.color,
    // Pattern class adds visual distinction
  }}
  className={cn(wavelengthInfo.pattern)}
/>
\`\`\`

### Operable

**Keyboard Navigation**: All interactive elements are keyboard accessible:

\`\`\`tsx
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
  tabIndex={0}
>
\`\`\`

**Focus Indicators**: Clear, visible focus rings:

\`\`\`css
:focus-visible {
  outline: 2px solid var(--cosmos-gold);
  outline-offset: 2px;
}
\`\`\`

**Reduced Motion**: Respecting user preferences:

\`\`\`tsx
const prefersReducedMotion = useReducedMotion()

// Skip animations if user prefers reduced motion
if (prefersReducedMotion) {
  return <StaticStarfield />
}
\`\`\`

### Understandable

**Clear Labels**: Form inputs have visible labels:

\`\`\`tsx
<label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
  Search Object
</label>
<input
  type="text"
  aria-label="Search for astronomical objects"
  placeholder="M31, NGC 1234..."
/>
\`\`\`

**Error Prevention**: Confirmations for destructive actions, clear error messages.

### Robust

**Semantic HTML**: Using proper HTML elements:

\`\`\`tsx
<nav aria-label="Main navigation">
  <ul role="list">
    <li><Link href="/explore">Explore</Link></li>
  </ul>
</nav>
\`\`\`

**ARIA Labels**: Screen reader descriptions for complex widgets:

\`\`\`tsx
<div
  role="img"
  aria-label={\`Image of \${observation.targetName}, a \${observation.category}
               observed by \${observation.source} on \${observation.observationDate}\`}
>
\`\`\`

## Alternatives for Visual Content

### Image Descriptions

Every astronomical image includes:
- Alt text with object name and type
- Detailed description in info panel
- AI-generated analysis available via screen reader

### Data Tables

Complex data is available in accessible table format:

\`\`\`tsx
<table role="table" aria-label="Observation metadata">
  <thead>
    <tr>
      <th scope="col">Property</th>
      <th scope="col">Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Coordinates</th>
      <td>{formatCoordinates(coords)}</td>
    </tr>
  </tbody>
</table>
\`\`\`

### Sky Map Accessibility

The Aladin Lite sky map includes:
- Screen reader announcements for position changes
- Keyboard shortcuts for navigation
- Text-based coordinate display
- Catalogue search as alternative to visual browsing

## Testing

Accessibility testing includes:
- **Automated**: axe-core, Lighthouse
- **Manual**: Keyboard-only navigation, screen reader testing
- **User testing**: Feedback from users with disabilities

## The Broader Impact

Making astronomical data accessible has benefits beyond compliance:
- Better mobile experience (touch targets, clear labels)
- Improved SEO (semantic structure)
- Clearer communication (forced clarity in descriptions)
- Wider audience reach

The universe is for everyone. Our tools should be too.
`,
  },
  {
    slug: 'citizen-science-technical-design',
    title: 'Technical Design for Citizen Science Classification',
    excerpt: 'Building a classification interface that empowers volunteers to contribute to real astronomical research through Zooniverse integration.',
    date: '2025-12-04',
    author: { name: 'Developer' },
    category: 'data-integration',
    tags: ['Citizen Science', 'Zooniverse', 'API', 'UX Design'],
    readingTime: 9,
    content: `
# Technical Design for Citizen Science Classification

Citizen science has revolutionised astronomy. Projects like Galaxy Zoo have demonstrated that volunteers can make meaningful contributions to research. Here's how I designed the classification system for Cosmos Collective.

## The Zooniverse Model

Zooniverse is the world's largest platform for people-powered research. Key concepts:

- **Projects**: Research initiatives (Galaxy Zoo, Planet Hunters)
- **Subjects**: Items to classify (images, light curves)
- **Workflows**: Classification sequences
- **Annotations**: User responses

## Architecture

\`\`\`
┌─────────────────────────────────────────┐
│           ClassificationHub             │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ ProjectList │  │ ClassifyPanel   │  │
│  │             │  │ ┌─────────────┐ │  │
│  │ • GalaxyZoo │  │ │SubjectViewer│ │  │
│  │ • RadioZoo  │  │ └─────────────┘ │  │
│  │ • Hunters   │  │ ┌─────────────┐ │  │
│  │             │  │ │ OptionList  │ │  │
│  └─────────────┘  │ └─────────────┘ │  │
│                   └─────────────────┘  │
└─────────────────────────────────────────┘
\`\`\`

## User Flow

1. **Browse Projects** - Select from available projects
2. **View Tutorial** - Learn what to look for
3. **Classify Subjects** - Answer questions about images
4. **Submit & Continue** - Responses saved, next subject loaded
5. **Track Progress** - View stats and achievements

## State Management

Classification state requires careful management:

\`\`\`typescript
interface ClassificationState {
  currentProject: Project | null
  currentSubject: Subject | null
  annotations: Annotation[]
  startTime: string
  isSubmitting: boolean
}

// Reset on project change
useEffect(() => {
  if (projectId) {
    loadSubject(projectId)
    setAnnotations([])
    setStartTime(new Date().toISOString())
  }
}, [projectId])
\`\`\`

## Optimistic Updates

For responsive UX, we submit classifications optimistically:

\`\`\`typescript
const handleSubmit = async () => {
  // Immediately load next subject
  setCurrentSubject(null)
  loadNextSubject()

  // Submit in background
  try {
    await submitClassification(annotations)
    setClassificationCount(c => c + 1)
  } catch (error) {
    // Retry logic, error display
  }
}
\`\`\`

## Gamification

Engagement features encourage continued participation:

### Ranks
\`\`\`typescript
const RANKS = [
  { name: 'Stargazer', min: 0 },
  { name: 'Space Cadet', min: 10 },
  { name: 'Explorer', min: 50 },
  { name: 'Voyager', min: 100 },
  // ...
]
\`\`\`

### Badges
- First classification
- Century club (100)
- Project-specific achievements

### Progress Tracking
- Session statistics
- Historical activity
- Contribution graphs

## Australian Focus

The platform highlights Australian projects:

- **ASKAP EMU**: Classify radio morphologies
- **Murchison**: Low-frequency source identification

This connects citizen scientists directly with Australian research priorities and SKA development.

## Data Quality

Zooniverse ensures quality through:

- **Retirement**: Subjects retire after N classifications
- **Gold Standard**: Known answers for accuracy tracking
- **Weighting**: Experienced users' votes count more

## Future Enhancements

- Real-time collaboration (see what others classify)
- Expert feedback on your classifications
- Machine learning assistance (highlight features)
- Mobile-optimised classification

Citizen science demonstrates that everyone can contribute to astronomical discovery. The platform makes this as accessible as possible.
`,
  },

  // ─── March 2026 ───────────────────────────────────────────────────────────

  {
    slug: 'march-2026-solar-system-moons-milky-way',
    title: 'March 2026: Tidal Locking, True-Scale Moons, and the Milky Way Background',
    excerpt: 'All 13 moons now tidally lock to their planets, scale correctly with True Scale mode, and the solar system viewer gained a photorealistic Milky Way background with progressive 8K texture loading.',
    date: '2026-03-09',
    author: { name: 'Developer' },
    category: 'visualization',
    tags: ['Three.js', 'Solar System', 'Moons', 'Milky Way', 'Texture', 'Tidal Lock'],
    readingTime: 5,
    featured: false,
    content: `
# March 2026: Tidal Locking, True-Scale Moons, and the Milky Way Background

Three separate improvements landed in the solar system viewer this session, each addressing a physical accuracy or visual quality gap.

## Tidal Locking — All 13 Moons

A tidally locked body always shows the same face to its parent planet — the Moon is the most familiar example. All 13 moons in the solar system viewer now implement this behaviour.

The implementation rotates each moon around its own Y axis at the same angular rate as its orbital revolution, and applies a \`lookAt\` correction each frame to compensate for Three.js's coordinate conventions. The result is that Io, Europa, Ganymede, Callisto, Titan, and the rest always present their correct hemisphere toward their parent.

## True-Scale Moon Sizes

When the **True Scale** toggle is active, planet radii now scale to physical proportions. Moon radii previously defaulted to a fixed presentational size regardless of this toggle. They now follow the same scale factor — so Ganymede (larger than Mercury) appears noticeably bigger than the Moon when True Scale is enabled, and Deimos appears tiny compared to Phobos.

## Collapsible Control Panels

The solar system control panel previously loaded fully expanded, occupying a significant portion of the viewport on first load. Panels now collapse by default with a smooth slide animation. This gives the 3D canvas more breathing room and reduces visual overwhelm on first visit.

## Milky Way Background Sphere

The deep-space black background was replaced with a photorealistic Milky Way band. The implementation uses an equirectangular map projected onto a large sphere surrounding the solar system, oriented to match the actual galactic plane position relative to Earth's ecliptic.

Progressive loading strategy:
- A 2K texture loads immediately (fast, low bandwidth cost)
- On good network connections (effective type \`4g\`), an 8K upgrade swaps in silently after the scene stabilises

The sphere is camera-tracked — it follows the camera position so the background never tiles or repeats as the camera moves through the solar system. A \`toggle-milky-way\` button lets users switch it off if they prefer the original black void.
`,
  },

  {
    slug: 'march-2026-camera-presets-galaxy-particles',
    title: 'March 2026: Camera Presets, Novel Orbit Paths, and Galaxy View Particles',
    excerpt: 'Six new camera presets give the solar system distinct cinematic personalities — lemniscate, satellite drift, breathing vortex, immersive chase, Surfboard, and Helix — plus the galaxy view gained a full particle system with halo, core bloom, and 52,000 stars.',
    date: '2026-03-10',
    author: { name: 'Developer' },
    category: 'visualization',
    tags: ['Three.js', 'Camera', 'Presets', 'Galaxy', 'Particles', 'Cinematic'],
    readingTime: 6,
    featured: false,
    content: `
# March 2026: Camera Presets, Novel Orbit Paths, and Galaxy View Particles

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

Each preset defines its own \`update(t)\` function called each animation frame, modifying camera position, look-at target, and field-of-view. Transitions between presets use a 2-second lerp to avoid jarring cuts.

## Aladin Lite WebAssembly CSP Fix

The sky-map view embeds Aladin Lite for interactive HiPS sky surveys. Aladin compiles critical path-finding code to WebAssembly at runtime. The Content Security Policy was blocking this with:

\`\`\`
Refused to compile or instantiate WebAssembly module because 'wasm-unsafe-eval' is not allowed
\`\`\`

Fix: add \`wasm-unsafe-eval\` to the \`script-src\` CSP directive specifically for the sky-map route. Elsewhere the directive remains strict.

## Galaxy View Particle System

The galaxy view existed as a flat disk with a JPEG texture. Three canvas-drawn procedural meshes were added on top:

- **Stellar halo** — a 512×512 radial gradient plane (5.5× galaxy diameter) giving the soft violet glow of the old stellar population
- **Core bloom** — a 256×256 concentrated warm gradient centred on Sagittarius A*, simulating the dense bulge luminosity
- **Edge glow** — a narrow tilted plane perpendicular to the disk, giving the galaxy apparent thickness when viewed at low elevation angles

On top of the meshes: **40,000 disk star particles** (blue-white, HSL 0.6–0.7) plus **12,000 brighter core particles** (orange/golden, HSL 0.12). Both sets use an additive blending point material with a soft radial canvas texture so individual points render as glowing circles rather than hard squares.
`,
  },

  {
    slug: 'march-2026-solar-system-feature-surge',
    title: 'March 2026: Dwarf Planets, Dive Mode, JWST Deep Zoom, and Kepler 3D',
    excerpt: 'The biggest single-session solar system update yet — dwarf planets, dive mode lighting, a redesigned JWST viewer with multi-wavelength channels and deep zoom, a Hubble brightness slider, and an interactive Kepler system diagram.',
    date: '2026-03-11',
    author: { name: 'Developer' },
    category: 'visualization',
    tags: ['Three.js', 'Solar System', 'JWST', 'Kepler', 'Dwarf Planets', 'Dive Mode'],
    readingTime: 7,
    featured: true,
    content: `
# March 2026: Dwarf Planets, Dive Mode, JWST Deep Zoom, and Kepler 3D

## Solar System: Six New Features

### Dwarf Planets

Pluto, Eris, Haumea, Makemake, and Ceres are now in the scene — correctly scaled, textured, and orbiting beyond Neptune. Haumea's elongated shape (it rotates so fast it's visibly oblate) is approximated with a scaled ellipsoid geometry. Pluto's moon Charon is also present and tidally locked.

### Dive Mode

Pressing **D** near a planet launches a cinematic dive sequence — the camera transitions from the orbital overview down through the planet's atmosphere to close orbit. A fill light attached to the camera illuminates the planet surface during the dive, and tone-mapping exposure adjusts to simulate the transition from black space to lit atmosphere.

Implementing this required adding a \`DirectionalLight\` tied to the dive camera position, separate from the scene's ambient lighting. The light uses \`decay = 0\` (no distance falloff) so it illuminates the planet regardless of its orbital position.

### Smoother Orbit Rings at Large Radii

Neptune's orbit ring was visibly faceted at 128 segments. All outer planet rings now use 256 segments, and a resolution-multiplier formula scales segment count with orbital radius. The change is imperceptible on inner planets and eliminates faceting on Neptune and the dwarf planet orbits.

## JWST Viewer: Deep Zoom and Wavelength Channels

The JWST viewer was rebuilt with two major improvements:

**Deep zoom** — a custom zoom/pan implementation on the canvas element, separate from the browser's native scroll, allowing magnification up to 8× without blurring. Implements momentum after pointer lift.

**Wavelength channels** — each JWST observation can now expose 2–4 wavelength composites side by side: NIRCam short, NIRCam long, MIRI mid-infrared, and in some cases NIRSpec. A channel switcher renders each composite at full resolution and cross-fades on selection. This makes it immediately obvious how different wavelength choices change what structures are visible in the same target.

## Hubble Brightness Slider

The Hubble image viewer gained a brightness/contrast adjustment slider — a CSS \`filter: brightness()\` + \`contrast()\` combination applied live to the image element. Useful for bringing out faint outer structures in galaxy images where the core would otherwise blow out.

## Kepler 3D Orbital Diagram

The Kepler exoplanet explorer at \`/kepler\` gained an interactive orbital system diagram. For any selected star, the diagram renders all confirmed planets as circles on scaled orbital paths, with period labels. Clicking a planet highlights it and shows its parameters (radius, mass, equilibrium temperature, insolation flux, habitable zone status).

The diagram uses SVG rather than canvas, which makes the orbital paths crisp at any DPI and makes hit-testing trivial.
`,
  },

  {
    slug: 'march-2026-dive-mode-lighting-fix',
    title: 'March 2026: Fixing Dive Mode Lighting and Mobile Control Panel',
    excerpt: 'Dive mode was overexposing the entire scene white — tracked down to a DirectionalLight illuminating all planets simultaneously. Fixed with calibrated ambient, exposure, and emissive values across all three entry and exit code paths.',
    date: '2026-03-12',
    author: { name: 'Developer' },
    category: 'architecture',
    tags: ['Three.js', 'Lighting', 'Dive Mode', 'Mobile', 'Bug Fix'],
    readingTime: 4,
    featured: false,
    content: `
# March 2026: Fixing Dive Mode Lighting and Mobile Control Panel

## The Dive Whitewash Bug

Entering dive mode was turning every planet in the scene almost completely white. The investigation traced through three separate subsystems.

### Root Cause

The dive camera light (\`diveCamLight\`) was declared as a \`DirectionalLight\`. Unlike a \`SpotLight\` or \`PointLight\`, a DirectionalLight in Three.js has infinite reach and no falloff — it illuminates every surface in the scene equally. When \`diveCamLight.intensity\` was set to 1.5 and combined with the boosted ambient (\`intensity = 1.2\`) and a tone-mapping exposure of 3.0, every planet in the scene became blown out, not just the one being dived into.

### Fix

Recalibrated all three lighting parameters for dive entry:

\`\`\`javascript
ambientLight.color.set(0x334466)  // cool tint, was white
ambientLight.intensity = 0.3      // was 1.2
diveFillLight.intensity = 0.15    // was 0.4
renderer.toneMappingExposure = 1.5 // was 3.0
diveCamLight.intensity = 0.55     // was 1.5
\`\`\`

Also added a subtle emissive component to the target planet's material during dive (\`emissive: 0x111122, emissiveIntensity: 0.1\`) so it doesn't go dead-dark if the camera light undershoots.

### Three Exit Paths

The dive has three ways to end — user presses Escape, timer expires, or clicking away. All three were restoring ambient to stale pre-fix values (\`0x333344 / 0.4\`). All three were updated to the correct post-fix restoration values (\`0x111122 / 0.15\`).

## Mobile Control Panel Fix

The solar system control panel was not visible on initial mobile load. The panel's \`display\` state was managed via a CSS class that toggled on first scroll — but the scroll event never fired on touch devices because the canvas consumed all touch input. Fixed by initialising the panel as visible on viewport widths below 768px.

## API Cleanup

Removed three sources of console noise: next-auth 404s (routes were registered but the package was removed), React hydration mismatches in the APOD widget (server timestamp differed from client), and ESAWebb CORS errors (requests now go through the existing server-side proxy).
`,
  },

  {
    slug: 'march-2026-design-audit',
    title: 'March 2026: Full Design Audit — Accessibility, Performance, Data Density, UX',
    excerpt: 'A systematic pass across every page: WCAG AA colour contrast, keyboard navigation, ARIA labelling, reduced motion support, font optimisation, lazy loading, and data density improvements.',
    date: '2026-03-14',
    author: { name: 'Developer' },
    category: 'accessibility',
    tags: ['WCAG', 'Accessibility', 'Performance', 'UX', 'Design', 'Lighthouse', 'ARIA'],
    readingTime: 6,
    featured: false,
    content: `
# March 2026: Full Design Audit — Accessibility, Performance, Data Density, UX

## Accessibility

### Colour Contrast

Every text/background pair across the site was checked against WCAG AA (4.5:1 for body text, 3:1 for large text and UI components). The most common failure was mid-grey labels (\`#6070a0\`) on the dark \`#0a0e1a\` background — adjusted to \`#8090c0\` across the design system.

### Keyboard Navigation

Tab order was audited in every modal and overlay. The solar system control panel, JWST viewer, and galaxy info panel all now:
- Trap focus when open (Tab and Shift+Tab cycle within the component)
- Return focus to the trigger element on close
- Close on Escape key

### ARIA Labelling

Added \`aria-label\`, \`aria-expanded\`, \`aria-controls\`, and \`role\` attributes to all icon-only buttons. Interactive 3D components gained \`aria-describedby\` pointing to a visually hidden description of available keyboard controls.

### Reduced Motion

Users with \`prefers-reduced-motion: reduce\` now see static alternatives to:
- The shimmer badge animation on the landing hero
- The breathing vortex camera preset (falls back to a stationary overview)
- Particle opacity fade-in animations in the galaxy view

## Performance

### Font Subsetting

Inter and Space Grotesk were loading full variable font files (~280KB combined). Implemented subsetting to Latin characters only, cutting the combined weight to ~95KB.

### Image Lazy Loading

Below-fold images on the landing page and Explore grid switched to \`loading="lazy"\`. Hero images retain \`priority\` loading. The change cut initial page weight by ~400KB on the landing page.

### Component Code Splitting

The galaxy view, JWST viewer, and Kepler explorer are now dynamic imports with \`{ ssr: false }\`. This moves their Three.js and canvas dependencies out of the initial JS bundle, reducing first-load parse time on the solar system page.

## Data Density

### Compacted Info Panels

Info panels previously used 16px padding and large font sizes that felt appropriate for a dashboard but wasteful at the side of a 3D canvas. Padding reduced to 12px, font sizes tightened, line heights reduced from 1.8 to 1.5. More data visible without scrolling.

### Galaxy Info Panel Expansion

The galaxy info panel gained four new data rows: galactic bar length, number of known globular clusters, estimated dark matter halo radius, and the angular separation to Andromeda (M31).
`,
  },

  {
    slug: 'march-2026-performance-lighthouse-vercel-analytics',
    title: 'March 2026: Lighthouse 100, Observatory A+, and Vercel Analytics',
    excerpt: 'Eliminated the homepage Three.js iframe that was loading 15MB of JavaScript on every landing page visit — replaced with a pre-recorded video loop. Lighthouse scores hit 100 across the board. Observatory security rating reached A+. Vercel Analytics deployed.',
    date: '2026-03-20',
    author: { name: 'Developer' },
    category: 'performance',
    tags: ['Lighthouse', 'Performance', 'Security', 'CSP', 'WebP', 'Vercel Analytics', 'LCP'],
    readingTime: 5,
    featured: false,
    content: `
# March 2026: Lighthouse 100, Observatory A+, and Vercel Analytics

## Eliminating the Homepage Three.js Load

The landing hero previously embedded the solar system viewer in an iframe — giving first-time visitors an interactive 3D preview immediately on the homepage. The cost: the iframe triggered a full Three.js bundle load (~15MB, deferred but still parsed), blocking the main thread and pushing Largest Contentful Paint above 3 seconds.

Fix: replaced the iframe with a pre-recorded 1080p WebP video loop of the solar system orbiting. Filesize: 1.8MB. The video \`autoplay muted loop playsinline\` starts immediately, looks identical to the live version, and removes the Three.js parse cost entirely from the landing page. The full interactive viewer is one click away at \`/solar-system\`.

Lighthouse improvement on the landing page:

| Metric | Before | After |
|--------|--------|-------|
| Performance | 74 | 100 |
| LCP | 3.4s | 0.9s |
| TBT | 620ms | 0ms |

## Observatory A+ Security Rating

Mozilla Observatory measures HTTP security headers. The previous rating was B+ (score 75). The blockers:

- **\`Content-Security-Policy\`** was missing \`frame-ancestors 'none'\` — added
- **\`Permissions-Policy\`** header was absent — added with camera, microphone, and geolocation all set to \`()\`
- The \`Referrer-Policy\` was set to \`no-referrer-when-downgrade\` rather than the stricter \`strict-origin-when-cross-origin\`

Result: Observatory score 120/100, A+ rating.

## WebP Image Conversion

All hero and feature images were converted from JPEG/PNG to WebP at 85% quality. Average size reduction: 45%. The Next.js \`Image\` component handles format negotiation for browsers that don't support WebP (primarily older Safari — though support is now >97% globally).

The solar system hero image specifically: a screenshot of Earth and the Moon from the 3D viewer, exported from the browser canvas at 2560×1440, converted to WebP at 80% quality — 340KB vs the original 1.1MB JPEG.

## Vercel Analytics

Installed \`@vercel/analytics\` for page view tracking with zero PII collection. The script is injected via the root layout and reports to Vercel's edge network — no third-party domains, no cookies, GDPR-compliant by default.

## Mobile Hero Optimisation

Added \`fetchpriority="high"\` to the mobile hero image and a \`<link rel="preload">\" in the document head. On 4G connections this moved the mobile LCP image out of the render-blocking waterfall, improving mobile Lighthouse performance from 87 to 96.

## Devlog CSS Bundle Split

The devlog page had ~8KB of inline CSS embedded in the page component. Extracted to a dedicated \`devlog.css\` import, allowing Next.js to split it into a separate chunk not loaded on any other route.
`,
  },

  {
    slug: 'march-2026-galaxy-view-overhaul',
    title: 'March 2026: Galaxy View Overhaul — Spiral Arms, Scientific Overlays, and Control Panel Redesign',
    excerpt: 'The galaxy view went from a particle blob to a scientifically grounded visualisation — logarithmic spiral arm particle distribution, procedural 2048px disk texture, Galactic Habitable Zone ring, Gaia census boundary, Kepler survey cone, Magellanic Clouds, and JWST/Hubble deep-field beams.',
    date: '2026-03-21',
    author: { name: 'Developer' },
    category: 'visualization',
    tags: ['Three.js', 'Galaxy', 'Milky Way', 'Procedural', 'Canvas', 'Gaia', 'Kepler', 'GHZ'],
    readingTime: 8,
    featured: true,
    content: `
# March 2026: Galaxy View Overhaul — Spiral Arms, Scientific Overlays, and Control Panel Redesign

## Control Panel: Simple / Advanced Modes

The solar system control panel accumulated ~20 controls across three sessions. The panel was restructured into two tiers:

- **Simple mode** (default) — speed slider, True Scale toggle, orbit ring toggle, planet labels
- **Advanced mode** — camera presets, asteroid belt, dive controls, grid, Milky Way toggle, particle density

A single chevron button switches between modes with a height-animated transition. This keeps the default experience uncluttered while making every option accessible.

## Galaxy View: Scientific Overlays

All six overlays are rendered inside \`galaxyGroup\` (the galaxy-scale Three.js group) and tagged with \`userData\` flags so \`setGalaxyOpacity()\` can fade them in and out with zoom-gated thresholds.

### Galactic Habitable Zone (GHZ)

A \`RingGeometry(130, 330, 128)\` ring at zero elevation, coloured \`0x00eebb\` with additive blending at 32% opacity. The GHZ represents the annular region of the galaxy where metallicity is high enough for rocky planet formation but radiation levels from the galactic centre are not prohibitive — estimated to be 25,000–33,000 light-years from the galactic centre. Our solar system sits comfortably within it.

The opacity was carefully calibrated: too high and the cyan ring washes out the warm tones of the galaxy texture (tested at 0.55 — too bright; settled at 0.32).

### Gaia Census Ring

A dashed \`LineSegments\` circle of radius 300 units (~30,000 light-years) centred on the Sun's position in the galaxy. Represents the rough extent of Gaia's precise astrometric measurements — 1.7 billion star positions, distances, and velocities.

The ring is constructed as 90 dashed segments (3 solid, 1 gap pattern), coloured \`0x88ccff\`. It fades in only at zoom ≥ 0.8×.

### Kepler Survey Cone

Kepler stared at a 115 square-degree patch of sky toward Cygnus for 9 years. The cone is rendered as a \`CylinderGeometry(rFar, rNear, height, 24, 1, true)\` (open-ended frustum shell) oriented via quaternion toward galactic coordinates l=76°, b=+13.5°. Inside the cone: 220 point particles representing individual confirmed exoplanet host stars, colour-coded blue-cyan.

A far-cap \`CircleGeometry\` marks the outer boundary of the survey field. The cone's 3D label reads "Kepler Survey Field — 5,000+ exoplanets found".

### Magellanic Clouds (LMC and SMC)

Placed at their actual galactic coordinates (LMC: l=280°, b=-33°, distance ~160,000 ly; SMC: l=303°, b=-44°, ~200,000 ly) but scaled to visible size in scene units. Each cloud is a \`Points\` object with 800–1,200 particles in a Gaussian distribution, coloured blue-white. Labelled "satellite galaxy (not to scale)" because at the galaxy's rendering scale they'd be invisible dots.

### JWST and Hubble Deep Field Beams

Two \`Line\` segments extend from the Sun's position at 210 units (~21,000 light-years) toward:
- **Hubble Ultra Deep Field** — galactic coordinates l=224°, b=-55°
- **JWST GOODS-South** — l=223°, b=-53°

Both point well out of the galactic plane toward intergalactic space, which is correct — deep fields are chosen to look through the minimum amount of galactic foreground dust.

## Galaxy Disk: Procedural Texture Replacement

The previous disk texture was a 1600×1600 JPEG (\`milky_way_huge.jpg\`). It was replaced with a 2048×2048 canvas-generated texture:

1. **Background glow** — radial gradient from warm orange-gold core to transparent edge
2. **Galactic bulge** — concentrated 255/248/210 white-gold bloom over the central 16% radius
3. **Central bar** — a rotated rectangle at galactic PA 62° (the Milky Way has a prominent bar ~27,000 ly long)
4. **Four spiral arms** — drawn as 280-step logarithmic spirals with \`globalCompositeOperation: 'screen'\`, each arm widening with radius
5. **120 HII region knots** — random bright dots along arm paths (50% blue-white 180/220/255, 50% warm 255/200/130)

The JPEG hi-res swap function (\`loadGalaxyHiRes\`) now no-ops, as the procedural texture is already higher quality than the JPEG it replaced.

## Particle Distribution: Logarithmic Spiral Arms

The previous 52,000 particles were distributed uniformly in a circle — giving the galaxy a blob appearance with no visible arm structure.

Replaced with 100,000 particles in three populations:

**65,000 arm stars** — distributed along four logarithmic spirals. Each particle is placed at a random progress \`t ∈ [0, 1]\` along the arm, at radius \`r = innerR + pow(t, 0.6) * (outerR - innerR)\` and angle \`θ = armOffset + t * 4.5\` radians. Perpendicular scatter increases with radius (arms flare outward). Colour: blue-white near outer edges, warming toward golden at inner radii.

**15,000 inter-arm stars** — older, redder population distributed uniformly in the disk at lower opacity.

**20,000 core stars** — highly centre-concentrated (\`pow(random, 2.2)\`), warm orange/golden HSL.

The result is a galaxy that shows clearly defined spiral structure from the default overview camera position.

## Bug Fixes

### Orbit Ring Bleed into Galaxy View

The galaxy view was calling \`referenceGrid.visible = false\` to hide the solar system, but planet orbit rings are stored in a separate \`orbitRingLines\` Map. Added \`orbitRingLines.forEach(l => { l.visible = false })\` to the galaxy entry transition and the inverse on exit.

### Zoom Direction

Galaxy zoom was panning toward the galactic centre (Sgr A*). Fixed: as zoom increases from 1× to 3.5×, \`galaxyLookOffset\` linearly interpolates from \`(0, 0)\` to the Sun's position in galaxy-local coordinates \`(cos(SUN_GALACTIC_ANGLE) * SUN_GALACTIC_R, sin(SUN_GALACTIC_ANGLE) * SUN_GALACTIC_R)\`. Zoom now brings the camera toward the Orion Arm.

### Dive Mode Lighting (Second Pass)

The dive mode whitewash bug (documented in the March 12 entry) had a second surface: when the galaxy view was active and the user pressed D, the dive lighting was still applying its old aggressive values to the galaxy scene. The dive entry path now checks \`galaxyViewActive\` before modifying ambient and exposure.
`,
  },
]

// ============================================
// Functions
// ============================================

export async function getDevlogPosts(): Promise<DevlogPost[]> {
  // In production, this would read from MDX files or CMS
  // Sort by date descending
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getDevlogPost(slug: string): Promise<DevlogPost | null> {
  return posts.find((post) => post.slug === slug) || null
}

export async function getRelatedPosts(currentSlug: string, limit = 3): Promise<DevlogPost[]> {
  const current = posts.find((p) => p.slug === currentSlug)
  if (!current) return []

  // Find posts with matching tags or category
  return posts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => ({
      post: p,
      score:
        (p.category === current.category ? 2 : 0) +
        p.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((p) => p.post)
}
