# Cosmos Collective - Improvement Roadmap

**Date:** January 6, 2026
**Current Grade:** A- (90/100)
**Target Grade:** A+ (95/100)

---

## 📊 Current Status

### ✅ Completed (January 6, 2026)
- Security vulnerabilities fixed (Next.js 14.2.35)
- Image loading improved (37% faster, 39% fewer failures)
- Accessibility enhanced (100% H1 coverage)
- ESLint configured
- TypeScript: 0 errors
- Test coverage: 100% E2E pass rate

### ⚠️ Discovered Issues
- **Launch section was reverted** - pages don't exist in current codebase
- Homepage still loads in 5.6s (target: <3s)
- 67 image requests still failing
- Aladin Lite sky map not rendering
- No unit tests
- Missing security headers (CSP, HSTS)

---

## 🎯 Improvement Roadmap

### 🔴 High Priority (This Week)

#### 1. **Optimize Homepage Load Time** (5.6s → <3s)

**Current bottlenecks:**
- Heavy initial bundle (15MB static assets)
- 67 failed image requests
- Synchronous script loading

**Actions:**

```javascript
// 1.1 Lazy load arcade games
// In src/components/features/arcade/ArcadeModal.tsx
const ArcadeGames = dynamic(() => import('./ArcadeGames'), {
  loading: () => <Spinner />,
  ssr: false
});

// 1.2 Add image error handling
// Create src/components/ui/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

export function OptimizedImage({ src, fallback = '/placeholder.jpg', ...props }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => setImgSrc(fallback)}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Add blur placeholder
    />
  );
}

// 1.3 Implement prefetching
// In src/components/layout/Header.tsx
<Link href="/explore" prefetch={true}>
  Explore
</Link>
```

**Expected improvement:** 5.6s → 3.5s (37% faster)

---

#### 2. **Fix Remaining Image Failures** (67 requests)

**Root cause:** Some NASA images timeout or are unavailable

**Actions:**

```javascript
// 2.1 Add retry logic to image loader
// Update image-loader.js
export default function customImageLoader({ src, width, quality }) {
  if (src.includes('nasa.gov') || src.includes('images-assets.nasa.gov')) {
    // Add CDN proxy for reliability
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && shouldUseProxy(src)) {
      return `/api/image-proxy?url=${encodeURIComponent(src)}&w=${width}`;
    }
    return src;
  }
  // ... rest
}

// 2.2 Create image proxy API route
// Create src/app/api/image-proxy/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  try {
    const response = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Cosmos-Collective/2.0' },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    // Return placeholder
    return fetch('/images/placeholder-cosmic.jpg');
  }
}
```

**Expected improvement:** 67 → <10 failures

---

#### 3. **Fix Aladin Lite Sky Map**

**Issue:** Container not rendering in tests/production

**Actions:**

```typescript
// 3.1 Add error boundary
// Update src/components/features/sky-map/SkyMapViewer.tsx
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export function SkyMapViewer({ initialRa, initialDec, initialFov, initialTarget }) {
  const [aladinLoaded, setAladinLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!aladinLoaded) return;

    try {
      // Initialize Aladin Lite v3
      const aladin = A.aladin('#aladin-lite-div', {
        survey: 'P/DSS2/color',
        fov: initialFov || 180,
        target: initialTarget || 'M31',
        showReticle: true,
        showLayersControl: true,
        showGotoControl: true,
      });

      if (initialRa && initialDec) {
        aladin.gotoRaDec(initialRa, initialDec);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [aladinLoaded, initialRa, initialDec, initialFov, initialTarget]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load sky map</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js"
        strategy="afterInteractive"
        onLoad={() => setAladinLoaded(true)}
        onError={(e) => setError('Failed to load Aladin library')}
      />
      <div
        id="aladin-lite-div"
        className="w-full h-full"
        data-testid="aladin-container"
      />
    </>
  );
}
```

**Expected improvement:** Sky map functional in production

---

### 🟡 Medium Priority (This Month)

#### 4. **Add Security Headers**

**Current:** Basic headers (X-Frame-Options, etc.)
**Missing:** CSP, HSTS

**Actions:**

```javascript
// Update next.config.js
headers: async () => [
  {
    source: '/(.*)',
    headers: [
      // Existing headers...
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://aladin.cds.unistra.fr https://www.googletagmanager.com",
          "style-src 'self' 'unsafe-inline' https://aladin.cds.unistra.fr",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://images-assets.nasa.gov https://mast.stsci.edu https://api.nasa.gov https://www.google-analytics.com",
          "frame-src 'self' https://www.youtube.com",
          "worker-src 'self' blob:",
        ].join('; '),
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ],
  },
],
```

**Expected improvement:** Security grade A+ (from A-)

---

#### 5. **Add Unit Tests**

**Current:** 0 unit tests (only E2E)
**Target:** 80% coverage for utilities and hooks

**Actions:**

```bash
# 5.1 Create test files
mkdir -p src/__tests__/lib
mkdir -p src/__tests__/hooks
mkdir -p src/__tests__/services

# 5.2 Example: src/__tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn, formatDate } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });
});

# 5.3 Run tests
npm run test
```

**Expected improvement:** Better code reliability, faster debugging

---

#### 6. **Implement Explore Page Filters**

**Current:** Search only
**Missing:** Telescope, wavelength, date range filters

**Actions:**

```typescript
// Update src/components/features/explore/ExploreFilters.tsx
export function ExploreFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    telescope: 'all',
    wavelength: 'all',
    dateRange: 'all'
  });

  const telescopes = ['all', 'jwst', 'hubble', 'askap', 'mwa', 'parkes'];
  const wavelengths = ['all', 'radio', 'infrared', 'optical', 'uv', 'xray'];
  const dateRanges = ['all', 'last-7-days', 'last-30-days', 'last-year'];

  return (
    <div className="flex gap-4 mb-6">
      <Select value={filters.telescope} onChange={...}>
        {telescopes.map(t => <option key={t} value={t}>{t}</option>)}
      </Select>

      <Select value={filters.wavelength} onChange={...}>
        {wavelengths.map(w => <option key={w} value={w}>{w}</option>)}
      </Select>

      <Select value={filters.dateRange} onChange={...}>
        {dateRanges.map(d => <option key={d} value={d}>{d}</option>)}
      </Select>
    </div>
  );
}
```

**Expected improvement:** Better user experience, easier discovery

---

#### 7. **Optimize Bundle Size**

**Current:** 15MB static assets
**Target:** <10MB

**Actions:**

```javascript
// 7.1 Analyze current bundle
npm run analyze

// 7.2 Dynamic imports for heavy features
// In src/app/page.tsx
const ArcadeModal = dynamic(() => import('@/components/features/arcade/ArcadeModal'), {
  ssr: false
});

const Starfield = dynamic(() => import('@/components/ui/Starfield'), {
  ssr: false
});

// 7.3 Use next/font instead of Google Fonts CDN
// Already done in layout.tsx ✅

// 7.4 Optimize images
// Use WebP/AVIF format (already configured ✅)

// 7.5 Remove unused dependencies
npm uninstall <unused-packages>
```

**Expected improvement:** 15MB → 10MB (33% reduction)

---

### 🟢 Low Priority (Next Quarter)

#### 8. **Add Launch Section** (Optional)

**Note:** Launch section was reverted in production. If you want it back:

**Actions:**

```bash
# 8.1 Check if old branch exists
git branch -a | grep launch

# 8.2 If branch exists, cherry-pick commits
git cherry-pick <commit-hash-of-launch-pages>

# 8.3 Or rebuild from scratch
mkdir -p src/app/launch src/app/live src/app/agencies src/app/vehicles

# 8.4 Integrate with Launch Library 2 API
# https://ll.thespacedevs.com/2.2.0/launch/upcoming/
```

**Decision needed:** Do you want the Launch section back?

---

#### 9. **Add Progressive Web App Features**

**Current:** Basic PWA (service worker, manifest)
**Enhancement:** Offline mode, install prompt, push notifications

**Actions:**

```typescript
// 9.1 Add install prompt
// Create src/components/InstallPrompt.tsx
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setShowPrompt(false);
    }
  };

  return showPrompt ? (
    <div className="fixed bottom-20 right-4 glass-panel p-4 rounded-lg">
      <p className="mb-2">Install Cosmos Collective for offline access</p>
      <button onClick={handleInstall} className="btn-primary">
        Install
      </button>
    </div>
  ) : null;
}

// 9.2 Add offline page
// Create src/app/offline/page.tsx (already exists ✅)

// 9.3 Enhanced service worker caching
// Update next.config.js PWA config
```

---

#### 10. **Add Error Monitoring**

**Current:** No error tracking
**Recommended:** Sentry or Vercel Analytics

**Actions:**

```bash
# 10.1 Install Sentry
npm install @sentry/nextjs

# 10.2 Initialize
npx @sentry/wizard@latest -i nextjs

# 10.3 Configure
# Creates sentry.client.config.ts and sentry.server.config.ts

# 10.4 Add error boundary
# Create src/components/ErrorBoundary.tsx
```

**Expected improvement:** Proactive bug detection, better debugging

---

## 📈 Expected Impact

| Improvement | Current | Target | Impact |
|-------------|---------|--------|--------|
| **Homepage Load** | 5.6s | <3s | 🟢 High |
| **Image Failures** | 67 | <10 | 🟢 High |
| **Sky Map** | Broken | Working | 🟢 High |
| **Security Headers** | Basic | CSP+HSTS | 🟡 Medium |
| **Unit Test Coverage** | 0% | 80% | 🟡 Medium |
| **Bundle Size** | 15MB | <10MB | 🟡 Medium |
| **Overall Grade** | A- (90) | **A+ (95)** | 🎯 Target |

---

## 🛠️ Implementation Order

### Week 1: Performance & Critical Fixes
1. ✅ Optimize homepage load time (Actions 1.1-1.3)
2. ✅ Fix image failures (Actions 2.1-2.2)
3. ✅ Fix Aladin Lite sky map (Actions 3.1)

**Expected time:** 8-12 hours
**Impact:** High (user-facing improvements)

### Week 2: Security & Quality
4. ✅ Add security headers (Action 4)
5. ✅ Add unit tests (Actions 5.1-5.3)
6. ✅ Implement explore filters (Action 6)

**Expected time:** 10-15 hours
**Impact:** Medium (foundation improvements)

### Week 3: Optimization
7. ✅ Optimize bundle size (Actions 7.1-7.5)
8. ⏸️ Consider Launch section restoration (optional)

**Expected time:** 6-10 hours
**Impact:** Medium (performance gains)

### Month 2-3: Enhancements
9. ✅ Add PWA features (Actions 9.1-9.3)
10. ✅ Add error monitoring (Actions 10.1-10.4)

**Expected time:** 8-12 hours
**Impact:** Low (nice-to-have features)

---

## 📊 Success Metrics

Track these metrics weekly:

```bash
# Performance
- Homepage load time: <3s
- Time to Interactive: <2s
- Lighthouse Performance score: >90

# Reliability
- Image load success rate: >95%
- API success rate: >99%
- Error rate: <0.1%

# Quality
- Unit test coverage: >80%
- E2E test pass rate: 100%
- TypeScript errors: 0

# Security
- Security headers score: A+
- Vulnerability count: 0
- OWASP compliance: 100%
```

---

## 🚀 Quick Wins (Can do today)

### 1. Add blur placeholders to images
```javascript
// In next.config.js
images: {
  // ... existing config
  minimumCacheTTL: 60,
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 2. Enable React DevTools profiling
```javascript
// In next.config.js
reactStrictMode: true,
productionBrowserSourceMaps: false, // Reduce bundle size
```

### 3. Add robots.txt optimization
```
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://cosmos-collective.com.au/sitemap.xml

# Block expensive crawlers
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /
```

### 4. Preconnect to external domains
```html
<!-- Already in layout.tsx ✅ -->
<link rel="preconnect" href="https://images-api.nasa.gov" />
<link rel="preconnect" href="https://mast.stsci.edu" />
```

---

## 📞 Need Help?

Each improvement has detailed implementation steps. If you want me to:
- Implement any specific improvement
- Prioritize differently
- Add more features

Just ask!

**Next recommended action:** Start with Week 1 (Performance & Critical Fixes) for immediate user impact.

---

*Last updated: January 6, 2026*
*Based on: COMPREHENSIVE-ANALYSIS-REPORT.md*
