<div align="center">

# Cosmos Collective

### Real astronomical data, made to explore.

Fly a 3D solar system, image an exoplanet through the Sun's own gravity, browse JWST's infrared sky, and map 2,700+ Kepler worlds. Every datum is real, sourced, and dated - drawn live from NASA, ESA, STScI, NOAA, and CSIRO.

[![CI](https://github.com/m4cd4r4/cosmos-collective-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/m4cd4r4/cosmos-collective-v2/actions/workflows/ci.yml)
[![Website](https://img.shields.io/badge/live-cosmos--collective.com.au-d4af37?style=flat-square)](https://cosmos-collective.com.au)
[![Next.js](https://img.shields.io/badge/Next.js-14-000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-4a90e2?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-ff9a3c?style=flat-square&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

**[cosmos-collective.com.au](https://cosmos-collective.com.au)**

<br />

![The Solar System explorer: every planet where it really is today, then a dive to the Sun](./docs/readme/solar-system.gif)

<sub>The Solar System explorer - real orbital mechanics, speed control from real time to a year per second, top and side views, and a dive to the Sun.</sub>

</div>

---

## What's inside

Six explorers, one dark-sky instrument aesthetic. Deep space void backgrounds, stellar-gold accents, tabular data readouts. Built for the curious - a 14-year-old can navigate it, and the numbers are all real.

| Explorer | Route | What it does |
|----------|-------|--------------|
| **Explore** | `/explore` | Curated JWST, Hubble, and Australian radio observations, with a Webb explorer at `/explore?view=webb` |
| **Satellites** | `/satellites` | Every active satellite at its position right now, by orbit class and constellation, plus a spacecraft guide |
| **Sky Map** | `/sky-map` | The whole celestial sphere across radio, infrared, optical, UV, and gamma surveys |
| **Solar System** | `/solar-system` | Orbits where the planets really are today, time-speed control, top and side views, a dive to the Sun |
| **Gravitational Lens** | `/gravitational-lens` | The Solar Gravitational Lens mission concept, act by act, with a string-of-pearls CubeSat anatomy |
| **Kepler Exoplanets** | `/kepler` | 2,700+ confirmed worlds from a live NASA Exoplanet Archive query |

<table>
  <tr>
    <td width="50%"><img src="./docs/readme/explore.jpg" alt="Explore: curated observations"/></td>
    <td width="50%"><img src="./docs/readme/webb.jpg" alt="Webb explorer: JWST observations by category and instrument"/></td>
  </tr>
  <tr>
    <td width="50%"><img src="./docs/readme/satellites.jpg" alt="Satellites: every active satellite by orbit class"/></td>
    <td width="50%"><img src="./docs/readme/sky-map.jpg" alt="Sky Map: Aladin Lite with a spectrum switcher"/></td>
  </tr>
  <tr>
    <td width="50%"><img src="./docs/readme/kepler.jpg" alt="Kepler: confirmed exoplanets in an interactive stellar field"/></td>
    <td width="50%"><img src="./docs/readme/solar-system.jpg" alt="Solar System: orbit view with speed and view controls"/></td>
  </tr>
</table>

---

## The Gravitational Lens Telescope

<div align="center">

![String of pearls: six CubeSats self-assemble into a one-metre telescope, shown exploded](./docs/readme/string-of-pearls.gif)

</div>

A standalone, interactive walkthrough of the **Solar Gravitational Lens** mission concept (NASA/JPL NIAC, Turyshev et al) - flying a solar-sail spacecraft past 650 AU to use the Sun's gravity as a lens and image an exoplanet's surface. Eight acts, each with a scripted **Tour** and a free-camera **Explore** mode: why JWST can't do this, how gravity bends light, the focal line, the sundiver trajectory, the string of pearls, the Einstein-ring imaging dance, the real stellar neighbourhood, and a lens-to-lens comms epilogue.

The clip above is Act 4. Each launch carries six CubeSats that self-assemble in flight into a one-metre telescope; the tour opens a pearl, explodes it into its parts, then docks it back.

Real physics throughout (test-verified against published anchors), dramatised visuals clearly labelled as such. It is a separate Vite + Three.js app ([m4cd4r4/550-AU](https://github.com/m4cd4r4/550-AU)), built and vendored into `public/embeds/` and served in a same-origin iframe - fully offline, no external calls at runtime.

---

## Feature highlights

**Solar System** - accurate orbital mechanics with a speed control from real time to a year per second, free, top and side camera views, and a dive to the Sun. Zoom out to see the Sun's place in the Milky Way.

**Webb explorer** - JWST observations browsable by category and instrument (NIRCam, MIRI, NIRSpec), with feature annotations, a Hubble comparison mode, and deep links into the Sky Map.

**Kepler Exoplanets** - a live NASA Exoplanet Archive query rendering the confirmed planets across Sky, Galaxy, and HR-diagram views. Opens on a genuinely weird world (Kepler-16b, the real Tatooine) with the full catalogue one click away. Filter by size, stellar temperature, orbital period, and habitable zone.

**Sky Map** - the entire celestial sphere via Aladin Lite, with a first-class spectrum switcher (CMB, mid-IR, near-IR, optical, UV, gamma) and a live RA/Dec/FoV readout. Search any object; JWST markers deep-link back to their observation pages.

**Satellites** - active satellites drawn at their current positions around a 3D Earth, filterable by orbit class (LEO, MEO, GEO, HEO) and constellation, with a follow-the-ISS mode.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router), React 18, TypeScript (strict) |
| Styling | Tailwind CSS 3, Radix UI primitives |
| 3D / viz | Three.js (r183), Aladin Lite, HTML canvas |
| State / data | Zustand, TanStack Query |
| Motion | Framer Motion + CSS keyframes (reduced-motion honoured) |
| Quality | Vitest unit tests, Playwright e2e, ESLint, `tsc --noEmit`, GitHub Actions CI on every push and PR |
| Platform | PWA (offline-capable), Vercel |

---

## Data sources

Every readout is real and attributed. Nothing is invented or decorative.

| Source | Data | Access |
|--------|------|--------|
| [STScI MAST](https://mast.stsci.edu/) | JWST, Hubble observations | Public API |
| [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) | Kepler exoplanets | Public TAP |
| [NASA APIs](https://api.nasa.gov/) | APOD, Near-Earth Objects | API key (server-side) |
| [NOAA SWPC](https://www.swpc.noaa.gov/) | Solar X-ray flux, space weather | Public |
| [Where the ISS at](https://wheretheiss.at/) | Live ISS position | Public |
| [CelesTrak](https://celestrak.org/) | Active satellite catalogue | Public |
| [Launch Library 2](https://thespacedevs.com/llapi) | Upcoming launches | Public |
| [Aladin Lite / CDS](https://aladin.cds.unistra.fr/) | Multi-wavelength sky surveys | Public |
| [CSIRO CASDA](https://casda.csiro.au/) | ASKAP radio data | Public TAP |

---

## Design system

Dark-first, always. Deep space void backgrounds with astronomy-authentic accents pulled from real emission lines and stellar cores.

| Role | Token | Hex |
|------|-------|-----|
| Deep space void | `cosmos-void` | `#0a0e1a` |
| Stellar gold (primary) | `cosmos-gold` | `#d4af37` |
| Infrared amber | `cosmos-amber` | `#ff9a3c` |
| Reflection-nebula blue | `cosmos-nebula-blue` | `#4a90e2` |
| H-alpha red | `cosmos-hydrogen` | `#ff6b6b` |

**Type:** Outfit (display) · Inter (body) · JetBrains Mono (data and timestamps, tabular numerals). WCAG 2.1 AA, keyboard navigable, `prefers-reduced-motion` treated as a first-class experience.

---

## Getting started

```bash
git clone https://github.com/m4cd4r4/cosmos-collective-v2.git
cd cosmos-collective-v2

npm install
cp .env.example .env.local   # add NASA_API_KEY (free at api.nasa.gov)

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The Gravitational Lens embed is a vendored build. To refresh it after an upstream change, see [`public/embeds/gravitational-lens/README.md`](public/embeds/gravitational-lens/README.md).

### Scripts

| Command | Does |
|---------|------|
| `npm run dev` | Development server |
| `npm run build` | Production build (type-checked and linted) |
| `npm run start` | Serve the production build |
| `npm test` | Vitest unit tests (watch mode); `npx vitest run` for a single pass |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint via `next lint` |

---

## Deployment

Hosted on Vercel. Production deploys are manual (`vercel --prod`) - pushing to `main` does not auto-deploy.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/m4cd4r4/cosmos-collective-v2)

---

## Credits

- **NASA / ESA / CSA / STScI** - JWST and Hubble imagery and data
- **NASA Exoplanet Archive** - Kepler mission data
- **NOAA SWPC** - space weather
- **CSIRO** - Australian radio telescope data
- **CDS Strasbourg** - Aladin Lite sky viewer
- **[550-AU](https://github.com/m4cd4r4/550-AU)** - the embedded Solar Gravitational Lens simulation (MIT)
- The open-source community, for the tools that made this possible

## License

MIT - see [LICENSE](LICENSE).

<div align="center">
<br />
<a href="https://cosmos-collective.com.au">Live Site</a> &bull;
<a href="https://cosmos-collective.com.au/gravitational-lens">Gravitational Lens</a>
</div>
