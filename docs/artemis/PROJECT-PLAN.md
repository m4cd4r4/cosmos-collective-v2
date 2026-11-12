# Artemis mini-apps: project plan

Status: slice 1 (powered descent gate) in build on `feat/lunar-descent`. Written 2026-11-12.

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
| 6 | The game is the last 2 km. The braking burn is a short intro flown by the computer at 32x time, labelled on the HUD, with a skip button. The manual descent runs in real time. Retry restarts at the takeover. (Revised 2026-11-12 after the first play: with the computer flying the burn and the player only matching marks, the controls changed nothing.) | The burn has no decision in it. The decision is where to put the lander down. |
| 7 | Framing: manual takeover. The computer flies attitude during braking; the crew takes the stick at high gate. | NASA's human-rating rules require manual control, and NASA and SpaceX disagree on whether Starship meets that (source 9). |
| 8 | The dust finish stays and is labelled: Apollo crews lost sight of the surface (flown); HLS plume behaviour is still under test. | Honest about what is known. |
| 9 | The gold guidance marks stay on. "Off by default" was offered and declined. | The marks steer for the target centre, which the game strews with boulders, so following them is the losing line and the player has to depart from them. |

## 3. Slices

| # | Slice | What the player does | State |
|---|-------|----------------------|-------|
| 1 | **Descent to Shackleton** (this PR) | Takes over at high gate, steers the touchdown marker off the boulders, finishes on instruments in the dust, scored against real limits | In build |
| 2 | Ascent and max-Q gate | Throttle a launch through maximum dynamic pressure | Planned |
| 3 | Refuel docking gate | Close on a depot in low Earth orbit and dock; reuses the 550 AU docking assembly animation | Planned |
| 4 | Orion entry corridor gate | Hold the skip-entry corridor on return from the Moon | Planned |
| 5 | Artemis explorer | South pole light table, base phases on a time slider, flown versus planned trajectories, tanker ledger | Planned |

Gate for every slice: sources re-fetched on the day of the build, because the mission architecture changed during 2026 and may change again.

## 4. Slice 1 design

**Flow.** Start card, braking burn intro (32x, about 15 seconds, skippable; skipped outright under reduced motion), takeover at high gate, manual descent (1x), end card with instant retry from the takeover.

**The decision.** The computer's aim point, the centre of the 100 m ring, is strewn with boulders it cannot see (a game element, 30 m either side of the target along the track). The player has to put the lander down on clear ground inside the ring, short of the rocks or beyond them, with about 100 m/s of delta-v to spare. Four endings: landed, in the boulders, hard landing, overflew.

**Controls.** Throttle and pitch, live only in the manual descent; during the intro the slider is disabled and focus sits on the skip button. Keyboard: W/S or up/down for throttle, A/D or left/right for pitch, R to retry, P to pause. Touch: a throttle slider and two pitch buttons. Every control is a focusable button or slider.

**What the player sees their inputs do.** A marker on the ground shows where the lander ends up if the controls are held: the touchdown point, or the point it stops above when the braking wins first. It is off-white on clear ground and red on the boulders or over the speed limits. The Impact readout gives the predicted touchdown speed, or "stops in the air" or "stops over rocks". A velocity arrow rides on the lander and the plume length follows the throttle.

**What the computer does.** It flies the braking burn. In the manual descent it only draws the gold cue marks on the throttle and pitch instruments (ruling 9). Flying the cue exactly lands softly, upright and in the boulders (covered by a unit test).

**Tip cards.** Short, shown at the top over the sky so they never cover the ground ahead: why you fly sideways first, the takeover, the low Sun, the 100 m accuracy ring, the boulders (at 1,200 m), the dust.

**End card.** The player's touchdown numbers beside the real ones in section 5, each with its source and its status (flown, requirement, design limit).

**Physics.** Fixed 60 Hz timestep. Real lunar gravity that falls with altitude, real lunar radius, and the orbital term that cancels gravity at orbital speed. Propellant is shown as velocity change remaining.

**Terrain.** Three nested layers of NASA LOLA elevation, all real, with sunlight and cast shadows baked for a Sun 1.5 degrees above the horizon at the target:

| Layer | Extent | Source resolution |
|-------|--------|-------------------|
| Region | 915 km square, 75 S to the pole | 240 m/pixel |
| Rim | 16 km square, Shackleton rim | 5 m/pixel |
| Near | 2.56 km square around the target | 5 m/pixel |

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

Statements on screen without a number:

- Manual control is required and disputed: "There is disagreement between NASA and SpaceX on whether the provider's current proposed approach for landing meets the intent of the Agency's manual control requirement." Inspector General report (as 9).
- Plume effects for large landers are still being tested: IAC-26 paper (as 10) and https://www.nasa.gov/directorates/esdmd/artemis-campaign-development-division/human-landing-system-program/nasa-marshall-fires-up-hybrid-rocket-motor-to-prep-for-moon-landings/
- NASA has not said which lander flies Artemis IV: "NASA will announce the lander provider for each of those missions at a later date." IAC-26 paper (as 10).
- Apollo 11's automatic descent was heading for a boulder field and the commander flew past it by hand: "Neil has to take manual control and fly beyond the boulder field surrounding West Crater." Apollo Lunar Surface Journal (as 4).

**Game tuning, labelled as such on screen, not mission figures:** full-throttle thrust acceleration (4 m/s2), velocity change available (2,000 m/s, which leaves about 384 m/s at the takeover and about 100 m/s after a landing flown on the marks), the takeover range and ground speed (7.5 km, 150 m/s), the 32x time compression of the intro, the Sun's direction and its 1.5 degree height, the target point, and the start speed, which is the circular orbital speed at 15 km worked out from sources 1 and 2.

**Game element, said so on the start card:** the boulders. 70 of them, 1 to 6 m across, within 30 m of the target along the track. The 5 m terrain data shows no rocks; these are placed by the game.

## 6. Not published as of 2026-11-12

Searched for and not found in any NASA, SpaceX, Inspector General or NTRS document: Starship HLS descent profile and duration, braking engines and throttle, the altitude at which landing thrusters take over, dry and landing mass, descent thrust, touchdown speed limits, crewed landing accuracy, landing leg geometry, and the landing site. None of these appear in the game.

Not covered by the search (a usage limit cut it short): GAO 2026 assessments, NTRS guidance papers beyond the IAC-26 paper, Blue Moon figures. Worth one more pass before slice 2.

## 7. Risks

1. **The catalogue.** Four gates and an explorer are all tempting. One slice per PR, in the order above.
2. **The architecture moves.** Artemis III became a low Earth orbit docking test during 2026 and NASA has not named the Artemis IV lander. All mission copy lives in `lunar-descent/src/data/facts.ts` so one file changes when NASA does.
3. **Vehicle naming.** Trademark caution from pilot-mode decision 20 still applies. The ruling here is factual naming with no logos and a not-affiliated credit.
4. **Weight.** Terrain is about 2.3 MB and loads after the start card. The total is stated in the PR.

## 8. Follow-ups (not in slice 1)

- A middle terrain layer (LOLA 20 m/pixel, 87.5 S to the pole) to sharpen the last 80 km of the approach.
- Cross-range steering. Slice 1 flies in the vertical plane of the approach track.
- Sound.
- Earth in the sky, at its real position for the chosen Sun direction.
- A header navigation entry. Slice 1 is linked from the footer only, because the header and the mobile bar are full.
- Add the game to the sitemap and landing page once it has been played by someone other than its author.
