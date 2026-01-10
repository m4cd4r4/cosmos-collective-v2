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
--cosmos-cyan: #22d3ee;         /* 6.2:1 on void */
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
  outline: 2px solid var(--cosmos-cyan);
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
