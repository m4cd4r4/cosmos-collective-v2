# Pilot Mode - Project Plan

**Status:** Approved, not started. **Owner:** Macdara. **Primary player:** his 6-year-old daughter.
**Decided:** 2026-06-12, across three assessment rounds (audit, game pivot, surface racing expansion). Research traces in `.claude/traces/2026-06-12-*.jsonl`.

A space game built on the cosmos-collective solar system: drive and jump on real planetary terrain with real per-planet gravity, fly between planets, and eventually earn the Dyson Drive - the power to escape orbital mechanics entirely. Built kid-first for one specific 6-year-old; everything else is secondary.

---

## 1. Decision log

| # | Decision | Why |
|---|----------|-----|
| 1 | Build a game, do not rebuild the instrument | Judged 24/30 vs full-pivot 19 and instrument-first 16. The daughter is the audience; her joy is the verifiable success criterion |
| 2 | The game is a **clean Vite/TS build** at `public/solar-system/pilot/`. The 6,452-line monolith never hosts gameplay | Surface scenes + shader injection + render-target crossfades + GLTF loaders in a no-build-step file with ~40 globals exceeds the ~1 weekend port cost. Decided pre-emptively |
| 3 | **Surface kart racer ships before slingshot flight** | Drive-jump-collect is the age-6-native genre (Mario Kart, LEGO, Subway Surfers). Trajectory-line play is the age 7+ skill edge |
| 4 | Toy physics, real data | Every successful kid gravity game fakes physics toward readability (Angry Birds Space used constant-force wells deliberately). Realism lives in the terrain, textures, gravity ratios, and names - not the dynamics |
| 5 | The takeoff morph is the trigonometric "rolling log" vertex bend, render-only | The common parabolic bend can never close into a ball. Physics always computes in flat space |
| 6 | Kart toy is weekend 1, before any infrastructure | Red-team finding: the original sequencing delivered her first lovable moment at weekend 5-7 when it is achievable at weekend 1. Fail-fast on the only real unknown (kart feel) |
| 7 | Do **not** strip the website | GSC: ~3 clicks/90 days site-wide; only `/explore/jwst-*` pages rank; `/solar-system` has zero impressions. Freezing is free, deleting destroys the only search history. Website P0 fixes move to weeknights |
| 8 | Gas giants never get fake ground | "You can't land on Jupiter - there's no ground!" is itself the lesson. Saturn becomes a ring-surf unlock |

## 2. The player - design covenant

Non-negotiable rules, from the age-6 research (Angry Birds Space, Mario Galaxy, Sesame Workshop, NN/g, PBS Kids):

- **No fail states, ever.** No GAME OVER, no timers, no opponents in v1. Runs are finished, never lost.
- **Instant silent retry.** Off track = auto-respawn on-track in under 2 seconds with a chime and a mini-boost.
- **One finger / one button.** Auto-accelerate always on. Follow-the-finger steering on touch, arrow keys on desktop. One jump button, hold to float.
- **Icon and audio UI.** She is an early reader. Touch targets 4x adult size. Max 3-5 choices per screen.
- **Celebration on everything.** Fanfare + animation per run, stars feed a sticker collection, sticker pages fill toward the big unlock.
- **60-120 second runs.** A complete reward cycle per run; 5-10 runs fit one sitting. Few tracks replayed many times is developmentally correct - do not over-produce content.
- **Her in the game.** Ship named by her, colours picked by her, her recorded voice as a celebration sound.
- **Camera safety.** Chase cam ~80 FOV, no shake, no head-bob, no motion blur. Kids are more motion-sick-prone than adults.
- **Co-play.** Parent gets a Co-Star pointer (Mario Galaxy pattern): a second cursor that highlights and collects but cannot fail. Deferred to Phase 6, designed for from day one.
- **Listen, don't prompt** at playtest gates. Build around what she spontaneously enjoys.

## 3. Architecture

### App shell
- Vite + TypeScript, newer three.js (not r128). Static build output to `public/solar-system/pilot/`, a sibling of the existing app. Launched from a rocket button in the current UI. Zero Next.js changes.
- Ported from the monolith (~1,000 lines): `planetsData`, `solveKepler`, the texture set, starfield. Nothing else. Dive mode, galaxy view, tour engine, True Scale stay in the instrument.

### Scenes
- One renderer, two resident `THREE.Scene` graphs (orbital + surface), `renderer.render(activeScene, camera)` per frame.
- The surface scene is ONE reusable template re-skinned per planet: track GLB + palette + gravity constant + obstacle set swapped in. Per-planet assets disposed on exit.
- Crossfade render targets allocated only during transitions, disposed after. pixelRatio capped at 1 during transitions, 2 otherwise. No canvas resizes mid-game (iOS Safari).

### Physics
- One 60 Hz fixed-timestep accumulator drives two integrators behind a common `step(dt)` interface. Never frame-coupled (the monolith's runaway-clock bug is the cautionary tale).
- **Orbital:** restricted n-body toy on the 2D ecliptic plane, planets on Kepler rails, ~300 lines. Visible gravity-well circles, constant-force inside wells, dotted trajectory preview.
- **Surface:** flat-plane kart controller - x/z position + heading, y under per-planet constant g for jumps, ground height from a precomputed height grid (never mesh raycasts), circle-vs-circle collision for obstacles and pickups.
- Both integrators run in flat, unbent space at all times. The morph never touches physics.

### The morph (takeoff/landing spectacle)
- `bend.ts` exports `wrapBendable(material)` - an `onBeforeCompile` vertex injection around `#include <begin_vertex>` - plus one shared uniforms object `{uBendRadius, uBendOrigin, uMix}`. Nothing else in the codebase knows the world bends.
- Math: the trigonometric rolling-log wrap, radial two-axis form. `theta = d/R; y' = (y+R)cos(theta)-R; xz' = origin + dir*(y+R)sin(theta)`. Animating R from ~10000 (imperceptible curl while racing) down to ball size IS the takeoff morph. NOT the parabolic `y -= d*d*k` form - it droops but never closes.
- At peak curvature: two-render-target crossfade to the orbital scene (the official three.js scenes-transition pattern), apparent planet size matched, the SAME NASA albedo texture on both representations. Landing runs it in reverse.
- Pre-decided gotchas: `frustumCulled = false` on surface meshes (bounds are computed unbent); blob shadows only (shadow depth pass does not inherit the injection); every surface material gets the injection or props float above bent ground.
- `uMix` also drives the photo-to-stylized blend: real photograph during approach, posterized 4-6 band version of the same photograph at ground level. One uniform, zero extra textures.

## 4. Content pipeline - real terrain, toy gameplay

Brand rule carried over from the site: real data, honestly labelled. Tracks are shrunk and labelled so ("Tycho crater, kart-sized") - the same epistemic move the app already makes with compressed orbits.

| Body | Source | Gravity | Notes |
|------|--------|---------|-------|
| Moon (v1) | NASA CGI Moon Kit; later LROC NAC 2 m Tycho DTM | 0.17 g | v1 uses the Moon Kit heightmap displaced at load - real data, no pipeline |
| Mars | HiRISE 1-2 m DTMs (Victoria crater) or MOLA+HRSC blend (shrunk Olympus Mons) | 0.38 g | First use of the full bake pipeline |
| Pluto | New Horizons 300 m DEM (Sputnik Planitia) | 0.07 g | Comedy floatiness; unlock reward |
| Saturn | n/a - ring-surf track | n/a | Unlock; no fake ground |
| Jupiter | n/a | 2.5 g | v2 candidate: cloud-trampoline. Never gets ground |
| Venus, Mercury | skipped | - | Venus topo (4.6 km/px) cannot honestly support terrain |

Full bake pipeline (from Mars onward, not for v1): GeoTIFF clip (Map a Planet 2 / Solar System Treks) -> 16-bit PNG heightmap (gdal or geotiff.js; mind LOLA's 0.5 scale factor) -> Blender: displace, 2-3x vertical exaggeration, decimate to 15-30k tris, flatten a smooth authored ribbon along the racing line (real terrain is scenery and jump features; the drivable line is authored) -> bake AO + posterized colour to one 1024px texture -> Draco GLB (~0.3-0.5 MB) + KTX2 albedo + one real-photo approach plate. ~1-1.5 MB per track, lazy-loaded per landing.

Budgets: app grows ~10 MB -> ~16-18 MB with 4-5 tracks (first paint unchanged). GPU under ~500 MB. Test on the actual family iPad at every gate. Credits line: "Terrain: NASA / USGS / LRO / HiRISE".

## 5. Build order

Red-team-corrected sequencing. The kart is first because kart feel is the only real unknown; infrastructure waits until a phase needs it.

| Wave | Scope | Effort | Gate | Status |
|------|-------|--------|------|--------|
| **W1 - The Toy** | Vite/TS scaffold, ONE scene. Kart on flat moon-grey plane with noise bumps: auto-accel, follow-the-finger / arrows, one-button jump at 0.17 g with hold-to-float, star pickups + chime. Simple 20-line accumulator. No n-body, no loaders | 1 weekend | **She plays Sunday night.** Any engagement passes | later |
| **W2 - The Feel** | Tune to her reactions: sparkle force-field edges, sub-2 s respawn + boost, 3 big stars (one on-path, one behind a jump, **one in the tunnel**), run-end celebration, blob shadow, chase cam. Validate touch on the family iPad | 1 weekend | Does she replay unprompted? Pass = proceed. Fail = tune feel, add nothing | later |
| **W3 - The Moon (v1 SHIP)** | CGI Moon Kit heightmap displaced at load, Earth in the black sky, title screen + rocket button, takeoff = shake + white-out -> menu. "Moon Raceway" is a complete game | 1 weekend | 3+ unprompted replays, finishes runs herself | later |
| **W4 - Her choice** | Decided by her behaviour: replaying hard? Mars re-skin at 0.38 g (learn the full pipeline now). Lukewarm? The morph for wow | 1 weekend | Does she notice the jumps feel different on Mars? (Listen, don't prompt) | later |
| **P4 - The Morph** | `wrapBendable` + animated R + crossfade + albedo continuity. Pure spectacle on a working game | 1.5-2 wk | The takeoff reaction: she makes someone else watch it | later |
| **P5 - Flight layer** | Orbital scene + slingshot toy: gravity-well circles, trajectory preview, piloted flight replaces tap-to-fly autopilot, visit-the-planets missions | 3-4 wk | Does she use the line or thrust-and-giggle? Both pass; tune to whichever | later |
| **P6 - Dyson Drive** | Item-Get ritual (freeze, pose, fanfare, ship transforms), straight-line flight, free-fly sandbox, Pluto/Saturn unlock tracks, Co-Star pointer | 1.5-2 wk | - | later |

**Total: ~13-17 weekends** at honest solo-dad cadence (3-4 months). Stopping after W3, W4, or P4 still leaves a finished game.

**Parallel weeknight stream (off the critical path):** website Phase 0 fixes in the monolith - fixed-timestep accumulator, runaway clock, Reset, ghost overlay, mobile taps. See `docs/solar-system/AUDIT-2026-06-12.md`. The production site needs these regardless; they share no code with the game.

### Progression design
v1 inter-planet travel is tap-a-planet autopilot (a charming scripted arc she can wiggle) so the capstone reward is not given away on day one. P5 makes flight piloted ("now YOU fly" - the growth arc as she gets older). P6's Dyson Drive is the earned escape from Newton: stars -> sticker pages -> the full Zelda Item-Get ritual -> the first straight-line flight crosses in seconds a distance that previously took three slingshots. Project Orion lore card for the grown-ups.

## 6. Cut list

**Cut from v1, returns later:** Mars (W4/P3), the morph (P4), photo approach plates (P4), full GIS pipeline (W4+), orbital level-select scene (P5 - v1 boots to a menu), Co-Star pointer (P6), Pluto + Saturn tracks (P6 unlocks).

**Kept in v1 despite pressure:** the tunnel. It was in the original ask, it is a stretched arch, and bursting out of darkness is enormous per-byte delight.

**Cut indefinitely:** AI opponents, lap counting, placements (no-fail collect-a-thon verdict); Venus and Mercury tracks; fake gas-giant ground.

**Rejected permanently:** true spherical-gravity driving (Mario Galaxy style - weekends of work for a wow delta a 6-year-old cannot perceive over the bend; revisit only if she asks to "drive all the way around"); chunked-LOD real-scale planets (confirmed multi-year trap; web prior art is immature).

## 7. Risks

1. **Kart feel is the gating unknown** (W1-W2). Timebox to the playtest gates. Cut obstacle variety before cutting feel polish.
2. **The named failure mode: the bend-shader spike at 11pm in week 5.** When kart tuning feels bad, the spectacular morph is the sanctioned distraction - it produces a tweetable demo and a dead game. The morph is already de-risked on paper. Do not touch it until she replays the kart unprompted.
3. **The GIS pipeline is a hidden fourth project** (gdal, Blender, Draco, KTX2 each have learning curves). It is deliberately deferred to the Mars track and the first bake attempt is expected to fail.
4. **iOS Safari memory.** Test on the actual family iPad at every gate, not just desktop. pixelRatio discipline during transitions.
5. **Design ages out.** She is 6 now; at 7 she will start wanting opponents and scores. Ship W1-W3 fast; P5/P6 can grow with her.

## 8. Relationship to the website

- The site is **frozen, not stripped**. The `/explore/jwst-*` pages are the only URLs that rank; keep them. Umami is registered but the tracking script was never embedded (0 events) - wire it during the weeknight stream.
- The instrument enhancement plan (real ephemeris, spacecraft layer, SEO tracker routes) is **parked**, not dead: `docs/solar-system/AUDIT-2026-06-12.md`. Its Phase 0 is the weeknight stream. Real ephemeris conflicts with the game's toy physics; they only ever coexist as two modes with two position sources.
- JWST integration verdict (parked with it): narrow only - L2 marker in the instrument + deep links. Precondition: fix the wrong-object Hubble pairs and fake MIRI images first.

## 9. References

- Research traces: `.claude/traces/2026-06-12-solar-system-assessment.jsonl`, `2026-06-12-game-pivot-assessment.jsonl`, `2026-06-12-surface-racing-expansion.jsonl`
- Companion audit: `docs/solar-system/AUDIT-2026-06-12.md`
- Key prior art: Angry Birds Space (readability devices), Mario Galaxy (Co-Star lap-play, spherical joy), Gravity Ghost (no-fail orbital, reward orbiting itself), Subway Surfers (curved-world shader, short-run retention), Outer Wilds (toy-scale internal consistency), Sissy's Magical Ponycorn Adventure (dad + daughter co-creation, tiny finished scope)
- Tech references: rolling-log bend math (bevyengine discussion #10062, lynnpepin/rollinglogshader), three.js onBeforeCompile material extension, official three.js crossfade example, NASA CGI Moon Kit, USGS Map a Planet 2
