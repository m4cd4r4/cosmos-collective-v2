'use client'

/**
 * Citizen Science Hub
 * Main container for citizen science features
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ProjectList } from './ProjectList'
import { ClassificationInterface } from './ClassificationInterface'
import { ContributionTracker } from './ContributionTracker'
import {
  Telescope,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Radio,
  Star,
} from 'lucide-react'

// ============================================
// Tabs
// ============================================

type TabId = 'projects' | 'classify' | 'progress'

const tabs = [
  { id: 'projects' as TabId, label: 'Projects', icon: Telescope },
  { id: 'classify' as TabId, label: 'Classify', icon: Sparkles },
  { id: 'progress' as TabId, label: 'My Progress', icon: Award },
]

// ============================================
// Component
// ============================================

export function CitizenScienceHub() {
  const [activeTab, setActiveTab] = useState<TabId>('projects')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleStartClassifying = (projectId: string) => {
    setSelectedProjectId(projectId)
    setActiveTab('classify')
  }

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-cosmos-cyan text-sm font-medium mb-4">
          <Users className="w-4 h-4" />
          Join 2+ million citizen scientists worldwide
        </span>

        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Citizen Science
        </h1>

        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Real research, real impact. Help astronomers classify galaxies, discover exoplanets,
          and unlock the secrets of the universe. No experience needed.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {[
            { value: '3M+', label: 'Classifications', icon: Sparkles },
            { value: '120+', label: 'Discoveries', icon: Star },
            { value: '50+', label: 'Research Papers', icon: BookOpen },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-cosmos-gold mb-1">
                <stat.icon className="w-6 h-6" />
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tab Navigation */}
      <nav
        className="flex justify-center mb-8"
        role="tablist"
        aria-label="Citizen science sections"
      >
        <div className="glass-panel rounded-xl p-1.5 inline-flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-cosmos-cyan/20 text-cosmos-cyan'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Panels */}
      <div className="min-h-[600px]">
        {/* Projects Panel */}
        <div
          id="panel-projects"
          role="tabpanel"
          aria-labelledby="tab-projects"
          hidden={activeTab !== 'projects'}
        >
          {activeTab === 'projects' && (
            <ProjectList onStartClassifying={handleStartClassifying} />
          )}
        </div>

        {/* Classify Panel */}
        <div
          id="panel-classify"
          role="tabpanel"
          aria-labelledby="tab-classify"
          hidden={activeTab !== 'classify'}
        >
          {activeTab === 'classify' && (
            <ClassificationInterface
              projectId={selectedProjectId}
              onProjectChange={setSelectedProjectId}
            />
          )}
        </div>

        {/* Progress Panel */}
        <div
          id="panel-progress"
          role="tabpanel"
          aria-labelledby="tab-progress"
          hidden={activeTab !== 'progress'}
        >
          {activeTab === 'progress' && <ContributionTracker />}
        </div>
      </div>

      {/* Call to Action */}
      <section className="mt-16 text-center">
        <Card className="max-w-4xl mx-auto" variant="gradient" padding="xl">
          <CardContent>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Radio className="w-8 h-8 text-cosmos-cyan" />
              <Telescope className="w-8 h-8 text-cosmos-gold" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-3">
              Supporting Australian Radio Astronomy
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Many of these projects use data from Australian facilities like ASKAP, MWA, and Parkes.
              Your contributions directly support the development of the Square Kilometre Array -
              the world&apos;s largest radio telescope.
            </p>
            <Button variant="primary">
              Learn About SKA
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section className="mt-16">
        <h2 className="text-2xl font-display font-bold text-white text-center mb-8">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: 1,
              title: 'Choose a Project',
              description: 'Browse active projects and pick one that interests you.',
            },
            {
              step: 2,
              title: 'Learn the Task',
              description: 'Quick tutorial explains what to look for - no expertise needed.',
            },
            {
              step: 3,
              title: 'Make Classifications',
              description: 'Answer simple questions about astronomical images or data.',
            },
            {
              step: 4,
              title: 'Contribute to Science',
              description: 'Your work combines with others to create scientific discoveries.',
            },
          ].map((item) => (
            <Card key={item.step} padding="lg" className="text-center">
              <CardContent>
                <div className="w-10 h-10 rounded-full bg-cosmos-cyan/20 text-cosmos-cyan flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
