# The Great Expanse → Cosmos Collective Migration Checklist

## Overview
Consolidating thegreatexpanse.com content into cosmos-collective.com.au

**Source:** `/i/Scratch/thegreatexpanse/`
**Destination:** `/c/Scratch/cosmos-collective-v2/`

---

## Phase 1: Component Migration

### Priority 1: Core Launch Components
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `components/launch/launch-countdown.tsx` | `src/components/features/launch/LaunchCountdown.tsx` | [ ] | Core countdown timer |
| `components/home/upcoming-launches.tsx` | `src/components/features/launch/UpcomingLaunches.tsx` | [ ] | Launch list component |
| `components/home/status-bar.tsx` | `src/components/features/launch/StatusBar.tsx` | [ ] | Mission status display |

### Priority 2: Agency & Vehicle Components
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `components/agency/agency-card.tsx` | `src/components/features/agency/AgencyCard.tsx` | [ ] | Agency display card |
| `components/vehicle/vehicle-card.tsx` | `src/components/features/vehicle/VehicleCard.tsx` | [ ] | Vehicle specs card |

### Priority 3: Video Components
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `components/video/video-card.tsx` | `src/components/features/video/VideoCard.tsx` | [ ] | Video thumbnail |
| `components/video/video-modal.tsx` | `src/components/features/video/VideoModal.tsx` | [ ] | Fullscreen player |
| `components/video/youtube-embed.tsx` | `src/components/features/video/YouTubeEmbed.tsx` | [ ] | YT iframe wrapper |
| `components/home/featured-videos.tsx` | `src/components/features/video/FeaturedVideos.tsx` | [ ] | Video showcase |

### Priority 4: Arcade Games
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `components/arcade/arcade-modal.tsx` | `src/components/features/arcade/ArcadeModal.tsx` | [ ] | Game launcher |
| `components/arcade/game-selection.tsx` | `src/components/features/arcade/GameSelection.tsx` | [ ] | Game picker UI |
| `components/arcade/asteroids-game.tsx` | `src/components/features/arcade/games/AsteroidsGame.tsx` | [ ] | Classic asteroids |
| `components/arcade/breakout-game.tsx` | `src/components/features/arcade/games/BreakoutGame.tsx` | [ ] | Breakout clone |
| `components/arcade/defender-game.tsx` | `src/components/features/arcade/games/DefenderGame.tsx` | [ ] | Defender clone |
| `components/arcade/invaders-game.tsx` | `src/components/features/arcade/games/InvadersGame.tsx` | [ ] | Space invaders |
| `components/arcade/lunar-lander-game.tsx` | `src/components/features/arcade/games/LunarLanderGame.tsx` | [ ] | Lunar lander |
| `components/arcade/missile-command-game.tsx` | `src/components/features/arcade/games/MissileCommandGame.tsx` | [ ] | Missile command |
| `components/arcade/snake-game.tsx` | `src/components/features/arcade/games/SnakeGame.tsx` | [ ] | Snake |
| `components/arcade/thrust-game.tsx` | `src/components/features/arcade/games/ThrustGame.tsx` | [ ] | Thrust |

### Priority 5: UI Components (if not duplicated)
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `components/ui/badge.tsx` | Check if exists | [ ] | May already exist |
| `components/ui/spinner.tsx` | Check if exists | [ ] | Loading indicator |
| `components/ui/prediction-ticker.tsx` | `src/components/ui/PredictionTicker.tsx` | [ ] | Launch predictions |
| `components/ui/prediction-modal.tsx` | `src/components/ui/PredictionModal.tsx` | [ ] | Prediction details |
| `components/home/starfield.tsx` | Check if exists | [ ] | Background animation |

---

## Phase 2: API Routes Migration

### Launch Library 2 Integration
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `app/api/launches/route.ts` | `src/app/api/launches/route.ts` | [ ] | Upcoming launches |
| `app/api/launches/[id]/route.ts` | `src/app/api/launches/[id]/route.ts` | [ ] | Launch details |
| `app/api/agencies/route.ts` | `src/app/api/agencies/route.ts` | [ ] | Agency list |
| `app/api/agencies/[id]/route.ts` | `src/app/api/agencies/[id]/route.ts` | [ ] | Agency details |
| `app/api/vehicles/route.ts` | `src/app/api/vehicles/route.ts` | [ ] | Vehicle list |
| `app/api/vehicles/[id]/route.ts` | `src/app/api/vehicles/[id]/route.ts` | [ ] | Vehicle details |

### YouTube Integration
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `app/api/videos/route.ts` | `src/app/api/videos/route.ts` | [ ] | Video feed |
| `app/api/live/route.ts` | `src/app/api/live/route.ts` | [ ] | Live streams |

---

## Phase 3: Page Creation

### New Routes to Create
| Route | Source Reference | Status | Notes |
|-------|------------------|--------|-------|
| `/launch` | `app/launches/page.tsx` | [ ] | Launch calendar |
| `/launch/[id]` | N/A (create new) | [ ] | Launch detail page |
| `/agencies` | `app/agencies/page.tsx` | [ ] | Agency directory |
| `/agencies/[id]` | `app/agencies/[id]/page.tsx` | [ ] | Agency detail |
| `/vehicles` | `app/vehicles/page.tsx` | [ ] | Vehicle specs |
| `/vehicles/[id]` | `app/vehicles/[id]/page.tsx` | [ ] | Vehicle detail |
| `/live` | `app/live/page.tsx` | [ ] | Live streams hub |
| `/arcade` | N/A (modal-based) | [ ] | Optional: dedicated page |

---

## Phase 4: Library/Utility Migration

### Stores
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `lib/stores/ui.ts` | Merge with existing | [ ] | UI state (mobile menu) |
| `lib/stores/preferences.ts` | `src/lib/stores/preferences.ts` | [ ] | User preferences |

### API Utilities
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `lib/api/launch-library.ts` | `src/lib/api/launch-library.ts` | [ ] | LL2 API client |
| `lib/api/youtube.ts` | `src/lib/api/youtube.ts` | [ ] | YouTube API client |

### Query Keys (TanStack Query)
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `lib/queries/launches.ts` | `src/lib/queries/launches.ts` | [ ] | Launch query factories |
| `lib/queries/agencies.ts` | `src/lib/queries/agencies.ts` | [ ] | Agency queries |
| `lib/queries/vehicles.ts` | `src/lib/queries/vehicles.ts` | [ ] | Vehicle queries |

### Types
| Source File | Destination | Status | Notes |
|-------------|-------------|--------|-------|
| `types/launch.ts` | `src/types/launch.ts` | [ ] | Launch types |
| `types/agency.ts` | `src/types/agency.ts` | [ ] | Agency types |
| `types/vehicle.ts` | `src/types/vehicle.ts` | [ ] | Vehicle types |

---

## Phase 5: Assets & Styling

### Tailwind Config
| Task | Status | Notes |
|------|--------|-------|
| Add TGE color palette (rocket-orange, cosmos, etc.) | [ ] | Keep as secondary palette |
| Merge custom animations | [ ] | Starfield, countdown effects |

### Public Assets
| Source | Destination | Status | Notes |
|--------|-------------|--------|-------|
| `public/agency-logos/` | `public/images/agencies/` | [ ] | Agency logos |
| `public/vehicle-images/` | `public/images/vehicles/` | [ ] | Vehicle photos |

---

## Phase 6: Environment Variables

### Required .env additions
```env
# Launch Library 2
LAUNCH_LIBRARY_API_URL=https://ll.thespacedevs.com/2.2.0

# YouTube Data API (already may exist)
YOUTUBE_API_KEY=your_key_here

# Redis caching (may already exist)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Phase 7: Navigation Update

### Tasks
| Task | Status | Notes |
|------|--------|-------|
| Update Header with tabbed navigation | [ ] | See `Header.tsx` update |
| Add "Launch" section to desktop nav | [ ] | |
| Add "Arcade" button to header | [ ] | |
| Update mobile bottom nav | [ ] | Add launch icon |

---

## Phase 8: Testing

### Integration Tests
| Test | Status | Notes |
|------|--------|-------|
| Launch API returns data | [ ] | |
| Agency pages render | [ ] | |
| Vehicle pages render | [ ] | |
| Arcade games load | [ ] | |
| Video modal plays | [ ] | |
| Countdown timer accuracy | [ ] | |

### Lighthouse Audit
| Metric | Target | Status |
|--------|--------|--------|
| Performance | > 90 | [ ] |
| Accessibility | 100 | [ ] |
| Best Practices | 100 | [ ] |
| SEO | 100 | [ ] |

---

## Phase 9: Deployment

### Tasks
| Task | Status | Notes |
|------|--------|-------|
| Deploy to Vercel preview | [ ] | Test before production |
| Update DNS if needed | [ ] | |
| Monitor error rates | [ ] | Check Vercel analytics |

---

## NOT Migrating (Simplified Away)

| Item | Reason |
|------|--------|
| `age-mode-toggle.tsx` | Replaced with SimpleExplanation toggle |
| `age-mode-provider.tsx` | No longer needed |
| Age-based content variants | Single good explanation instead |
| `mobile-menu.tsx` | CC already has mobile bottom nav |

---

## Quick Reference: File Counts

- **Components to migrate:** ~25 files
- **API routes to create:** ~8 routes
- **Pages to create:** ~7 pages
- **Types to add:** ~3 type files
- **Estimated LOC:** ~3,000-4,000 lines

---

## Commands

```bash
# Copy components (example)
cp -r /i/Scratch/thegreatexpanse/components/arcade /c/Scratch/cosmos-collective-v2/src/components/features/

# Run type check after migration
cd /c/Scratch/cosmos-collective-v2
npm run type-check

# Test locally
npm run dev
```
