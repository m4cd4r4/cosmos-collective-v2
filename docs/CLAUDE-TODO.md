# Claude TODO

Follow-ups captured during work, not built yet. Source for each: the plan artifact https://claude.ai/artifact/Gzcq3M39AbDYPaePLeMFnZ unless noted.

## From feat/solar-dock (2026-10-14)

- **550 AU pearl anatomy** - parked; not part of the dock redesign.
- **Page pruning** - review which site routes earn their place.
- **Homepage rebuild** - separate brief.
- **Wrong 2026 lunar dates** in `src/services/real-time-events.ts:428` - check against a published ephemeris and fix.
- **Install prompt covers canvases** - the PWA install prompt sits over the 3D views; move or delay it.

## From /design-review of feat/solar-dock (2026-10-14)

- **Time tab event dates lag the sim date** - at sim date Jan 2028 the "Planetary events" list showed Oct 2027 events; check `updateEventsDisplay` (index.html ~2537) bases `ev.date` on `simulationDays`, not wall-clock today.
- **Event cards use emoji icons** (link, lightning, arrows) - off-brand; swap for small inline SVG or plain text.
- **11 texture 404s per load** - the loader requests `textures/2-8k_textures/8k_*.jpg` first, which exist neither locally nor on production, then falls back. Drop the 8k attempt or ship the files.

## From the galaxy-view removal (2026-10-15)

- **A galaxy view, if it ever returns, needs a different technique.** Three passes at a live Three.js r128 particle Milky Way (PR #55, closed) did not reach a standard worth shipping. If it is revisited, start from a baked high-resolution galaxy image or sprite sheet rather than live particles, and treat it as its own visual project, not a dock mode.
- **`playwright.local.config.ts` baseURL was hardcoded to :3099.** Now reads `BASE_URL`. Any earlier worktree run that passed `BASE_URL=` silently tested the main-repo server instead.
