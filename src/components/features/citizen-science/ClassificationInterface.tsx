'use client'

/**
 * Classification Interface
 * The main interface for classifying astronomical objects
 */

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  getClassificationTasks,
  submitClassification,
  FEATURED_ZOONIVERSE_PROJECTS,
  type ZooniverseProject,
} from '@/services/zooniverse-api'
import type { ClassificationTask } from '@/types'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Clock,
  Flag,
  SkipForward,
} from 'lucide-react'

// ============================================
// Props
// ============================================

interface ClassificationInterfaceProps {
  projectId: string | null
  onProjectChange: (projectId: string | null) => void
}

// ============================================
// Component
// ============================================

export function ClassificationInterface({
  projectId,
  onProjectChange,
}: ClassificationInterfaceProps) {
  const [currentTask, setCurrentTask] = useState<ClassificationTask | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [classificationsCount, setClassificationsCount] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [startTime] = useState(new Date().toISOString())

  // Get project details
  const project = projectId
    ? FEATURED_ZOONIVERSE_PROJECTS.find((p) => p.id === projectId)
    : null

  // Load task
  const loadNextTask = useCallback(() => {
    setSelectedOption(null)
    setZoom(1)

    const tasks = getClassificationTasks(projectId || undefined)
    if (tasks.length > 0) {
      // Get a random task for demo
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
      setCurrentTask(randomTask)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      loadNextTask()
    }
  }, [projectId, loadNextTask])

  // Handle submission
  const handleSubmit = async () => {
    if (!currentTask || !selectedOption) return

    setIsSubmitting(true)

    try {
      await submitClassification({
        projectId: currentTask.projectId,
        subjectId: currentTask.id,
        workflowId: 'workflow-1',
        annotations: [{ task: 'T0', value: selectedOption }],
        startedAt: startTime,
        finishedAt: new Date().toISOString(),
      })

      setClassificationsCount((c) => c + 1)
      loadNextTask()
    } catch (error) {
      console.error('Classification error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // If no project selected, show project selector
  if (!projectId) {
    return (
      <Card className="max-w-2xl mx-auto" padding="xl">
        <CardContent className="text-center">
          <Sparkles className="w-12 h-12 text-cosmos-gold mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Select a Project to Start
          </h2>
          <p className="text-gray-400 mb-6">
            Choose from our featured citizen science projects to begin classifying.
          </p>

          <div className="grid gap-3">
            {FEATURED_ZOONIVERSE_PROJECTS.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => onProjectChange(p.id)}
                className="w-full p-4 rounded-lg glass-panel hover:bg-white/10 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white group-hover:text-cosmos-cyan">
                      {p.displayName}
                    </div>
                    <div className="text-sm text-gray-400">{p.description}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cosmos-cyan" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentTask) {
    return (
      <Card className="max-w-2xl mx-auto" padding="xl">
        <CardContent className="text-center">
          <div className="w-12 h-12 border-4 border-cosmos-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading classification task...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Image Area */}
      <div className="lg:col-span-2 space-y-4">
        {/* Project Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onProjectChange(null)}
              aria-label="Back to projects"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-semibold text-white">{project?.displayName}</h2>
              <p className="text-xs text-gray-400">
                {classificationsCount} classified this session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Button>
          </div>
        </div>

        {/* Image Viewer */}
        <Card padding="none" className="overflow-hidden">
          <div className="relative aspect-square bg-cosmos-void">
            {/* Placeholder for real image - using gradient for demo */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-cosmos-depth via-cosmos-void to-cosmos-surface flex items-center justify-center"
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              <div className="text-center text-gray-500">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">
                  Subject image would load here
                  <br />
                  <span className="text-xs text-gray-600">
                    (Using placeholder for demo)
                  </span>
                </p>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="glass-panel rounded-lg p-1 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  aria-label="Zoom in"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  aria-label="Zoom out"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setZoom(1)}
                  aria-label="Reset zoom"
                  disabled={zoom === 1}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Difficulty Badge */}
            <div className="absolute top-4 left-4">
              <span
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  currentTask.difficulty === 'beginner'
                    ? 'bg-green-500/20 text-green-400'
                    : currentTask.difficulty === 'intermediate'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                )}
              >
                {currentTask.difficulty}
              </span>
            </div>
          </div>
        </Card>

        {/* Metadata */}
        {currentTask.metadata && (
          <Card padding="md">
            <CardContent>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Subject Metadata
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {Object.entries(currentTask.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-500 capitalize">{key}: </span>
                    <span className="text-gray-300">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Classification Panel */}
      <div className="space-y-4">
        {/* Help Panel */}
        {showHelp && (
          <Card padding="md" className="bg-cosmos-gold/5 border-cosmos-gold/20">
            <CardContent>
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-cosmos-gold flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-white mb-1">Tips for this task</h4>
                  <p className="text-sm text-gray-300">
                    {currentTask.type === 'galaxy-morphology' && (
                      <>
                        Look for spiral arms, central bulges, or smooth elliptical shapes.
                        If unsure, choose the closest match - there are no wrong answers!
                      </>
                    )}
                    {currentTask.type === 'source-matching' && (
                      <>
                        Compare the radio contours (usually colored) with the optical image.
                        The host galaxy is usually at the center of the radio emission.
                      </>
                    )}
                    {currentTask.type === 'transient-detection' && (
                      <>
                        Blink between images to spot differences. Supernovae appear as new
                        point sources, usually near or within a galaxy.
                      </>
                    )}
                    {currentTask.type === 'light-curve' && (
                      <>
                        Transits appear as shallow, box-like dips. Eclipsing binaries show
                        deeper, V-shaped dips. Look for repeated patterns.
                      </>
                    )}
                    {currentTask.type === 'radio-morphology' && (
                      <>
                        Radio sources can appear compact, extended, or have multiple lobes.
                        Look at the overall shape and structure.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        <Card padding="lg">
          <CardContent>
            <h3 className="text-lg font-semibold text-white mb-4">
              {currentTask.instructions}
            </h3>

            {/* Options */}
            <div className="space-y-3" role="radiogroup" aria-label="Classification options">
              {currentTask.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedOption(option.value)}
                  className={cn(
                    'w-full p-4 rounded-lg text-left transition-all',
                    'border-2',
                    selectedOption === option.value
                      ? 'border-cosmos-cyan bg-cosmos-cyan/10'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  )}
                  role="radio"
                  aria-checked={selectedOption === option.value}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5',
                        selectedOption === option.value
                          ? 'border-cosmos-cyan bg-cosmos-cyan'
                          : 'border-gray-500'
                      )}
                    >
                      {selectedOption === option.value && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-400 mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting}
                isLoading={isSubmitting}
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={loadNextTask}
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </Button>
              <Button variant="ghost" size="sm" fullWidth>
                <Flag className="w-4 h-4" />
                Flag Issue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Stats */}
        <Card padding="md">
          <CardContent>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Session Stats
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cosmos-cyan">
                  {classificationsCount}
                </div>
                <div className="text-xs text-gray-400">Classified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cosmos-gold flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  ~{currentTask.estimatedTime}s
                </div>
                <div className="text-xs text-gray-400">Est. Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Encouragement */}
        {classificationsCount > 0 && classificationsCount % 5 === 0 && (
          <Card padding="md" className="bg-cosmos-gold/5 border-cosmos-gold/20">
            <CardContent className="text-center">
              <Sparkles className="w-6 h-6 text-cosmos-gold mx-auto mb-2" />
              <p className="text-sm text-white">
                Great work! You&apos;ve made {classificationsCount} classifications!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Every classification helps advance real science.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
