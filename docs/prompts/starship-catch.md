# Starship Launch and Tower Catch Brief

Open this in a **fresh Claude Code session** in this worktree. Do not carry context from another session.

## First action: rebase, then check PR 82

```bash
git fetch origin main --quiet
git rebase origin/main
gh pr view 82 --json state
```

PR 82 (`feat/lunar-descent`, "Descent to Shackleton") is slice 1 of this project. It adds the project plan, the standalone-app pattern and the build wiring this slice copies.

- **Merged:** carry on. `docs/artemis/PROJECT-PLAN.md` and `lunar-descent/` are in your tree.
- **Still open:** read both from the sibling worktree `I:/Scratch/cosmos-collective-v2-lunar-descent` as read-only reference. Build your app, but do not edit the plan doc or open your PR until 82 has merged and you have rebased onto it. Expect small conflicts in `next.config.js`, `package.json`, `tsconfig.json`, the footer and the credits page.

## The problem

Slice 1 lets a visitor land on the Moon. Nothing on the site shows how the rocket leaves Earth or comes back. Macdara wants the launch, and above all the tower catch, playable. This worktree builds slice 2: one continuous Super Heavy booster flight from liftoff to the chopsticks, at the real launch site.

## Source of truth (read these BEFORE designing or coding)

1. `CLAUDE.md` - design context: dark-first, quiet glass panels, glow only in the 3D scene, off-white primary action, gold for selection and guidance only.
2. `docs/artemis/PROJECT-PLAN.md` - the rulings, the slice table, and section 4, which records what slice 1 learned. Rulings 4, 6 and 9 matter most here.
3. `lunar-descent/` - the pattern to copy: `sim/` (pure physics and flight rules, unit tested), `scene/`, `ui/`, `data/facts.ts`, and its Vite config.
4. `src/app/lunar-descent/page.tsx` and `src/components/features/lunar-descent/LunarDescentViewer.tsx` - how the route wraps the standalone app.
5. `next.config.js` - the `viewer-pages` network-first rule and the precache exclusions.

If this brief contradicts those files, **the files win**.

## Rulings already made (Macdara, 2026-11-12)

- **Core flight:** the booster, liftoff to tower catch, as one run.
- **Vehicles:** realistic geometry, named factually (SpaceX Starship, Super Heavy, Falcon 9). No logos or livery. "Not affiliated with NASA or SpaceX" credit.
- **Real data only.** Published figures with a source. Flown values labelled flown, planned labelled planned. Where nothing is published, say so or leave it out.
- **Sea landing:** a separate Falcon 9 drone ship gate. Starship has never landed on a drone ship, so it is not shown doing so. That gate is the next slice, not this PR.
- **Launch site terrain:** test Google Photorealistic 3D Tiles first; if the test fails, bake open data. See the spike below.
- **Extras, all wanted:** real flight comparison on the end card; failures shown honestly; the flight director go/no-go call; a launch site tour.

## Facts checked on 2026-11-12 (re-fetch on the day you build)

Flight 9 timeline, flown: hot staging at T+2:37, boostback start T+2:47, boostback shutdown T+3:27.

- Liftoff on 33 Raptor engines. At hot staging the booster drops to 3 centre engines and the ship lights its 6 while still attached.
- Boostback has used 13 engines. On Flight 8 only 11 of 13 lit, and the catch still succeeded.
- The hot-stage ring is jettisoned during the return on earlier boosters. Check whether V3 boosters still do this.
- The flight director must send a manual command before boostback ends, or the booster defaults to a splashdown path. Flight 6 was called off and splashed down in the Gulf.
- The landing burn ends on 3 centre engines, which steer the booster into the arms.
- First catch: Flight 5, October 2024. Sources disagree on the count of later catches. Use the Wikipedia list of Starship launches and SpaceX's own flight pages, and reconcile them.
- **Flight 15 is targeted for 13 November 2026** with the first ship catch attempt and the first V3 booster catch. Its outcome will exist when you read this. Fetch it.
- The ship's return (belly-first re-entry, flip, catch) is a later slice.

## Spike first: Google 3D tiles (about one hour, then decide)

Macdara approved a test, not a commitment. Prove all four before building on it:

1. Starbase is covered in photoreal 3D, and the imagery shows the current tower and launch mount. Read a screenshot yourself.
2. The caching terms. The site has a service worker; tiles must never be precached or stored if the terms forbid it.
3. A hard spend cap and a referrer-locked key. Reported pricing is 1,000 free root-tile loads a month, then USD 6.00 per 1,000, and the service stops when quota runs out. Confirm on Google's live pricing page.
4. It loads in three.js at a usable frame rate on a mid-range laptop.

Use the local Google Cloud setup for the key. Never commit the key. **Ask Macdara before attaching the key to production**; that is a new paid service on a live site.

If any of the four fails: bake USGS aerial imagery and elevation (public domain) at build time, the way slice 1 baked LOLA, and model the tower. Record the result of the spike in the plan doc either way.

## What's in scope

- A new standalone Vite + TypeScript + three.js app in its own folder beside `lunar-descent/`, building to `public/`, with a wrapping route.
- Lift shared code out of `lunar-descent/` only where you would otherwise copy it wholesale, and only after PR 82 has merged.
- `docs/artemis/PROJECT-PLAN.md`: this slice's design, its sources table, the spike result, and the Falcon 9 drone ship gate and ship re-entry added to the slice table.
- Footer link and credits entry, matching what slice 1 did.

## Out of scope (do NOT modify)

- The behaviour of `lunar-descent/` and anything under `public/solar-system/`.
- The Falcon 9 drone ship gate, the ship re-entry, refuel docking, the Orion entry gate and the Artemis explorer. Plan them, do not build them.
- Any production deploy.

## What "good" looks like

- One run takes the player from liftoff through max-Q, hot staging, the flip, boostback, the catch call and the landing burn into the arms.
- The player has real decisions. Slice 1's first build failed here: the computer flew and the controls changed nothing (plan ruling 6). Compress or automate any phase with no decision in it, and label the time compression.
- **Go/no-go:** before boostback ends the player reads tower and booster health and makes the catch call. No-go diverts to a splashdown, shown as the correct call when the readouts were bad.
- **Failures:** engine-outs the player must fly through, and a missed catch that ends plainly and violently, then an instant retry. Engine-out behaviour is modelled on flown events.
- **End card:** the player's timeline beside a real flight's published timeline, each row with its source and status.
- **Tour:** a free-look mode around the tower, arms, launch mount and tank farm with short labels. Build it last; if the PR is getting large, it is the first thing to move to a follow-up.
- The catch looks as large as it is: a 70 m booster and a tower taller than it. Scale is the spectacle. Glow, smoke and fire belong in the scene, never on the HUD.
- Fixed 60 Hz physics. `prefers-reduced-motion` removes camera shake. Every control is reachable by keyboard and by touch.

## Required deliverables

1. The spike result, written into the plan doc.
2. Design rationale in the PR body: palette from the repo tokens, HUD layout, what the player decides in each phase, data sources.
3. The game, scoped as above.
4. Unit tests for the physics step and the flight rules, including one that flies the catch end to end.
5. A sources table for every real-world number on screen, fetched on the build day.
6. Verification: a PortPilot-managed dev server, a full run played in a real browser, screenshots at 1440 and 390 read by you.

## Suggested workflow

1. Rebase, check PR 82, read the source-of-truth files.
2. Re-fetch the facts, including Flight 15.
3. Run the Google tiles spike and decide.
4. Put any remaining design forks to Macdara in one batch of option cards before building, then run to the end.
5. One vertical slice first (site, booster, physics, HUD, catch), then failures, go/no-go, the end card, the tour.
6. Finish with `/design-review`.

## Constraints

- One PR. Branch name: `feat/starship-catch`. It must not merge before PR 82.
- No single-file monolith.
- British English. No em-dashes, en-dashes or ellipsis characters in site copy.
- Lazy-load terrain and models; state the first-load weight in the PR.
- Merging is not deploying. Report "merged and ready" and ask before any production deploy.

## Out-of-scope follow-ups (capture, don't build)

Append to `docs/CLAUDE-TODO.md` or create a task in Vikunja project 31 (cosmos-collective). Do not fix inline.

## Why this brief is structured this way

Three of Macdara's wishes ran ahead of what has flown: a Starship drone ship landing, a ship catch, and photoreal tiles of a site that is rebuilt every few months. The brief keeps each one and pins it to what is real, so the site's "never fake it" rule holds. The decision-first note is there because slice 1 had to be reworked after its first play for exactly that reason.