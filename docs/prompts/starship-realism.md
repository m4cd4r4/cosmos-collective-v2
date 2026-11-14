# Starship catch: realism and hands-on rebuild (brief)

Decided by Macdara on 2026-11-14 after a full run. Builds on PR 85 (`feat/starship-spectacle`), which stays open as the base. The real-data rules in the repo `CLAUDE.md` and in `docs/prompts/starship-catch.md` still apply.

## Why

Macdara: "really really boring, does not look good at all, and has no real playability". A run is a few cued presses, and flying on the cue always catches (`starship-catch/src/sim/flight.test.ts`).

## What a 1440 run showed (2026-11-14)

| Area | Now |
|---|---|
| Terrain | Flat beige plain with a blurred photo near the pad; procedural green and khaki blotches, a smooth coast and a flat teal sea from height |
| Sky | Flat blue gradient, cartoon cloud puffs, no haze, no sun, no darkening with altitude |
| Vehicle | Plain grey cylinder with ring lines, crude grid fins, thin orange plume |
| Catcher | Uniform grey lattice tower, one black beam for the arms |
| Infrastructure | Five white cylinders and a small round mount |

## Requirements (Macdara, 2026-11-14)

1. **Gameplay: hands-on final approach.** The player flies the last ~60 s: throttle and steer the booster into the arms, with wind, drift and limited propellant. A miss must be easy. Ascent and boostback become a short cinematic. No cue that tells you when to press.
2. **Realistic terrain.**
3. **Realistic sky:** physical atmosphere (precomputed scattering, volumetric clouds), real sun position for Flight 8's launch time, sky darkening with altitude. Lower-quality fallback for phones.
4. **Realistic vehicle:** stainless PBR with environment reflections, engine bay, chines, grid fins, hot-stage ring, plume with the right engine count.
5. **Realistic catcher:** the chopstick pair on its carriage, the tower as built.
6. **Other ground infrastructure:** launch mount, tank farm and piping, the second pad and tower, beach, Highway 4, build site in the distance.

## Ground route: test first, then decide

No open dataset has photoreal 3D scans of Starbase.

- **Google Photorealistic 3D Tiles:** real scans of the site. Macdara chose to test it before committing: load Starbase in a throwaway page within the free quota, with zero paid usage, screenshot it beside the open route, and let him pick. Coverage quality at Starbase is unverified.
- **Open route:** NAIP aerial imagery (public domain; check for a 2024 Texas flight, since 2022 predates much of the pad) on USGS 3DEP lidar, with towers, tanks and pads hand-built or taken from CC-BY models (licence checked, credited on screen).

Set up on 2026-11-14 (approved): a Map Tiles key with free-tier quota caps and a budget alert. Account details, the key location and the spike page live in Claude's private project memory, not in this public repo.

Blocked: the key gets 403 "Permission denied on the service" with the API enabled. The likely cause is that the Maps Platform terms have not been accepted for the Cloud project. Macdara accepts them once in the console, then the screenshots are rerun.

## Do not

- Keep the score labelled as a game measure, keep `TUNING.towerHeight` off screen, and use no em or en dashes. Use British English.
- No production deploy without fresh approval.
