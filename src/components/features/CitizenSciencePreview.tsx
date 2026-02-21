'use client'

/**
 * Citizen Science Preview Component
 * Highlights citizen science opportunities with real project data,
 * animated progress bars, and an inline mini classification demo
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FEATURED_ZOONIVERSE_PROJECTS, getClassificationTasks } from '@/services/zooniverse-api'
import type { ClassificationTask } from '@/types'
import { cn } from '@/lib/utils'
import { Users, Star, Trophy, Sparkles, ArrowRight, CheckCircle2, Microscope } from 'lucide-react'

// ============================================
// Project Icons & Colors
// ============================================

const projectMeta: Record<string, { icon: string; color: string }> = {
  'galaxy-zoo-jwst': { icon: '🌀', color: 'cyan' },
  'radio-galaxy-zoo': { icon: '📡', color: 'gold' },
  'supernova-hunters': { icon: '💥', color: 'pink' },
  'planet-hunters-tess': { icon: '🪐', color: 'purple' },
  'muon-hunters': { icon: '⚡', color: 'blue' },
  'askap-emu': { icon: '🔭', color: 'green' },
}

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
// Mini Classification Demo
// ============================================

function ClassificationDemo() {
  const [task, setTask] = useState<ClassificationTask | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [totalClassified, setTotalClassified] = useState(0)

  useEffect(() => {
    // Grab a galaxy morphology task for the demo
    const tasks = getClassificationTasks('galaxy-zoo-jwst')
    if (tasks.length > 0) setTask(tasks[0])
  }, [])

  const handleClassify = (value: string) => {
    setSelected(value)
    setTotalClassified((c) => c + 1)

    // After brief feedback, load the next task
    setTimeout(() => {
      const tasks = getClassificationTasks('galaxy-zoo-jwst')
      const next = tasks[Math.floor(Math.random() * tasks.length)]
      setTask(next)
      setSelected(null)
    }, 1500)
  }

  if (!task) return null

  return (
    <div className="glass-panel rounded-xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Microscope className="w-4 h-4 text-cosmos-gold" />
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Try It Now</h4>
        {totalClassified > 0 && (
          <span className="ml-auto text-xs text-cosmos-gold bg-cosmos-gold/10 px-2 py-0.5 rounded-full">
            {totalClassified} classified
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Subject image */}
        <div className="w-full md:w-40 h-40 md:h-auto rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
          <img
            src={task.subjectUrl}
            alt="Galaxy to classify"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Question + options */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 mb-3">{task.instructions}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {task.options?.map((opt) => {
              const isSelected = selected === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => !selected && handleClassify(opt.value)}
                  disabled={!!selected}
                  className={cn(
                    'text-left px-3 py-2 rounded-lg border transition-all text-sm',
                    isSelected
                      ? 'border-cosmos-gold bg-cosmos-gold/20 text-cosmos-gold'
                      : selected
                        ? 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-cosmos-gold/50 hover:bg-cosmos-gold/10 cursor-pointer',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="font-medium">{opt.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                </button>
              )
            })}
          </div>
          {selected && (
            <p className="text-xs text-cosmos-gold mt-2 animate-fadeIn">
              Classification recorded! Loading next subject...
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 text-center">
        <Link
          href="/citizen-science"
          className="text-xs text-cosmos-gold hover:text-white transition-colors"
        >
          Want to classify more? Join the full Citizen Science experience →
        </Link>
      </div>
    </div>
  )
}

// ============================================
// Animated Progress Bar
// ============================================

function ProjectProgress({ completeness, inView, delay }: { completeness: number; inView: boolean; delay: number }) {
  const pct = Math.round(completeness * 100)
  return (
    <div className="mt-2">
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cosmos-gold/80 to-cosmos-gold transition-all duration-1000 ease-out"
          style={{
            width: inView ? `${pct}%` : '0%',
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] mt-1">
        <span className="text-gray-500">{pct}% complete</span>
        <span className="text-gray-500">
          {(completeness * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

// ============================================
// Citizen Science Preview Component
// ============================================

export function CitizenSciencePreview() {
  const [inView, setInView] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Use first 4 featured projects for the preview grid
  const displayProjects = FEATURED_ZOONIVERSE_PROJECTS.slice(0, 4)

  return (
    <div ref={sectionRef}>
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-gold/10 border border-cosmos-gold/30 mb-4">
          <Users className="w-4 h-4 text-cosmos-gold" />
          <span className="text-sm text-cosmos-gold font-medium">
            Real Science, Real Impact
          </span>
        </div>
        <h2
          id="citizen-science-heading"
          className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
        >
          Become a <span className="text-cosmos-gold">Citizen Scientist</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Contribute to real astronomical research from your browser.
          No prior experience needed — your eyes and brain are the best pattern recognition tools!
        </p>
      </div>

      {/* Projects Grid with Real Data */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {displayProjects.map((project, i) => {
          const meta = projectMeta[project.id] || { icon: '🔬', color: 'gray' }
          return (
            <Card key={project.id} variant="interactive" padding="md" className="group">
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{meta.icon}</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      project.state === 'live'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400',
                    )}
                  >
                    {project.state}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cosmos-gold transition-colors">
                  {project.displayName}
                </h3>
                <p className="text-sm text-gray-400 mb-3">{project.description}</p>
                <div className="text-xs text-gray-500">
                  {project.classifications_count.toLocaleString()} classifications
                </div>
                <ProjectProgress
                  completeness={project.completeness}
                  inView={inView}
                  delay={i * 200}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mini Classification Demo */}
      <div className="mb-8">
        <ClassificationDemo />
      </div>

      {/* Benefits */}
      <div className="glass-panel rounded-xl p-6 md:p-8 mb-8">
        <h3 className="text-xl font-bold text-white text-center mb-8">
          Why Participate?
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-cosmos-gold/10 flex items-center justify-center mx-auto mb-3">
                <benefit.icon className="w-6 h-6 text-cosmos-gold" />
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
