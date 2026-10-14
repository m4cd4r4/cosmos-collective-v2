---
title: "December 2025: Expanded Events Calendar & Smart Banner"
slug: december-2025-events-expansion
date: 2025-12-08
category: data-integration
tags: [Events, Astronomy, Meteor Showers, Eclipses, Lunar, Conjunctions, Launches, UX]
author: "Developer"
reading_time: 4
featured: true
excerpt: "Major expansion of the Live Events system with 50+ astronomical events including lunar phases, eclipses, planetary conjunctions, and rocket launches."
---# December 2025: Expanded Events Calendar

The Live Events system has received a major overhaul, expanding from a handful of events to over 50 astronomical phenomena throughout the year.

## New Event Types

### Lunar Events
- Full moons with traditional names (Wolf Moon, Snow Moon, etc.)
- Supermoons highlighted with special severity
- New moons for optimal deep-sky observation

### Eclipses
- Solar eclipses (total, partial, annular) through 2026
- Lunar eclipses with Blood Moon visibility
- Visibility regions and peak times included

### Planetary Conjunctions
- Close approaches between planets
- Planet-Moon conjunctions
- Opposition events (Saturn, Jupiter at peak brightness)

### Rocket Launches
- Major upcoming launches (Starship, Artemis II)
- Links to live webcasts
- Crewed missions highlighted

## Smart Banner Filtering

The scrolling live events banner now intelligently filters events:

- Prioritizes ongoing events (shown first)
- Shows only notable+ severity to reduce noise
- Sorts by date proximity for relevance
- Caps at 10 events for smooth animation

## UX Improvements

### Click-to-Scroll
Clicking an event in the banner now scrolls directly to that event on the Events page with a temporary highlight effect.

### Show More Pagination
Events page now loads 8 events initially with a "Show More" button to progressively reveal the full list.

### Responsive Cards
All event cards are now clickable, linking to relevant external resources (IMO, NASA, TimeAndDate, etc.).

## Technical Details

| Component | Changes |
|-----------|---------|
| `real-time-events.ts` | Added getLunarEvents(), getEclipses(), getPlanetaryConjunctions(), getUpcomingLaunches() |
| `LiveEventsBar.tsx` | Priority filtering, limit to 10 events |
| `events/page.tsx` | Pagination state, Show More button, scroll-to behavior |
| `astronomy.ts` | New EventTypes: 'lunar', 'conjunction' |

## What's Next

- Integration with launch APIs for real-time schedule updates
- User location-based visibility filtering
- Event reminders and notifications
