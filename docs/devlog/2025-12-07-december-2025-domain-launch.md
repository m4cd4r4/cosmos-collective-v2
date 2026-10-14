---
title: "December 2025: Custom Domain, 75 Observations & Community Features"
slug: december-2025-domain-launch
date: 2025-12-07
category: architecture
tags: [Domain, DNS, Accessibility, Community, Ko-fi, JWST, Hubble, ASKAP, Radio Astronomy]
author: "Developer"
reading_time: 6
featured: true
excerpt: "Launching cosmos-collective.com.au with custom domain setup, tripling observations from 25 to 75, adding accessibility improvements, and Ko-fi support integration."
---# December 2025: Custom Domain & Community Features

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

```
A     @      76.76.21.21          (Vercel's IP)
CNAME www    cname.vercel-dns.com (Vercel's CNAME)
```

The www subdomain automatically redirects to the apex domain for a consistent user experience.

### Files Updated

All references to the old Vercel URL were updated across the codebase:

- `src/app/layout.tsx` - OpenGraph URLs, canonical links, JSON-LD schema
- `src/app/sitemap.ts` - BASE_URL constant
- `public/robots.txt` - Sitemap URL
- `docs/FUTURE_FEATURES.md` - OAuth callback URLs
- `README.md` - Live demo links

## Accessibility Improvements

### Filter Tooltips

Added `title` and `aria-label` attributes to all filter buttons on the Explore page. This improves accessibility for:

- **Screen reader users** - Clear labels describe each filter option
- **Mobile users** - Long-press reveals tooltip text
- **Keyboard navigators** - Better context when tabbing through filters

```tsx
<button
  onClick={() => updateFilter('source', source.value)}
  aria-pressed={currentSource === source.value}
  aria-label={source.label}
  title={source.label}
>
  {source.icon}
  <span className="hidden sm:inline">{source.label}</span>
</button>
```

Filter groups updated:
- **Telescope sources** - JWST, Hubble, ASKAP, MWA, Parkes
- **Object categories** - Galaxies, Nebulae, Stars, etc.
- **Wavelength bands** - Radio, Infrared, Visible, UV, X-ray

## Community Features

### Ko-fi Support Integration

Added a Ko-fi donation link to the footer, allowing supporters to contribute to the project's development:

```tsx
<a
  href="https://ko-fi.com/m4cd4r4"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Support on Ko-fi"
>
  <Heart className="w-5 h-5" />
</a>
```

### "Available for Hire" Badge

Added a professional hire badge to the footer for potential collaboration opportunities:

```tsx
<a href="https://github.com/m4cd4r4" className="...">
  <Briefcase className="w-3.5 h-3.5" />
  <span>Available for hire</span>
</a>
```

## SEO & Metadata Updates

With the new domain, all SEO-related metadata was updated:

### JSON-LD Schema

```json
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
```

### robots.txt

Updated sitemap reference:
```
Sitemap: https://cosmos-collective.com.au/sitemap.xml
```

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
- Images use `loading="lazy"` for deferred loading
- Data is bundled at build time (static generation)
- Client-side filtering operates on small in-memory dataset
- Pagination via "Load More" button limits initial render

## What's Next

- Implement user authentication for personalised features
- Add more citizen science classification projects
- Performance optimisations for the gallery
- Real-time data integration improvements

The custom domain establishes Cosmos Collective as a permanent home for exploring the universe through Australian and international telescope data.
