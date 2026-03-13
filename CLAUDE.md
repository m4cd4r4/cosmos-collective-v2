# Cosmos Collective v2

## Design Context

### Users
Space enthusiasts and hobbyists - curious people who love astronomy but aren't professionals. They arrive wanting to explore real astronomical data (JWST images, exoplanets, solar weather) in an interactive, visual way. Context: browsing at home on desktop or tablet, often late at night. The job: satisfy curiosity about the universe through real data presented beautifully.

### Brand Personality
**Awe-inspiring, Scientific, Accessible.** Wonder-driven exploration of real astronomical data, made approachable for everyone. The tone is confident and knowledgeable without being academic. Data is always real (NASA, STScI, CSIRO) but presentation prioritizes emotional impact alongside scientific accuracy.

### Aesthetic Direction
- **Dark-first**: Deep space void (#0a0e1a) background, always. No light mode.
- **Glassmorphism**: Glass panels with backdrop blur, subtle white borders, cosmic shadows
- **Astronomy-authentic colors**: Gold (#d4af37) from stellar cores, amber (#ff9a3c) from infrared, nebula blue (#4a90e2) from reflection nebulae, hydrogen red (#ff6b6b) from H-alpha emission
- **Typography**: Outfit (display/headlines), Inter (body), JetBrains Mono (data/code)
- **Motion**: Purposeful animations - twinkling stars, orbital rotations, scroll reveals. Respect prefers-reduced-motion.
- **Data-dense**: Compact spacing, information-rich panels, scientific data front and center

### Design Principles
1. **Real data, real wonder** - Every visualization uses authentic astronomical data. Never fake it.
2. **Dark sky, bright details** - Deep void backgrounds with gold/amber accents that pop like stars against the night.
3. **Explore, don't explain** - Interactive discovery over walls of text. Let users find their own path through the cosmos.
4. **Accessible universe** - WCAG 2.1 AA, keyboard navigation, reduced motion support. The cosmos is for everyone.
5. **Glass and glow** - Glassmorphism panels, glow shadows, grain textures. The UI itself should feel like looking through a telescope.

### Design System Reference
- **Tailwind config**: `tailwind.config.ts` - Full color palette, animations, glass components
- **Global CSS**: `src/styles/globals.css` - Base styles, component classes, utilities
- **UI components**: `src/components/ui/` - Button, Card, Starfield, Skeleton, etc.
- **Icons**: Lucide React
- **Animation**: Framer Motion + Tailwind keyframes
- **State**: Zustand + React Query

### Tech Stack
Next.js 14 (App Router) | React 18 | TypeScript | Tailwind CSS 3 | Radix UI | Three.js | Framer Motion | Zustand
