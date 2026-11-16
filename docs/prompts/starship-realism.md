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

## Phases (Macdara, 2026-11-15)

Each phase is its own PR and ends in a build Macdara plays before the next starts. Gameplay goes first: no realism work until phase 1 is fun.

| # | Phase | Answers his complaints |
|---|---|---|
| 1 | **Final approach is the game.** Start about 10 km above Starbase with the booster falling. The player flies it into the arms (throttle, gimbal, grid fins) against wind, with limited propellant. A miss is easy and the crash is shown up close. Plain models are fine. | "nothing but an engine cutoff option"; blank landscape; a fuzzy puff in the distance |
| 2 | **Site:** NAIP and lidar ground, both towers with working chopsticks, launch mounts, tank farm, beach, Highway 4, build site | no landmarks, not realistic |
| 3 | **Sky and vehicles:** physical atmosphere (black at altitude, Earth's curve), stainless booster and ship, engines and plume | not realistic |
| 4 | **Opening:** short, skippable liftoff and hot staging. The ship flies on to orbit and stays visible; the booster flips back. Shake on the camera, never the ground. | ground shaking side to side; ship descending while the booster climbs |

Macdara on the current build (2026-11-15): "the game sucks". The ground shakes side to side at liftoff, there are no landmarks, the only choice is an engine cutoff, the ship descends while the booster ascends (`src/scene/world.ts` draws the ship for 16 s with gravity only partly offset by thrust), then a blank landscape and a fuzzy puff in the distance.

## Phase 2 as built (2026-11-16)

Ground and site, baked by `starship-catch/scripts/bake-site.py` (Python with rasterio; no logins). Outputs in `starship-catch/public/site/`, about 1.7 MB in all.

| Layer | Size | Source | Licence |
|---|---|---|---|
| pad | 1.2 km, 0.6 m a pixel | USDA NAIP, flown 14 October 2024 | Public domain |
| site | 3 km | NAIP 2024 (2022 north of 26 degrees N, matched in colour); open water from Sentinel-2 | Public domain; Copernicus |
| area | 10 km, to the build site and the Rio Grande mouth | as site | as site |
| region | 44 km, to South Padre Island, Port Isabel and Mexico | Sentinel-2 L2A, 21 November 2024, matched in colour to NAIP | Copernicus Sentinel data licence: "Contains modified Copernicus Sentinel data 2024" |
| elevation | pad, site and area layers | USGS 3DEP DEM; over the site the 2023 TX Lower Rio Grande lidar | Public domain |

All three credits are on the start card, the help card and the end card, and on the site's credits page.

Models (`starship-catch/src/scene/pads.ts`, `tower.ts`): both towers with chopsticks on their carriages, the Pad 1 mount, the Pad 2 mount over its flame trench, the Pad 1 tank farm (horizontal tanks and pipe racks), and the two Mega Bays and the Starfactory at the build site. Positions are read off the 2024 photograph relative to the Pad 1 tower; building heights come from their shadows, scaled by the 146 m tower's 228 m shadow. Highway 4 and the beach are the photograph itself, laid on the lidar.

Known departures and gaps:
- The sim catches 15 m east of the Pad 1 tower's centre, where the mount is drawn; the photograph puts the real mount about 30 m east. Gameplay was not changed.
- The Sun is fixed where it stood when the 2024 photograph was flown (east-south-east, about 33 degrees up), so the photograph's shadows agree with the models. Phase 3's real Sun for Flight 8 will disagree with those baked shadows and needs a plan for them.
- The Pad 2 mount is drawn over the trench seen in the 2024 photograph; its shape is representative.
- NAIP leans tall structures; the leaning images of both towers are painted out of the photograph.

## Do not

- Keep the score labelled as a game measure, keep `TUNING.towerHeight` off screen, and use no em or en dashes. Use British English.
- No production deploy without fresh approval.

## Phase 3 as built (2026-11-16)

Sky, Sun, vehicles and plume. `flight.ts` and `TUNING` are unchanged.

- **Sky** (`starship-catch/src/scene/sky.ts`, `air.ts`): single scattering (Rayleigh, Mie, ozone; constants from Hillaire, EGSR 2020) computed each frame for the camera's height, so the sky darkens with altitude. The same table lights the haze over the ground. Photo layers and far ground drop with the Earth's curve. Volumetric cumulus between 1.3 and 1.9 km, rendered at half size and blurred. A low tier runs on phones (`?quality=low` or `high` forces one).
- **Sun** (`starship-catch/src/sim/sun.ts`): NOAA solar position, checked against the NREL SPA worked example. Liftoff 23:30:31 UTC on 6 March 2025 (Jonathan McDowell's launch log, via Wikipedia "Starship flight test 8"); catch at T+7:02. At the catch the Sun is at azimuth 258.3 degrees, 11.6 degrees up. Two modes: `flight8` (default, real) and `photo` (`?sun=photo`, matches the shadows baked into the 2024 photograph). Macdara picks at playtest.
- **Booster and ship** (`starship-catch/src/scene/booster.ts`): stainless PBR reflecting the sky, weld rings, four grid fins, hot-stage ring, chines, 33 bells (13 centre, 20 outer). Ship: tiles on the windward side only, 3 sea-level and 3 vacuum bells; shown only through a dev hook until phase 4.
- **Plume**: drawn from the engines the sim says are lit; widens and lengthens as the air thins.

Known gaps:
- In `flight8` mode the Sun is behind the booster from the play camera, so the steel reads dark until the catch view.
- The play camera looks down at altitude, so the black sky and curved horizon are rarely in frame before phase 4.
- Clouds are soft; nothing published gives Flight 8's weather, so they are scenery.
- Haze is a calibrated approximation, not a full 3D table. Chines, fin spacing, frost band and flaps are representative shapes.
- Beyond about 22 km the ground is procedural, with a straight coast when the camera looks out level.
