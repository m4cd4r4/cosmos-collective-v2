'use client'

/**
 * SKA (Square Kilometre Array) Section
 * Showcases SKA science goals and construction timeline
 */

import { getSKAScienceGoals, getSKATimeline, getSKAComparison } from '@/services/australian-telescopes'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { ExternalLink, CheckCircle2, Clock, Circle } from 'lucide-react'

// ============================================
// SKA Section Component
// ============================================

export function SKASection() {
  const scienceGoals = getSKAScienceGoals()
  const timeline = getSKATimeline()
  const comparison = getSKAComparison()

  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmos-purple/10 border border-cosmos-purple/30 mb-4">
          <span>🔭</span>
          <span className="text-sm text-cosmos-purple font-medium">
            The Future of Radio Astronomy
          </span>
        </div>
        <h2
          id="ska-heading"
          className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
        >
          Square Kilometre <span className="text-cosmos-purple">Array</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          The world's largest and most sensitive radio telescope, currently under construction
          in Australia and South Africa. It will revolutionize our understanding of the universe.
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
              <div className="text-xs text-cosmos-cyan bg-cosmos-cyan/10 px-2 py-1 rounded inline-block">
                {goal.expectedResults}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Stats */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Timeline */}
        <Card variant="elevated" padding="lg">
          <CardContent>
            <h3 className="text-xl font-bold text-white mb-6">Construction Timeline</h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/10" />

              <ul className="space-y-4">
                {timeline.map((item, index) => (
                  <li key={item.year} className="flex gap-4 relative">
                    {/* Status icon */}
                    <div className="flex-shrink-0 z-10">
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : item.status === 'in-progress' ? (
                        <Clock className="w-6 h-6 text-cosmos-gold animate-pulse" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'font-bold',
                            item.status === 'completed'
                              ? 'text-green-400'
                              : item.status === 'in-progress'
                                ? 'text-cosmos-gold'
                                : 'text-gray-500'
                          )}
                        >
                          {item.year}
                        </span>
                        {item.status === 'in-progress' && (
                          <span className="text-xs bg-cosmos-gold/20 text-cosmos-gold px-2 py-0.5 rounded-full">
                            Now
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          'text-sm',
                          item.status === 'upcoming' ? 'text-gray-500' : 'text-gray-300'
                        )}
                      >
                        {item.event}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Comparison */}
        <Card variant="elevated" padding="lg">
          <CardContent>
            <h3 className="text-xl font-bold text-white mb-6">SKA vs Current Telescopes</h3>
            <div className="space-y-4">
              {Object.entries(comparison).map(([key, value]) => (
                <div key={key} className="glass-panel rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-400">{value.current}</span>
                    <span className="text-sm font-bold text-cosmos-purple">{value.ska}</span>
                  </div>
                  <p className="text-xs text-gray-500">{value.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Challenge */}
      <div className="glass-panel rounded-xl p-6 md:p-8 text-center max-w-3xl mx-auto">
        <span className="text-4xl mb-4 block">💾</span>
        <h3 className="text-xl font-bold text-white mb-2">The Data Challenge</h3>
        <p className="text-gray-400 mb-4">
          SKA will generate <span className="text-cosmos-pink font-bold">710 petabytes of raw data per day</span> —
          more than the entire global internet traffic. Processing this data requires revolutionary
          high-performance computing infrastructure.
        </p>
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
  )
}
