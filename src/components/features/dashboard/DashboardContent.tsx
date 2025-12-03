'use client'

/**
 * Dashboard Content
 * Main dashboard component showing user stats and activity
 */

import { useState } from 'react'
import Link from 'next/link'
import { useCosmosStore } from '@/store/cosmos-store'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { getFeaturedJWSTImages } from '@/services/mast-api'
import { getUserStats, getRankForClassifications, getNextRank, FEATURED_ZOONIVERSE_PROJECTS } from '@/services/zooniverse-api'
import {
  Heart,
  Star,
  Target,
  Clock,
  Telescope,
  Award,
  TrendingUp,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Radio,
  BookOpen,
  Settings,
  User,
} from 'lucide-react'

// ============================================
// Tabs
// ============================================

type TabId = 'overview' | 'favorites' | 'activity' | 'settings'

const tabs = [
  { id: 'overview' as TabId, label: 'Overview', icon: TrendingUp },
  { id: 'favorites' as TabId, label: 'Favorites', icon: Heart },
  { id: 'activity' as TabId, label: 'Activity', icon: Clock },
  { id: 'settings' as TabId, label: 'Settings', icon: Settings },
]

// ============================================
// Component
// ============================================

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const { favorites, preferences, clearFavorites } = useCosmosStore()

  // Get user stats (mock data for now)
  const stats = getUserStats()
  const currentRank = getRankForClassifications(stats.classificationsCount)
  const nextRankInfo = getNextRank(stats.classificationsCount)

  // Get favorite observations
  const allObservations = getFeaturedJWSTImages()
  const favoriteObservations = allObservations.filter((obs) => favorites.includes(obs.id))

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Welcome Back, Explorer
            </h1>
            <p className="text-gray-400">
              Track your cosmic journey and contributions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cosmos-gold/10 border border-cosmos-gold/30">
              <Award className="w-5 h-5 text-cosmos-gold" />
              <span className="text-cosmos-gold font-medium">{currentRank.name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          value={stats.classificationsCount}
          label="Classifications"
          color="cyan"
        />
        <StatCard
          icon={Heart}
          value={favorites.length}
          label="Favorites"
          color="pink"
        />
        <StatCard
          icon={Telescope}
          value={stats.projectsContributed}
          label="Projects"
          color="gold"
        />
        <StatCard
          icon={Clock}
          value={`${stats.hoursSpent}h`}
          label="Time Spent"
          color="purple"
        />
      </section>

      {/* Tab Navigation */}
      <nav
        className="flex overflow-x-auto mb-6 border-b border-white/10"
        role="tablist"
        aria-label="Dashboard sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap',
              'border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-cosmos-cyan text-cosmos-cyan'
                : 'border-transparent text-gray-400 hover:text-white'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Panels */}
      <div className="min-h-[500px]">
        {/* Overview Panel */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Card */}
            <Card className="lg:col-span-2" padding="lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cosmos-cyan" />
                  Your Progress
                </h2>

                {/* Rank Progress */}
                {nextRankInfo && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">{currentRank.name}</span>
                      <span className="text-cosmos-gold">{nextRankInfo.rank.name}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cosmos-cyan to-cosmos-gold transition-all duration-500"
                        style={{
                          width: `${(stats.classificationsCount / nextRankInfo.rank.minClassifications) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {nextRankInfo.classificationsNeeded} more classifications to reach {nextRankInfo.rank.name}
                    </p>
                  </div>
                )}

                {/* Recent Activity Chart (placeholder) */}
                <div className="p-6 rounded-lg bg-white/5 text-center">
                  <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Activity chart visualization coming soon
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Track your daily contributions over time
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card padding="lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cosmos-gold" />
                  Quick Actions
                </h2>

                <div className="space-y-3">
                  <QuickActionLink
                    href="/citizen-science"
                    icon={Target}
                    label="Start Classifying"
                    description="Help advance real science"
                  />
                  <QuickActionLink
                    href="/explore"
                    icon={Telescope}
                    label="Explore Images"
                    description="Browse astronomical data"
                  />
                  <QuickActionLink
                    href="/sky-map"
                    icon={Radio}
                    label="Open Sky Map"
                    description="Navigate the cosmos"
                  />
                  <QuickActionLink
                    href="/devlog"
                    icon={BookOpen}
                    label="Read Devlog"
                    description="Technical deep-dives"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Contributions */}
            <Card className="lg:col-span-2" padding="lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cosmos-purple" />
                  Recent Activity
                </h2>

                <div className="space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={`${activity.date}-${activity.project}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cosmos-cyan/20 flex items-center justify-center">
                          <Target className="w-4 h-4 text-cosmos-cyan" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{activity.project}</p>
                          <p className="text-xs text-gray-500">{activity.date}</p>
                        </div>
                      </div>
                      <span className="text-cosmos-cyan font-medium">+{activity.count}</span>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" fullWidth className="mt-4" asChild>
                  <Link href="/citizen-science">
                    View All Activity
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card padding="lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-cosmos-gold" />
                  Recent Badges
                </h2>

                <div className="space-y-3">
                  {stats.badges.slice(0, 3).map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-cosmos-gold/5 border border-cosmos-gold/20"
                    >
                      <div className="w-8 h-8 rounded-full bg-cosmos-gold/20 flex items-center justify-center">
                        <Star className="w-4 h-4 text-cosmos-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{badge.name}</p>
                        <p className="text-xs text-gray-500">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Favorites Panel */}
        {activeTab === 'favorites' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
              </p>
              {favorites.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFavorites}>
                  Clear All
                </Button>
              )}
            </div>

            {favoriteObservations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteObservations.map((obs) => (
                  <FavoriteCard key={obs.id} observation={obs} />
                ))}
              </div>
            ) : (
              <Card className="text-center" padding="xl">
                <CardContent>
                  <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Favorites Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Start exploring and save your favorite observations
                  </p>
                  <Button variant="primary" asChild>
                    <Link href="/explore">
                      Explore Images
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Activity Panel */}
        {activeTab === 'activity' && (
          <Card padding="lg">
            <CardContent>
              <h2 className="text-lg font-semibold text-white mb-6">Activity History</h2>

              {/* Activity Timeline */}
              <div className="space-y-4">
                {[
                  { type: 'classification', project: 'Galaxy Zoo: Cosmic Dawn', date: '2024-01-20', count: 15 },
                  { type: 'favorite', target: 'Carina Nebula', date: '2024-01-19' },
                  { type: 'classification', project: 'Radio Galaxy Zoo', date: '2024-01-18', count: 8 },
                  { type: 'view', target: 'Stephan\'s Quintet', date: '2024-01-17' },
                  { type: 'classification', project: 'Planet Hunters TESS', date: '2024-01-16', count: 12 },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          item.type === 'classification' && 'bg-cosmos-cyan/20',
                          item.type === 'favorite' && 'bg-cosmos-pink/20',
                          item.type === 'view' && 'bg-cosmos-purple/20'
                        )}
                      >
                        {item.type === 'classification' && <Target className="w-5 h-5 text-cosmos-cyan" />}
                        {item.type === 'favorite' && <Heart className="w-5 h-5 text-cosmos-pink" />}
                        {item.type === 'view' && <Telescope className="w-5 h-5 text-cosmos-purple" />}
                      </div>
                      {idx < 4 && <div className="w-px h-full bg-white/10 mt-2" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <p className="text-white">
                          {item.type === 'classification' && (
                            <>Classified {item.count} subjects in <span className="text-cosmos-cyan">{item.project}</span></>
                          )}
                          {item.type === 'favorite' && (
                            <>Favorited <span className="text-cosmos-pink">{item.target}</span></>
                          )}
                          {item.type === 'view' && (
                            <>Viewed <span className="text-cosmos-purple">{item.target}</span></>
                          )}
                        </p>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Panel */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <Card padding="lg" className="mb-6">
              <CardContent>
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue="Space Explorer"
                      className="w-full px-4 py-2 rounded-lg bg-cosmos-surface border border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Notifications</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded bg-cosmos-surface border-white/20" />
                        <span className="text-sm text-gray-300">Weekly digest of new observations</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded bg-cosmos-surface border-white/20" />
                        <span className="text-sm text-gray-300">Badge achievements</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded bg-cosmos-surface border-white/20" />
                        <span className="text-sm text-gray-300">Citizen science project updates</span>
                      </label>
                    </div>
                  </div>
                </div>

                <Button variant="primary" className="mt-6">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Preferences
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Default Gallery View</label>
                    <select className="w-full px-4 py-2 rounded-lg bg-cosmos-surface border border-white/10 text-white">
                      <option value="grid">Grid</option>
                      <option value="list">List</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Preferred Wavelength</label>
                    <select className="w-full px-4 py-2 rounded-lg bg-cosmos-surface border border-white/10 text-white">
                      <option value="all">All Wavelengths</option>
                      <option value="optical">Optical</option>
                      <option value="infrared">Infrared</option>
                      <option value="radio">Radio</option>
                      <option value="ultraviolet">Ultraviolet</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Enable reduced motion</span>
                    <input type="checkbox" className="rounded bg-cosmos-surface border-white/20" />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">High contrast mode</span>
                    <input type="checkbox" className="rounded bg-cosmos-surface border-white/20" />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  value: number | string
  label: string
  color: 'cyan' | 'pink' | 'gold' | 'purple'
}

function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  const colorClasses = {
    cyan: 'text-cosmos-cyan bg-cosmos-cyan/10',
    pink: 'text-cosmos-pink bg-cosmos-pink/10',
    gold: 'text-cosmos-gold bg-cosmos-gold/10',
    purple: 'text-cosmos-purple bg-cosmos-purple/10',
  }

  return (
    <Card padding="lg">
      <CardContent>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Quick Action Link
// ============================================

interface QuickActionLinkProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

function QuickActionLink({ href, icon: Icon, label, description }: QuickActionLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-cosmos-cyan/10 flex items-center justify-center group-hover:bg-cosmos-cyan/20 transition-colors">
        <Icon className="w-5 h-5 text-cosmos-cyan" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white group-hover:text-cosmos-cyan transition-colors">
          {label}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cosmos-cyan transition-colors" />
    </Link>
  )
}

// ============================================
// Favorite Card
// ============================================

import type { Observation } from '@/types'

function FavoriteCard({ observation }: { observation: Observation }) {
  const { toggleFavorite } = useCosmosStore()

  return (
    <Card className="group overflow-hidden" padding="none">
      <CardContent className="p-0">
        {/* Image */}
        <Link href={`/explore/${observation.id}`} className="block relative aspect-video">
          <div className="absolute inset-0 bg-gradient-to-br from-cosmos-cyan/20 to-cosmos-purple/20 flex items-center justify-center">
            <Telescope className="w-12 h-12 text-white/20" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-cosmos-void to-transparent" />
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/explore/${observation.id}`}
                className="text-lg font-semibold text-white hover:text-cosmos-cyan transition-colors line-clamp-1"
              >
                {observation.targetName}
              </Link>
              <p className="text-sm text-gray-400">{observation.source}</p>
            </div>
            <button
              onClick={() => toggleFavorite(observation.id)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Remove from favorites"
            >
              <Heart className="w-5 h-5 text-cosmos-pink fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-xs">
              {observation.category.replace('-', ' ')}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-xs">
              {observation.wavelengthBand}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
