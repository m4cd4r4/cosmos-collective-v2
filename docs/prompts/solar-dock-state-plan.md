# Solar dock: state plan (commit 2)

Deliverable 1 of `docs/prompts/solar-dock.md`. Written 2026-10-14 from a static read of
`public/solar-system/index.html` (6,418 lines). Line numbers drift; search by name.

## One state object

```js
const DEFAULTS = Object.freeze({
  playing: true,
  speed: 'month',          // 'real' | 'week' | 'month' | 'year' -> SPEED_DPS below
  view: 'free',            // 'free' | 'top' | 'side' (dock View)
  follow: 'sun',
  look: 'pretty',          // 'real' | 'pretty' | 'kid' | 'custom' (Look tab preset)
  labels: true, orbitLines: true, moons: false, milkyWay: true, trails: true,
  mode: 'solar',           // 'solar' | 'dive' | 'galaxy' (set by their transitions)
  trueScale: false,
  tool: 'none',            // 'none' | 'distance'
  scrubber: false,
  sheet: null,             // null | 'look' | 'time' | 'tools'
});
const SPEED_DPS = { real: 1 / 86400, week: 7, month: 30.44, year: 365.25 };
let state = { ...DEFAULTS, ...loadPersisted() };
```

`simulationDays` stays a plain global: it changes every frame and is not UI state.

## setState and apply

- `setState(patch)`: `const prev = state; state = { ...state, ...patch }; apply(prev, state); persist(state);`
- `apply(prev, next)` touches only fields that changed. For each one it updates the
  globals the render loop already reads (`daysPerSecond`, `isPaused` + `pausedOffset`,
  `showLabels`, `showOrbitRings`, `showMoons`, `galacticBg.visible`, trail clearing,
  `cameraMode`/`cameraRotation`/`cameraDistance`, `followTarget`), then the DOM
  (`aria-pressed` on dock buttons, active segment, sheet tab, checkbox state).
- Toggling a Look field by hand sets `look: 'custom'`.
- `persist` writes `labels, orbitLines, moons, milkyWay, trails, speed, look` to
  localStorage `solar-vortex-state`. Never persisted: `mode`, `tool`, `scrubber`,
  `sheet`, `playing`. Existing keys `solar-vortex-advanced` (retired with the panel)
  and `solar-vortex-visited` (kept) stay as they are.

## Presets (Look tab), confirmed by Macdara 2026-10-14

| Preset | speed | trueScale | labels | orbitLines | moons | trails | milkyWay |
|---|---|---|---|---|---|---|---|
| Real scale | week | true | true | true | false | false | true |
| Pretty (default) | month | false | true | true | true | true | true |
| Kid mode | week | false | true, large (`body.kid`) | true | false | false | true |

## Who calls setState

- **Dock:** Play/Pause, Speed segment, View segment, Galaxy, More (sheet).
- **Dive and galaxy:** keep their animated transitions as they are. `startDive`,
  the dive return and `exitDiveImmediate` call `setState({ mode })` when the mode
  actually changes; `toggleGalaxyView` and `finishGalaxyReturn` do the same.
  `apply` never starts an animation. It only syncs the dock (Dive label, Galaxy pressed).
- **Reset:** `exitDiveImmediate()`; `if (state.mode === 'galaxy') finishGalaxyReturn(null)`;
  end the tour if it is running; then `simulationDays = 0; clearAllTrails();` and
  `setState({ ...DEFAULTS })`. Reset also clears persisted state. This replaces the
  22-step handler and fixes the 30 vs 30.44 slider default mismatch.
- **Tour:** `saveTourState` becomes `preTourState = { ...state }`; `restoreSolarState`
  becomes `setState(preTourState)`. Steps that clicked presets or toggled the cut
  controls (slider-demo, visual-toggles, corona-particles, camera-chase) are rewritten
  or dropped. The 14 steps become about 10.
- **Esc:** exits dive or galaxy (already true for the tour).

## Cut (fixed at current defaults, controls removed)

Sun Speed / "Helix stretch" (fixed 4.19), both trail sliders (length 800, opacity 0.7),
Grid (fixed **off**: a visible change, check in review), Corona (off), the elliptical
toggle (always on), `#stats` panel and right toggle, `.cam-btn` group, hidden
`#camera-mode`, and the Surfboard / Helix / Cinema / Vortex / Moon Watch presets
(View keeps Free / Top / Side).

## First visit

`initPanelToggles` collapses `#controls` on desktop load. The dock replaces the
panel and is always visible, so this goes.
