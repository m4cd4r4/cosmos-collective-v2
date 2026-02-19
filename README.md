# Cosmos Collective

**[cosmos-collective.com.au](https://cosmos-collective.com.au)**

> A Multi-Spectrum Astronomical Data Exploration Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Website](https://img.shields.io/badge/Website-cosmos--collective.com.au-06b6d4?style=flat-square&logo=vercel)](https://cosmos-collective.com.au)

Cosmos Collective is an interactive platform for exploring the universe through multiple wavelengths of light. From a 3D solar system you can fly through, to JWST's stunning infrared imagery and Australian radio telescopes scanning for signals across the cosmos, this project bridges the gap between professional astronomy and public engagement through citizen science.

![Cosmos Collective - Interactive Solar System](./public/images/hero-solar-system.png)

## Features

### Interactive Solar System
- Real-time 3D solar system with accurate orbital mechanics powered by Three.js
- Zoom out to view our position in the Milky Way galaxy using NASA/JPL-Caltech imagery
- Planet dive mode, adjustable simulation speed, and orbital trail visualisation

### Multi-Wavelength Exploration
- **JWST Gallery**: Browse infrared observations from the James Webb Space Telescope
- **Hubble Gallery**: Classic optical imagery including nebulae, galaxies, and star clusters
- **Australian Radio Telescopes**: Access data from ASKAP, MWA, and Parkes (10+ observations)
- **Multi-Spectrum Comparison**: View the same object across different wavelengths

### Interactive Sky Map
- Pan and zoom across the entire celestial sphere using Aladin Lite
- Search by object name, coordinates, or constellation
- Layer radio, infrared, optical, and X-ray survey data
- Quick navigation to popular deep sky objects

### Real-Time Events & ISS Cameras
- Live feed of astronomical events (meteor showers, asteroids, solar activity)
- ISS tracking with real-time orbital position
- **ISS Live Cameras** - Watch Earth from space via 3 NASA YouTube streams
- Space weather alerts and notifications

### Citizen Science (In development)
- Contribute to real astronomical research
- Galaxy classification tasks with real NASA imagery
- Radio source matching for SKA pathfinder science
- 12 classification tasks across 6 Zooniverse-style projects
- Track your contributions and earn badges

### SKA (Square Kilometre Array) Showcase
- Learn about the world's largest radio telescope
- Links to SKAO and CSIRO resources
- Understand how SKA will revolutionise astronomy

### Accessibility First
- WCAG 2.1 AA compliant with dedicated [Accessibility page](/accessibility)
- Screen reader optimised with ARIA labels
- Full keyboard navigation throughout
- High contrast colour palette
- Reduced motion support
- Semantic HTML structure

## Recently Added

- **Expanded Event Calendar** - 50+ astronomical events including lunar phases, eclipses, planetary conjunctions, and rocket launches
- **Smart Banner Filtering** - Live events banner prioritizes ongoing and high-severity events
- **Responsive Event Cards** - All event cards now clickable with external references
- **Show More Pagination** - Events page loads progressively to avoid overwhelming users
- **Scroll-to Event** - Click banner events to jump directly to that event on the events page

## Architecture

```
cosmos-collective/v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── explore/           # Observation browser
│   │   ├── sky-map/           # Interactive sky map
│   │   ├── events/            # Live events
│   │   ├── citizen-science/   # Classification tasks
│   │   ├── devlog/            # Technical blog
│   │   └── dashboard/         # User dashboard
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── features/          # Feature-specific components
│   │   ├── layout/            # Layout components
│   │   └── accessibility/     # A11y components
│   ├── services/              # API integrations
│   │   ├── mast-api.ts        # STScI MAST API
│   │   ├── australian-telescopes.ts
│   │   └── real-time-events.ts
│   ├── store/                 # Zustand state management
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities
│   └── types/                 # TypeScript definitions
├── public/                    # Static assets
└── ...config files
```

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/m4cd4r4/cosmos-collective-v2.git
cd cosmos-collective-v2

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

See `.env.example` for all available configuration options. At minimum, you'll need:

- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXT_PUBLIC_NASA_API_KEY`: Get free at [api.nasa.gov](https://api.nasa.gov/)

## Data Sources

| Source | Data Type | Access |
|--------|-----------|--------|
| [STScI MAST](https://mast.stsci.edu/) | JWST, Hubble observations | Public API |
| [CSIRO CASDA](https://casda.csiro.au/) | ASKAP radio data | Public TAP |
| [NASA APIs](https://api.nasa.gov/) | APOD, NEO, Mars Rovers | Free API key |
| [Zooniverse](https://www.zooniverse.org/) | Citizen science projects | Public API |
| [NOAA SWPC](https://www.swpc.noaa.gov/) | Space weather | Public |

## Design System

### Colour Palette - "Cosmic Optimism"

| Colour | Hex | Usage |
|-------|-----|-------|
| Void | `#030014` | Primary background |
| Stellar Cyan | `#06b6d4` | Primary accent, radio waves |
| Solar Gold | `#f59e0b` | Secondary accent, visible light |
| Aurora Purple | `#a855f7` | Tertiary, UV representation |
| Nebula Pink | `#ec4899` | Highlights, infrared |

### Typography

- **Display**: Space Grotesk - Headlines and branding
- **Body**: Inter - Body text and UI
- **Mono**: JetBrains Mono - Code and data

## Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/m4cd4r4/cosmos-collective-v2)

**Live Demo**: [cosmos-collective.com.au](https://cosmos-collective.com.au)

### Other Platforms

The app can be deployed to any platform supporting Next.js:

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Learn More

- [Technical Devlog](https://cosmos-collective.com.au/devlog) - Implementation details and decisions
- [SKA Observatory](https://www.skao.int/) - Learn about the Square Kilometre Array
- [CSIRO ATNF](https://www.atnf.csiro.au/) - Australia Telescope National Facility
- [STScI](https://www.stsci.edu/) - Space Telescope Science Institute

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **NASA/ESA/CSA/STScI** - JWST imagery and data
- **CSIRO** - Australian radio telescope data
- **Zooniverse** - Citizen science platform
- **Open source community** - For the amazing tools and libraries

---

<p align="center">
  <a href="https://cosmos-collective.com.au">Live Site</a> •
  <a href="https://cosmos-collective.com.au/devlog">Devlog</a> •
</p>
