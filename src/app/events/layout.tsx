/**
 * Events Page Layout
 * Provides metadata for the events page (client component can't export metadata)
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Events',
  description: 'Real-time astronomical events including meteor showers, asteroid approaches, ISS tracking, space weather alerts, and NASA Astronomy Picture of the Day.',
  openGraph: {
    title: 'Live Events | Cosmos Collective',
    description: 'Track real-time astronomical events, meteor showers, ISS position, and space weather.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Events | Cosmos Collective',
    description: 'Track real-time astronomical events, meteor showers, ISS position, and space weather.',
  },
  keywords: [
    'meteor showers',
    'ISS tracker',
    'space weather',
    'asteroid tracking',
    'near earth objects',
    'astronomical events',
    'APOD',
    'astronomy picture of the day',
  ],
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
