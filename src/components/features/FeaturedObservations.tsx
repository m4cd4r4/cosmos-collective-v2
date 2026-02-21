'use client'

/**
 * Featured Observations — Observatory Preview
 * Interactive sky chart preview with CTA to full Deep Space Observatory
 */

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Aperture, ArrowRight, Sparkles, Layers, SlidersHorizontal, Eye } from 'lucide-react'

const ObservatoryViewer = dynamic(
  () =>
    import('@/components/features/observatory/ObservatoryViewer').then((m) => ({
      default: m.ObservatoryViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-cosmos-gold animate-spin" />
      </div>
    ),
  },
)

const features = [
  {
    icon: Sparkles,
    title: '33 Iconic Observations',
    description: 'JWST and Hubble highlights plotted on a real Aitoff all-sky projection.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Multi-Axis Filtering',
    description: 'Filter by telescope, wavelength band, object category, and distance.',
  },
  {
    icon: Layers,
    title: 'Three View Modes',
    description: 'Sky Map, Distance, and Timeline projections for different perspectives.',
  },
  {
    icon: Eye,
    title: 'Rich Detail Panels',
    description: 'Scientific context, fun facts, and NASA imagery for every observation.',
  },
]

export function FeaturedObservations() {
  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-gold/10 border border-cosmos-gold/30 mb-4">
          <Aperture className="w-4 h-4 text-cosmos-gold" />
          <span className="text-sm text-cosmos-gold font-medium">
            Interactive Sky Chart
          </span>
        </div>
        <h2
          id="featured-heading"
          className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
        >
          Deep Space <span className="text-gradient-stellar">Observatory</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore 33 iconic JWST and Hubble observations on an interactive
          celestial sky chart. Click any star to uncover scientific analysis,
          fun facts, and NASA imagery.
        </p>
      </div>

      {/* Preview + Features */}
      <div className="grid lg:grid-cols-5 gap-8 mb-8">
        {/* Embedded Preview */}
        <div className="lg:col-span-3 relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-cosmos-void group">
          <ObservatoryViewer preview />
          {/* Overlay link to full experience */}
          <Link
            href="/observatory"
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 glass-panel rounded-lg px-6 py-3 text-white font-medium flex items-center gap-2">
              Open Full Observatory <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-panel rounded-xl p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-cosmos-gold/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-cosmos-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          size="lg"
          leftIcon={<Aperture className="w-5 h-5" />}
          asChild
        >
          <Link href="/observatory">Launch Deep Space Observatory</Link>
        </Button>
      </div>
    </div>
  )
}
