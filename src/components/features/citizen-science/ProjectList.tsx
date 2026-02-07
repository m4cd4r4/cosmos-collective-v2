'use client'

/**
 * Project List Component
 * Displays available citizen science projects
 */

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { FEATURED_ZOONIVERSE_PROJECTS, type ZooniverseProject } from '@/services/zooniverse-api'
import {
  Search,
  Filter,
  Users,
  Target,
  ExternalLink,
  ArrowRight,
  Check,
  Radio,
  Sparkles,
  Star,
} from 'lucide-react'

// ============================================
// Props
// ============================================

interface ProjectListProps {
  onStartClassifying: (projectId: string) => void
}

// ============================================
// Filter Options
// ============================================

const tagFilters = [
  { id: 'all', label: 'All Projects' },
  { id: 'galaxies', label: 'Galaxies' },
  { id: 'radio', label: 'Radio Astronomy' },
  { id: 'exoplanets', label: 'Exoplanets' },
  { id: 'transients', label: 'Transients' },
  { id: 'SKA-pathfinder', label: 'SKA Pathfinders' },
]

// ============================================
// Component
// ============================================

export function ProjectList({ onStartClassifying }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')

  const filteredProjects = useMemo(() => {
    return FEATURED_ZOONIVERSE_PROJECTS.filter((project) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        project.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Tag filter
      const matchesTag =
        selectedTag === 'all' || project.tags.includes(selectedTag)

      return matchesSearch && matchesTag
    })
  }, [searchQuery, selectedTag])

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-panel border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-cosmos-gold"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          {tagFilters.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedTag === tag.id
                  ? 'bg-cosmos-gold text-white'
                  : 'glass-panel text-gray-300 hover:text-white hover:bg-white/10'
              )}
              aria-pressed={selectedTag === tag.id}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onStartClassifying={onStartClassifying}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">No projects match your search.</div>
          <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedTag('all') }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Project Card
// ============================================

interface ProjectCardProps {
  project: ZooniverseProject
  onStartClassifying: (projectId: string) => void
}

function ProjectCard({ project, onStartClassifying }: ProjectCardProps) {
  const progressPercent = Math.round(project.completeness * 100)
  const isAustralian = project.tags.includes('ASKAP') || project.tags.includes('Australia')

  return (
    <Card
      data-testid="citizen-science-project"
      className={cn(
        'group transition-all duration-300 hover:scale-[1.02]',
        isAustralian && 'ring-1 ring-cosmos-gold/30'
      )}
      padding="none"
    >
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="relative h-32 bg-gradient-to-br from-cosmos-depth to-cosmos-surface p-4">
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                project.state === 'live'
                  ? 'bg-green-500/20 text-green-400'
                  : project.state === 'paused'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-500/20 text-gray-400'
              )}
            >
              {project.state === 'live' ? 'Active' : project.state}
            </span>
          </div>

          {/* Australian Badge */}
          {isAustralian && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded-full bg-cosmos-gold/20 text-cosmos-gold text-xs font-medium flex items-center gap-1">
                <Radio className="w-3 h-3" />
                Australian Data
              </span>
            </div>
          )}

          {/* Icon */}
          <div className="absolute bottom-4 left-4">
            {project.tags.includes('radio') ? (
              <Radio className="w-10 h-10 text-cosmos-gold opacity-50" />
            ) : project.tags.includes('exoplanets') ? (
              <Star className="w-10 h-10 text-cosmos-gold opacity-50" />
            ) : (
              <Sparkles className="w-10 h-10 text-cosmos-nebula-blue opacity-50" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-cosmos-gold transition-colors">
              {project.displayName}
            </h3>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>{(project.classifications_count / 1000).toFixed(0)}k classifications</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Target className="w-4 h-4" />
              <span>{(project.subjects_count / 1000).toFixed(0)}k subjects</span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-cosmos-gold">{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cosmos-gold to-cosmos-nebula-blue transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => onStartClassifying(project.id)}
            >
              Classify
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href={`https://www.zooniverse.org/projects/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.displayName} on Zooniverse`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
