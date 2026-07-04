# Pilot Mode - Project Plan (v2)

**Status:** Approved, not started. **Owner:** Macdara. **Primary player:** his 6-year-old daughter.
**Audience (widened in v2):** ages 6 to adult. The 6-year-old covenant is the floor; mastery strata are the ceiling. One game, layered depth - never separate modes she can get lost in.
**v1 decided:** 2026-06-12, across three assessment rounds (audit, game pivot, surface racing expansion). Research traces in `.claude/traces/2026-06-12-*.jsonl`.
**v2:** 2026-07-04 - proofread (numbering, effort units), audience widened to 6-adult, compression doctrine formalized, physics-true fun catalogue added, Nintendo-warmth tone covenant named, and the game separated from the website entirely (standalone repo). W1-W3 scope unchanged.
**v2.1:** 2026-07-05 - Launch Pad Earth (launch, booster catch, orbital refueling), historical Mission Replays on real trajectories, the S5 Pearl String sun-lens finale, vehicle IP policy (NASA free, SpaceX cautioned).

A space game built on the cosmos-collective solar system: drive and jump on real planetary terrain with real per-planet gravity, fly between planets, and eventually earn the Dyson Drive - the power to escape orbital mechanics entirely. Built kid-first for one specific 6-year-old; everyone older is served by depth she grows into, not menus she must route around.

---

## 1. Decision log

| # | Decision | Why |
|---|----------|-----|
| 1 | Build a game, do not rebuild the instrument | Judged 24/30 vs full-pivot 19 and instrument-first 16. The daughter is the audience; her joy is the verifiable success criterion |
| 2 | The game is a **clean Vite/TS build in its own standalone project**, fully separate from the website (separation made total in v2, decision 17). The 6,452-line monolith never hosts gameplay | Porting gameplay INTO the monolith (surface scenes + shader injection + render-target crossfades + GLTF loaders in a no-build-step file with ~40 globals) costs more than the ~1 weekend clean-app port. Decided pre-emptively |
| 3 | **Surface kart racer ships before slingshot flight** | Drive-jump-collect is the age-6-native genre (Mario Kart, LEGO, Subway Surfers). Trajectory-line play is the age 7+ skill edge |
| 4 | Toy physics, real data | Every successful kid gravity game fakes physics toward readability (Angry Birds Space used constant-force wells deliberately). Realism lives in the terrain, textures, gravity ratios, and names - not the dynamics |
| 5 | The takeoff morph is the trigonometric "rolling log" vertex bend, render-only | The common parabolic bend can never close into a ball. Physics always computes in flat space |
| 6 | Kart toy is weekend 1, before any infrastructure | Red-team finding: the original sequencing delivered her first lovable moment at weekend 5-7 when it is achievable at weekend 1. Fail-fast on the only real unknown (kart feel) |
| 7 | Do **not** strip the website | GSC: ~3 clicks/90 days site-wide; only `/explore/jwst-*` pages rank; `/solar-system` has zero impressions. Freezing is free, deleting destroys the only search history. Website P0 fixes move to weeknights |
| 8 | Gas giants never get fake ground | "You can't land on Jupiter - there's no ground!" is itself the lesson. Saturn becomes a ring-surf unlock |
| 9 | **(v2) Audience widens to 6-adult via depth strata, not modes** | Nintendo rule: easy to pick up, endless to master. Depth is discovered (ghosts, tricks, flight school, real-numbers toggle), never selected from a menu. The default boot experience stays identical to v1 |
| 10 | **(v2) Compression doctrine: ratios are real, magnitudes are tuned** | Formalizes decision 4 into testable rules (section 3). Gravity ratios, hang-time ratios, and body-to-body comparisons stay exact; absolute scales bend toward fun |
| 11 | **(v2) One kart, one jump impulse, many gravities** | Kart top speed and jump velocity are constant across every body. Gravity is the ONLY variable that changes between tracks. This isolates the physics lesson: same input, wildly different flight. Pedagogically clean, tuning-cheap |
| 12 | **(v2) Tiny moons keep real escape velocity** | On Phobos (escape ~41 km/h) a confident kart jump genuinely leaves forever. The game catches you with an orbit-cam and a giggle instead of a fail. The single best physics moment available to us; costs one camera behavior |
| 13 | **(v2) WebGL2 baseline, WebGPU as a flag from W3+** | three.js WebGPURenderer is maturing but iPad Safari support is the risk surface. The family iPad is the gate device; WebGL2 everywhere first, WebGPU as progressive enhancement once the game is real |
| 14 | **(v2) Mercury re-admitted; Venus stays cut** | v1 cut both, but the stated reason (4.6 km/px topo) only applies to Venus. Mercury has MESSENGER global DEMs at 665 m/px plus regional stereo - better data than the Moon Kit v1 launches with. And Mercury owns an unbeatable mechanic (race the sunrise, section 5) |
| 15 | **(v2) The fun catalogue is a menu, not a queue** | Section 5 lists more ideas than will ever ship. Nothing in it may start before its build-order gate. W1-W3 remain exactly as red-teamed in v1 |
| 16 | **(v2) Nintendo warmth over Xbox grit** | Named tone covenant (section 2.3). Photoreal awe lives in the world (real terrain, real skies, approach plates); toy warmth lives in everything the player touches (kart, UI, sound, language). Bright, rounded, musical, characterful - never gritty, never militaristic |
| 17 | **(v2) The game separates from the website entirely** | Macdara, 2026-07-04: the solar-system page was always the site's standout; the rest is not important. Standalone repo + own static deploy replaces the nested `public/solar-system/pilot/` location. Cross-links become optional marketing, not architecture. Ports from the monolith are copies, never imports |
| 18 | **(v2) Retro arcade cabinets as easter eggs** | Hidden 1979-style minigame cabinets (Asteroids in the belt, Lunar Lander on the Moon, a friendly Space Invaders inversion on Mars) found in the world, played through a CRT shader. Tiny to build (2D canvas, ~1 weekend each), enormous per-byte delight, and each one smuggles in a real lesson. Menu-gated like everything else |
| 19 | **(v2) Education by mechanic, never by lecture** | Every lesson is something you DO first and read second: gravity is felt through the same jump button, escape velocity through the Phobos hop, light-lag through a delayed mission-control voice. Facts arrive as stickers, fact cards, and hidden real-history artifacts - rewards, not homework |
| 20 | **(v2.1) Vehicle IP policy: facts are free, NASA is free, SpaceX is a caution flag** | Physics, mission profiles, and history cannot be owned. NASA craft (Saturn V, Voyager, Cassini, Parker) are US government works with free models on NASA 3D Resources - the entire historical fleet costs nothing. "SpaceX", "Falcon 9", "Starship" are trademarks and the vehicle look is trade dress; a free fan game is low-risk but it is NOT a granted right. The launch mechanic ships vehicle-agnostic: real SpaceX skins only after a licence check, else warm-named lookalikes (the Chopstick Tower catches the Big Silver One) |
| 21 | **(v2.1) Mission Replays ride baked JPL Horizons rails** | The parked instrument plan already speced bake-time Horizons vectors to static JSON. Replays reuse that exact pattern: real trajectories, time-compressed, zero backend. Watch first; take-the-stick moments for S2+ |
| 22 | **(v2.1) The Pearl String is the true finale** | The real Solar Gravitational Lens mission (NIAC Phase III study, Turyshev/JPL): sailcraft strings dive past the Sun, exit at ~25 AU/yr, and from ~550 AU use the Sun itself as a telescope - sampling an Einstein ring to develop a megapixel portrait of an exoplanet. Facts corrected from the ask: the focal line starts ~550 AU (not 150), and the targets are planets of OTHER stars, which is better. The Dyson Drive gives power over gravity; the Pearl String gives sight across light-years |
| 23 | **(v2.1) Tap the Telescopes pulls from the archives, never from the website** | Flying to Hubble and Webb and borrowing their eyes is the game's bridge to real astronomy imagery. Sources are MAST/STScI and ESA/Hubble with true pointing metadata (RA/Dec, observation date), baked at build time. The site's existing JWST pages are explicitly NOT a source - the audit found wrong-object Hubble pairs and mislabelled MIRI images there. The "hack" is a friendly GUEST MODE wink, not a crime scene |

## 2. The players

### 2.1 The covenant - the floor (non-negotiable, unchanged from v1)

From the age-6 research (Angry Birds Space, Mario Galaxy, Sesame Workshop, NN/g, PBS Kids):

- **No fail states, ever.** No GAME OVER, no timers, no opponents in v1. Runs are finished, never lost.
- **Instant silent retry.** Off track = auto-respawn on-track in under 2 seconds with a chime and a mini-boost.
- **One finger / one button.** Auto-accelerate always on. Follow-the-finger steering on touch, arrow keys on desktop. One jump button, hold to float.
- **Icon and audio UI.** She is an early reader. Touch targets 4x adult size. Max 3-5 choices per screen.
- **Celebration on everything.** Fanfare + animation per run, stars feed a sticker collection, sticker pages fill toward the big unlock.
- **60-120 second runs.** A complete reward cycle per run; 5-10 runs fit one sitting. Few tracks replayed many times is developmentally correct - do not over-produce content.
- **Her in the game.** Ship named by her, colours picked by her, her recorded voice as a celebration sound.
- **Camera safety.** Chase cam ~80 FOV, no shake, no head-bob, no motion blur. Kids are more motion-sick-prone than adults.
- **Co-play.** Parent gets a Co-Star pointer (Mario Galaxy pattern): a second cursor that highlights and collects but cannot fail. Deferred to P6, designed for from day one.
- **Listen, don't prompt** at playtest gates. Build around what she spontaneously enjoys.
- **Accessibility floor:** colourblind-safe pickup shapes (shape + colour, never colour alone), prefers-reduced-motion honored, every interactive element reachable by keyboard. Carried over from the site's WCAG DNA.

### 2.2 Depth strata - the ceiling (new in v2)

One world, layered. Each stratum is invisible until the player does the thing that reveals it. A 6-year-old never sees a menu grow; a 35-year-old finds a flight computer.

| Stratum | Player | Revealed by | What it adds |
|---------|--------|-------------|--------------|
| **S0 Joyride** | 6+ | nothing - the default | The covenant experience, complete in itself |
| **S1 Ghosts & tricks** | 8+ | finishing the same track 3 times | Race your own best-run ghost (self-competition, still no opponents, still no fail). Hold-jump spin tricks whose airtime is real: hang time scales as 1/g, so Pluto gives ~16x Earth's spin time. Tricks earn bonus stars, never penalties |
| **S2 Flight school** | 10+ | P5 flight layer | Named, taught, and playable orbital mechanics: the Hohmann "lazy river" route, the gravity-assist "free trampoline", Oberth's "burn low, fly fast", and a landing challenge where overshoot = comedy bounce, never a crash screen |
| **S3 The real numbers** | teen-adult | settings toggle | Hover any toy quantity for its real value. Arrival cards: "your 40-second cruise really takes 7 months". Photo mode with a JWST-infrared filter (site brand tie-in). "Space is silent" audio toggle: engine heard only through the kart body, everything outside muffled to honesty |
| **S4 Grand Tour** | adult | P6 complete | Recreate Voyager 2's real Jupiter-Saturn-Uranus-Neptune assist chain on a delta-v budget. Daily seeded challenge run. Local-only leaderboard (no accounts, nothing leaves the device) |
| **S5 The Pearl String** | adult | S4 Grand Tour complete | The endgame beyond the endgame: launch the sun-lens string, dive the corona, outrun a ghost Voyager, and develop humanity's first portrait of another world (section 5, decision 22) |

**Hotseat party mode** (any age, 1 weekend, post-W3 candidate): pass-the-iPad time trials with name stamps. No networking, no accounts - the leaderboard is the living room.

### 2.3 Tone - Nintendo warmth, not Xbox grit (new in v2)

The split that keeps both the brand and the fun honest: **photoreal awe in the world, toy warmth in everything you touch.**

Resolved (Macdara, 2026-07-05): gameplay is **cartoony-first** - posterized, chunky, saturated. Photoreal renders are reserved for the awe beats: approach plates, Mission Replay close-ups, the Pale Blue Dot, the Einstein ring. The tech for "both" already exists in the plan: the morph's `uMix` uniform blends a real photograph into its own posterized 4-6 band version, so cartoon and photo are one texture and one slider, not two art pipelines.

- The world is real: NASA terrain, true skies, photographic approach plates. That layer is allowed to be breathtaking and accurate.
- Everything interactive is warm and chunky: rounded geometry, saturated posterized palettes, squash-and-stretch on the kart (landing squish, jump stretch - render-only, physics untouched), idle wiggles, big rounded UI with press-wobble.
- The kart is a character, not a vehicle sim. Decals, colours, name, optional googly eyes: her call (covenant: her in the game).
- Sound is musical: pickups arpeggiate up a scale (the Mario coin trick), respawn is a friendly boop, celebrations are fanfares. Nothing barks, nothing klaxons.
- Language is invitation, never command: "Want to try Mars?" not "MISSION FAILED". Scores exist only in strata that asked for them.
- Banned aesthetics: gritty realism in UI, military HUDs, lens-flare menace, dark sci-fi dread. The cosmos is friendly here.

## 3. Compression doctrine - true to physics at toy scale (new in v2)

The rules that keep "real data, real wonder" honest while distances shrink and speeds rise:

1. **Ratios are real, magnitudes are tuned.** Gravity ratios between bodies are exact (Moon 0.17g, Mars 0.38g, Pluto 0.06g, Jupiter cloud-tops 2.53g). Hang-time ratios are exact by construction (t = 2v/g with v constant per decision 11). Relative body sizes within a scene are exact. Absolute track lengths, kart speeds, and trip times are tuned for 60-120 second runs.
2. **One kart, many gravities.** Top speed and jump impulse never change (decision 11). A player who has only ever pressed one button still FEELS the difference between worlds, because gravity is the only thing that changed.
3. **Distances compress by the site's own power law** (~16 * r_AU^0.43, the same curve the instrument already uses). The game inherits the site's established epistemic move and labels it the same way.
4. **Cruises time-warp with honesty captions.** Inter-planet flight is budgeted at 20-90 seconds with star-streak warp visuals. On arrival, S3 players see the real figure ("Earth to Jupiter: 6 years by gravity assist"). The toy never claims to be the truth; it links to the truth.
5. **Escape velocity is honored where it IS the fun.** On Phobos, Deimos, and comet 67P, real escape speeds are within kart reach - so jumping into orbit is real, kept, and celebrated (decision 12). On large bodies real escape is unreachable by kart anyway, so nothing needs faking.
6. **Real phenomena become mechanics, honestly labelled.** Every signature mechanic in section 5 is a real process (geysers, terminator speed, ring thickness), shrunk and labelled the same way the site labels compressed orbits: "Enceladus geysers, kart-sized".

## 4. Architecture

### App shell
- Vite + TypeScript, current three.js (not the monolith's r128). **A standalone project in its own repo** (working name `pilot-mode`), deployed as its own static site with its own URL (decision 17). No Next.js, no coupling to the website. Runs 100% in-browser: no install, no backend, no accounts.
- **Renderer strategy (v2):** WebGL2 is the baseline and the only path until W3 ships. WebGPU via three.js WebGPURenderer goes behind a query-string flag from W3+, promoted only after it survives the family iPad. All budgets are set against WebGL2.
- Copied from the monolith (~1,000 lines - copies, never imports): `planetsData`, `solveKepler`, the texture set, starfield. Nothing else. Dive mode, galaxy view, tour engine, True Scale stay in the instrument.

### Scenes
- One renderer, two resident `THREE.Scene` graphs (orbital + surface), `renderer.render(activeScene, camera)` per frame.
- The surface scene is ONE reusable template re-skinned per body: track GLB + palette + gravity constant + obstacle set + signature-mechanic module swapped in. Per-body assets disposed on exit.
- Crossfade render targets allocated only during transitions, disposed after. pixelRatio capped at 1 during transitions, 2 otherwise. No canvas resizes mid-game (iOS Safari).
- Instanced meshes for pickups, particles, and ring-surf boulder fields. Bloom post-processing only during celebration moments, never during driving (iPad thermal budget).

### Physics
- One 60 Hz fixed-timestep accumulator drives two integrators behind a common `step(dt)` interface. Never frame-coupled (the monolith's runaway-clock bug is the cautionary tale).
- **Orbital:** restricted n-body toy on the 2D ecliptic plane, planets on Kepler rails, ~300 lines. Visible gravity-well circles, constant-force inside wells, dotted trajectory preview.
- **Surface:** flat-plane kart controller - x/z position + heading, y under per-body constant g for jumps, ground height from a precomputed height grid (never mesh raycasts), circle-vs-circle collision for obstacles and pickups.
- Both integrators run in flat, unbent space at all times. The morph never touches physics.
- Bespoke integrators stay (no Rapier/ammo): circle collision covers everything in the catalogue. Revisit only if a mechanic genuinely needs rigid bodies, and treat that as a scope alarm first.

### The morph (takeoff/landing spectacle)
- `bend.ts` exports `wrapBendable(material)` - an `onBeforeCompile` vertex injection around `#include <begin_vertex>` - plus one shared uniforms object `{uBendRadius, uBendOrigin, uMix}`. Nothing else in the codebase knows the world bends.
- Math: the trigonometric rolling-log wrap, radial two-axis form. `theta = d/R; y' = (y+R)cos(theta)-R; xz' = origin + dir*(y+R)sin(theta)`. Animating R from ~10000 (imperceptible curl while racing) down to ball size IS the takeoff morph. NOT the parabolic `y -= d*d*k` form - it droops but never closes.
- At peak curvature: two-render-target crossfade to the orbital scene (the official three.js scenes-transition pattern), apparent planet size matched, the SAME NASA albedo texture on both representations. Landing runs it in reverse.
- Pre-decided gotchas: `frustumCulled = false` on surface meshes (bounds are computed unbent); blob shadows only (shadow depth pass does not inherit the injection); every surface material gets the injection or props float above bent ground.
- `uMix` also drives the photo-to-stylized blend: real photograph during approach, posterized 4-6 band version of the same photograph at ground level. One uniform, zero extra textures.

## 5. Content - the fun catalogue (real physics, toy scale)

Brand rule carried over from the site: real data, honestly labelled. Tracks are shrunk and labelled so ("Tycho crater, kart-sized") - the same epistemic move the app already makes with compressed orbits.

**This table is a menu, not a queue (decision 15).** Bodies above the line are the v1 plan; below the line is the unlock universe, each gated to its build-order wave.

| Body | Gravity | Signature fun | The real physics behind it | Earliest wave |
|------|---------|---------------|----------------------------|---------------|
| **Moon** | 0.17g | v1 raceway; floaty 2-second jumps; **Chase the Sunset** - outrun the terminator | Lunar terminator moves ~15 km/h at the equator: a kart really can outrun nightfall. Earth hangs in the black sky (Earthrise photo spot). NASA CGI Moon Kit heightmap, later LROC 2 m Tycho DTM | W3 (ship) |
| **Mars** | 0.38g | Dust-devil slalom; Olympus Mons mega-ramp; Phobos visibly racing across the sky | Dust devils are real and rover-photographed. Olympus Mons is 2.5x Everest. Phobos orbits faster than Mars rotates, so it rises in the WEST and crosses in ~4 hours. HiRISE 1-2 m DTMs | W4 |
| **Phobos & Deimos** | ~0.0005g | **Jump into orbit.** A hard jump genuinely escapes; orbit-cam catches you, giggle, gentle return | Real escape velocities: ~41 km/h (Phobos), ~20 km/h (Deimos) - within kart reach. The whole game's thesis in one moment | P5 |
| **Mercury** | 0.38g | **Race the Sunrise** - the dawn line chases you at walking pace and you outrun it forever | Mercury's solar day is 176 Earth days; the terminator crawls at ~3.6 km/h. Slowest sunrise in the solar system. MESSENGER 665 m/px DEM (decision 14) | P6 unlock |
| **Pluto** | 0.06g | Trick paradise: ~16x Earth hang time; glacier-surf Sputnik Planitia | Hang time = 2v/g, exact by decision 11. Sputnik Planitia is a real flowing nitrogen-ice glacier. New Horizons 300 m DEM | P6 unlock |
| **Saturn's rings** | n/a | **Ring-surf**: carve through the boulder swarm, gap-jump the Cassini Division, wave to Daphnis | Rings are only ~10 m to 1 km thick - a surfable sheet is barely a lie. Daphnis really does raise vertical waves in the Keeler Gap (Cassini photographed them). No fake ground (decision 8) | P6 unlock |
| **Jupiter's clouds** | 2.53g | Cloud-trampoline: heavy-g stubby hops, deep bouncy landings; Great Red Spot storm arena | 2.53g at cloud-tops is real; GRS winds exceed 400 km/h. Never gets ground (decision 8) | v2 candidate |
| **Io** | 0.18g | Volcano launch pads: ride a real plume 300 km up | Io's volcanic plumes genuinely reach 300-500 km (Pele). The most volcanically active body known | v2 candidate |
| **Europa** | 0.13g | Ice-drift track: low-friction carving through chaos terrain | Smoothest solid surface in the solar system; real chaos-terrain topography from Galileo imagery | v2 candidate |
| **Enceladus** | 0.011g | Geyser fountains as jump boosts through falling snow | South-pole geysers are real, feed Saturn's E ring, and in 0.011g the "snow" falls in dreamy slow motion | v2 candidate |
| **Titan** | 0.14g | **The flying kart**: pop wings, thermal-glide over methane lakes | Thick atmosphere (1.45 atm) + low gravity means a human with strapped-on wings could literally fly on Titan. Kraken Mare is a real sea | v2 candidate |
| **Comet 67P** | ~0.0001g | Land ON the comet (landing = docking); outgassing jets as boost vents | Escape velocity ~1 m/s: even a hop escapes. Jets are real near perihelion (Rosetta) | v2 candidate |
| **Ceres** | 0.03g | Night race to the Occator bright spots by headlight | Occator's faculae are real sodium-carbonate salt flats, the brightest thing on the darkest dwarf planet | v2 candidate |
| **Asteroid belt** | varies | Boulder-hop playground, home of the Arcade cabinet, Vesta-to-Pallas sightseeing | The real belt is almost entirely empty space - asteroids average a million km apart. Flying through it safely IS the lesson (sorry, Hollywood) | P5 |
| Venus | - | skipped permanently | 4.6 km/px topo cannot honestly support terrain | never |

### The Arcade in the Belt - retro cabinet easter eggs (new in v2, decision 18)

Hidden 1979-style arcade cabinets scattered through the solar system. Find one, dock, and the screen takes over through a CRT shader (scanlines, phosphor glow, barrel curve - one render-target trick, consistent with the crossfade tech already planned). Each cabinet is a ~300-line 2D canvas game, ~1 weekend each, and each smuggles in a real lesson. Covenant applies inside the glass: runs end with "NICE FLYING!" and a fact card, never GAME OVER.

| Cabinet | Where found | The game | The smuggled lesson | Gate |
|---------|-------------|----------|---------------------|------|
| **Lunar Lander** | Behind a crater rim on the Moon track | The 1979 classic, rebuilt with the Moon's real 1.62 m/s2 and real lander thrust ratios | Suicide-burn intuition, years before P5's landing challenge teaches it in 3D | W4+ |
| **BELT BLASTER** (Asteroids) | Floating in the asteroid belt, impossibly, with a coin slot | Vector-graphics rock-blasting in a comically dense field. The named big rocks are Ceres, Vesta, Pallas, Hygiea | The joke is the lesson: the cabinet plays the Hollywood fantasy while the window behind it shows the real, almost-empty belt | P5 |
| **MARS DEFENDER** (Space Invaders inversion) | Half-buried near the Perseverance cameo | You "defend" Mars against descending Earth probes - which all soft-land safely and wave hello. Each invader is a real mission with its real year (Viking 76, Pathfinder 97, Spirit 04, Curiosity 12, Perseverance 21) | Mars mission history as a scrolling gag; the invaders were us all along | W4 |

More cabinets only if the first one gets replayed (covenant rule: few things, loved hard).

### The hidden curriculum - easter eggs everywhere (new in v2, decision 19)

The game never lectures. Every fact is DONE first, read second, and half of them are hidden:

- **Sticker book = field guide.** Every sticker earned reveals a one-sentence fact with read-aloud audio (she is an early reader) and a real photo. Filling a body's page assembles its fact sheet without anyone assigning homework. Adults hover for the S3 deep card.
- **The Explorer's Museum: real spacecraft hidden as collectibles.** Apollo 11's descent stage at Tranquility Base (real coordinates, kart-scaled), Perseverance and a waving Ingenuity on Mars, New Horizons streaking past Pluto once per session, Huygens resting on Titan, and Philae wedged in its real shadowed crack on 67P - finding Philae took ESA two years, and finding it in-game is the same hunt. Each find = fanfare + museum sticker + story card.
- **Constellation tracer.** The skybox is the real star field. From any surface, trace constellations with a finger - Southern Cross first (Perth kid). The quiet blockbuster: the constellations look the same from Mars. Nobody says it; players notice.
- **Wait for the light.** Press the photon beacon on any body and watch a single pulse leave the Sun on the orbital map at true scaled light-speed. On Pluto, go make a sandwich. S3 adults get the running gag: mission control's radio replies arrive 43 minutes late at Jupiter.
- **Sky events that are really there.** Phobos transiting the Sun from the Mars track (rovers have photographed exactly this), Earth hanging fixed in the Moon's sky (it never rises or sets from one spot - tidal locking, felt not taught), Daphnis making waves overhead during ring-surf.
- **Names are real, spoken aloud.** Every crater, mons, and planitia on every track uses its IAU name with pronunciation audio. "Tycho" becomes a place she has jumped, not a word in a book.
- **Golden Record cameo.** Somewhere far out, a tiny gleaming disc drifts by. Catch it and it plays a snippet of the real Voyager record. One-time, unrepeatable, whispered about.

### Launch Pad Earth - rockets, catches, and orbital refueling (new in v2.1)

Earth enters the game as a launchpad, not a racetrack (1g is the world she already lives in; the game is about everywhere else). Gate: P5, because it needs the orbital scene.

- **One-button launch.** Hold to throttle, feel the rumble, staging is a felt THUNK plus a cheer. Covenant applies: a wobbly ascent arcs into ocean spray and a giggling recovery barge, never an explosion screen.
- **Catch the booster.** The tower-arms catch as a one-button timing game; droneship landings as its sea-level sibling. Inherently Nintendo-warm spectacle: a skyscraper catching a skyscraper.
- **Orbital refueling is the docking dance.** Gentle approach, match speed, soft-capture boop. Each tanker fills the delta-v meter toward departure. Kid mode: 3 tankers and you are fueled. S3 caption: "the real ship needs 10+ tanker flights; we gave you 3 so bedtime still happens." The lesson underneath: orbit is halfway to anywhere (Heinlein), and the tank is why.
- **Then GO.** A full tank unlocks the departure burn to the Moon, Mars, and the rest of the flight layer. The launch loop is also how S5 builds its pearl string.
- Vehicles per decision 20: the NASA fleet flies real and free; the modern super-heavy ships fly as warm-named lookalikes until branding is cleared.

### Mission Replays - ride the real voyages (new in v2.1)

Pick a mission in the Explorer's Museum and ride alongside it: the real trajectory on baked Horizons rails (decision 21), time-compressed with honesty captions, a cinematic free-look camera orbiting a free NASA 3D model up close, milestone cards at every encounter. S2+ players get take-the-stick moments - fly the gravity assist yourself, and the rail catches you afterwards.

| Replay | The moment that sells it |
|--------|--------------------------|
| **Voyager 2** | The only Grand Tour ever flown - four planets, one spacecraft, assists chaining like billiards |
| **Voyager 1** | At the real 1990 position the camera turns home: the Pale Blue Dot, recreated in-engine. Links the Golden Record cameo |
| **Apollo 11** | Saturn V ascent (all NASA, all free), translunar coast, the landing - ends at the Tranquility Base artifact she can already visit |
| **Parker Solar Probe** | Dive INTO the corona at 690,000 km/h, the fastest thing humans ever built. Trains the S5 sun-dive |
| **Cassini** | Thirteen years at Saturn, then the Grand Finale: 22 dives through the ring gap, ending as part of the planet it studied |
| **New Horizons** | Nine years of cruise for nine minutes of Pluto, and the heart reveal. Its 14 km/s would cross the whole Pluto track in a blink |
| **Rosetta & Philae** | The comet chase, the bounce, the two-year hunt for the lander - the same hunt the player runs on 67P |
| **Dawn** | The tortoise engine: ion thrust too weak to feel, patient enough to orbit TWO worlds (Vesta, then Ceres) |
| **Live rails** | Lucy, Psyche, JUICE and friends flying RIGHT NOW - monthly rebaked positions, "in flight today" markers |

### Tap the Telescopes - Hubble and Webb, borrowed (new in v2.1, decision 23)

Fly to the real observatories and borrow their eyes. Hubble hums along in low Earth orbit; Webb sits 1.5 million km out at Sun-Earth L2 - the exact marker the parked instrument plan always wanted, now a destination you can park next to. Dock gently, knock politely, and the dish grants GUEST MODE with a friendly handshake beep. The "hack" is mischief-flavoured, never menacing (covenant).

- **The sky has addresses.** Inside the eyepiece, the real star sphere glows with markers at the true RA/Dec of published observations. Slew to one, hold steady, and the real image develops in the frame - the same darkroom motif as the Pearl String.
- **Real archives, baked at build time.** A curated observation set from MAST/STScI and ESA/Hubble with genuine pointing metadata and dates. Static tiles, no runtime API, honest "observed on [date]" captions. Never sourced from the site's old JWST pages (decision 23).
- **Two eyes, one sky.** Where both scopes shot the same target (Pillars of Creation, Carina), a slider crossfades Hubble's visible light into Webb's infrared - the single best "why we built Webb" lesson, delivered by thumb.
- **Look-back time.** Deep-field captures caption the light's travel time ("this light left before the Sun existed"). S3 adults get redshift on hover.
- **Postcards from Deep Time.** Every developed image becomes a postcard sticker in the museum. Favourites go on the fridge page.

Effort: 1-2 weekends for the slew UI + bake pipeline; the catalogue then grows by curation, not code. Gate: P5 (L2 is a flight-layer destination; Hubble can arrive earlier alongside Launch Pad Earth).

### The Pearl String - the sun-lens finale (new in v2.1, decision 22)

The endgame beyond the Dyson Drive, and it is real physics in development today: the Solar Gravitational Lens mission concept (NIAC Phase III, Turyshev et al., JPL). The Sun's gravity bends light to a focal line beginning ~550 AU out; a small telescope there can sample the Einstein ring of a planet orbiting another star and reconstruct a megapixel portrait - continents, clouds, weather, on a world light-years away. The flight architecture really is called a string of pearls: waves of small sailcraft launched in strings.

The player flies it, post-Grand-Tour (S5):

1. **Build the string.** The Launch Pad loop launches pearl after pearl.
2. **The sun-dive.** Pilot the perihelion pass Parker taught you; sails bloom; exit at ~25 AU/yr while a ghost Voyager 1 (3.6 AU/yr) falls away astern.
3. **The wait.** Time-warp with the honesty caption ("real pearls cruise ~27 years; yours took 90 seconds"). Crossing the heliopause rings Voyager's chime. The map zooms out past everything: 550 AU makes the whole game so far look like a front garden. The scale lesson of the entire game in one zoom.
4. **The ring.** Put the Sun exactly behind you and the target star exactly ahead. The Einstein ring blooms around the black solar disc. Drift the pearls across it, sampling pixel by pixel, and another world's portrait develops like a photograph in a darkroom.
5. **Name it.** Her call (covenant). Museum card: "This mission is a real NASA-funded study. Nobody has flown it yet. You flew it first."

Facts kept honest: the focal line starts ~550 AU, not 150 (150 AU is barely past the heliopause, still inside the lens's blind zone); the targets are exoplanets, never our own outer planets (the geometry only works pointing away from the Sun); the status is a funded study, not an approved flight.

### Terrain pipeline (unchanged from v1)

v1 Moon uses the CGI Moon Kit heightmap displaced at load - real data, no pipeline. From Mars onward, the full bake: GeoTIFF clip (Map a Planet 2 / Solar System Treks) -> 16-bit PNG heightmap (gdal or geotiff.js; mind LOLA's 0.5 scale factor) -> Blender: displace, 2-3x vertical exaggeration, decimate to 15-30k tris, flatten a smooth authored ribbon along the racing line (real terrain is scenery and jump features; the drivable line is authored) -> bake AO + posterized colour to one 1024px texture -> Draco GLB (~0.3-0.5 MB) + KTX2 albedo + one real-photo approach plate. ~1-1.5 MB per track, lazy-loaded per landing.

Budgets: app grows ~10 MB -> ~16-18 MB with 4-5 tracks (first paint unchanged). GPU under ~500 MB. Test on the actual family iPad at every gate. Credits line: "Terrain: NASA / USGS / LRO / HiRISE / MESSENGER".

### Sound
- Arcade audio by default (she gets the fanfares). Celebration jingles can sample real NASA sonifications.
- S3 "space is silent" toggle: engine transmitted through the kart body only, exterior sources muffled to near-nothing. Physics-honest and weirdly beautiful.

## 6. Build order

Red-team-corrected sequencing, unchanged at the front. The kart is first because kart feel is the only real unknown; infrastructure waits until a phase needs it. **v2 proofread note:** effort units normalized to weekends throughout (v1 mixed weekends and weeks; the 13-17 total now reconciles).

| Wave | Scope | Effort | Gate | Status |
|------|-------|--------|------|--------|
| **W1 - The Toy** | Vite/TS scaffold, ONE scene. Kart on flat moon-grey plane with noise bumps: auto-accel, follow-the-finger / arrows, one-button jump at 0.17g with hold-to-float, star pickups + chime. Simple 20-line accumulator. No n-body, no loaders | 1 weekend | **She plays Sunday night.** Any engagement passes | later |
| **W2 - The Feel** | Tune to her reactions: sparkle force-field edges, sub-2 s respawn + boost, 3 big stars (one on-path, one behind a jump, **one in the tunnel**), run-end celebration, blob shadow, chase cam. Validate touch on the family iPad | 1 weekend | Does she replay unprompted? Pass = proceed. Fail = tune feel, add nothing | later |
| **W3 - The Moon (v1 SHIP)** | CGI Moon Kit heightmap displaced at load, Earth in the black sky, title screen + rocket button, takeoff = shake + white-out -> menu | 1 weekend | 3+ unprompted replays, finishes runs herself | later |
| **W4 - Her choice** | Decided by her behaviour: replaying hard? Mars re-skin at 0.38g (learn the full pipeline now). Lukewarm? The morph for wow | 1 weekend | Does she notice the jumps feel different on Mars? (Listen, don't prompt) | later |
| **P4 - The Morph** | `wrapBendable` + animated R + crossfade + albedo continuity. Pure spectacle on a working game | 2-3 weekends | The takeoff reaction: she makes someone else watch it | later |
| **P5 - Flight layer** | Orbital scene + slingshot toy: gravity-well circles, trajectory preview, piloted flight replaces tap-to-fly autopilot, visit-the-planets missions. Unlocks S2 flight school and the Phobos jump-into-orbit moment | 5-7 weekends | Does she use the line or thrust-and-giggle? Both pass; tune to whichever | later |
| **P6 - Dyson Drive** | Item-Get ritual (freeze, pose, fanfare, ship transforms), straight-line flight, free-fly sandbox, Pluto/Mercury/Saturn-rings unlock tracks, Co-Star pointer | 2-3 weekends | - | later |

**Core total: 13-17 weekends** at honest solo-dad cadence (3-4 months). Stopping after W3, W4, or P4 still leaves a finished game.

### Strata backlog (v2 - all gated, all optional, all "later")

| Item | Effort | Gate (may not start before) |
|------|--------|------------------------------|
| S1 ghosts & tricks | 1-2 weekends | W3 shipped AND she replays unprompted |
| Hotseat party mode | 1 weekend | W3 shipped |
| S3 real-numbers toggle + photo mode | 1-2 weekends | P4 shipped |
| S2 flight school challenges | inside P5 +1 weekend | P5 |
| S4 Grand Tour + daily seed | 2-3 weekends | P6 shipped |
| Lunar Lander cabinet | 1 weekend | W4 shipped |
| MARS DEFENDER cabinet | 1 weekend | W4 Mars track shipped |
| BELT BLASTER cabinet | 1 weekend | P5 shipped |
| Explorer's Museum wave 1 (Apollo site + Perseverance/Ingenuity) | 1 weekend | W4 |
| Constellation tracer + photon beacon | 1-2 weekends | P4 shipped |
| Launch Pad Earth (launch + booster catch + refuel docking) | 2-3 weekends | P5 shipped |
| Mission Replay engine | 1-2 weekends | P5 shipped |
| Individual replays (Voyagers, Apollo 11, Parker, Cassini, New Horizons, Rosetta, Dawn, live rails) | ~0.5 weekend each | Replay engine shipped |
| Tap the Telescopes (Hubble + Webb) | 1-2 weekends | P5 shipped |
| S5 Pearl String finale | 2-3 weekends | P6 + S4 Grand Tour shipped |
| v2-candidate bodies (Io, Europa, Titan, Enceladus, 67P, Ceres, Jupiter clouds, belt playground) | ~1 weekend each once pipeline exists | P6 shipped, and only the ones players actually ask for |

**Parallel weeknight stream (off the critical path):** website Phase 0 fixes in the monolith - fixed-timestep accumulator, runaway clock, Reset, ghost overlay, mobile taps. See `docs/solar-system/AUDIT-2026-06-12.md`. The production site needs these regardless; they share no code with the game.

### Progression design
v1 inter-planet travel is tap-a-planet autopilot (a charming scripted arc she can wiggle) so the capstone reward is not given away on day one. P5 makes flight piloted ("now YOU fly" - the growth arc as she gets older). P6's Dyson Drive is the earned escape from Newton: stars -> sticker pages -> the full Zelda Item-Get ritual -> the first straight-line flight crosses in seconds a distance that previously took three slingshots. Project Orion lore card for the grown-ups. Past P6, the strata take over as the adult endgame: Grand Tour, daily seeds, and the unlock bodies.

## 7. Cut list

**Cut from v1, returns later:** Mars (W4), the morph (P4), photo approach plates (P4), full GIS pipeline (W4+), orbital level-select scene (P5 - v1 boots to a menu), Co-Star pointer (P6), Pluto + Mercury + Saturn-ring tracks (P6 unlocks), everything in the strata backlog.

**Kept in v1 despite pressure:** the tunnel. It was in the original ask, it is a stretched arch, and bursting out of darkness is enormous per-byte delight.

**Cut indefinitely:** AI opponents, lap counting, placements against others (no-fail collect-a-thon verdict; the S1 ghost is yourself and cannot beat you rudely); Venus; fake gas-giant ground; online multiplayer, accounts, cloud saves (privacy + scope - the party mode is a shared iPad); Earth as a racetrack (Earth is a launchpad and a photograph - the game is about everywhere else).

**Rejected permanently:** true spherical-gravity driving (Mario Galaxy style - weekends of work for a wow delta a 6-year-old cannot perceive over the bend; revisit only if she asks to "drive all the way around"); chunked-LOD real-scale planets (confirmed multi-year trap; web prior art is immature).

## 8. Risks

1. **Kart feel is the gating unknown** (W1-W2). Timebox to the playtest gates. Cut obstacle variety before cutting feel polish.
2. **The named failure mode: the bend-shader spike at 11pm in week 5.** When kart tuning feels bad, the spectacular morph is the sanctioned distraction - it produces a tweetable demo and a dead game. The morph is already de-risked on paper. Do not touch it until she replays the kart unprompted.
3. **(v2) The catalogue is the new bend-shader.** Section 5 now contains a dozen tweetable mechanics (Titan wings! comet docking!) plus an entire retro arcade. Every one is gated for the same reason the morph is gated behind W2: nothing in the menu may jump its gate. If a weekend starts with "quick prototype of the Enceladus geysers" or "just a quick Asteroids clone", the plan has failed. The cabinets LOOK like sanctioned 1-weekend treats; they are only sanctioned AFTER their gates. v2.1 stacks a rocket program, a replay fleet, two space telescopes, and an interstellar lens onto the same menu: same rule, same gates.
4. **The GIS pipeline is a hidden fourth project** (gdal, Blender, Draco, KTX2 each have learning curves). It is deliberately deferred to the Mars track and the first bake attempt is expected to fail.
5. **iOS Safari memory.** Test on the actual family iPad at every gate, not just desktop. pixelRatio discipline during transitions. WebGPU stays behind its flag until proven on that device.
6. **Design ages out - now partially mitigated.** She is 6 now; at 7-8 she will want scores and competition. v1 said "ship fast before she outgrows it"; v2 adds the answer for afterwards: S1 ghosts arrive exactly when score-hunger does, S2 flight school at 10, and the game grows with her instead of dying. The strata are the anti-aging plan.

## 9. Relationship to the website (v2: separated entirely)

- **The game is its own project** (decision 17). Own repo, own static deploy, own URL. No shared code, no shared build, no iframe. A "Play Pilot Mode" link on the solar-system page is optional marketing once the game exists, nothing more. This plan doc migrates to the game repo when it is minted at W1; a pointer stays here.
- The site stays **frozen, not stripped** - still free, still true. Macdara's call (2026-07-04): the solar-system page has always been the site's standout; the rest is not important. The `/explore/jwst-*` pages keep whatever ranking they have without maintenance.
- The weeknight P0 stream survives the separation because every P0 bug (runaway clock, broken Reset, ghost overlay, mobile taps) is ON the solar-system page itself - the one part of the site that still matters. Everything else in the parked instrument plan (`docs/solar-system/AUDIT-2026-06-12.md`) is now doubly parked.
- The S3 photo mode's JWST filter and Tap the Telescopes echo the site's JWST identity without depending on it: the game sources imagery straight from the archives (decision 23), never from the site's broken JWST pages.

## 10. References

- Research traces: `.claude/traces/2026-06-12-solar-system-assessment.jsonl`, `2026-06-12-game-pivot-assessment.jsonl`, `2026-06-12-surface-racing-expansion.jsonl`
- Companion audit: `docs/solar-system/AUDIT-2026-06-12.md`
- Key prior art: Angry Birds Space (readability devices), Mario Galaxy (Co-Star lap-play, spherical joy), Gravity Ghost (no-fail orbital, reward orbiting itself), Subway Surfers (curved-world shader, short-run retention), Outer Wilds (toy-scale internal consistency), Kerbal Space Program (flight-school joy, bounce-not-fail landings), Sissy's Magical Ponycorn Adventure (dad + daughter co-creation, tiny finished scope)
- Tech references: rolling-log bend math (bevyengine discussion #10062, lynnpepin/rollinglogshader), three.js onBeforeCompile material extension, official three.js crossfade example, three.js WebGPURenderer, NASA CGI Moon Kit, USGS Map a Planet 2, USGS MESSENGER global DEM
- Physics fact-check anchors (v2): lunar terminator ~15 km/h and Mercury terminator ~3.6 km/h (circumference / solar day); Phobos escape ~11 m/s, Deimos ~5.6 m/s, 67P ~1 m/s; Io plumes to 500 km (Pele); Daphnis vertical ring waves (Cassini, Keeler Gap); Titan human-powered-flight estimate (1.45 atm, 0.14g); Sputnik Planitia nitrogen-ice glacial flow (New Horizons); Occator faculae sodium carbonate (Dawn)
- v2.1 references: NASA 3D Resources (free spacecraft models: Voyager, Cassini, Parker, and more), JPL Horizons ephemerides (bake-time replay rails), Turyshev et al. NIAC Phase III Solar Gravitational Lens reports (string-of-pearls sailcraft architecture, ~550 AU focal line, megapixel exoplanet imaging), MAST/STScI and ESA/Hubble archives (Tap the Telescopes pointing metadata), Pale Blue Dot (Voyager 1, 1990), Parker Solar Probe (690,000 km/h corona passes), Heinlein's "orbit is halfway to anywhere"

## Changelog

- **v2 (2026-07-04):** Proofread: fixed W/P numbering drift (cut list referenced nonexistent "P3"), normalized effort units to weekends so the 13-17 total reconciles, unglued decision 2 phrasing. Enhanced: audience widened to 6-adult via depth strata (S0-S4), compression doctrine formalized (section 3), fun catalogue expanded with 8 physics-true unlock bodies plus the asteroid belt, Mercury re-admitted on MESSENGER data, WebGL2/WebGPU strategy set, sound design + accessibility floor added, catalogue-discipline risk added. Same-day additions from Macdara: Nintendo-warmth tone covenant (2.3, decision 16); full separation from the website into a standalone repo (decision 17, section 9); retro arcade cabinet easter eggs (decision 18); education-by-mechanic + hidden curriculum easter eggs (decision 19). W1-W3 scope unchanged from v1 throughout.
- **v2.1 (2026-07-05):** Launch Pad Earth (one-button launch, booster catch, orbital-refuel docking, delta-v lesson). Mission Replays on baked Horizons rails (Voyagers with Pale Blue Dot, Apollo 11, Parker, Cassini Grand Finale, New Horizons, Rosetta/Philae, Dawn, live rails for missions in flight now). Tap the Telescopes: fly to Hubble and Webb, GUEST MODE in, develop real archive images at their true sky positions (MAST/STScI sourced, decision 23). S5 Pearl String sun-lens finale (real SGL study; facts corrected to ~550 AU focal line and exoplanet targets). Vehicle IP policy: NASA fleet free, SpaceX trademarked so the mechanic ships vehicle-agnostic (decision 20). Art direction resolved cartoony-first with photoreal awe beats (2.3). All new items menu-gated; W1-W3 still untouched.
- **v1 (2026-06-12):** Initial plan from three assessment rounds.
