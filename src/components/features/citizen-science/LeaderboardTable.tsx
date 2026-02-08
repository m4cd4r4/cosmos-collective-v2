'use client'

/**
 * Leaderboard Table Component
 * Displays top users by classification count with filters
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Trophy, Medal, Award, TrendingUp, Calendar, Users } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar: string | null
  classificationsCount: number
  projectsContributed: number
  currentStreak: number
  currentRank: number
  badgeCount: number
}

interface LeaderboardProps {
  timeframe?: 'all-time' | 'monthly' | 'weekly'
}

const RANK_ICONS = [
  '👁️', // Stargazer
  '🚀', // Rocket
  '🔭', // Telescope
  '🌌', // Orbit
  '🧭', // Compass
  '⚛️', // Atom
  '🏴', // Flag
  '🌍', // Globe
  '🛡️', // Shield
  '👑', // Crown
  '✨', // Cosmic Legend
]

export function LeaderboardTable({ timeframe = 'all-time' }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)

  useEffect(() => {
    fetchLeaderboard(selectedTimeframe)
  }, [selectedTimeframe])

  async function fetchLeaderboard(period: string) {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?timeframe=${period}`)
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankMedal = (rank: number) => {
    if (rank === 1)
      return <Trophy className="w-6 h-6 text-yellow-400" title="1st Place" />
    if (rank === 2)
      return <Medal className="w-6 h-6 text-gray-300" title="2nd Place" />
    if (rank === 3)
      return <Medal className="w-6 h-6 text-amber-600" title="3rd Place" />
    return <span className="w-6 text-center text-gray-400">#{rank}</span>
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Tabs */}
      <div className="flex gap-2 justify-center">
        {[
          { id: 'all-time', label: 'All Time', icon: TrendingUp },
          { id: 'monthly', label: 'This Month', icon: Calendar },
          { id: 'weekly', label: 'This Week', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTimeframe(tab.id as any)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              selectedTimeframe === tab.id
                ? 'bg-cosmos-gold/20 border border-cosmos-gold/30 text-cosmos-gold'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-gray-400">
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              No entries found for this timeframe
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-sm text-gray-400">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4 text-right">Classifications</th>
                    <th className="px-6 py-4 text-right">Projects</th>
                    <th className="px-6 py-4 text-right">Streak</th>
                    <th className="px-6 py-4 text-center">Level</th>
                    <th className="px-6 py-4 text-right">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.userId}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">{getRankMedal(entry.rank)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cosmos-gold/20 flex items-center justify-center text-cosmos-gold font-bold">
                            {entry.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-white font-medium">
                            {entry.username || 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-white font-mono">
                        {entry.classificationsCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300">
                        {entry.projectsContributed}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`px-2 py-1 rounded ${
                            entry.currentStreak > 7
                              ? 'bg-green-500/20 text-green-400'
                              : entry.currentStreak > 3
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          🔥 {entry.currentStreak}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-2xl" title={`Rank ${entry.currentRank}`}>
                        {RANK_ICONS[entry.currentRank] || RANK_ICONS[0]}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                          <Award className="w-4 h-4" />
                          {entry.badgeCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            How Rankings Work
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Ranked by total number of classifications submitted</li>
            <li>
              • Streak counts consecutive days with at least one classification
            </li>
            <li>• Level increases based on classification milestones</li>
            <li>• Badges are earned for various achievements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
