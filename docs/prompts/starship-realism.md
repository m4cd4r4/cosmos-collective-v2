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

## Ground route: open data (decided 2026-11-15)

Google Photorealistic 3D Tiles were tested on 2026-11-14 and 15 and dropped. Over Starbase they are aerial photos on terrain. From 2 km they look convincing, but from 40 m nothing stands up: no towers, chopsticks or tanks in 3D. They would also need on-screen Google attribution, and the API key route failed. Macdara chose the open route and the Google setup was removed.

- **Ground:** NAIP aerial imagery (public domain; check for a 2024 Texas flight, since 2022 predates much of the pad) on USGS 3DEP lidar elevation, with coarser public imagery beyond the site for the boostback and coast views.
- **Towers, chopsticks, launch mounts, tank farm, piping:** modelled from reference photos, or CC-BY models with the licence checked and a credit on screen. Both pads and both towers.
- **Sky:** physical atmosphere (decided 2026-11-14), see requirement 3.

## Do not

- Keep the score labelled as a game measure, keep `TUNING.towerHeight` off screen, and use no em or en dashes. Use British English.
- No production deploy without fresh approval.
