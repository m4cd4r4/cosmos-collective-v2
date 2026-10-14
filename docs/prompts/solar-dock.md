# Solar System Controls: P0 Fixes and Dock Redesign Brief

Open this in a **fresh Claude Code session** in this worktree. Don't carry context from the session that wrote it.

## First action: rebase before doing anything else

```bash
git fetch origin main --quiet
git rebase origin/main
```

## The problem

The 3D solar system at https://cosmos-collective.com.au/solar-system is the site's flagship, but its controls are clunky and buggy. The app is one vanilla Three.js r128 file, `public/solar-system/index.html` (about 6,450 lines), iframed by `src/app/solar-system`. An audit on 2026-10-14 found about 45 controls in 6 clusters, and none of the June 2026 P0 fixes have landed. Full plan: https://claude.ai/artifact/Gzcq3M39AbDYPaePLeMFnZ (section "Solar system: the controls").

Confirmed in code (line refs as of 2026-10-14; re-check after rebase):

- **The main speed slider moves nothing.** `time-speed` (handler ~3744) only sets `daysPerSecond`, which feeds the date counter (~3257). Planets advance `planet.speed*0.01*orbitSpeedMultiplier` per frame (~3262), so motion depends on refresh rate (144 Hz runs about 2.4x faster), and the date runs about 255 d/s while the label says 49.
- Speed is set in 3 places (d/s, Sun Speed, Orbital Speed: squared values, ~1614-1630). Camera is set in 3 places (Views ~3913, 7 `.cam-btn` ~3880, Focus select ~3831), each clearing the others' active state.
- Reset (~3757-3816) skips `simulationDays`, orbit lines, Milky Way, true scale, distance mode, dive and galaxy state, and silently un-pauses.
- `#stats{display:none!important}` (~1440) makes the mobile stats button dead.
- Desktop panels start collapsed (~6352-6359); the "?" help sits inside the hidden panel.
- Galaxy view hides `#events` with opacity but not pointer-events (~5311-5314): an invisible click trap.
- Distance meter uses `sceneDistPerAU = 16` (~4198); scene units are not AU.
- Textures credited to NASA (~1793, 1806, 4054 and the wrapper); the real source is Solar System Scope, CC BY 4.0 (see comment ~1912).
- Wrapper sr-only text says "Press D to dive"; the real key is E (~5537).
- Global Space/R/E/G key handlers (~5534) probably fire while a select or button has focus.
- The intro modal says "Solar Vortex" with a pink gradient button, which is off-brand against the site's gold (#d4af37).

## Source of truth (read these BEFORE coding)

1. `public/solar-system/index.html`: the app. Read the panel markup (~1488-1725), the handlers listed above, and the tour hooks (~5677-5830), which click panel buttons by ID.
2. `docs/solar-system/AUDIT-2026-06-12.md`: the June bug list and the parked enhancement plan.
3. `CLAUDE.md`: the design context (dark-first, gold accent, Outfit/Inter/JetBrains Mono, WCAG 2.1 AA, reduced motion).
4. `src/app/solar-system/` and its viewer component: the iframe wrapper and its sr-only text.
5. `docs/pilot-mode/PROJECT-PLAN.md`: only to confirm the game lives in a separate repo (`I:/Scratch/pilot-mode`). It is not touched here.

If anything in this brief contradicts those files, the files win.

## What's in scope

- `public/solar-system/index.html`: the panel markup, CSS, handlers, state and animation loop timing.
- The solar-system wrapper component in `src/` (sr-only text and attribution only).
- A new Playwright smoke test for the solar-system controls.

## Out of scope (do NOT modify)

- The rest of the site: landing page, nav, other routes, the gravitational-lens embed.
- Planet textures, the Three.js version, the renderer and shaders.
- Real ephemeris (astronomy-engine), the spacecraft layer, and anything for pilot mode.
- Do not rebuild or extract the app into React. Refactor in place.

## What "good" looks like

- One date drives every planet angle. Speed control maps to real days per second and looks the same at 60 Hz and 144 Hz.
- Reset returns every control, toggle and mode to its default, and the UI matches the state.
- **Dock on every screen size, 44 px targets:** Play/Pause, Speed (Real / 1 week/s / 1 month/s / 1 year/s), View (Free / Top / Side), Dive, Galaxy, More.
- **"More" opens a sheet with three tabs:** Look (presets Real scale / Pretty / Kid mode, then Labels, Orbit lines, Moons, Milky Way, Trails), Time (scrubber, Today, date), Tools (Distance, Planet info, Screenshot, Record, Tour, Accuracy).
- **Cut or hide:** Sun Speed, the trail sliders, Grid, Corona, the elliptical toggle (always on), the dead stats panel, the duplicate camera buttons and the hidden `#camera-mode` select.
- First visit shows the dock immediately. A `?` overlay lists the shortcuts. Esc exits dive and galaxy view.
- Key handlers ignore events from inputs and selects.
- Credits read Solar System Scope CC BY 4.0. The intro modal uses the site's gold, not the pink gradient.

## Required deliverables

1. **Before any UI code:** a short plain-text plan of the state shape (one `state` object, `setState(patch)`, and an apply step that updates DOM, globals and localStorage) and how tour, dive and Reset will call it.
2. **Commit 1, P0 fixes only:** clock unification, Reset, galaxy pointer-events, distance meter, attribution, D/E text, dead stats button, focus-safe keys.
3. **Commit 2:** the state object, then the dock and sheet replacing the old panel. Rewire presets and the tour.
4. Playwright smoke test (`playwright.local.config.ts` exists): load, Play/Pause, change speed, Reset restores defaults, More opens, galaxy view leaves no click traps.
5. Screenshots at 1440 and 390, read by you before reporting. Load a real page in the browser; a dev-server banner does not count.

## Suggested workflow

1. Rebase. Read the source-of-truth files.
2. Run `/pre-build` briefly, to confirm with Macdara which presets matter (Kid mode is for his 6-year-old daughter).
3. Ship the P0 commit first and verify it in the browser. Then do the redesign.
4. Run `/design-review` at the end, at 1440 and 390.
5. Open one PR. Do not deploy: production deploys need Macdara's approval every time.

## Constraints

- One PR. Branch: `feat/solar-dock`.
- No new dependencies. The app stays a single HTML file with vanilla JS.
- Respect `prefers-reduced-motion`. Keyboard reachable. Visible focus.
- Effort estimate: minimum version 12-14 h, full version 25-34 h. If time runs short, the P0 commit plus one speed control and a working Reset is a shippable stop point.

## Out-of-scope follow-ups (capture, don't build)

Append to `docs/CLAUDE-TODO.md`. Known follow-ups are already in the plan artifact: 550 AU pearl anatomy, page pruning, the homepage rebuild, the wrong 2026 lunar dates in `src/services/real-time-events.ts:428`, and the install prompt covering canvases.

## Why this brief is structured this way

The dock redesign would sit on top of the same speed and Reset bugs unless the state and clock are fixed first. The June audit warned against a rewrite (enhance in place scored highest), so this is a refactor of one file, not a new app.