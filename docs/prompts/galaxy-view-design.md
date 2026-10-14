# Galaxy view: design note

Deliverable 1 of `docs/prompts/galaxy-view.md`. Written 2026-10-14 from a static read of
the galaxy block in `public/solar-system/index.html` (`createGalaxy`, `setGalaxyOpacity`,
`toggleGalaxyView`, `updateGalaxyTransition`, `finishGalaxyReturn`). Line numbers drift;
search by name.

## What is actually wrong (named causes, not impressions)

| Macdara's words | Cause in the code |
|---|---|
| "flat, opaque green disk under everything" | `_ghzMesh`: a `RingGeometry(130, 330)` in `0x00eebb`, additive, held at `opacity * 0.32` for the whole view. It is the Galactic Habitable Zone band and it dominates the frame. |
| "spiral arms as blocky rectangular bands with visible segment edges" | The 2048² procedural disk texture strokes each arm as 280 straight `lineTo` segments with `lineWidth` up to `0.158 * R` and default butt caps. Wide butt-cap segments are rectangles, so every joint shows. |
| "hard-edged brown bulge" | Same texture: a circular clip at `R * 0.97` gives the disk a cut edge, and `diskBg` is a brown-gold radial over black that reads as a solid plate under the particles. |
| "static, doesn't really do anything" | `idle-galaxy` only orbits the camera (`theta += 0.024 * dt`) and pulses one marker. The 100k stars never move; nothing is hoverable or clickable. |
| "info panel covering a quarter of the screen, off-brand blue title" | `#galaxy-info` is `max-width: 320px` and opens expanded with eight stats plus two paragraphs; `h3` is `#6495ff`, and the whole panel's borders/tags are cornflower blue, not the brand gold. |
| "transition is a cut with a flash" | `#galaxy-transition-flash` is a blue radial held at opacity 1 for 1.5 s while the camera straight-lerps between two unrelated coordinate frames, and `zoom-out` ends at `targetPos` (`GALAXY_CENTER + (50, 450, 200)`) which is **not** where `idle-galaxy` then puts the camera (spherical, `phi 0.35π`, dist 480) - so there is a visible snap at the hand-off that the flash hides. |

## The approach: no disk plane, stars only

Delete the texture plane (`galaxyDisk`, `galaxyDiskMaterial`, the whole 2048² canvas
block) and the GHZ ring and label. The galaxy becomes particles plus two soft radial
glows with no hard edge anywhere. `loadGalaxyHiRes` becomes a no-op kept only so the
existing call sites do not need touching.

### Particle populations (desktop; `LOW` halves every count at <=768px wide)

| Population | Count | Distribution | Colour | Point size |
|---|---|---|---|---|
| Arm stars | 90,000 | 4 logarithmic arms, 12.5° pitch, launched from the two bar ends | blue-white, warming inward | 0.9-2.0 |
| Inter-arm disk | 25,000 | exponential radial falloff, uniform angle | dim red-orange | 0.6 |
| Bar + bulge | 30,000 | prolate ellipsoid `a 0.22R, b 0.075R, c 0.045R`, rotated to `BAR_ANGLE` | warm gold | 1.4-2.6 |
| Dust lanes | 8,000 | inner edge of each arm, offset -0.035R in angle | near-black brown, **NormalBlending**, `renderOrder 2` | 3.5 |
| Globular halo | 50 | kept as-is | amber | 7 |

Four `Points` draw calls plus the halo. ~153k points total, which the existing build
already demonstrates is affordable at 100k.

**Arm maths.** Logarithmic spiral `r = r0 * exp(b * theta)` with `b = tan(12.5°) = 0.2217`
(the Milky Way's arms are measured at roughly 12°). `theta` runs 0 to 3.0π, `r0 = 0.11R`,
which lands the arm tips at `0.89R` with no clamping. Each arm starts at a bar end
(`BAR_ANGLE` and `BAR_ANGLE + π`), two arms per end - that is what makes the thing read
as a *barred* spiral rather than a pinwheel. Perpendicular scatter is Gaussian
(three-uniform sum), `sigma = 0.03R + 0.055r`, so arms are tight near the bar and fray
at the rim. Vertical scale height `sigma_z = 2.2 + 0.012r` (a thin, slightly flaring
disk). Density along each arm is modulated by `0.55 + 0.45 * sin(5 * theta)` so arms
have knots and gaps instead of a uniform ribbon.

**Dust lanes** are the one population that is not additive. Additive blending cannot
darken, so the lanes are dark brown points with `NormalBlending`, `depthWrite: false`
and `renderOrder: 2`: they draw last and dim the arms behind them. 8,000 large soft
points is enough to read as lanes without turning into a smear.

**Blending and shape.** Every star population uses one raw `ShaderMaterial` (r128, no
`three/examples`): the vertex shader takes `position`, `aColor`, `aSize`, `aRadius`,
`aPhase` and the fragment shader draws a soft circle analytically from `gl_PointCoord`
(`smoothstep` on the radius), so there is no sprite texture and no square edges.

### Motion (all on the GPU, zero per-frame CPU work)

The vertex shader rotates each star about the galactic axis by
`angle = uTime * uOmega / (0.35 + aRadius)`, which is a flat-rotation-curve
approximation: the bulge turns visibly faster than the rim, matching the real
differential rotation. Brightness is multiplied by `0.72 + 0.28 * sin(uTime * 1.7 + aPhase)`
for twinkle. One `uTime` uniform per frame drives both; nothing else changes.

Under `prefers-reduced-motion` the shader still runs but `uTime` is frozen at 0 and the
camera's auto-orbit is skipped, so the scene is a still image.

### Fade

`setGalaxyOpacity` keeps its signature and its zoom-gated branches, minus the GHZ branch,
plus one new branch: a child flagged `userData.isStarShader` gets
`child.material.uniforms.uOpacity.value` set instead of `material.opacity`.

## Transition timeline

One shared path function so the return is the exact reverse. `pathPoint(t)` is a
quadratic Bezier from the saved solar camera position to the galactic overlook, with the
control point lifted `+700` in Y and pulled back from the galactic plane - the camera
arcs up out of the ecliptic and over the disk instead of sliding through it.

**Out (3,200 ms, ease-in-out cubic):**

| t | What happens |
|---|---|
| 0.00-0.30 | Sun and planets fade to 0. Camera starts down the Bezier. The `#starfield` background stays, so the frame never goes black. |
| 0.20-0.75 | Galaxy fades in from 0 to 1. Camera is mid-arc; the disk comes up from below the frame. |
| 0.55-1.00 | Gold "You are here" marker scales in; the Sun's galactic orbit ring draws, its arc length growing from 0 to 2π. |
| 0.75-1.00 | Camera settles onto **exactly** the `idle-galaxy` spherical position for `theta = -0.6`, `phi = 0.35π`, `zoom = 1`, so the hand-off at `t = 1` moves the camera zero units. The snap goes away and the flash is no longer needed. |

FOV eases 60 -> 75 across the whole move.

**Back (2,600 ms):** the same Bezier evaluated at `1 - t`, galaxy fading out over the
first 60%, solar system in over the last 70%, FOV 75 -> 60, then `finishGalaxyReturn(sc)`
exactly as now.

**Reduced motion:** both directions collapse to a 600 ms cross-fade. The camera is placed
at its destination on frame 1 and only the two opacity ramps run.

`#galaxy-transition-flash` loses the blue radial. It becomes a gold vignette at a peak of
0.18 opacity over the first 25% of the out-move only - a hint of glare, not a wipe. It
keeps `pointer-events: none`, so it cannot become a click trap.

## Things to do

Four hotspots, each with one sourced fact. They exist twice: as a 3D marker in the scene
and as a real `<button>` chip in the HUD, so keyboard users get them without raycasting.
Clicking a marker activates the same chip; the active chip shows a one-line card.

| Hotspot | Fact | Source |
|---|---|---|
| The Sun | 26,000 ly from the galactic centre, one lap every ~225 million years | NASA |
| Galactic centre | Sagittarius A*, about 4 million solar masses | NASA / EHT 2022 |
| Kepler field | One patch of Cygnus, ~150,000 stars watched for four years, 2,700+ confirmed planets | NASA Kepler |
| Orion Spur | The Sun's minor arm, between the Sagittarius and Perseus arms | NASA |

Gaia's figure is corrected in the stat list from 1.7 to 1.8 billion stars (DR3), and the
Kepler cone label from "5,000+ exoplanets found" to "2,700+ confirmed planets" - Kepler's
own count, not the all-survey total. No other number changes.

## HUD

- `#galaxy-info` opens **collapsed**: one gold line, `Milky Way - barred spiral, ~100,000 ly across`,
  with an expand chevron (`aria-expanded`). Expanded it shows the stat list as now, minus
  the two long paragraphs. Blue (`#6495ff`, `rgba(100,150,255,*)`) is replaced throughout
  by `var(--gold)` / `var(--line)` / `var(--muted)`, and the panel takes `var(--ui-font)`.
- New `#galaxy-hotspots`: the four chips, top-centre on desktop, a scrollable row above
  the Return button at 390.
- `#galaxy-zoom-indicator` keeps its layout, restyled gold-on-glass.
- `#galaxy-return-btn` is already gold; unchanged.
- The whole galaxy HUD moves inside `#galaxy-hud`, which is `display: none` unless
  `body.mode-galaxy`. That replaces the hand-rolled `style.display` juggling in
  `finishGalaxyReturn` and makes the click-trap case structurally impossible rather than
  cleaned up after the fact.

## How it hooks into state

Unchanged, and deliberately so: `toggleGalaxyView` still calls
`setState({ mode: 'galaxy', sheet: null, tool: 'none' })` as the out-move starts, and
`finishGalaxyReturn` still calls `setState({ mode: 'solar' })`. `applyState` keeps its one
galaxy line (`body.mode-galaxy` + `aria-pressed`) and starts no animation. Esc, the G key,
the dock Galaxy button, scroll-overscroll and Reset all keep their current entry and exit
paths. `mode` stays out of `PERSISTED`.

## Verification plan

- `npx playwright test -c playwright.local.config.ts tests/e2e/solar-dock.spec.ts` - the
  click-trap and Esc case must stay green, plus new cases for the collapsed info panel,
  a hotspot chip, and the reduced-motion cross-fade.
- Screenshots at 1440 and 390 (idle, mid-transition, info expanded), read before reporting.
- Frame time measured in the page: mean rAF delta over 3 s while idle in the galaxy,
  reported as a number.
