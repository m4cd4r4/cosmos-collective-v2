# Page Pruning Brief

Open this in a **fresh Claude Code session** in this worktree. Don't carry context from the session that wrote it.

## First action: rebase before doing anything else

```bash
git fetch origin main --quiet
git rebase origin/main
```

## The problem

cosmos-collective.com.au carries pages that don't earn their place. The refresh plan of 2026-10-14 (https://claude.ai/artifact/Gzcq3M39AbDYPaePLeMFnZ, section "Site pages: keep, merge, cut") audited every route. It found a live error-test page, three redirect stubs, a developer blog aimed at the wrong audience, two pages that duplicate others, and wrong 2026 lunar dates on /events. The site got about 3 organic clicks in 90 days, so pruning costs almost nothing in search. The exception is the `/explore/*` detail pages, which are the only pages that have ever ranked and must stay untouched.

## Source of truth (read these BEFORE coding)

1. The plan artifact above (read it with the Artifact tool, `action: "read"`): the keep/merge/cut table.
2. `src/app/` route folders and `src/app/sitemap.ts`.
3. `next.config.js`: the existing `headers()`, and where `redirects()` goes.
4. The header nav and footer components (search `src/components` for the nav links, e.g. `LandingFooter.tsx` and the header). `/sky-map` is missing from the header nav.
5. `src/services/real-time-events.ts` (around line 428): the hardcoded 2026 lunar dates.
6. `tests/e2e/*.spec.ts`: `audit-changes.spec.ts` checks the sitemap routes and a Mission Control hub. Update these to match; don't delete coverage without saying so.
7. `CLAUDE.md`: design context.

If anything here contradicts those files, the files win.

## What's in scope

| Route | Action |
|---|---|
| `/test-error` | Delete. Redirect to `/` |
| `/dashboard`, `/mission-control`, `/observatory` | Delete the route folders; add permanent redirects in `next.config.js` `redirects()` to their current targets |
| `/devlog` (21 posts) | Remove from the site and sitemap; 301 to `/`. Keep the content in the repo (e.g. move it under `docs/devlog/`) so nothing is lost |
| `/jwst` | Merge into `/explore`: anything unique moves across, then 301 `/jwst` to `/explore`. **Drop the Hubble comparison pairs**: they show the wrong objects |
| `/spacecraft` | Merge into `/events` as a tab next to the launch tracker; 301 `/spacecraft` to `/events` (or its tab anchor) |
| `/events` lunar dates | Compute moon phases instead of the copied table. The full moon is 3 Jan 2026, not 13 Jan; check against a published ephemeris (e.g. timeanddate.com or USNO) |
| `/sky-map` | Add to the header nav |
| Nav, footer, sitemap, landing cards | Remove links to anything cut; no dead links anywhere |

## Out of scope (do NOT modify)

- `/explore/*` detail pages (they rank), `/kepler`, `/solar-system`, `/gravitational-lens`, `/sky-map` content.
- The homepage rebuild (a separate brief later). Only remove landing links to cut pages.
- The install-prompt fix, the Next upgrade, and dependency cleanup.

## What "good" looks like

- Every cut URL returns a 301/308 to a sensible page; nothing 404s that used to resolve.
- The header shows Sky Map; no link anywhere points at a removed route.
- `/events` shows the correct 2026 moon phases, and a spacecraft tab.
- The sitemap lists only live routes.
- `npm run build` passes; the e2e specs that touch these routes pass or are updated with a reason.

## Required deliverables

1. A short plan before code: the redirect table (source to destination) and what moves where in the two merges.
2. One PR with the cuts, redirects, merges, nav change and lunar fix.
3. Verification from outside: `curl -sI` each old URL on the dev server and show the 30x and `location`. Load `/events`, `/explore` and the header at 1440 and 390, and read the screenshots.
4. A dead-link check: grep the source for every removed route path.

## Suggested workflow

1. Rebase. Read the plan artifact and the source-of-truth files.
2. Do the cuts and redirects first (quick, low risk). Commit.
3. Then the lunar fix, then the two merges.
4. Start the dev server through PortPilot on a free port; don't reuse :3099 (another worktree's server).
5. Open one PR with an `## Evidence` section. Do not deploy: production deploys need Macdara's approval every time, and he plans to deploy this together with the solar system and galaxy work.

## Constraints

- One PR. Branch: `feat/page-prune`.
- No new dependencies unless a moon-phase calculation genuinely needs one. Prefer a small pure function (the synodic month from a known new-moon epoch is accurate to well within a day).
- Permanent redirects only (`permanent: true`).

## Out-of-scope follow-ups (capture, don't build)

Append to `docs/CLAUDE-TODO.md`.

## Why this brief is structured this way

Cutting pages is easy to get half-done: a removed route that still has a nav link, a sitemap entry or an old URL that now 404s. The redirect table and the outside-in curl check are what make this PR safe.