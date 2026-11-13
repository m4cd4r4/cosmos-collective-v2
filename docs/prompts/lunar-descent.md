# Lunar Descent Game Gate Brief

Open this in a **fresh Claude Code session** in this worktree. Do not carry context from another session.

## First action: rebase before doing anything else

```bash
git fetch origin main --quiet
git rebase origin/main
```

A fast-forward means you are done. Resolve any conflict now, before reading further.

## The problem

Cosmos Collective has no crewed-spaceflight feature. Macdara wants two mini-apps: an Artemis explorer and a Starship game. Research on 2026-11-12 found the public web is full of Artemis II trajectory trackers and has no public interactive of the lunar landing itself. This worktree builds the first slice of the game: the powered descent to the lunar south pole, working title "Twelve Minutes to Shackleton".

It is also the first slice of a multi-PR project, so the project plan is written here.

## Source of truth (read these BEFORE designing or coding)

1. [CLAUDE.md](CLAUDE.md) - design context: dark-first, quiet glass panels, glow only in the 3D scene, off-white primary action, gold for selection only.
2. [src/app/solar-system/page.tsx](src/app/solar-system/page.tsx) and `src/components/features/solar-system/SolarSystemViewer.tsx` - how a standalone viewer in `public/` is wrapped by an app route.
3. [next.config.js](next.config.js) (or the `.mjs` equivalent) - the `viewer-pages` network-first cache rule and the precache exclusions that standalone viewers need.
4. [docs/pilot-mode/PROJECT-PLAN.md](docs/pilot-mode/PROJECT-PLAN.md) - decision 20 (vehicle IP), the fixed-timestep physics note in section 4, and risk 3. That plan is for a separate kid-toned game; do not copy its tone.
5. [src/styles/globals.css](src/styles/globals.css) and [tailwind.config.ts](tailwind.config.ts) - the real tokens. Use these values in the standalone app.
6. Memory: `starship-moon-demo-idea.md` in the galaxy-view worktree's project memory, and `starship-note-lives-in-galaxy-view-memory.md` in the main checkout's project memory.

If anything in this brief contradicts those files, **the files win**.

## Rulings already made (Macdara, 2026-11-12)

- The lander is drawn with realistic geometry and named factually as SpaceX's Starship HLS. No SpaceX logos or livery. A "not affiliated with NASA or SpaceX" credit is shown.
- Real data only. Published figures with a source; planned values labelled planned, flown values labelled flown. Never invent a mission parameter. Where no figure is published, say so on screen or leave it out.
- The powered descent gate is built first.

## Facts checked on 2026-11-12 (re-verify before putting them on screen)

- NASA's Artemis page, updated 21 Oct 2026: Artemis II flew in April 2026. Artemis III (2027) is a low Earth orbit docking test with commercial landers. Artemis IV (2028) is the first crewed landing.
- CBS reports Gateway is dropped and a three-phase base near the south pole is planned. Treat mission counts from secondary sources as unverified.
- The Moon has no atmosphere, so there is no entry heating at the Moon. The violence in this gate is the braking burn and the plume throwing regolith.

## What's in scope

- `docs/artemis/PROJECT-PLAN.md` (new): the plan for the whole project. Slices: this gate, ascent and max-Q gate, refuel docking gate, Orion entry corridor gate, and the separate Artemis explorer (south pole light table, base phases on a time slider, flown versus planned trajectories, tanker ledger).
- A new standalone Vite + TypeScript + current three.js app in its own source folder, with its build output emitted under `public/`.
- A new app route that wraps it, plus the matching service worker cache and precache entries.
- Lunar terrain assets and a credits entry for their sources.
- One navigation entry point, if the existing nav has an obvious place. Otherwise leave it reachable by URL and say so.

## Out of scope (do NOT modify)

- `public/solar-system/index.html` and anything under `src/components/features/solar-system/`.
- The other three game gates and the Artemis explorer. Plan them, do not build them.
- The separate `I:/Scratch/pilot-mode` repo.
- Any production deploy.

## What "good" looks like

- The player flies the braking burn, the pitch-over and the terminal descent with throttle and attitude, on keyboard and on touch.
- The terrain is real lunar south pole data (LOLA or NASA CGI Moon Kit) lit by a low Sun, with long shadows. It should look like the south pole, not a generic grey plain.
- Near the ground the plume hides the surface and the player finishes on instruments: altitude, vertical speed, horizontal speed, propellant.
- Short tip cards appear at the moment each idea matters. The player does the thing first and reads second.
- An end card compares the player's touchdown numbers with real published ones, each with its source.
- A hard landing ends the run plainly and offers an instant retry.
- Physics runs on a fixed 60 Hz timestep at real lunar gravity, 1.62 m/s2. Any time compression is labelled.
- `prefers-reduced-motion` is honoured (no camera shake), and every control is reachable by keyboard.

## Required deliverables

1. `docs/artemis/PROJECT-PLAN.md`, written first.
2. A short design rationale in the PR body: palette named from the repo tokens, HUD layout, and the data sources chosen.
3. The game gate, scoped to the list above.
4. Verification: load the route in a real browser through a PortPilot-managed dev server, play a full descent, and read screenshots at 1440 and 390 yourself. A start-up banner is not proof.
5. A unit test for the physics step (free fall for a known time gives the known speed and distance).
6. A sources list in the plan doc: every number shown on screen and where it came from.

## Suggested workflow

1. Rebase. Read the source-of-truth files.
2. Run `/pre-build` to settle the open scoping questions with Macdara up front, then write the plan doc.
3. Prove the data access before building on it: download one south pole terrain tile and confirm its licence and resolution.
4. Build one vertical slice end to end (terrain, lander, physics, HUD, touchdown) before polishing any part.
5. Finish with `/design-review`.

## Constraints

- One PR. Branch name: `feat/lunar-descent`.
- Not a single-file monolith. The solar system page is 6,000+ lines in one HTML file; do not repeat that.
- British English. No em-dashes, en-dashes or ellipsis characters in site copy.
- Keep first-load weight sensible: lazy-load terrain and models, and state the total in the PR.
- Merging is not deploying. Report "merged and ready" and ask before any production deploy.

## Out-of-scope follow-ups (capture, don't build)

Append to `docs/CLAUDE-TODO.md` or create a task in Vikunja project 31 (cosmos-collective). Do not fix inline.

## Why this brief is structured this way

The pilot-mode plan names the failure this project is prone to: a catalogue of tempting mechanics and no finished slice. So this brief ships one playable gate and a written plan for the rest. The facts section exists because the mission architecture changed during 2026 and older notes describe a different plan.