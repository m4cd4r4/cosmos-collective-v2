'use client'

/**
 * Citizen Science Preview Component
 * Highlights citizen science opportunities
 */

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, Star, Trophy, Sparkles, ArrowRight } from 'lucide-react'

// ============================================
// Citizen Science Projects
// ============================================

const projects = [
  {
    id: 'galaxy-zoo',
    name: 'Galaxy Zoo',
    description: 'Classify galaxy shapes and help train AI models',
    difficulty: 'beginner',
    contributions: '100M+',
    icon: '🌀',
    color: 'cyan',
  },
  {
    id: 'radio-galaxy-zoo',
    name: 'Radio Galaxy Zoo',
    description: 'Match radio sources to optical galaxies — SKA pathfinder science',
    difficulty: 'intermediate',
    contributions: '2M+',
    icon: '📡',
    color: 'gold',
  },
  {
    id: 'planet-hunters',
    name: 'Planet Hunters TESS',
    description: 'Find exoplanets in transit data from NASA',
    difficulty: 'beginner',
    contributions: '30M+',
    icon: '🪐',
    color: 'purple',
  },
  {
    id: 'supernova-hunters',
    name: 'Supernova Hunters',
    description: 'Discover stellar explosions in real-time survey data',
    difficulty: 'intermediate',
    contributions: '5M+',
    icon: '💥',
    color: 'pink',
  },
]

const benefits = [
  {
    icon: Star,
    title: 'Make Real Discoveries',
    description: 'Citizen scientists have discovered new planets, galaxies, and phenomena.',
  },
  {
    icon: Trophy,
    title: 'Earn Recognition',
    description: 'Get credited in scientific papers and earn badges for your contributions.',
  },
  {
    icon: Users,
    title: 'Join a Community',
    description: 'Connect with millions of volunteers and professional astronomers.',
  },
  {
    icon: Sparkles,
    title: 'Learn While Contributing',
    description: 'Access tutorials, talk forums, and educational resources.',
  },
]

// ============================================
// Citizen Science Preview Component
// ============================================

export function CitizenSciencePreview() {
  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-cyan/10 border border-cosmos-cyan/30 mb-4">
          <Users className="w-4 h-4 text-cosmos-cyan" />
          <span className="text-sm text-cosmos-cyan font-medium">
            Real Science, Real Impact
          </span>
        </div>
        <h2
          id="citizen-science-heading"
          className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
        >
          Become a <span className="text-cosmos-cyan">Citizen Scientist</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Contribute to real astronomical research from your browser.
          No prior experience needed — your eyes and brain are the best pattern recognition tools!
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {projects.map((project) => (
          <Card key={project.id} variant="interactive" padding="md" className="group">
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{project.icon}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    project.difficulty === 'beginner'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {project.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cosmos-cyan transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400 mb-3">{project.description}</p>
              <div className="text-xs text-gray-500">
                {project.contributions} classifications
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits */}
      <div className="glass-panel rounded-xl p-6 md:p-8 mb-8">
        <h3 className="text-xl font-bold text-white text-center mb-8">
          Why Participate?
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-cosmos-cyan/10 flex items-center justify-center mx-auto mb-3">
                <benefit.icon className="w-6 h-6 text-cosmos-cyan" />
              </div>
              <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
              <p className="text-sm text-gray-400">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-400 mb-4">
          Link your Zooniverse, Galaxy Zoo, or other citizen science accounts to showcase your contributions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            leftIcon={<Users className="w-5 h-5" />}
            asChild
          >
            <Link href="/citizen-science">Start Contributing</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            asChild
          >
            <a
              href="https://www.zooniverse.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Zooniverse
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
