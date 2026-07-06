# Brand: Cosmos Collective

> Mode: **alternative** (locked identity, open style). Do not assume the current site's palette, typography, or glassmorphism are load-bearing. They are not. Propose a different visual answer.

## Positioning

Hobbyist astronomers, space-curious adults, and late-night browsers who arrive wanting to *feel something* about the universe and walk away knowing something concrete. Desktop and tablet, often after dark, often alone with a coffee. The job is to turn real astronomical data into emotional encounters. Not academic. Not a textbook. A telescope you can poke.

Voice rules, with examples from the actual product domain:

- Yes: "Saturn's rings are about 30 metres thick on average. Here's where you're looking right now."
- No: "Welcome to the Cosmos Collective platform, your premier destination for space content."
- Yes: "JWST took 6.5 hours to capture this. You are seeing 13 billion years of light."
- No: "Discover the universe through cutting-edge AI-powered visualisations."
- Confidence in the data, restraint in the prose. Specific numbers beat adjectives every time.

Feel anchor: a planetarium console operated by someone who has been doing this for thirty years and still goes quiet when the lights go down.

## Non-negotiables (identity, not style)

1. **The solar system is the hero, not a feature.** It is the front door, the main event, the thing the rest of the site orbits around. A landing experience that does not make the solar system the centre of gravity has failed the brief.
2. **Every datum is real, sourced, and dated.** NASA, STScI, CSIRO, ESA. Sources visible to the user, not hidden. No invented numbers, no decorative fake data.
3. **The interface should feel like looking *through* something** — a telescope, a window, a viewport. Not a webpage decorated with space images.
4. **Wonder beats pedagogy.** The site rewards exploration ("what happens if I click this?") over reading. Walls of explanatory text are credibility theatre.
5. **Accessible to a curious person with no astronomy background.** A 14-year-old should be able to navigate the solar system. Jargon is allowed only if a hover or click reveals what it means.
6. **Reduced motion is honoured as a first-class experience.** The default is animated and atmospheric. The reduced-motion variant is just as expressive in stills, never a stripped-down apology.
7. **Live data must look live.** Anything streaming (sun activity, ISS position, current sky) must be visibly fresh, with a timestamp the user can trust.

## Open for reinterpretation

Propose an answer for each axis with intent. Do not default to the obvious.

- **Colour palette** — describe by role, not by hex. Required roles: a colour for "deep, undisturbed space"; a colour for "incandescent, energetic, hot" (stellar cores, infrared sources); a colour for "cool, reflective, atmospheric"; a colour that signals streaming/live data is fresh. Dark-on-dark is one valid answer; a high-key cyanotype answer is another; a black-and-gold serif-magazine answer is a third. Pick with intent.
- **Typography** — find a pairing that carries gravity for celestial body names without reading as luxury-brand corporate, plus a workhorse for live data tables and timestamps. Numerals must be tabular for live readouts. Avoid the obvious "futuristic geometric sans + monospace data" cliché unless you can defend it.
- **Corner language** — sharp, soft, mixed, telescope-iris-shaped, half-circle. Pick one register and hold it.
- **Elevation and depth** — how does the UI signal "this is information overlaid on a vast scene" versus "this is the scene"? Could be glass and blur, could be windowed insets, could be flat with hairline rules, could be parallax-only. Propose with intent.
- **Motion language** — orbital, drift, parallax, scroll-triggered reveals, fully still. The solar system hero needs *some* motion direction since it is the main event; the rest of the site should take its cue from there.
- **Texture and surface** — film grain, no grain, halftone, high-fidelity render, low-poly, pixelated. Pick a register and hold it.
- **Page set** — propose based on user jobs below. Existing routes (solar system, JWST, exoplanets, sky map, observatory, spacecraft, events) are inputs to consolidate, not a list to preserve verbatim.

## User jobs

Each is a quote from inside a user's head. Every page you produce should serve at least one.

1. *"I want to see the solar system right now. Where is everything? How fast is it moving?"*
2. *"What has JWST looked at this week? Show me the new images and tell me what I am seeing."*
3. *"How many exoplanets have we found? Which one is the weirdest?"*
4. *"Is the sun doing anything dramatic right now? Are auroras likely tonight?"*
5. *"Where in the sky is Mars from where I am standing?"*
6. *"I just heard about [event]. What actually happened, in one screen, with the real data?"*

If a page exists for any reason other than serving one of these, it is dead weight and should not be in the proposal.

## Page set

Propose your own. The constraints:

- A **landing experience** built around the solar system hero. The hero must read instantly as the centre of gravity, not as a banner ornament.
- A **dedicated solar system explorer** as a destination page, deeper and more interactive than the landing hero. The landing teases; the explorer delivers.
- A **JWST or imagery view** showing one image at a time with the data behind it (date, exposure, target, instrument).
- An **exoplanets browser** that opens with one genuinely weird planet front and centre, with the catalogue accessible from there.
- A **live sun / space weather view** showing today's state with real, timestamped readouts.

Optional: a sky-from-here view, an events/news stream, a spacecraft tracker. Include only if you can defend their position in the navigation against the six user jobs above.

## Forbidden

Credibility killers. Do not produce any of these:

- AI-slop signifiers: sparkles, "Powered by AI" badges, generic chatbot avatars, "Pro" or "Premium" tier markers, gradient unicorn shimmer, animated typewriter effects on body copy.
- Wellness or productivity-app voice: "your cosmic journey," "unlock the universe," "discover yourself among the stars."
- Decorative or invented data. No fake exoplanet names, no synthesised "JWST-style" imagery, no rounded "approximately" numbers presented as exact, no placeholder lorem-ipsum dressed up as scientific text.
- Em-dashes, en-dashes, ellipsis character. Use a hyphen or rewrite the sentence.
- Stock-photo astronaut helmets reflecting earth. Stock-photo silhouettes pointing at the night sky. Both are credibility killers on a real-data site.
- Generic "futuristic dashboard" tropes: scanline overlays, fake CRT bezels, neon HUD reticles unless the choice is genuinely defensible against the brand.

## Deliverable

Full design system tokens, plus the following pages demonstrating the system in use:

1. **Landing** — solar-system-as-hero, with secondary navigation for JWST, Exoplanets, Live Sun.
2. **Solar System explorer** — the destination version, deeper than the landing hero. Planets selectable, real orbital and physical data on selection.
3. **JWST gallery** — one image foregrounded, with the data behind it visible.
4. **Exoplanets browser** — opens on one weird planet, full catalogue reachable.
5. **Live Sun / space weather** — current state, timestamped, with a "today / 7 days" toggle.

Prefer distinctive choices over safe ones. If a choice would render the site indistinguishable from a generic dark-mode space dashboard, reject it and try again.
