---
title: "Making Space Data Accessible to Everyone"
slug: accessible-space-data-visualization
date: 2025-12-04
category: accessibility
tags: [Accessibility, WCAG, Inclusive Design, UX]
author: "Developer"
reading_time: 8
excerpt: "Designing astronomical data visualisations that work for users of all abilities, with a focus on WCAG compliance and inclusive design."
---# Making Space Data Accessible to Everyone

The universe belongs to everyone. When building Cosmos Collective, accessibility wasn't an afterthought - it was a core design principle. Here's how I approached making astronomical data accessible to users of all abilities.

## The Challenge

Astronomy is inherently visual. Images of galaxies, nebulae, and deep fields are the primary way we share discoveries. But what about users who:
- Have low vision or blindness?
- Have colour vision deficiency?
- Use screen readers?
- Navigate with keyboards only?
- Have cognitive or learning differences?

## WCAG 2.1 AA Compliance

We target WCAG 2.1 Level AA compliance across the platform:

### Perceivable

**Colour Contrast**: All text meets 4.5:1 minimum contrast ratio:

```css
/* High contrast against dark background */
--text-primary: #ffffff;        /* 21:1 on void */
--text-secondary: #9ca3af;      /* 5.5:1 on void */
--cosmos-gold: #d4af37;         /* 6.2:1 on void */
```

**Non-colour indicators**: Information isn't conveyed by colour alone:

```tsx
{/* Uses both color AND pattern */}
<span
  className="w-2 h-2 rounded-full"
  style={{
    backgroundColor: wavelengthInfo.color,
    // Pattern class adds visual distinction
  }}
  className={cn(wavelengthInfo.pattern)}
/>
```

### Operable

**Keyboard Navigation**: All interactive elements are keyboard accessible:

```tsx
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
  tabIndex={0}
>
```

**Focus Indicators**: Clear, visible focus rings:

```css
:focus-visible {
  outline: 2px solid var(--cosmos-gold);
  outline-offset: 2px;
}
```

**Reduced Motion**: Respecting user preferences:

```tsx
const prefersReducedMotion = useReducedMotion()

// Skip animations if user prefers reduced motion
if (prefersReducedMotion) {
  return <StaticStarfield />
}
```

### Understandable

**Clear Labels**: Form inputs have visible labels:

```tsx
<label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
  Search Object
</label>
<input
  type="text"
  aria-label="Search for astronomical objects"
  placeholder="M31, NGC 1234..."
/>
```

**Error Prevention**: Confirmations for destructive actions, clear error messages.

### Robust

**Semantic HTML**: Using proper HTML elements:

```tsx
<nav aria-label="Main navigation">
  <ul role="list">
    <li><Link href="/explore">Explore</Link></li>
  </ul>
</nav>
```

**ARIA Labels**: Screen reader descriptions for complex widgets:

```tsx
<div
  role="img"
  aria-label={`Image of ${observation.targetName}, a ${observation.category}
               observed by ${observation.source} on ${observation.observationDate}`}
>
```

## Alternatives for Visual Content

### Image Descriptions

Every astronomical image includes:
- Alt text with object name and type
- Detailed description in info panel
- AI-generated analysis available via screen reader

### Data Tables

Complex data is available in accessible table format:

```tsx
<table role="table" aria-label="Observation metadata">
  <thead>
    <tr>
      <th scope="col">Property</th>
      <th scope="col">Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Coordinates</th>
      <td>{formatCoordinates(coords)}</td>
    </tr>
  </tbody>
</table>
```

### Sky Map Accessibility

The Aladin Lite sky map includes:
- Screen reader announcements for position changes
- Keyboard shortcuts for navigation
- Text-based coordinate display
- Catalogue search as alternative to visual browsing

## Testing

Accessibility testing includes:
- **Automated**: axe-core, Lighthouse
- **Manual**: Keyboard-only navigation, screen reader testing
- **User testing**: Feedback from users with disabilities

## The Broader Impact

Making astronomical data accessible has benefits beyond compliance:
- Better mobile experience (touch targets, clear labels)
- Improved SEO (semantic structure)
- Clearer communication (forced clarity in descriptions)
- Wider audience reach

The universe is for everyone. Our tools should be too.
