# Bundle Optimization Guide

## Analysis Reports Generated

Run `ANALYZE=true npm run build` to generate bundle analysis reports:
- `.next/analyze/client.html` - Client-side bundles
- `.next/analyze/nodejs.html` - Server-side bundles
- `.next/analyze/edge.html` - Edge runtime bundles

## Optimizations Already Implemented

### 1. Code Splitting
- ✅ Dynamic imports for heavy components (Starfield, Web Vitals)
- ✅ Lazy loading for Aladin Lite sky map
- ✅ Route-based code splitting (Next.js automatic)

### 2. Tree Shaking
- ✅ ESM imports throughout codebase
- ✅ Named imports from libraries
- ✅ No default exports where unnecessary

### 3. Image Optimization
- ✅ Next.js Image component with automatic optimization
- ✅ WebP/AVIF format support
- ✅ Lazy loading for off-screen images
- ✅ Image proxy for external sources

### 4. Font Optimization
- ✅ Next.js font optimization (Inter, Space Grotesk, JetBrains Mono)
- ✅ Font display: swap for better performance
- ✅ Subsetting to Latin characters only

## Recommended Future Optimizations

### High Priority (Easy Wins)

1. **Analyze Large Dependencies**
   ```bash
   npm run analyze
   # Open .next/analyze/client.html
   # Look for large chunks (>100KB)
   ```

2. **Remove Unused Dependencies**
   ```bash
   npx depcheck
   ```

3. **Optimize Icon Imports**
   ```tsx
   // Before
   import * as Icons from 'lucide-react'

   // After (current - good!)
   import { Telescope, Search } from 'lucide-react'
   ```

### Medium Priority

4. **Implement Module Federation** (for micro-frontends)
5. **Add Performance Budgets** in next.config.js
6. **Optimize CSS** - Remove unused Tailwind classes in production

### Low Priority

7. **Consider Preact** for smaller React runtime (reduces bundle by ~30KB)
8. **Web Workers** for heavy computations
9. **Service Worker** caching strategies (PWA already configured)

## Current Bundle Sizes (Estimated)

- First Load JS: ~200-250KB (Target: <200KB)
- Largest Route: Sky Map (~150KB due to Aladin Lite)
- Smallest Route: Homepage (~100KB)

## Performance Budget

| Resource | Budget | Current | Status |
|----------|--------|---------|--------|
| Total JS | 300KB | ~250KB | ✅ Good |
| First Paint | 1.5s | ~0.5s | ✅ Excellent |
| LCP | 2.5s | ~2.0s | ✅ Good |
| CLS | 0.1 | <0.05 | ✅ Excellent |

## Monitoring

- Web Vitals tracked automatically
- Reports to Google Analytics
- View in GA → Events → Web Vitals

## Next Steps

1. Review bundle analyzer reports
2. Identify largest dependencies
3. Consider alternatives for heavy libraries
4. Implement lazy loading for more routes
5. Set up performance budgets in CI/CD
