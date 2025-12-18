'use client'

/**
 * Live Page
 * Live launch streams and upcoming webcasts
 */

import { useState } from 'react'
import Link from 'next/link'
import { VideoCard } from '@/components/features/video/VideoCard'
import { VideoModal } from '@/components/features/video/VideoModal'
import { Badge } from '@/components/ui/Badge'
import { Radio, ExternalLink, Calendar, Rocket } from 'lucide-react'
import { format } from 'date-fns'
import type { Video } from '@/types/video'

// Mock live stream data (will be replaced with YouTube API in future phase)
const MOCK_LIVE_STREAMS: Video[] = [
  {
    id: 'live-1',
    source: 'youtube',
    externalId: 'dQw4w9WgXcQ',
    title: '🔴 LIVE: SpaceX Starship Flight Test',
    description:
      'Watch the latest Starship integrated flight test live from Starbase, Texas. This is the most powerful rocket ever built attempting its orbital flight test.',
    channel: {
      id: 'spacex',
      name: 'SpaceX',
      url: 'https://www.youtube.com/spacex',
    },
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    publishedAt: new Date(),
    isLive: true,
    viewCount: 125430,
    category: 'livestream',
    relatedLaunchId: 'launch-123',
  },
  {
    id: 'live-2',
    source: 'youtube',
    externalId: 'xyz789',
    title: '🔴 LIVE: NASA ISS Stream',
    description:
      'Live view from the International Space Station as it orbits Earth at 17,500 mph.',
    channel: {
      id: 'nasa',
      name: 'NASA',
      url: 'https://www.youtube.com/nasa',
    },
    thumbnailUrl: 'https://i.ytimg.com/vi/xyz789/maxresdefault.jpg',
    publishedAt: new Date(Date.now() - 3600000),
    isLive: true,
    viewCount: 45230,
    category: 'livestream',
  },
]

// Mock upcoming launches with webcasts
const MOCK_UPCOMING_WEBCASTS = [
  {
    id: 'upcoming-1',
    launchName: 'Falcon 9 • Starlink Group 6-32',
    provider: 'SpaceX',
    launchTime: new Date(Date.now() + 7200000), // 2 hours from now
    site: 'Cape Canaveral SLC-40',
    webcastUrl: 'https://www.youtube.com/spacex',
  },
  {
    id: 'upcoming-2',
    launchName: 'Electron • NROL-199',
    provider: 'Rocket Lab',
    launchTime: new Date(Date.now() + 14400000), // 4 hours from now
    site: 'Mahia LC-1A',
    webcastUrl: 'https://www.youtube.com/rocketlabusa',
  },
  {
    id: 'upcoming-3',
    launchName: 'Atlas V • USSF-51',
    provider: 'United Launch Alliance',
    launchTime: new Date(Date.now() + 28800000), // 8 hours from now
    site: 'Vandenberg SLC-3E',
    webcastUrl: 'https://www.youtube.com/ulalaunch',
  },
]

export default function LivePage() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedVideo(null), 300)
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Radio className="h-8 w-8 text-red-500 animate-pulse" aria-hidden="true" />
          <h1 className="text-4xl font-bold text-white font-display">Live Streams</h1>
        </div>
        <p className="text-gray-300">
          Live coverage of rocket launches, spacewalks, and space events happening now
        </p>
      </div>

      {/* Live Streams Section */}
      {MOCK_LIVE_STREAMS.length > 0 ? (
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Badge variant="live" className="animate-pulse">
              <Radio className="h-3 w-3" aria-hidden="true" />
              {MOCK_LIVE_STREAMS.length} LIVE NOW
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_LIVE_STREAMS.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="cursor-pointer"
              >
                <VideoCard video={video} variant="default" />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-12">
          <div className="glass-panel rounded-lg border-2 border-dashed border-white/20 p-12 text-center">
            <Radio className="h-16 w-16 text-gray-600 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-white mb-2">No Live Streams</h3>
            <p className="text-gray-400 mb-6">
              There are no live streams at the moment. Check the upcoming webcasts below.
            </p>
            <Link
              href="/videos"
              className="text-cosmos-cyan hover:text-cosmos-cyan/80 transition-colors"
            >
              Browse Recent Videos →
            </Link>
          </div>
        </section>
      )}

      {/* Upcoming Webcasts Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2 font-display">
            Upcoming Webcasts
          </h2>
          <p className="text-gray-300">Scheduled launches with confirmed webcast coverage</p>
        </div>

        <div className="grid gap-4">
          {MOCK_UPCOMING_WEBCASTS.map((webcast) => {
            const hoursUntil = Math.floor(
              (webcast.launchTime.getTime() - Date.now()) / (1000 * 60 * 60)
            )
            const minutesUntil = Math.floor(
              ((webcast.launchTime.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60)
            )

            return (
              <div
                key={webcast.id}
                className="group relative overflow-hidden glass-panel rounded-lg p-6 transition-all hover:border-rocket-orange/30 hover:shadow-lg hover:shadow-rocket-orange/10"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Launch Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-rocket-orange transition-colors">
                      {webcast.launchName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Rocket className="h-4 w-4" aria-hidden="true" />
                        <span>{webcast.provider}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        <span>{webcast.site}</span>
                      </div>

                      <div className="text-xs text-gray-500">
                        {format(webcast.launchTime, 'PPp')}
                      </div>
                    </div>
                  </div>

                  {/* Time Until Launch */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-rocket-orange font-mono">
                        T-{hoursUntil}h {minutesUntil}m
                      </div>
                      <div className="text-xs text-gray-500">until launch</div>
                    </div>

                    {/* Webcast Link */}
                    <a
                      href={webcast.webcastUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-cosmos-cyan text-white transition-all hover:scale-110 hover:bg-cosmos-cyan/80"
                      aria-label={`Watch ${webcast.launchName} webcast`}
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA to Launches Page */}
      <div className="mt-12 glass-panel-strong rounded-lg p-8 text-center border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-2 font-display">
          View All Upcoming Launches
        </h3>
        <p className="text-gray-300 mb-4">
          Browse all scheduled launches with detailed information and countdowns
        </p>
        <Link
          href="/launch"
          className="inline-flex items-center gap-2 rounded-lg bg-rocket-orange px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-rocket-orange/80"
        >
          <Rocket className="h-5 w-5" aria-hidden="true" />
          View Launch Schedule
        </Link>
      </div>

      {/* Video Modal */}
      <VideoModal video={selectedVideo} isOpen={isModalOpen} onClose={handleCloseModal} />

      {/* Note about mock data */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Note: Live stream data is currently mocked. Future updates will integrate YouTube Data
          API for real-time updates.
        </p>
      </div>
    </div>
  )
}
