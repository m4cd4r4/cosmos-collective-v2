'use client';

import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import { VideoCard } from '@/components/features/video/VideoCard';
import { Spinner } from '@/components/ui/Spinner';
import { useUserPreferences } from '@/lib/stores/preferences';
import type { Video } from '@/types/video';

// Mock video data (Phase 2 will use YouTube API)
const MOCK_VIDEOS: Video[] = [
  {
    id: 'video-1',
    source: 'youtube',
    externalId: 'dQw4w9WgXcQ',
    title: '🔴 LIVE: SpaceX Starship Flight Test',
    description: 'Watch the latest Starship integrated flight test live from Starbase, Texas.',
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
    ageAppropriate: ['explorer', 'cadet', 'missionControl'],
  },
  {
    id: 'video-2',
    source: 'youtube',
    externalId: 'abc123',
    title: 'Falcon 9 Starlink Launch Highlights',
    description: 'Highlights from the recent Starlink mission, including booster landing.',
    channel: {
      id: 'spacex',
      name: 'SpaceX',
      url: 'https://www.youtube.com/spacex',
    },
    thumbnailUrl: 'https://i.ytimg.com/vi/abc123/maxresdefault.jpg',
    duration: 180,
    publishedAt: new Date(Date.now() - 86400000), // Yesterday
    isLive: false,
    viewCount: 450230,
    category: 'launch',
    ageAppropriate: ['explorer', 'cadet', 'missionControl'],
  },
  {
    id: 'video-3',
    source: 'youtube',
    externalId: 'def456',
    title: 'Inside the Vehicle Assembly Building',
    description: 'An exclusive tour of NASA\'s massive Vehicle Assembly Building at Kennedy Space Center.',
    channel: {
      id: 'nasa',
      name: 'NASA',
      url: 'https://www.youtube.com/nasa',
    },
    thumbnailUrl: 'https://i.ytimg.com/vi/def456/maxresdefault.jpg',
    duration: 720,
    publishedAt: new Date(Date.now() - 172800000), // 2 days ago
    isLive: false,
    viewCount: 892100,
    category: 'documentary',
    ageAppropriate: ['cadet', 'missionControl'],
  },
];

/**
 * FeaturedVideos component for the homepage
 *
 * Features:
 * - Featured live stream (if available) in larger card
 * - Grid of recent videos
 * - Age-mode filtering
 * - Loading state
 * - "View All" link to videos page
 */
export function FeaturedVideos(): JSX.Element {
  const { ageMode } = useUserPreferences();

  // Filter videos by age appropriateness
  const filteredVideos = MOCK_VIDEOS.filter(video =>
    video.ageAppropriate?.includes(ageMode) ?? true
  );

  // Separate live videos and regular videos
  const liveVideos = filteredVideos.filter(v => v.isLive);
  const regularVideos = filteredVideos.filter(v => !v.isLive);

  // Featured video (first live, or first regular)
  const featuredVideo = liveVideos[0] || regularVideos[0];

  // Additional videos (remaining videos, up to 2)
  const additionalVideos = [
    ...liveVideos.slice(1),
    ...regularVideos.slice(liveVideos.length > 0 ? 0 : 1),
  ].slice(0, 2);

  if (filteredVideos.length === 0) {
    return (
      <section className="bg-cosmos py-16">
        <div className="container-custom">
          <div className="flex items-center justify-center py-12">
            <p className="text-stardust">No videos available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cosmos py-16">
      <div className="container-custom">
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-starlight">
              {ageMode === 'explorer' ? '📺 Watch Rockets!' : 'Live & Videos'}
            </h2>
            <p className="mt-2 text-stardust">
              {ageMode === 'explorer'
                ? 'See real rocket launches and space videos'
                : ageMode === 'cadet'
                ? 'Watch live launches and space content'
                : 'Live streams, launch highlights, and space documentaries'}
            </p>
          </div>

          <Link
            href="/videos"
            className="group flex items-center gap-2 text-plasma-blue transition-colors hover:text-aurora-teal"
          >
            <span className="hidden sm:inline">View All</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Video Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured Video (2 columns on desktop if available) */}
          {featuredVideo && (
            <VideoCard
              video={featuredVideo}
              variant="featured"
            />
          )}

          {/* Additional Videos */}
          {additionalVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              variant="default"
            />
          ))}
        </div>

        {/* Note about mock data (remove in production) */}
        <div className="mt-6 text-center">
          <p className="text-xs text-stardust/60">
            Note: Video thumbnails are placeholders. Phase 2 will integrate YouTube API for real data.
          </p>
        </div>
      </div>
    </section>
  );
}
