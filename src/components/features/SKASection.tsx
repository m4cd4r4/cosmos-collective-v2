'use client'

/**
 * SKA (Square Kilometre Array) Section
 * Interactive timeline, animated comparison bars, and live data counter
 */

import { useState, useEffect, useRef } from 'react'
import { getSKAScienceGoals, getSKATimeline, getSKAComparison } from '@/services/australian-telescopes'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { ExternalLink, CheckCircle2, Clock, Circle } from 'lucide-react'

// ============================================
// Data Counter Hook (710 PB/day = ~8.217 TB/s)
// ============================================

const PB_PER_SECOND = 710 / 86400

function useDataCounter(): string {
  const [display, setDisplay] = useState('0.000')
  const startRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = performance.now()

    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000
      const pb = elapsed * PB_PER_SECOND
      setDisplay(pb.toFixed(3))
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return display
}

// ============================================
// Animated Bar Component
// ============================================

function ComparisonBar({
  label,
  currentLabel,
  skaLabel,
  ratio,
  description,
  inView,
  delay,
}: {
  label: string
  currentLabel: string
  skaLabel: string
  ratio: number
  description: string
  inView: boolean
  delay: number
}) {
  const currentWidth = Math.max(2, (1 / ratio) * 100)

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">{label}</div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Current</span>
            <span className="text-gray-400">{currentLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gray-500 transition-all duration-1000 ease-out"
              style={{
                width: inView ? `${currentWidth}%` : '0%',
                transitionDelay: `${delay}ms`,
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-cosmos-nebula-blue font-medium">SKA</span>
            <span className="text-cosmos-nebula-blue font-bold">{skaLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-cosmos-nebula-blue transition-all duration-1500 ease-out"
              style={{
                width: inView ? '100%' : '0%',
                transitionDelay: `${delay + 200}ms`,
              }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
  )
}

// ============================================
// SKA Section Component
// ============================================

export function SKASection() {
  const scienceGoals = getSKAScienceGoals()
  const timeline = getSKATimeline()
  const comparison = getSKAComparison()
  const dataCount = useDataCounter()

  const [inView, setInView] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Find the index of the in-progress item for the timeline progress line
  const inProgressIndex = timeline.findIndex((t) => t.status === 'in-progress')
  const progressPercent = inProgressIndex >= 0 ? ((inProgressIndex + 0.5) / (timeline.length - 1)) * 100 : 0

  // Comparison bar data
  const comparisonBars = [
    { label: 'Sensitivity', ratio: 50, key: 'sensitivity' as keyof typeof comparison },
    { label: 'Survey Speed', ratio: 100, key: 'surveySpeed' as keyof typeof comparison },
    { label: 'Resolution', ratio: 50, key: 'resolution' as keyof typeof comparison },
    { label: 'Data Rate', ratio: 100, key: 'dataRate' as keyof typeof comparison },
    { label: 'Baselines', ratio: 10, key: 'baselines' as keyof typeof comparison },
  ]

  return (
    <div ref={sectionRef}>
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-nebula-blue/10 border border-cosmos-nebula-blue/30 mb-4">
          <span>🔭</span>
          <span className="text-sm text-cosmos-nebula-blue font-medium">
            The Future of Radio Astronomy
          </span>
        </div>
        <h2
          id="ska-heading"
          className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
        >
          Square Kilometre <span className="text-cosmos-nebula-blue">Array</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          The world's largest and most sensitive radio telescope, currently under construction
          in Australia and South Africa. It will revolutionise our understanding of the universe.
        </p>
      </div>

      {/* Science Goals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {scienceGoals.map((goal) => (
          <Card key={goal.id} variant="interactive" padding="md">
            <CardContent>
              <span className="text-3xl mb-3 block">{goal.icon}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{goal.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{goal.description}</p>
              <div className="text-xs text-cosmos-gold bg-cosmos-gold/10 px-2 py-1 rounded inline-block">
                {goal.expectedResults}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline + Comparison */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Interactive Horizontal Timeline */}
        <Card variant="elevated" padding="lg">
          <CardContent>
            <h3 className="text-xl font-bold text-white mb-6">Construction Timeline</h3>

            {/* Horizontal scrollable timeline */}
            <div className="overflow-x-auto pb-4 -mx-2 px-2">
              <div className="relative min-w-[500px]">
                {/* Background track */}
                <div className="absolute top-[11px] left-0 right-0 h-0.5 bg-white/10" />

                {/* Animated progress line */}
                <div
                  className="absolute top-[11px] left-0 h-0.5 bg-gradient-to-r from-green-500 via-cosmos-gold to-cosmos-gold/0 transition-all duration-2000 ease-out"
                  style={{ width: inView ? `${progressPercent}%` : '0%' }}
                />

                {/* Timeline items */}
                <div className="flex justify-between relative">
                  {timeline.map((item) => (
                    <div key={item.year} className="flex flex-col items-center" style={{ width: `${100 / timeline.length}%` }}>
                      {/* Dot */}
                      <div className="flex-shrink-0 z-10 mb-2">
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : item.status === 'in-progress' ? (
                          <div className="relative">
                            <Clock className="w-6 h-6 text-cosmos-gold" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cosmos-gold animate-ping" />
                          </div>
                        ) : (
                          <Circle className="w-6 h-6 text-gray-600" />
                        )}
                      </div>

                      {/* Year */}
                      <span
                        className={cn(
                          'text-xs font-bold mb-1',
                          item.status === 'completed' ? 'text-green-400' :
                          item.status === 'in-progress' ? 'text-cosmos-gold' : 'text-gray-500',
                        )}
                      >
                        {item.year}
                      </span>

                      {/* Event text */}
                      <p className={cn(
                        'text-[10px] text-center leading-tight max-w-[70px]',
                        item.status === 'upcoming' ? 'text-gray-500' : 'text-gray-300',
                      )}>
                        {item.event}
                      </p>

                      {item.status === 'in-progress' && (
                        <span className="text-[9px] bg-cosmos-gold/20 text-cosmos-gold px-1.5 py-0.5 rounded-full mt-1">
                          Now
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animated Comparison Bars */}
        <Card variant="elevated" padding="lg">
          <CardContent>
            <h3 className="text-xl font-bold text-white mb-6">SKA vs Current Telescopes</h3>
            <div className="space-y-3">
              {comparisonBars.map((bar, i) => {
                const data = comparison[bar.key]
                if (!data) return null
                return (
                  <ComparisonBar
                    key={bar.key}
                    label={bar.label}
                    currentLabel={data.current}
                    skaLabel={data.ska}
                    ratio={bar.ratio}
                    description={data.description}
                    inView={inView}
                    delay={i * 150}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Challenge with Live Counter */}
      <div className="glass-panel rounded-xl p-6 md:p-8 text-center max-w-3xl mx-auto">
        <span className="text-4xl mb-4 block">💾</span>
        <h3 className="text-xl font-bold text-white mb-2">The Data Challenge</h3>
        <p className="text-gray-400 mb-4">
          SKA will generate <span className="text-cosmos-hydrogen font-bold">710 petabytes of raw data per day</span> —
          more than the entire global internet traffic. Processing this data requires revolutionary
          high-performance computing infrastructure.
        </p>

        {/* Live data counter */}
        <div className="glass-panel rounded-lg p-4 inline-block mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Simulated data since page load
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-cosmos-hydrogen">
            {dataCount} <span className="text-sm font-normal text-gray-400">PB</span>
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            rightIcon={<ExternalLink className="w-4 h-4" />}
            asChild
          >
            <a
              href="https://www.skao.int/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit SKA Observatory
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
