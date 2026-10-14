# Galaxy View Rebuild Brief

Open this in a **fresh Claude Code session** in this worktree. Don't carry context from the session that wrote it.

## First action: rebase before doing anything else

This branch is stacked on `feat/solar-dock` (PR #54), because the galaxy view's entry and exit now run through that PR's `state` object.

```bash
gh pr view 54 --json state --jq .state
```

- **MERGED:** `git fetch origin main --quiet && git rebase --onto origin/main origin/feat/solar-dock` and open your PR against `main`.
- **OPEN:** `git fetch origin feat/solar-dock --quiet && git rebase origin/feat/solar-dock`. Open your PR against `feat/solar-dock`, or wait for #54 and retarget.

## The problem

The 3D solar system at https://cosmos-collective.com.au/solar-system has a Galaxy view (the dock's Galaxy button, the G key, or scrolling far out). On 2026-10-14 Macdara called it "weird and crude, and clunky, doesn't really do anything". What a screenshot at 1440 shows:

- a flat, opaque green disk under everything
- spiral arms drawn as blocky rectangular bands, with visible segment edges
- a hard-edged brown bulge in the centre
- a static scene: nothing moves, and nothing invites exploring
- a "Milky Way Galaxy" info panel covering about a quarter of the screen, with an off-brand blue title

The transition in and out is a cut with a flash, not a journey.

## Source of truth (read these BEFORE designing or coding)

1. `public/solar-system/index.html`: the whole app (Three.js r128, vanilla JS, about 6,400 lines). Search `toggleGalaxyView`, `updateGalaxyTransition`, `finishGalaxyReturn`, `galaxyViewActive` and the `#galaxy-*` markup and CSS. Also read the `UI STATE: one object` block (`setState`, `applyState`, the `mode` field).
2. `docs/prompts/solar-dock-state-plan.md`: how modes enter and exit through `setState`.
3. `tests/e2e/solar-dock.spec.ts`: the smoke test. The galaxy case checks for invisible click traps and that Esc returns.
4. `CLAUDE.md`: design context (dark-first, gold `#d4af37`, Outfit/Inter/JetBrains Mono, WCAG 2.1 AA, reduced motion).
5. `docs/solar-system/AUDIT-2026-06-12.md`: the June audit, which recommends enhancing in place, not rebuilding the app.

If anything in this brief contradicts those files, the files win.

## What's in scope

- The galaxy scene construction, its materials and its animation in `public/solar-system/index.html`.
- The solar-to-galaxy transition and the return.
- The galaxy HUD: info panel, zoom indicator, scale bar, Return button.
- New smoke-test cases in `tests/e2e/solar-dock.spec.ts` if the behaviour changes.

## Out of scope (do NOT modify)

- The dock, the More sheet, the `state` shape, and the solar-system scene itself (planets, trails, orbit lines).
- Planet textures, the Three.js version, and the rest of the site.
- Pilot mode (separate repo).
- Do not extract the app into React or add files beyond the single HTML.

## What "good" looks like

- A galaxy that reads as a galaxy at first glance: a barred spiral made of stars, with a glowing bulge, arms that fade softly into the dark, and dust lanes. No visible geometry edges or flat coloured disks.
- It feels alive: slow rotation (inner faster than outer), twinkle or shimmer, depth when you orbit the camera.
- The trip there is the point: a continuous zoom-out from the Sun to the whole galaxy, with a gold "You are here" marker and the Sun's galactic orbit drawn. Coming back reverses it.
- Something to do: a few things to tap or hover (the Sun's position, the galactic centre, the Kepler field, the Orion Arm), each with one short real fact. Facts come from sourced numbers only (NASA, ESA Gaia), with no invented figures.
- Compact HUD: the info panel starts collapsed to a single line, and the Return button and Esc both work.
- 60 fps on a mid-range laptop. Under `prefers-reduced-motion`: no rotation, and a cross-fade instead of the fly-through.
- At 390 width the galaxy fills the screen and the HUD stays out of the way.

## Required deliverables

1. **Before code:** a short plain-text design note covering the particle approach (counts, arm maths, blending), the transition timeline, and how it hooks into `setState({ mode: 'galaxy' })`.
2. The rebuilt galaxy view in `public/solar-system/index.html`.
3. `tests/e2e/solar-dock.spec.ts` stays green, including the galaxy click-trap case: `npx playwright test -c playwright.local.config.ts tests/e2e/solar-dock.spec.ts`.
4. Screenshots at 1440 and 390 (galaxy idle, mid-transition, info expanded), read by you before reporting. Load the real page; a dev-server banner does not count.
5. A frame-time check: report the average frame time in the galaxy view, measured in the page.

## Suggested workflow

1. Rebase (see above). Read the source-of-truth files.
2. Run `/web-design-lab` for the particle-galaxy and fly-through recipes. `/ai-animation` is for SVG explainers and does not fit a live Three.js scene.
3. Write the design note, then build the particle galaxy first, and look at it before building the transition.
4. Build the transition, then the HUD.
5. Run `/design-review` at 1440 and 390. Open one PR. Do not deploy.

## Constraints

- One PR. Branch: `feat/galaxy-view`.
- No new dependencies. Three.js r128 only (no `three/examples` imports unless inlined).
- Respect `prefers-reduced-motion`. Keyboard reachable. Visible focus.
- Production deploys need Macdara's approval every time.

## Out-of-scope follow-ups (capture, don't build)

Append to `docs/CLAUDE-TODO.md`.

## Why this brief is structured this way

The dock PR fixed the controls but left the galaxy view as it was. That view needs its own session because it is a visual rebuild with its own verification (look at it, measure frame time), and folding it into #54 would have made that PR unreviewable.