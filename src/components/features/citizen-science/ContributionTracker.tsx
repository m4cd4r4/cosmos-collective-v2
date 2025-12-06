'use client'

/**
 * Contribution Tracker
 * Shows user's progress, achievements, and history
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  getUserStats,
  getClassificationHistory,
  RANKS,
  getRankForClassifications,
  getNextRank,
  FEATURED_ZOONIVERSE_PROJECTS,
} from '@/services/zooniverse-api'
import {
  Award,
  Star,
  Trophy,
  Target,
  Clock,
  Calendar,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Eye,
  Rocket,
  Telescope,
  Orbit,
  Compass,
  Atom,
  Flag,
  Globe,
  Shield,
  Crown,
} from 'lucide-react'

// ============================================
// Icon Map for Ranks
// ============================================

const rankIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  eye: Eye,
  rocket: Rocket,
  telescope: Telescope,
  orbit: Orbit,
  compass: Compass,
  atom: Atom,
  flag: Flag,
  globe: Globe,
  shield: Shield,
  crown: Crown,
}

// ============================================
// Component
// ============================================

export function ContributionTracker() {
  const [activeSection, setActiveSection] = useState<'overview' | 'badges' | 'history'>('overview')

  // Get user stats (would come from auth context in production)
  const stats = getUserStats()
  const currentRank = getRankForClassifications(stats.classificationsCount)
  const nextRankInfo = getNextRank(stats.classificationsCount)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Classifications */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <Target className="w-8 h-8 text-cosmos-cyan mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{stats.classificationsCount}</div>
            <div className="text-sm text-gray-400">Total Classifications</div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <Telescope className="w-8 h-8 text-cosmos-gold mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{stats.projectsContributed}</div>
            <div className="text-sm text-gray-400">Projects</div>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <Clock className="w-8 h-8 text-cosmos-purple mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{stats.hoursSpent}</div>
            <div className="text-sm text-gray-400">Hours Contributed</div>
          </CardContent>
        </Card>

        {/* Rank */}
        <Card padding="lg" className="text-center bg-gradient-to-br from-cosmos-gold/10 to-transparent">
          <CardContent>
            <Award className="w-8 h-8 text-cosmos-gold mx-auto mb-2" />
            <div className="text-xl font-bold text-cosmos-gold">{currentRank.name}</div>
            <div className="text-sm text-gray-400">Current Rank</div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Progress */}
      {nextRankInfo && (
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Rank Progress</h3>
              <span className="text-sm text-gray-400">
                {nextRankInfo.classificationsNeeded} more to{' '}
                <span className="text-cosmos-gold">{nextRankInfo.rank.name}</span>
              </span>
            </div>

            {/* Rank Timeline */}
            <div className="relative">
              {/* Progress Bar */}
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cosmos-cyan to-cosmos-gold transition-all duration-500"
                  style={{
                    width: `${(stats.classificationsCount / nextRankInfo.rank.minClassifications) * 100}%`,
                  }}
                />
              </div>

              {/* Rank Markers */}
              <div className="flex justify-between mt-2">
                <div className="text-xs text-gray-400">
                  {stats.classificationsCount} classifications
                </div>
                <div className="text-xs text-cosmos-gold">
                  {nextRankInfo.rank.minClassifications} needed
                </div>
              </div>
            </div>

            {/* All Ranks */}
            <div className="mt-6">
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                All Ranks
              </h4>
              <div className="flex flex-wrap gap-2">
                {RANKS.map((rank) => {
                  const RankIcon = rankIcons[rank.icon] || Star
                  const isAchieved = stats.classificationsCount >= rank.minClassifications
                  const isCurrent = rank.name === currentRank.name

                  return (
                    <div
                      key={rank.name}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                        isCurrent
                          ? 'bg-cosmos-gold/20 text-cosmos-gold border border-cosmos-gold/30'
                          : isAchieved
                          ? 'bg-white/10 text-white'
                          : 'bg-white/5 text-gray-500'
                      )}
                    >
                      <RankIcon className="w-4 h-4" />
                      <span>{rank.name}</span>
                      {isCurrent && (
                        <span className="text-xs bg-cosmos-gold/30 px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'overview' as const, label: 'Overview' },
          { id: 'badges' as const, label: 'Badges' },
          { id: 'history' as const, label: 'History' },
        ].map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </Button>
        ))}
      </div>

      {/* Section Content */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card padding="lg">
            <CardContent>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cosmos-cyan" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div
                    key={`${activity.date}-${activity.project}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div>
                      <div className="text-sm text-white">{activity.project}</div>
                      <div className="text-xs text-gray-500">{activity.date}</div>
                    </div>
                    <div className="text-cosmos-cyan font-medium">+{activity.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Favorite Projects */}
          <Card padding="lg">
            <CardContent>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-cosmos-gold" />
                Favorite Projects
              </h3>
              <div className="space-y-3">
                {stats.favoriteProjects.map((projectId) => {
                  const project = FEATURED_ZOONIVERSE_PROJECTS.find((p) => p.id === projectId)
                  if (!project) return null

                  return (
                    <div
                      key={projectId}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 group hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <div className="text-sm text-white group-hover:text-cosmos-cyan transition-colors">
                          {project.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(project.completeness * 100)}% complete
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cosmos-cyan" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'badges' && (
        <Card padding="lg">
          <CardContent>
            <h3 className="text-lg font-semibold text-white mb-6">Your Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 text-center hover:border-cosmos-gold/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-cosmos-gold/20 flex items-center justify-center mx-auto mb-3">
                    {badge.icon === 'star' && <Star className="w-6 h-6 text-cosmos-gold" />}
                    {badge.icon === 'trophy' && <Trophy className="w-6 h-6 text-cosmos-gold" />}
                    {badge.icon === 'galaxy' && <Sparkles className="w-6 h-6 text-cosmos-gold" />}
                    {badge.icon === 'radio' && <Orbit className="w-6 h-6 text-cosmos-gold" />}
                  </div>
                  <h4 className="font-medium text-white mb-1">{badge.name}</h4>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                </div>
              ))}

              {/* Locked Badges Placeholder */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={`locked-${i}`}
                  className="p-4 rounded-lg bg-white/5 border border-white/5 text-center opacity-50"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-600 text-2xl">?</span>
                  </div>
                  <h4 className="font-medium text-gray-500 mb-1">Locked</h4>
                  <p className="text-xs text-gray-600">Keep classifying!</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'history' && (
        <Card padding="lg">
          <CardContent>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cosmos-purple" />
              Classification History
            </h3>
            <div className="space-y-2">
              {/* Activity Calendar Placeholder */}
              <div className="p-4 rounded-lg bg-white/5 text-center text-gray-400">
                <p className="text-sm mb-2">Activity calendar visualisation would appear here</p>
                <p className="text-xs text-gray-500">
                  (GitHub-style contribution graph showing daily activity)
                </p>
              </div>

              {/* Recent Classifications */}
              <div className="mt-6">
                <h4 className="text-sm text-gray-400 mb-3">Recent Classifications</h4>
                <div className="space-y-2">
                  {stats.recentActivity.flatMap((activity) =>
                    Array.from({ length: Math.min(activity.count, 3) }, (_, i) => ({
                      project: activity.project,
                      date: activity.date,
                      id: `${activity.date}-${i}`,
                    }))
                  ).slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-cosmos-purple/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-cosmos-purple" />
                        </div>
                        <div>
                          <div className="text-sm text-white">{item.project}</div>
                          <div className="text-xs text-gray-500">{item.date}</div>
                        </div>
                      </div>
                      <span className="text-xs text-green-400">Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card padding="lg" variant="elevated" className="text-center">
        <CardContent>
          <Sparkles className="w-10 h-10 text-cosmos-gold mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Keep Contributing!
          </h3>
          <p className="text-gray-300 mb-4 max-w-md mx-auto">
            Your classifications help real scientists make discoveries.
            Every click matters!
          </p>
          <Button variant="primary">
            Continue Classifying
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
