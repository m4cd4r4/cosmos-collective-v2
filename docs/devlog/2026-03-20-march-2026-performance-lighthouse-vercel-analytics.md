---
title: "March 2026: Lighthouse 100, Observatory A+, and Vercel Analytics"
slug: march-2026-performance-lighthouse-vercel-analytics
date: 2026-03-20
category: performance
tags: [Lighthouse, Performance, Security, CSP, WebP, Vercel Analytics, LCP]
author: "Developer"
reading_time: 5
excerpt: "Eliminated the homepage Three.js iframe that was loading 15MB of JavaScript on every landing page visit — replaced with a pre-recorded video loop. Lighthouse scores hit 100 across the board. Observatory security rating reached A+. Vercel Analytics deployed."
---# March 2026: Lighthouse 100, Observatory A+, and Vercel Analytics

## Eliminating the Homepage Three.js Load

The landing hero previously embedded the solar system viewer in an iframe — giving first-time visitors an interactive 3D preview immediately on the homepage. The cost: the iframe triggered a full Three.js bundle load (~15MB, deferred but still parsed), blocking the main thread and pushing Largest Contentful Paint above 3 seconds.

Fix: replaced the iframe with a pre-recorded 1080p WebP video loop of the solar system orbiting. Filesize: 1.8MB. The video `autoplay muted loop playsinline` starts immediately, looks identical to the live version, and removes the Three.js parse cost entirely from the landing page. The full interactive viewer is one click away at `/solar-system`.

Lighthouse improvement on the landing page:

| Metric | Before | After |
|--------|--------|-------|
| Performance | 74 | 100 |
| LCP | 3.4s | 0.9s |
| TBT | 620ms | 0ms |

## Observatory A+ Security Rating

Mozilla Observatory measures HTTP security headers. The previous rating was B+ (score 75). The blockers:

- **`Content-Security-Policy`** was missing `frame-ancestors 'none'` — added
- **`Permissions-Policy`** header was absent — added with camera, microphone, and geolocation all set to `()`
- The `Referrer-Policy` was set to `no-referrer-when-downgrade` rather than the stricter `strict-origin-when-cross-origin`

Result: Observatory score 120/100, A+ rating.

## WebP Image Conversion

All hero and feature images were converted from JPEG/PNG to WebP at 85% quality. Average size reduction: 45%. The Next.js `Image` component handles format negotiation for browsers that don't support WebP (primarily older Safari — though support is now >97% globally).

The solar system hero image specifically: a screenshot of Earth and the Moon from the 3D viewer, exported from the browser canvas at 2560×1440, converted to WebP at 80% quality — 340KB vs the original 1.1MB JPEG.

## Vercel Analytics

Installed `@vercel/analytics` for page view tracking with zero PII collection. The script is injected via the root layout and reports to Vercel's edge network — no third-party domains, no cookies, GDPR-compliant by default.

## Mobile Hero Optimisation

Added `fetchpriority="high"` to the mobile hero image and a `<link rel="preload">" in the document head. On 4G connections this moved the mobile LCP image out of the render-blocking waterfall, improving mobile Lighthouse performance from 87 to 96.

## Devlog CSS Bundle Split

The devlog page had ~8KB of inline CSS embedded in the page component. Extracted to a dedicated `devlog.css` import, allowing Next.js to split it into a separate chunk not loaded on any other route.
