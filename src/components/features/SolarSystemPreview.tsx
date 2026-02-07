'use client'

/**
 * Solar System Preview Component
 * Homepage teaser for the interactive 3D Solar System
 */

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Orbit, ArrowRight, Compass, Zap, Globe } from 'lucide-react'

const features = [
  {
    icon: Orbit,
    title: 'Photorealistic Planets',
    description: 'NASA Solar System Scope 2K textures on all 8 planets, Earth clouds, and Saturn rings.',
  },
  {
    icon: Compass,
    title: 'Earth Dive Experience',
    description: 'Press D to dive from space into low-Earth orbit. Watch cities glow on the night side.',
  },
  {
    icon: Zap,
    title: 'Fresnel Atmospheres',
    description: 'GLSL shader-driven atmospheric glow on Earth, Venus, Mars, Jupiter, and Neptune.',
  },
  {
    icon: Globe,
    title: 'Follow Any Body',
    description: 'Lock the camera to follow the Sun, any planet, or the Moon through its orbit.',
  },
]

export function SolarSystemPreview() {
  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-amber/10 border border-cosmos-amber/30 mb-4">
          <Orbit className="w-4 h-4 text-cosmos-amber" />
          <span className="text-sm text-cosmos-amber font-medium">
            Interactive 3D Experience
          </span>
        </div>
        <h2
          id="solar-system-heading"
          className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
        >
          Explore Our <span className="text-gradient-stellar">Solar System</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          A real-time 3D visualization with photorealistic NASA textures,
          orbital mechanics, and atmospheric effects. Built with Three.js and WebGL.
        </p>
      </div>

      {/* Preview + Features */}
      <div className="grid lg:grid-cols-5 gap-8 mb-8">
        {/* Embedded Preview */}
        <div className="lg:col-span-3 relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-cosmos-void group">
          <iframe
            src="/solar-system/index.html"
            title="Solar System 3D Preview"
            className="w-full h-full border-0"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
          {/* Overlay link to full experience */}
          <Link
            href="/solar-system"
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 glass-panel rounded-lg px-6 py-3 text-white font-medium flex items-center gap-2">
              Open Full Experience <ArrowRight className="w-4 h-4" />
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
              <div className="w-10 h-10 rounded-lg bg-cosmos-amber/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-cosmos-amber" />
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
          leftIcon={<Orbit className="w-5 h-5" />}
          asChild
        >
          <Link href="/solar-system">Launch Solar System Explorer</Link>
        </Button>
      </div>
    </div>
  )
}
