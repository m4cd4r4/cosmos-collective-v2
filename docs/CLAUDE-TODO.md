# Claude TODO

Follow-ups captured during work, not built yet. Source for each: the plan artifact https://claude.ai/artifact/Gzcq3M39AbDYPaePLeMFnZ unless noted.

## From feat/solar-dock (2026-10-14)

- **550 AU pearl anatomy** - parked; not part of the dock redesign.
- **Page pruning** - review which site routes earn their place.
- **Homepage rebuild** - separate brief.
- **Wrong 2026 lunar dates** in `src/services/real-time-events.ts:428` - check against a published ephemeris and fix.
- **Install prompt covers canvases** - the PWA install prompt sits over the 3D views; move or delay it.

## From /design-review of feat/solar-dock (2026-10-14)

- **Time tab event dates lag the sim date** - at sim date Jan 2028 the "Planetary events" list showed Oct 2027 events; check `updateEventsDisplay` (index.html ~2537) bases `ev.date` on `simulationDays`, not wall-clock today.
- **Event cards use emoji icons** (link, lightning, arrows) - off-brand; swap for small inline SVG or plain text.
- **11 texture 404s per load** - the loader requests `textures/2-8k_textures/8k_*.jpg` first, which exist neither locally nor on production, then falls back. Drop the 8k attempt or ship the files.
## From feat/galaxy-view (2026-10-14)

- **Galactic-centre hotspot is invisible at idle** - its marker sits inside the bulge glow, so only the chip reveals it. Consider an offset leader line.
- **Galaxy info sheet is tall at 390** - expanded it covers about half the phone screen. A scrollable sheet or two-column stats would sit better.
- **Transition timing is unverifiable headless** - Chromium software-rasterises at ~4 fps, so the 3.2 s fly-out cannot be sampled mid-flight by the local harness. Needs a GPU browser or a deterministic clock hook in the page.
- **Frame time never measured on a GPU** - the same software rasterisation makes the harness's fps meaningless. Scene cost is 25 draw calls / ~289k points / 6.5k triangles per frame; a real number still needs Brave.
- **Reported core "pulsing" not reproduced** - sampling core brightness and bright-pixel area over 40 s, against an empty-sky control, showed variation tracking the camera orbit only, with no periodic component. The bulge twinkle, the fast bar rotation and the camera drift rate were all reduced anyway. Re-check by eye.
