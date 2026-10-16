# Claude TODO

Follow-ups captured during work, not built yet. Source for each: the plan artifact https://claude.ai/artifact/Gzcq3M39AbDYPaePLeMFnZ unless noted.

## From feat/solar-dock (2026-10-14)

- **550 AU pearl anatomy** - parked; not part of the dock redesign.
- ~~**Page pruning**~~ - DONE on feat/page-prune.
- **Homepage rebuild** - separate brief.
- ~~**Wrong 2026 lunar dates**~~ - DONE on feat/page-prune: phases are computed in `src/lib/moon-phase.ts`.
- **Install prompt covers canvases** - the PWA install prompt sits over the 3D views; move or delay it.

## From /design-review of feat/solar-dock (2026-10-14)

- **Time tab event dates lag the sim date** - at sim date Jan 2028 the "Planetary events" list showed Oct 2027 events; check `updateEventsDisplay` (index.html ~2537) bases `ev.date` on `simulationDays`, not wall-clock today.
- **Event cards use emoji icons** (link, lightning, arrows) - off-brand; swap for small inline SVG or plain text.
- **11 texture 404s per load** - the loader requests `textures/2-8k_textures/8k_*.jpg` first, which exist neither locally nor on production, then falls back. Drop the 8k attempt or ship the files.

## From the galaxy-view removal (2026-10-15)

- **A galaxy view, if it ever returns, needs a different technique.** Three passes at a live Three.js r128 particle Milky Way (PR #55, closed) did not reach a standard worth shipping. If it is revisited, start from a baked high-resolution galaxy image or sprite sheet rather than live particles, and treat it as its own visual project, not a dock mode.
- **`playwright.local.config.ts` baseURL was hardcoded to :3099.** Now reads `BASE_URL`. Any earlier worktree run that passed `BASE_URL=` silently tested the main-repo server instead.

## From feat/page-prune (2026-10-14)

Out of scope for that PR, captured so they are not lost.

- **`JWSTSkyMap.tsx` is dead code** - `src/components/features/jwst/JWSTSkyMap.tsx` (372 lines, Aladin Lite) is imported nowhere. It predates the prune. Either wire it into the Webb view or delete it.
- **The devlog archive is repo-only now** - `docs/devlog/` holds the 19 posts that used to render at `/devlog`. If any of it is worth publishing, the GitHub README or a personal site is the place, per the audit.
- **Launch card thumbnails do not load** on `/events` (grey placeholders at 1440). Seen on the page-prune worktree; check whether the main checkout does the same before treating it as a regression.
- **ISS Cam 1 is private** - `/events` falls back to Cam 2, but the embed shows a YouTube sign-in card first. Validate the video id at build time or drop Cam 1.
- **Hubble pairs are gone, not fixed** - the Hubble comparison showed the wrong objects, so it was dropped with `/jwst`. A correct JWST/Hubble pairing needs matched observations from MAST, not a hand-typed `hubbleUrl` per entry.
- **Supermoon threshold is a convention** - `SUPERMOON_DISTANCE_KM` is 360,000 km, which is what timeanddate.com uses. A full moon just outside it (3 Jan 2026, 362,311 km) is not labelled. Worth a line of copy on `/events` if anyone asks why.
- **Audit said 21 devlog posts; the repo had 19.** No posts were lost, the plan's count was wrong.
- **`ignoreBuildErrors` / unused deps (Prisma, auth, Leaflet)** - from the audit's housekeeping note, untouched here.
