# Hero Video: Cinematic Solar System Flight

**Status:** planned (2026-07-07) | **Owner:** Macdara | **Executor:** Opus (high) per phase briefs below
**Planned by:** Fable 5 | **Repo home:** `hero-video/` (pipeline) + `docs/hero-video/` (this plan)

The landing hero gets a cinematic video: planet fly-bys, surface dives, slingshots, a slow-motion
sun pass, the moons of Mars, the seas of Titan. Distinct from the in-site Three.js solar system app.

**The brand rule decides the method.** "Every datum is real, sourced, and dated" and no synthesised
imagery. So: no generative AI video. Every surface in the Blender flight is a real measured map
(NASA/USGS/ESA), every montage clip is a real NASA render, and the credits name every source.

---

## Status table

| # | Phase | Scope | Status | Est. effort | Depends on |
|---|-------|-------|--------|-------------|------------|
| 0 | Toolchain smoke test | Headless Blender render proven end to end | later | 1 session | - |
| A | SVS montage | 45-60s cut of NASA SVS footage, graded to brand | later | 1-2 sessions | 0 (ffmpeg only) |
| B1 | Pipeline vertical slice | ONE shot (Earth-Moon) rendered, encoded, live as hero loop | later | 2-3 sessions + render time | 0 |
| B2 | Full flight | Remaining 11 shots, full 60s cut, /cinema page | later | 3-5 sessions + render time | B1 |

**Wave gate:** do not start B2 until B1 is merged and the hero loop is verified on the live site.
B1 is the pipeline proof; B2 is repetition of a proven loop. If B1 stalls, Phase A alone still
ships a good hero.

---

## Phase 0 - Toolchain smoke test (do first, one session)

Goal: prove the untested Blender integration with the smallest possible end-to-end run.

1. `blender --version` - require 4.2+; note whether 4.5+/5.x (affects exporter features, AgX default).
2. Write `hero-video/scripts/smoke.py`: build a UV sphere with a 2k Earth texture, one sun lamp,
   camera orbiting 48 frames, EEVEE-Next, 1280x720.
3. Render headless: `blender -b -P hero-video/scripts/smoke.py`. Confirm GPU device is used
   (script must print `bpy.context.preferences.addons['cycles'].preferences.devices` and the
   EEVEE backend); a CPU-only fallthrough is a FAIL to investigate, not accept.
4. Assemble with ffmpeg to mp4. Confirm ffmpeg is on PATH and the clip plays.
5. Optional: one narrow Blender MCP call (e.g. query scene stats) to confirm the MCP wiring works.
   **MCP is verification-only. All production work is committed headless scripts** - real-world
   reports show MCP-driven modeling burns tokens and produces broken geometry (see
   `~/.claude/skills/blender/reference/blender-mcp.md`).

**Gate:** a playable mp4 rendered entirely from a script committed to the repo, GPU confirmed.

## Phase A - NASA SVS montage (quick win, ships independently)

Goal: a 45-60s cut of NASA's own cinematic renders, graded to the site palette. Honest,
impressive, fast - and a fallback hero if Phase B slips.

1. **Source** from https://svs.gsfc.nasa.gov and https://images.nasa.gov (public domain;
   verify the credit line on each item - some SVS entries include ESA or university co-credits
   that must be carried through). Search terms: "Tour of the Moon", "Dynamic Earth", "solar
   dynamics observatory" (SDO flare footage), "Cassini Saturn approach", "Europa Clipper flyby",
   "Deep Star Maps". Prefer 4K ProRes/high-bitrate downloads where offered.
2. Record every selected clip in `hero-video/assets/MANIFEST.json`:
   `{ id, title, source_url, direct_download_url, credit_line, license_note, sha256, duration_s }`.
   **Binary assets are never committed** - `hero-video/assets/` and `hero-video/out/` are
   gitignored; `hero-video/scripts/fetch-assets.py` downloads and checksum-verifies from the manifest.
3. Cut with a scripted ffmpeg pipeline (`hero-video/scripts/montage.py` emitting the ffmpeg
   filtergraph from a `shots-montage.json` edit list) so the edit is reproducible. Target: 24fps,
   2560x1440 master, cuts on motion, 45-60s. No text overlays except a 2s end card
   ("Footage: NASA SVS / SDO / JPL-Caltech" in Outfit).
4. Grade toward the brand: lift blacks slightly toward `#0a0e1a`, gold-warm highlights. Implement
   as an ffmpeg `lut3d` or `colorbalance` pass kept in the script - no manual one-off grading.
5. Add every source to `/credits` on the site in the same PR that uses the footage.

**Gate:** master file plays; every clip has a manifest entry with verified credit; edit script
re-runs byte-identically (same input -> same cut).

## Phase B - The bespoke Blender flight

### Architecture decisions (locked - do not relitigate during execution)

1. **Shot-based, script-driven.** Each shot is one Python file (`hero-video/shots/NN_name.py`)
   that builds its scene from shared library code and renders its own frame range. Shots render
   independently and are assembled by ffmpeg. Re-rendering one shot never touches the others.
2. **Shared library** `hero-video/lib/` (plain Python imported by shot scripts):
   - `planets.py` - builds a textured planet from a manifest entry (color/normal/displacement
     maps, atmosphere shell shader, ring geometry from radial profile)
   - `sun.py` - emissive sun with noise-driven surface displacement + volumetric corona
   - `stars.py` - skybox from SVS Deep Star Maps (real Hipparcos/Gaia star positions)
   - `camera.py` - reusable rigs: `flyby()`, `orbit()`, `surface_dive()`, `slingshot()`
     (bezier path + Follow Path + ease curves), all keyframe-baked
   - `render.py` - one place for resolution, fps, color management, output paths
3. **Per-shot local scale, not one full-scale system.** Real distances break float precision and
   render as empty black. Each shot is planet-centric at a per-shot scale (documented in the shot
   file header). The final pull-back uses a compressed schematic layout. Honesty consequence: we
   claim real *surface data and relative planet sizes*, never real distances - the credits page
   says exactly that.
4. **Renderer:** EEVEE-Next by default (space scenes are emissive-light + sharp shadows - its
   sweet spot, 10-50x faster than Cycles). Cycles only where it earns its cost: Shot 1 (sun
   volumetrics) and Shot 9 (ring light scattering). Color management: AgX (handles the sun's
   highlights without clipping). Master: 2560x1440, 24fps, PNG 16-bit frames.
5. **Determinism.** Fixed seeds for any noise/particles; no `datetime`/random without seed;
   every render reproducible from a clean checkout + `fetch-assets.py`.

### Asset manifest (all public domain / NASA media guidelines)

| Body | Asset | Source |
|------|-------|--------|
| Stars | Deep Star Maps 2020 (16k celestial sphere) | NASA SVS |
| Sun | SDO AIA reference imagery for shader matching | sdo.gsfc.nasa.gov |
| Mercury | MESSENGER MDIS global mosaic | USGS Astrogeology |
| Venus | Magellan radar mosaic + synthetic cloud layer (labelled stylised) | USGS / JPL |
| Earth | Blue Marble NG (color), Black Marble (night), cloud map, bathymetry | NASA Visible Earth |
| Moon | CGI Moon Kit - color + displacement, made for exactly this | NASA SVS 4720 |
| Mars | Viking MDIM 2.1 color mosaic + MOLA DEM (Valles Marineris crop) | USGS Astrogeology |
| Phobos/Deimos | Shape models + imagery | NASA 3D Resources / PDS |
| Jupiter | Cassini flyby global map (NASA/JPL version, check license) | NASA/JPL |
| Saturn + rings | Global map + Cassini ring radial color/transparency profile | NASA/JPL / PDS |
| Titan | Cassini ISS global mosaic + Ligeia Mare radar (colour stylised - label it) | NASA/JPL-Caltech/ASI |

Executor verifies each URL at fetch time and records the working direct link + sha256 in
`MANIFEST.json`. Link rot is expected: find the current USGS/SVS hosting rather than trusting
stale URLs. If a map's license is unclear (e.g. community-processed Jupiter maps), skip it and
use the NASA/JPL original even if prettier.

### Shot list (12 shots, ~60s + end card)

| # | Shot | Dur | Camera | Notes |
|---|------|-----|--------|-------|
| 1 | Sun, slow-motion pass | 6s | slow lateral dolly, sun fills 130% of frame | Cycles; volumetric corona, AgX; the "held breath" opener |
| 2 | Mercury terminator flyby | 4s | fast `flyby()` low over terminator | long shadows across craters |
| 3 | Venus slingshot | 4s | `slingshot()` whipping around the limb | motion blur on; cloud layer labelled stylised |
| 4 | Earth-Moon approach | 6s | slow approach matching the current hero still framing | **the loop shot** - first and last frames alignable for a seamless hero loop |
| 5 | Moon surface skim | 4s | `surface_dive()` grazing displacement terrain | CGI Moon Kit displacement, real relief |
| 6 | Mars approach + Phobos pass | 5s | Phobos crosses foreground, Mars grows | Deimos as distant point - accurate, it is tiny |
| 7 | Valles Marineris dive | 8s | drop into the canyon, race the floor, pull out | **the money shot**; MOLA DEM terrain; needs the most iteration time |
| 8 | Jupiter storms, slow-mo | 5s | slow push toward Great Red Spot | subtle cloud-band parallax via layered normal maps |
| 9 | Saturn ring-plane skim | 6s | camera flat through the ring plane | Cycles; particle field driven by radial profile; second loop candidate |
| 10 | Titan descent | 6s | fall through orange haze, level out over Ligeia Mare glint | haze = volumetric gradient; sea colour stylised - credited as radar-derived |
| 11 | Pull-back to full system | 5s | accelerating reverse dolly to schematic system | compressed distances (see decision 3) |
| 12 | End card | 2s | static | "Every surface: real NASA/USGS data." + credit line |

### B1 - Vertical slice (mandatory first milestone)

Build ONLY: repo scaffolding (`hero-video/` layout, gitignore, manifest, fetch script), `lib/`
with what Shot 4 needs, Shot 4 itself, encode pipeline, site integration. That is one shot
proving every pipeline stage - asset fetch, scene build, headless render, assemble, encode,
component swap - before 11 more shots repeat the loop.

Site integration (same PR):
- `HeroVideo` component replacing the hero `<Image>`: `<video autoplay muted loop playsinline>`
  with the current `hero-earth-close.webp` as `poster`; render the static poster instead of video
  when `prefers-reduced-motion` matches or `navigator.connection.saveData` is true
- Encodes: 10s loop, VP9 webm (primary) + H.264 mp4 (fallback), 2560w, **hard budget 5MB webm** -
  drop to 1920w before dropping quality if over; poster stays webp
- Lighthouse performance on the landing page must not regress vs the current static hero
  (compare before/after; the video must be `preload="metadata"` at most)

### B2 - Full flight

Remaining shots in storyboard order but rendered cheapest-first (2, 6, 8 before 7, 9, 10) so
early sessions bank finished shots while the hard ones iterate. Then: full 60s assembly, grade
pass, end card, `/cinema` page (click-to-play, no autoplay), YouTube upload (ask Macdara for the
channel), credits page update, and optionally swap the hero loop to Shot 9 if it loops better.

---

## Execution guidelines for the implementing agent (Opus, high)

**Process**
1. Work phase by phase in order; one branch per phase (`feat/hero-video-phase-0`, etc.), PR and
   merge at each gate. Never pre-build a later phase while a gate is unmet.
2. Rebase on start of every session (`git fetch origin main && git rebase origin/main`).
3. Preview before committing render time: every shot gets a 5-frame strip at 50% resolution
   reviewed (open the PNGs, look at them) before its full-quality render is launched. Full
   renders run as background jobs; never block a session waiting on one.
4. Long renders: estimate first (time one frame x frame count), report the estimate, run
   overnight-style in the background. 1440 frames at 5-15s/frame EEVEE is 2-6h; plan sessions so
   renders run between them.

**Hard rules**
- Blender is driven ONLY by committed scripts run headless (`blender -b -P ...`). MCP calls are
  allowed solely to inspect/verify (scene stats, screenshots), never to author geometry.
- No binary media in git. Assets and renders live under gitignored dirs; the manifest + fetch
  script are the source of truth. The final delivery encodes (<5MB each) go in `public/videos/`
  and ARE committed.
- Every external asset gets: verified working URL, sha256, credit line, license note - in the
  manifest AND on `/credits` before anything using it merges.
- Honesty labels are not optional: stylised elements (Venus clouds, Titan sea colour, schematic
  distances in Shot 11) are named as such in credits. Never present them as photographic.
- Do not touch `public/solar-system/index.html` (frozen monolith) or the Pilot Mode plan's scope.
- Site perf: hero loop <=5MB webm, `prefers-reduced-motion` and Save-Data honoured, Lighthouse
  perf non-regressing. These are merge blockers, not suggestions.
- Production deploy is ASK-FIRST, always. Merging is not deploying.

**Verification per gate** (run, do not assume)
- Phase 0: mp4 exists and plays (probe with ffprobe), GPU confirmed in render log
- Phase A: ffprobe duration 45-60s; manifest entries complete; re-run reproduces the cut
- B1: loop plays seamlessly (extract first/last frame, diff them - near-identical), budgets met,
  Lighthouse compared, screenshots at 1440px and 390px reviewed in the actual browser
- B2: full cut duration matches shot list ±2s; all 12 shots present; credits complete

**When blocked** (asset URL dead with no findable mirror, GPU headless failure, license doubt):
stop that thread, document in the PR, move to the next independent shot. Do not substitute
synthetic assets to keep moving - that violates the brand's core rule.

## Risks

| Risk | Mitigation |
|------|------------|
| Headless GPU rendering fails on this machine | Phase 0 exists to catch it first; fallback is in-app Blender CLI on same scripts, worst case CPU EEVEE at 720p to keep iterating while debugging |
| Asset link rot / license ambiguity | Manifest with verified URLs + checksums at fetch time; skip ambiguous assets (rule above) |
| MOLA DEM is a multi-GB GeoTIFF | Fetch the USGS pre-cropped Valles Marineris tiles, or crop once with GDAL and cache; document the exact crop in the manifest |
| Shot 7/9/10 iteration eats the schedule | Cheapest-first ordering in B2; B1 + Phase A already shipped a good hero before these start |
| Scope creep ("add Uranus, add audio, add 4K") | This table is the scope. New ideas go to a Future section in this doc, not into the build |

## Out of scope

Audio/music (hero is muted; full cut can get audio later as its own decision), 4K masters,
Uranus/Neptune/Pluto shots, real-time WebGL version of the flight, any change to the solar
system app itself.
