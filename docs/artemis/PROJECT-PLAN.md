# Artemis mini-apps: project plan

Status: slice 1 (Descent to Shackleton) merged in PR 82 on 2026-11-13. Slice 2 (Return to the Tower) in review on `feat/starship-catch`. Written 2026-11-12.

Two mini-apps for Cosmos Collective: a Starship game made of four short "gates", and an Artemis explorer. Each slice is one PR and ends playable. Nothing in a later slice starts before the slice above it has merged.

## 1. Why this exists

Research on 2026-11-12 found many public Artemis II trajectory trackers and no public interactive of the lunar landing itself. The landing is the part nobody has built, so it goes first.

The failure this project is prone to is the one named in `docs/pilot-mode/PROJECT-PLAN.md` risk 3: a catalogue of tempting mechanics and no finished slice. This plan ships one gate at a time.

## 2. Rulings (Macdara, 2026-11-12)

| # | Ruling | Why |
|---|--------|-----|
| 1 | The lander is drawn with realistic geometry and named factually as SpaceX's Starship HLS. No logos or livery. A "not affiliated with NASA or SpaceX" credit is shown. | Website mini-apps only. Pilot-mode decision 20 (lookalikes) is unchanged for that game. |
| 2 | Real data only. Published figures with a source; planned values labelled planned, flown values labelled flown. Where nothing is published, say so or leave it out. | Site principle 1. |
| 3 | The powered descent gate is built first. | It is the gap in what exists publicly. |
| 4 | Physics is an acceleration model. The throttle commands thrust acceleration; no lander mass or engine thrust appears. | No Starship HLS descent figure is published (section 6). |
| 5 | Title: "Descent to Shackleton". The working title "Twelve Minutes to Shackleton" is retired. | Twelve and a half minutes is Apollo 11's flown descent. It does not transfer to HLS, and the game compresses the burn. |
| 6 | The game is the last 2 km. The braking burn is a short intro flown by the computer at 32x time, labelled on the HUD, with a skip button. The intro eases from 32x to 4x over its last 30 simulated seconds so the pitch-over and the handover can be seen coming. The manual descent runs in real time. Retry restarts 2 km out, on the computer's line. (Revised 2026-11-12 after the first play: with the computer flying the burn and the player only matching marks, the controls changed nothing. Revised again the same day after the second play: a retry from the takeover cost a minute's flying before the decision.) | The burn has no decision in it. The decision is where to put the lander down. |
| 7 | Framing: manual takeover. The computer flies attitude during braking; the crew takes the stick at high gate. | NASA's human-rating rules require manual control, and NASA and SpaceX disagree on whether Starship meets that (source 9). |
| 8 | The dust finish stays and is labelled: Apollo crews lost sight of the surface (flown); HLS plume behaviour is still under test. | Honest about what is known. |
| 9 | The gold guidance marks stay on. "Off by default" was offered and declined. | The marks steer for the target centre, which the game strews with boulders, so following them is the losing line and the player has to depart from them. |
| 10 | The lander casts a real shadow: its true geometry from the game's 1.5 degree Sun on to the LOLA terrain. The lander goes dark when the terrain hides the Sun from it. | It is worked out, not invented. With the Sun that low the shadow is about 1.9 km long and only reaches the lander's feet at touchdown. |
| 11 | Shadowed ground shows faint relief from scattered light. Its strength and direction are game settings. | Sunlit slopes do light the shadows on the Moon, but how much is not a figure the game can source, so it is labelled as tuning. |
| 12 | A hard landing topples the lander, and dust lingers after any touchdown. Both are game effects. | Nothing published describes either for Starship HLS. They are there so the ending can be read on screen before the card covers it. |
| 13 | Slice 2 is the Super Heavy booster, liftoff to tower catch, as one run. A sea landing is a separate Falcon 9 drone ship gate. Vehicles named factually (SpaceX Starship, Super Heavy, Falcon 9), no logos or livery. (2026-11-12) | Starship has never landed on a drone ship. |
| 14 | Slice 2 is built on Flight 8 as flown: the 71 m booster and the Pad 1 tower. The second tower is left out. (2026-11-13) | Flight 8 has a full published timeline and a catch; nothing published places the second tower. |
| 15 | The launch site tour moves to a follow-up. (2026-11-13) | The slice 2 PR was already about 3,800 lines, and the brief named the tour as the first thing to cut. |

## 3. Slices

| # | Slice | What the player does | State |
|---|-------|----------------------|-------|
| 1 | **Descent to Shackleton** | Takes over at high gate, steers the touchdown marker off the boulders, finishes on instruments in the dust, scored against real limits | Merged (PR 82) |
| 2 | **Return to the Tower** (section 9) | Flies one Super Heavy booster from liftoff through max Q, hot staging and boostback, makes the catch call, and flies the landing burn into the tower arms. Takes in the ascent and max-Q gate first planned here | In review |
| 3 | Falcon 9 drone ship gate | Land a Falcon 9 first stage on a drone ship. Starship has never landed on one, so it is not shown doing so (ruling 13) | Planned |
| 4 | Ship re-entry and catch | Belly-first re-entry, the flip and the ship catch, once one has flown | Planned |
| 5 | Refuel docking gate | Close on a depot in low Earth orbit and dock; reuses the 550 AU docking assembly animation | Planned |
| 6 | Orion entry corridor gate | Hold the skip-entry corridor on return from the Moon | Planned |
| 7 | Artemis explorer | South pole light table, base phases on a time slider, flown versus planned trajectories, tanker ledger | Planned |

Gate for every slice: sources re-fetched on the day of the build, because the mission architecture changed during 2026 and may change again.

## 4. Slice 1 design

**Flow.** Start card, braking burn intro (32x easing to 4x for the pitch-over, about 20 seconds, skippable; skipped outright under reduced motion), takeover at high gate, manual descent (1x), a 2.4 second pause on the touchdown (0.8 seconds under reduced motion), end card. Retry (the first button, or R) restarts 2 km out on the computer's line; a second button replays the braking burn.

**The decision.** The computer's aim point, the centre of the 100 m ring, is strewn with boulders it cannot see (a game element, 30 m either side of the target along the track). The player has to put the lander down on clear ground inside the ring, short of the rocks or beyond them, with about 100 m/s of delta-v to spare. Four endings: landed, in the boulders, hard landing, overflew.

**Controls.** Throttle and pitch, live only in the manual descent; during the intro the slider is disabled and focus sits on the skip button. Keyboard: W/S or up/down for throttle, A/D or left/right for pitch, R to retry, P to pause. Touch: a throttle slider and two pitch buttons. Every control is a focusable button or slider.

**What the player sees their inputs do.** A marker on the ground shows where the lander ends up if the controls are held: the touchdown point, or the point it stops above when the braking wins first. It is off-white on clear ground and red on the boulders or over the speed limits. The Impact readout gives the predicted touchdown speed, or "stops in the air" or "stops over rocks". A label beside the marker gives the distance from the target ("47 m short", "20 m long", "11 m, in the rocks"). Below about 900 m a faint line runs from the lander straight down and along the ground to the marker. A velocity arrow rides on the lander and the plume length follows the throttle. The speed readouts turn red only below 30 m, where they are over the touchdown limits.

**What the computer does.** It flies the braking burn. In the manual descent it only draws the gold cue marks on the throttle and pitch instruments (ruling 9). Flying the cue exactly lands softly, upright and in the boulders (covered by a unit test).

**Tip cards.** Short, shown at the top over the sky so they never cover the ground ahead: why you fly sideways first, the takeover, the low Sun, the 100 m accuracy ring, the boulders (1,800 m out, early enough to be gone before the player is choosing a spot), the dust (below 30 m). Each closes itself after 10 seconds.

**End card.** The player's touchdown numbers beside the real ones in section 5, each with its source and its status (flown, requirement, design limit). Propellant left is given as seconds of hover (delta-v divided by lunar gravity) so it can sit beside Apollo 11's flown 45 seconds, with the delta-v beneath.

**Physics.** Fixed 60 Hz timestep. Real lunar gravity that falls with altitude, real lunar radius, and the orbital term that cancels gravity at orbital speed. Propellant is shown as velocity change remaining.

**Terrain.** Three nested layers of NASA LOLA elevation, all real, with sunlight and cast shadows baked for a Sun 1.5 degrees above the horizon at the target:

| Layer | Extent | Source resolution |
|-------|--------|-------------------|
| Region | 915 km square, 75 S to the pole | 240 m/pixel |
| Rim | 16 km square, Shackleton rim | 5 m/pixel |
| Near | 2.56 km square around the target | 5 m/pixel |

The bake reads the 5 m posts through a smooth (Catmull-Rom) curve and lights the near layer at 1.25 m per pixel, so the ground and its shadows have no 5 m steps. Nothing is added: no detail finer than the data is invented.

**Sky.** All 9,096 stars with a position in the Yale Bright Star Catalogue, sized and dimmed by visual magnitude and tinted by colour index. They are placed as seen from the lunar south pole: the Moon's south celestial pole is overhead (in Dorado, beside the Large Magellanic Cloud) and the zodiac runs round the horizon. They do not twinkle. Two honest limits: the Sun's place along the zodiac (the time of year) is a game setting, and a camera or an eye exposed for sunlit ground would show few or no stars.

The target is the flattest 100 m patch on the high ground of the rim tile, chosen by the bake script. It is a game target: NASA has not selected a landing site, and Shackleton's rim is not on NASA's 2024 list of nine candidate regions.

**Palette (repo tokens).** Void `#0a0e1a` ground, glass panels (white 8 to 3 percent, 1 px white 10 percent border, blur), off-white `#f4f1e8` for the primary action, muted `#7c88a8` for labels, gold `#d4af37` for selection and the guidance cue only, hydrogen red `#ff6b6b` for limits exceeded. No glow on the HUD. Outfit for titles, Inter for copy, JetBrains Mono for instruments.

**Architecture.** A standalone Vite + TypeScript + three.js app in `lunar-descent/`, split into `sim/` (pure physics and flight rules), `scene/`, `ui/` and `data/`. It builds to `public/lunar-descent/` (not committed) before `next dev` and `next build`. The route `/lunar-descent` wraps it in an iframe, as `/solar-system` does. The page is served network-first through the `viewer-pages` cache and excluded from the precache.

## 5. Sources: every real-world number on screen

Fetched and checked on 2026-11-12. "Flown" means it happened. Imperial source values are converted.

| # | Number on screen | Value | Status | Source |
|---|------------------|-------|--------|--------|
| 1 | Lunar surface gravity | 1.62 m/s2 | Constant | NASA NSSDCA Moon Fact Sheet, https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html |
| 2 | Lunar radius | 1,737.4 km | Constant | LOLA reference sphere, label of `LDEM_75S_240M`, https://imbrium.mit.edu/DATA/LOLA_GDR/POLAR/IMG/LDEM_75S_240M.LBL |
| 3 | Altitude at the start of the burn | about 15 km (50,000 ft) | Flown, Apollo 11 | Apollo 11 Mission Report, https://ntrs.nasa.gov/api/citations/19710015566/downloads/19710015566.pdf |
| 4 | Apollo 11 powered descent duration | 12 min 34 s | Flown | Apollo Lunar Surface Journal, https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.landing.html |
| 5 | Apollo 11 high gate | 2,173 m (7,129 ft), descending at 38 m/s (125 ft/s) | Flown | Apollo 11 Mission Report (as 3) |
| 6 | Apollo 11 touchdown speed | 0.5 m/s vertical (1.7 ft/s), 0.6 m/s sideways (2.1 ft/s) | Flown | Apollo 11 Mission Report (as 3) |
| 7 | Apollo 11 propellant left | about 45 seconds | Flown | Apollo Lunar Surface Journal (as 4) |
| 8 | Touchdown speed limits | 3.05 m/s vertical (10 ft/s), 1.22 m/s horizontal (4 ft/s) | Design limit, Apollo Lunar Module landing gear | NASA, Apollo experience report: lunar module landing gear subsystem, https://ntrs.nasa.gov/api/citations/19720018253/downloads/19720018253.pdf |
| 9 | Tilt limit after landing | 8 degrees | NASA requirement, both HLS landers | NASA Inspector General IG-26-004, March 2026, https://oig.nasa.gov/wp-content/uploads/2026/03/final-report-ig-26-004-nasas-management-of-the-human-landing-system-contracts.pdf |
| 10 | Landing accuracy | within 100 m | NASA requirement, uncrewed HLS demos | NASA, IAC-26 paper, https://ntrs.nasa.gov/api/citations/20260008717/downloads/HLS%20IAC%202026%20FINAL.pdf |
| 11 | Dust first seen | about 30 m | Flown, Apollo 11 | Apollo 11 Mission Report (as 3) |
| 12 | Starship HLS height | about 50 m (165 ft) | Published design figure | NASA, https://www.nasa.gov/reference/human-landing-systems/ (the Inspector General report says about 171 ft) |
| 13 | Shackleton crater diameter | 21 km | Measured | NASA, https://science.nasa.gov/image-detail/faces-of-shackleton/ |
| 14 | Sun height in the landing regions | never more than a few degrees; 7 degrees at most | Environment | NASA NESC, https://www.nasa.gov/centers-and-facilities/nesc/characterizing-the-visual-experience-of-astronauts-at-the-lunar-south-pole/ |
| 15 | First crewed Artemis landing | 2028 (Artemis IV) | Planned | NASA, https://www.nasa.gov/humans-in-space/artemis/ (page updated 21 Oct 2026) |
| 16 | Terrain | 5 m and 240 m per pixel | Measured, LOLA | NASA Goddard PGDA product 78, https://pgda.gsfc.nasa.gov/products/78 (Barker et al. 2021); LOLA GDR (as 2) |
| 17 | Stars | 9,096 stars to about magnitude 6.5 | Measured | Bright Star Catalogue, 5th Revised Ed. (Hoffleit and Warren 1991), CDS V/50, https://vizier.cfa.harvard.edu/ftp/cats/V/50/ReadMe |
| 18 | Direction of the Moon's pole (not shown as a number; it orients the stars) | RA 269.9949, Dec 66.5392 degrees, J2000 | Constant, IAU | NASA NAIF `pck00010.tpc`, https://naif.jpl.nasa.gov/pub/naif/generic_kernels/pck/pck00010.tpc |

Statements on screen without a number:

- Manual control is required and disputed: "There is disagreement between NASA and SpaceX on whether the provider's current proposed approach for landing meets the intent of the Agency's manual control requirement." Inspector General report (as 9).
- Plume effects for large landers are still being tested: IAC-26 paper (as 10) and https://www.nasa.gov/directorates/esdmd/artemis-campaign-development-division/human-landing-system-program/nasa-marshall-fires-up-hybrid-rocket-motor-to-prep-for-moon-landings/
- NASA has not said which lander flies Artemis IV: "NASA will announce the lander provider for each of those missions at a later date." IAC-26 paper (as 10).
- Apollo 11's automatic descent was heading for a boulder field and the commander flew past it by hand: "Neil has to take manual control and fly beyond the boulder field surrounding West Crater." Apollo Lunar Surface Journal (as 4).

**Game tuning, labelled as such on screen, not mission figures:** full-throttle thrust acceleration (4 m/s2), velocity change available (2,000 m/s, which leaves about 384 m/s at the takeover and about 100 m/s after a landing flown on the marks), the takeover range and ground speed (7.5 km, 150 m/s when the intro is skipped and a little faster after a watched one, because the pitch-over brakes less), the retry range (2 km), the 32x time compression of the intro and its 4x pitch-over, the Sun's direction and its 1.5 degree height, the scattered light in shadowed ground (its strength, and a source 25 degrees up opposite the Sun), the 2.4 second touchdown pause, the lingering dust and the topple after a hard landing, the time of year that turns the star field (Sun at ecliptic longitude 150 degrees, chosen so Scorpius and Sagittarius stand ahead), the target point, and the start speed, which is the circular orbital speed at 15 km worked out from sources 1 and 2.

**Game element, said so on the start card:** the boulders. 70 of them, 1 to 6 m across, within 30 m of the target along the track. The 5 m terrain data shows no rocks; these are placed by the game.

## 6. Not published as of 2026-11-12

Searched for and not found in any NASA, SpaceX, Inspector General or NTRS document: Starship HLS descent profile and duration, braking engines and throttle, the altitude at which landing thrusters take over, dry and landing mass, descent thrust, touchdown speed limits, crewed landing accuracy, landing leg geometry, and the landing site. None of these appear in the game.

Not covered by the search (a usage limit cut it short): GAO 2026 assessments, NTRS guidance papers beyond the IAC-26 paper, Blue Moon figures. Worth one more pass before slice 2.

## 7. Risks

1. **The catalogue.** Four gates and an explorer are all tempting. One slice per PR, in the order above.
2. **The architecture moves.** Artemis III became a low Earth orbit docking test during 2026 and NASA has not named the Artemis IV lander. All mission copy lives in `lunar-descent/src/data/facts.ts` so one file changes when NASA does.
3. **Vehicle naming.** Trademark caution from pilot-mode decision 20 still applies. The ruling here is factual naming with no logos and a not-affiliated credit.
4. **Weight.** Terrain is about 2.7 MB and the stars 91 kB; both load after the start card. The total is stated in the PR.

## 8. Follow-ups (not in slice 1)

- A middle terrain layer (LOLA 20 m/pixel, 87.5 S to the pole) to sharpen the last 80 km of the approach.
- Cross-range steering. Slice 1 flies in the vertical plane of the approach track.
- Sound.
- Earth in the sky, at its real position for the chosen Sun direction.
- A header navigation entry. Slice 1 is linked from the footer only, because the header and the mobile bar are full.
- Add the game to the sitemap and landing page once it has been played by someone other than its author.

## 9. Slice 2 design: Return to the Tower

**Flow.** Start card, ascent (4x), hot staging and the flip (4x), boostback (3x, easing to 1x within 40 km of the aim), coast (16x), landing burn (1x), end card. Each compressed phase carries its rate on the HUD as a "4x time" chip, labelled a game setting. Skip buttons cover the ascent and the coast. Once a run has reached the landing phase, retry (R, or "Fly the landing again") restarts it there with the same scenario and catch call; a run lost before that retries from liftoff. "Fly again from liftoff" is always offered.

**What the player decides in each phase.**

| Phase | Decision | What goes wrong |
|-------|----------|-----------------|
| Ascent | Throttle down through max Q and back up after it. The gold cue sits on the throttle; the pressure meter shows the limit line | Over the limit for more than 2.5 s: the stack breaks up |
| Hot staging and flip | None. Flown by the computer, compressed | |
| Boostback | When to cut the engines, so the impact point lands on the tower. A gold line on the range bar marks the cut | Cut early: short, into the sea. Cut late: over land |
| Catch call | Go or no go (G or N, or the buttons), before boostback ends, from the tower and booster health readouts | No call: the booster takes its default path to the sea, as SpaceX describes. Go on a tower fault: the health checks override it, as on Flight 6 |
| Coast | Fin steering only. Compressed | |
| Landing burn | When to light (Space at the cue height), then throttle and tilt to hold the white ring on the gold one at the arms, on 13 engines then the 3 centre engines | Never lit, too hard, off the arms, into the tower |

A no-go on a healthy tower ends in a soft splashdown, shown as a safe call, not a failure. A no-go on the Flight 6 tower fault is the right call and the end card says so.

**Scenarios, all flown.** The first run is Flight 8 as flown. Later runs draw from four: Flight 8 (11 of 13 engines relit for boostback, 12 of 13 for landing), Flight 7 (12 of 13, then 13), Flight 6 (tower health checks fail during boostback) and Flight 14 (11 of 13 relit for landing, then a controlled splashdown). The engine-outs are the flown counts, and the player flies through them with less thrust. A unit test flies every healthy scenario into the arms on the cue.

**Controls.** W/S or up/down: throttle. A/D or left/right: tilt in the landing burn. Space: the one-shot command of the moment (cut boostback, light the landing burn). G and N: the catch call. P: pause. R: retry. Touch: a throttle slider, tilt buttons, an action button and the call buttons, all focusable and at least 44 px.

**HUD.** A readout strip across the top (altitude, speed, downrange, propellant as velocity change, engines lit, pressure as a percentage of the limit), the phase card top left with its time-rate chip and skip and pause, the throttle bottom left, and a phase instrument bottom right (pressure meter, range bar, or the landing ring). Tip cards sit under the phase card on wide screens and close after 10 seconds. On phones the strip wraps to two rows and the instruments shrink to leave the booster in view.

**End card.** The player's time for each event beside Flight 8's published time and its flown outcome, each row with its source and status, then the scenario the run was modelled on, the catch record, and Flight 15's planned status.

**Physics.** Fixed 60 Hz timestep, acceleration model (ruling 4), real gravity and an exponential atmosphere for dynamic pressure and the grid fins. Everything in `TUNING` is game tuning (section 11).

**Scene.** The booster and the ship are drawn at their published sizes (71 m and 52 m, 9 m across); the tower stands taller than the booster, and its height is not shown as a number because none is sourced. The ground is USDA NAIP aerial imagery of Starbase, baked at build time. Fire, smoke, steam and dust belong in the scene; nothing on the HUD glows. Under `prefers-reduced-motion` the camera does not shake. The ascent camera rides close enough that the stack stays readable while the ground drops away below it.

**Palette (repo tokens).** As slice 1: void `#0a0e1a`, quiet glass panels, off-white `#f4f1e8` for the primary action, muted `#7c88a8` labels, gold `#d4af37` for the cue and the selection only, hydrogen red `#ff6b6b` for limits exceeded. Outfit, Inter, JetBrains Mono.

**Architecture.** A standalone Vite + TypeScript + three.js app in `starship-catch/` with the same split as slice 1 (`sim/`, `scene/`, `ui/`, `data/`). It builds to `public/starship-catch/` (not committed) alongside `lunar-descent/`, and the `/starship-catch` route wraps it in an iframe. The page is network-first through `viewer-pages`; bundles and the ground imagery are cached on first play and excluded from the precache. No code is shared with `lunar-descent/` yet: the overlap is the HUD helpers and the fixed-step loop, small enough that lifting them is a follow-up.

**Weight.** Before the start button: 13.1 kB JS and 5.8 kB CSS gzip, plus about 121 kB of latin fonts. After it: about 138 kB JS gzip and 1.4 MB of ground imagery.

**Google Photorealistic 3D Tiles spike (2026-11-12): failed check 1.** Starbase has flat imagery only: no 3D mesh of the tower or the launch mount. The other three checks (caching terms, spend cap, frame rate) were not needed. No key was created and nothing was spent. The ground is baked from public-domain NAIP imagery instead, and the tower is modelled.

**Prior art.** SpaceX publishes its own browser game (starshipthegame.spacex.com). The build went ahead: this slice is a decision game on flown data with sources on screen.

## 10. Slice 2 sources: every real-world number on screen

Fetched and checked on 2026-11-12. Mirrored in `starship-catch/src/data/facts.ts` and `starship-catch/src/sim/scenario.ts`.

| # | Number or claim on screen | Value | Status | Source |
|---|---------------------------|-------|--------|--------|
| 1 | Flight 8 timeline: max Q, most engines cut off, hot staging, boostback start, boostback shutdown, landing burn start, catch | T+1:02, 2:32, 2:40, 2:45, 4:06, 6:34, 7:02 | Published timeline ("all times approximate") | Wikipedia, Starship flight test 8, https://en.wikipedia.org/wiki/Starship_flight_test_8 |
| 2 | Flight 8 outcomes: throttled through max Q; all but 3 engines shut down; ship lit 6 and separated; 11 of 13 relit for boostback; 12 of 13 for landing; caught | as listed | Flown | SpaceX, https://www.spacex.com/launches/starship-flight-8 |
| 3 | Engines: 33 at liftoff, 13 in the centre, 3 that fly into the arms | 33, 13, 3 | Design figure | SpaceX, https://www.spacex.com/vehicles/starship |
| 4 | Booster height | 71 m | Design figure (the booster flown on Flights 5 to 11) | Wikipedia, SpaceX Super Heavy, https://en.wikipedia.org/wiki/SpaceX_Super_Heavy |
| 5 | Diameter | 9 m | Design figure | SpaceX (as 3) |
| 6 | Ship height | 52 m | Design figure (current page) | SpaceX (as 3) |
| 7 | Flight 7: 12 of 13 relit for boostback, 13 for landing, caught | as listed | Flown | Wikipedia, Starship flight test 7, https://en.wikipedia.org/wiki/Starship_flight_test_7 |
| 8 | Flight 6: tower health checks aborted the catch; splashdown in the Gulf | as listed | Flown | SpaceX, https://www.spacex.com/launches/starship-flight-6 |
| 9 | Flight 14: 11 of 13 relit for landing, controlled splashdown | as listed | Flown | SpaceX, https://www.spacex.com/launches/starship-flight-14 |
| 10 | Boosters caught | Flights 5, 7 and 8 | Flown | SpaceX, https://www.spacex.com/launches/starship-flight-15 |
| 11 | Flight 15: first planned return of both booster and ship to the tower | planned 13 Nov 2026 (US time) | Planned | SpaceX (as 10) |
| 12 | Thousands of vehicle and pad criteria before a catch | quote | Flown, Flight 5 | SpaceX, https://www.spacex.com/launches/starship-flight-5 |
| 13 | With no go before boostback ends, the booster defaults to a splashdown path | quote | Published procedure | SpaceX before Flight 5, archived page data, https://web.archive.org/web/20241007234125/https://content.spacex.com/api/spacex-website/missions/starship-flight-5 |
| 14 | Ground imagery | NAIP, flown June 2022 | Measured | USGS EROS, https://www.usgs.gov/centers/eros/science/usgs-eros-archive-aerial-photography-national-agriculture-imagery-program-naip |

Sources disagree on the count of later catches; SpaceX's Flight 15 page (10) is the one the game cites. Flight 15's outcome is not in the game yet (follow-up in `docs/CLAUDE-TODO.md`).

## 11. Slice 2 game tuning, labelled as such on screen

Not mission figures: thrust accelerations (liftoff, boostback, landing on 13 and on 3 engines), the pitch-over profile, the engine cutoff speed, the max-Q limit and its 2.5 s tolerance, terminal speeds, staging and flip timings, grid fin authority, the offshore splashdown point, the landing gate height, the catch window (height, gap, sink and side speed, tilt), the tower position and height used for collisions, the starting propellant, the time compression of each phase, and the retry point. SpaceX publishes times and engine counts, not these. The end card says so.

## 12. Slice 2 follow-ups

In `docs/CLAUDE-TODO.md`, section "From feat/starship-catch (2026-11-13)": the launch site tour, Flight 15's result, a regional ground layer above 4 km, a real-pointer touch test on a phone, the second tower, and sound.
