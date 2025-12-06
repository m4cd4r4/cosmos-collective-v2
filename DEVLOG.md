# Cosmos Collective v2 - Development Log

> Technical analysis, issues, improvements, and implementation roadmap

**Last Updated:** December 6, 2025
**Analysis Scope:** Complete codebase review

---

## Fixes Implemented (December 4, 2025)
## Fixes Implemented (December 6, 2025)

### Server-Side API Proxies for CORS Resolution

**Problem:** ALeRCE (transient alerts) and GCN (gamma-ray circulars) APIs were blocked by CORS when called directly from the browser, causing the dashboard to show fallback data instead of live astronomical events.

**Solution:** Created Next.js API route proxies that fetch data server-side:

| File | Purpose | Status |
|------|---------|--------|
| `src/app/api/proxy/alerce/route.ts` | ALeRCE ZTF API proxy | **ADDED** |
| `src/app/api/proxy/gcn/route.ts` | NASA GCN Circulars proxy | **ADDED** |
| `src/services/real-time-events.ts` | Updated to use proxy endpoints | **MODIFIED** |

#### ALeRCE Proxy Details
- **Endpoint:** `https://api.alerce.online/ztf/v1/objects/`
- **Default classifier:** `lc_classifier` with `SNIa` class
- **Note:** `order_by` parameter not supported by this endpoint
- **Cache:** 5-minute revalidation
- **Fallback:** Returns sample data if API unavailable

#### GCN Proxy Details
- **Endpoint:** `https://gcn.nasa.gov/circulars/{id}.json`
- **Approach:** Fetches individual circulars by sequential ID (~43000 range as of Dec 2025)
- **Auto-discovery:** Finds latest circular ID automatically
- **Cache:** 5-minute revalidation
- **Fallback:** Returns placeholder data if API unavailable

#### Verified Live Data

| API | Status | Sample Data |
|-----|--------|-------------|
| ALeRCE | **WORKING** | ZTF19abnfgwe (SNIa), ZTF20abyvbvs |
| GCN | **WORKING** | Circular #43006: "Swift GRB 251205A" |

### Homepage Screenshot & Animated Demo

- Captured site screenshots using Playwright
- Added animated GIF demo to README
- Shows homepage, explore page, and sky map features

---


The following automated fixes have been applied:

| Fix | Status | Details |
|-----|--------|---------|
| JWST Image URLs | **FIXED** | Replaced broken stsci-opo.org URLs with working nasa.gov URLs |
| Sky Map CSS | **FIXED** | Moved Aladin CSS to `app/layout.tsx` head section |
| Radio Placeholders | **FIXED** | Created SVG placeholders for ASKAP, Parkes, MWA observations |
| Image Fallbacks | **FIXED** | Added `onError` handler to ImageCard with fallback support |
| NASA Image Service | **ADDED** | New `src/services/nasa-images.ts` for NASA Image Library API |
| PWA Caching | **FIXED** | Updated runtime caching for nasa.gov images |

### Manual Steps Required (For Tonight)

1. **Get NASA API Key** - Register at [api.nasa.gov](https://api.nasa.gov/) and add to `.env.local`
2. **Optional: Higher Quality Images** - Download full-resolution JWST images from NASA to `/public/images/featured/`
3. **OAuth Setup** - Configure Google/GitHub OAuth credentials for authentication

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Critical Issues](#critical-issues)
3. [Image & API Issues](#image--api-issues)
4. [Sky Map Issues](#sky-map-issues)
5. [Missing Files & Assets](#missing-files--assets)
6. [API Integration Status](#api-integration-status)
7. [Opportunities for Improvement](#opportunities-for-improvement)
8. [Imagery API Implementation Guide](#imagery-api-implementation-guide)
9. [Recommended Fixes](#recommended-fixes)
10. [Future Roadmap](#future-roadmap)

---

## Executive Summary

Cosmos Collective v2 is a well-architected multi-spectrum astronomical data exploration platform built with Next.js 14, React 18, and TypeScript.

### Current Status (Post-Fix)
- **Architecture:** Excellent - modern stack, clean code organization
- **UI/UX:** Good - responsive design, accessibility features
- **Images:** **WORKING** - Using NASA.gov URLs with fallback support
- **Sky Map:** **WORKING** - CSS properly loaded in document head
- **APIs:** Mixed - some working, some mock data only

### Remaining Manual Steps
1. Configure NASA API key in environment variables
2. (Optional) Self-host higher quality JWST images
3. Set up OAuth credentials for authentication

---

## Critical Issues

### 1. STScI Image URLs Return 403 Forbidden - **RESOLVED**

**Severity:** ~~CRITICAL~~ RESOLVED
**Impact:** ~~No JWST/Hubble images display on the site~~ Now using NASA.gov URLs
**Location:** `src/services/mast-api.ts:368-602`

> **FIX APPLIED:** Replaced all stsci-opo.org URLs with working nasa.gov/wp-content URLs

**Problem:**
The STScI image CDN URLs (stsci-opo.org) are returning 403 Forbidden errors:

```bash
curl -sI "https://stsci-opo.org/STScI-01G8GZR2PM5DH9B8DNSYSCXQ81.png"
# Returns: HTTP/2 403 (from CloudFront/S3)
```

**Root Cause:**
STScI has likely implemented referrer checking or hotlink protection on their CDN. The URLs may only work when accessed from stsci.edu domains.

**Solution Options:**

**Option A - Use Official MAST URLs (Recommended)**
```typescript
// Replace hardcoded URLs with MAST preview URLs
images: {
  thumbnail: `https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=${obsid}`,
  preview: `https://mast.stsci.edu/api/v0.1/Preview?obsid=${obsid}`,
  full: `https://mast.stsci.edu/api/v0.1/Download?uri=mast:${obsid}`,
}
```

**Option B - Use NASA Image API**
```typescript
// NASA Image and Video Library (free, no hotlink issues)
const NASA_IMAGE_API = 'https://images-api.nasa.gov/search'
const response = await fetch(`${NASA_IMAGE_API}?q=JWST+${targetName}`)
```

**Option C - Self-host Curated Images**
Download and serve images from `/public/images/featured/`

---

### 2. Radio Observation Images Missing - **RESOLVED**

**Severity:** ~~HIGH~~ RESOLVED
**Impact:** ~~Australian telescope observations show no images~~ Now using custom SVG placeholders
**Location:** `src/services/australian-telescopes.ts:381-461`

> **FIX APPLIED:** Created custom SVG placeholder images for each telescope:
> - `/public/images/askap-placeholder.svg` - ASKAP radio galaxy visualization
> - `/public/images/parkes-placeholder.svg` - Parkes pulsar visualization
> - `/public/images/mwa-placeholder.svg` - MWA Epoch of Reionization visualization
> - `/public/images/radio-placeholder.svg` - Generic radio fallback
> - `/public/images/cosmos-placeholder.svg` - Generic cosmos fallback

**Optional Enhancement:**
You can replace the SVG placeholders with actual images from CSIRO media:
- CSIRO Image Library: https://www.csiro.au/en/news/all/articles
- ASKAP Media: https://www.atnf.csiro.au/projects/askap/

---

### 3. Sky Map CSS Loading Issue - **RESOLVED**

**Severity:** ~~MEDIUM~~ RESOLVED
**Impact:** ~~Sky Map may not render correctly~~ CSS now loads correctly
**Location:** `src/components/features/sky-map/SkyMapViewer.tsx` and `src/app/layout.tsx`

> **FIX APPLIED:**
> - Moved CSS `<link>` tag from component to `app/layout.tsx` `<head>` section
> - Removed duplicate link tag from SkyMapViewer.tsx

**The fix that was applied:**

```tsx
// In app/layout.tsx
<head>
  <link
    rel="stylesheet"
    href="https://aladin.u-strasbg.fr/AladinLite/api/v3/latest/aladin.min.css"
  />
</head>
```

Or use CSS import in the component:

```tsx
// At top of SkyMapViewer.tsx
import 'https://aladin.u-strasbg.fr/AladinLite/api/v3/latest/aladin.min.css'
```

---

## Image & API Issues

### Dynamic Image URL Generation Issue

**Location:** `src/services/mast-api.ts:114-123`

The `generateImageUrls()` function creates URLs that don't match actual STScI paths:

```typescript
// Current (broken)
function generateImageUrls(obsid: string, targetName: string) {
  const cleanName = targetName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
  return {
    thumbnail: `${IMAGE_CDN_BASE}${obsid.slice(-4)}-${cleanName.slice(0, 10)}.png`,
    // These URLs don't correspond to real files
  }
}
```

**Solution:**
Use MAST API to fetch actual preview URLs:

```typescript
export async function getObservationPreview(obsid: string): Promise<string> {
  const response = await mastClient.get(`/api/v0.1/Preview`, {
    params: { obsid }
  })
  return response.data.url
}
```

---

### ImageCard Component Using Native `<img>`

**Location:** `src/components/ui/Card.tsx:231-236`

The ImageCard uses a native `<img>` tag instead of Next.js Image:

```tsx
<img
  src={src}
  alt={alt}
  loading="lazy"
  className="absolute inset-0 w-full h-full object-cover..."
/>
```

**Impact:**
- No automatic image optimization
- No WebP/AVIF conversion
- No responsive sizing

**Recommendation:**
Use Next.js Image component with `unoptimized` prop for external URLs:

```tsx
import Image from 'next/image'

<Image
  src={src}
  alt={alt}
  fill
  sizes="(max-width: 768px) 100vw, 33vw"
  className="object-cover..."
  unoptimized // For external domains
/>
```

---

## Sky Map Issues

### Aladin Lite Integration Problems

1. **Script Loading Timing**
   - Script loads via `next/script` with `afterInteractive` strategy
   - `initializeAladin` callback may fire before DOM is ready

2. **CSS in Wrong Location**
   - `<link>` tag placed inside component return
   - Should be in document head

3. **No Error Boundary**
   - If Aladin fails to load, no fallback UI

**Recommended Fix:**

```tsx
// SkyMapViewer.tsx
useEffect(() => {
  // Load CSS dynamically
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://aladin.u-strasbg.fr/AladinLite/api/v3/latest/aladin.min.css'
  document.head.appendChild(link)

  return () => {
    document.head.removeChild(link)
  }
}, [])
```

---

## Missing Files & Assets

### Files Added (December 4, 2025)

| File | Purpose | Status |
|------|---------|--------|
| `/public/images/radio-placeholder.svg` | Generic radio fallback | **ADDED** |
| `/public/images/askap-placeholder.svg` | ASKAP visualization | **ADDED** |
| `/public/images/parkes-placeholder.svg` | Parkes pulsar visualization | **ADDED** |
| `/public/images/mwa-placeholder.svg` | MWA EoR visualization | **ADDED** |
| `/public/images/cosmos-placeholder.svg` | Generic cosmos fallback | **ADDED** |
| `src/services/nasa-images.ts` | NASA Image API service | **ADDED** |

### Still Missing (Optional)

| File | Purpose | Priority |
|------|---------|----------|
| `/public/og-image.png` | OpenGraph social image | MEDIUM |
| `/public/favicon.ico` | Site favicon | MEDIUM |
| `/public/apple-touch-icon.png` | iOS icon | LOW |
| `/public/images/featured/*.jpg` | Self-hosted JWST images | LOW |

### Files Present

| File | Status |
|------|--------|
| `/public/manifest.json` | Present |
| `/public/sw.js` | Present (service worker) |

---

## API Integration Status

### Working APIs

| API | Status | Notes |
|-----|--------|-------|
| NASA APOD | Ready | Requires API key |
| NASA NEO | Ready | Requires API key |
| ISS Position | Ready | Public API |
| NOAA Solar Weather | Ready | Public API |

### Partially Working

| API | Status | Notes |
|-----|--------|-------|
| MAST/STScI | Query works, images don't | Need alternative image source |
| CASDA TAP | Query ready | No images in response |
| Aladin Lite | Script loads | CSS issue |

### Mock Data Only

| API | Status | Notes |
|-----|--------|-------|
| Zooniverse | Mock data | Full integration requires OAuth |
| Analytics | Local only | IndexedDB storage |

---

## Opportunities for Improvement

### 1. Replace Mock Zooniverse with Real API

**Current:** Mock projects and classifications
**Opportunity:** Full Zooniverse OAuth integration

```typescript
// Real Zooniverse API integration
const ZOONIVERSE_API = 'https://www.zooniverse.org/api'

export async function getActiveProjects(tag: string) {
  const response = await fetch(
    `${ZOONIVERSE_API}/projects?tag=${tag}&state=live&page_size=10`
  )
  return response.json()
}
```

### 2. Add Real-Time Data Streaming

**Opportunity:** WebSocket connections for live data

```typescript
// Transient Alerts (ALeRCE, TNS)
const ALERCE_WS = 'wss://alerce.online/stream'

// GCN Notices for gamma-ray bursts
const GCN_API = 'https://gcn.nasa.gov/api/circulars'
```

### 3. Implement FITS File Viewing

**Opportunity:** In-browser FITS visualization

```typescript
// Using js9 or fitsjs library
import { FITS } from 'fitsjs'

async function loadFITS(url: string) {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  const fits = new FITS(buffer)
  return fits.getHDU(0).data
}
```

### 4. Add 3D Visualization

**Opportunity:** Three.js galaxy/catalog visualization (dependency already installed)

```typescript
// Already have @react-three/fiber and @react-three/drei
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'

function Galaxy3D({ sources }) {
  return (
    <Canvas>
      <Stars />
      {sources.map(src => (
        <mesh key={src.id} position={[src.x, src.y, src.z]}>
          <sphereGeometry args={[0.01]} />
          <meshBasicMaterial color={src.color} />
        </mesh>
      ))}
      <OrbitControls />
    </Canvas>
  )
}
```

### 5. Progressive Web App Improvements

**Current:** Basic PWA with service worker
**Opportunity:** Offline observation caching

```typescript
// Cache observations for offline viewing
async function cacheObservation(observation: Observation) {
  const cache = await caches.open('observations-v1')
  await cache.put(
    `/observation/${observation.id}`,
    new Response(JSON.stringify(observation))
  )

  // Also cache the image
  if (observation.images.thumbnail) {
    const imgResponse = await fetch(observation.images.thumbnail)
    await cache.put(observation.images.thumbnail, imgResponse)
  }
}
```

---

## Imagery API Implementation Guide

### Option 1: NASA Image and Video Library (Recommended)

**API:** https://images.nasa.gov
**Docs:** https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf
**Auth:** None required

```typescript
// src/services/nasa-images.ts
const NASA_IMAGES_API = 'https://images-api.nasa.gov'

interface NASAImage {
  href: string
  data: {
    title: string
    description: string
    date_created: string
    keywords: string[]
    nasa_id: string
  }[]
  links: {
    href: string
    rel: 'preview' | 'captions'
  }[]
}

export async function searchNASAImages(query: string): Promise<NASAImage[]> {
  const response = await fetch(
    `${NASA_IMAGES_API}/search?q=${encodeURIComponent(query)}&media_type=image`
  )
  const data = await response.json()
  return data.collection.items
}

export async function getJWSTImages(): Promise<NASAImage[]> {
  return searchNASAImages('James Webb Space Telescope')
}
```

### Option 2: ESA/Hubble Archive

**API:** https://esahubble.org/images/
**RSS Feed:** https://esahubble.org/images/feed/

```typescript
// Parse ESA Hubble RSS for images
export async function getHubbleImages() {
  const response = await fetch('https://esahubble.org/images/feed/')
  const xml = await response.text()
  // Parse XML and extract image URLs
}
```

### Option 3: Astronomy Picture of the Day Archive

**API:** https://api.nasa.gov/planetary/apod
**Auth:** NASA API Key (free)

```typescript
// Get APOD archive
export async function getAPODArchive(count: number = 30) {
  const response = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&count=${count}`
  )
  return response.json()
}
```

### Option 4: WorldWide Telescope (WWT)

**API:** https://worldwidetelescope.org/docs/
**Features:** Interactive sky tiles

```typescript
// WWT tile server for sky images
const WWT_TILES = 'https://cdn.worldwidetelescope.org/wwtweb/tiles'

function getTileUrl(level: number, x: number, y: number, survey: string) {
  return `${WWT_TILES}/${survey}/${level}/${x}/${y}.png`
}
```

### Option 5: SkyView (NASA GSFC)

**API:** https://skyview.gsfc.nasa.gov/
**Features:** Virtual observatory, multi-wavelength

```typescript
// SkyView image cutout service
const SKYVIEW_API = 'https://skyview.gsfc.nasa.gov/cgi-bin/images'

export async function getSkyViewImage(
  ra: number,
  dec: number,
  survey: string = 'dss'
) {
  const params = new URLSearchParams({
    Position: `${ra},${dec}`,
    Survey: survey,
    Return: 'FITS',
    Size: '0.5'
  })
  return `${SKYVIEW_API}?${params}`
}
```

---

## Recommended Fixes

### Immediate (Fix Images)

1. **Replace JWST Image URLs**

   ```typescript
   // src/services/mast-api.ts
   // Update getFeaturedJWSTImages() to use NASA Image API

   import { searchNASAImages } from './nasa-images'

   export async function getFeaturedJWSTImages(): Promise<Observation[]> {
     const nasaImages = await searchNASAImages('JWST')
     return nasaImages.map(img => ({
       id: img.data[0].nasa_id,
       images: {
         thumbnail: img.links.find(l => l.rel === 'preview')?.href,
         preview: img.links.find(l => l.rel === 'preview')?.href,
         full: img.href,
       },
       // ... rest of mapping
     }))
   }
   ```

2. **Add Placeholder Images**

   Create SVG placeholders for missing images:
   ```svg
   <!-- /public/images/radio-placeholder.svg -->
   <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
     <rect fill="#030014" width="400" height="300"/>
     <circle cx="200" cy="150" r="80" stroke="#06b6d4" fill="none" stroke-width="2"/>
     <text x="200" y="250" text-anchor="middle" fill="#9ca3af">Radio Observation</text>
   </svg>
   ```

3. **Fix Sky Map CSS**

   Move the CSS link to `app/layout.tsx`:
   ```tsx
   // app/layout.tsx
   export default function RootLayout({ children }) {
     return (
       <html>
         <head>
           <link
             rel="stylesheet"
             href="https://aladin.u-strasbg.fr/AladinLite/api/v3/latest/aladin.min.css"
           />
         </head>
         <body>{children}</body>
       </html>
     )
   }
   ```

### Short-term (This Week)

1. Add NASA API key to environment variables
2. Create `src/services/nasa-images.ts` service
3. Add fallback image error handling
4. Test all API endpoints

### Medium-term (This Month)

1. Implement actual Zooniverse OAuth
2. Add FITS file viewer
3. Set up image caching strategy
4. Add error boundaries

---

## Future Roadmap

### Phase 1: Core Functionality (Week 1-2)
- [x] Fix all image display issues
- [x] Implement NASA Image API integration
- [x] Add missing placeholder assets
- [x] Fix Sky Map CSS loading
- [ ] Test all API connections

### Phase 2: Enhanced Features (Week 3-4)
- [ ] Real Zooniverse integration
- [ ] Implement FITS viewing
- [ ] Add 3D galaxy visualization
- [ ] Improve PWA offline support

### Phase 3: Advanced Features (Month 2)
- [ ] Real-time transient alerts
- [ ] User accounts with database
- [ ] Classification history tracking
- [ ] Social sharing features

### Phase 4: Scale & Polish (Month 3)
- [ ] Performance optimization
- [ ] CDN for cached images
- [ ] Analytics dashboard
- [ ] Mobile app wrapper

---

## Technical Debt

1. **Next.js Image Optimization:** Not using `next/image` for external images
2. **Error Handling:** Limited error boundaries and fallbacks
3. **Testing:** Test files exist but may need expansion
4. **Database:** Prisma configured but not connected
5. **Authentication:** NextAuth configured but OAuth apps not set up

---

## Resources

### API Documentation
- [MAST API](https://mast.stsci.edu/api/v0/)
- [NASA APIs](https://api.nasa.gov/)
- [CASDA TAP](https://casda.csiro.au/casda_vo_tools/tap)
- [Zooniverse API](https://www.zooniverse.org/talk/18/1034522)
- [Aladin Lite](https://aladin.u-strasbg.fr/AladinLite/doc/)

### Image Sources
- [NASA Image Library](https://images.nasa.gov/)
- [ESA/Hubble](https://esahubble.org/images/)
- [CSIRO Media](https://www.csiro.au/en/news)
- [APOD Archive](https://apod.nasa.gov/apod/archivepix.html)

---

*This DevLog is a living document. Update as issues are resolved and new features are implemented.*
