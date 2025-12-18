'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, Radio, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { Video } from '@/types/video';

export interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'featured';
  className?: string;
}

/**
 * VideoCard component for displaying video thumbnails with metadata
 *
 * Features:
 * - Thumbnail with play overlay on hover
 * - Live badge for live streams (pulsing)
 * - Duration display
 * - Channel information
 * - View count
 * - Responsive design
 */
export function VideoCard({ video, variant = 'default', className }: VideoCardProps): JSX.Element {
  const isFeatured = variant === 'featured';

  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format view count (e.g., 1.2K, 3.5M)
  const formatViewCount = (count?: number): string => {
    if (!count) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const videoUrl = video.source === 'youtube'
    ? `https://www.youtube.com/watch?v=${video.externalId}`
    : '#';

  return (
    <Card
      variant="interactive"
      className={cn(
        isFeatured && 'md:col-span-2',
        className
      )}
    >
      <CardContent className="p-0">
        {/* Thumbnail with Play Overlay */}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-video overflow-hidden bg-nebula"
        >
          {/* Thumbnail Image */}
          <div className="relative h-full w-full">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={isFeatured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
            />
          </div>

          {/* Play Overlay (on hover) */}
          <div className="absolute inset-0 flex items-center justify-center bg-void/0 transition-colors duration-300 group-hover:bg-void/60">
            <div className="translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rocket-orange">
                <Play className="h-8 w-8 fill-current text-starlight" />
              </div>
            </div>
          </div>

          {/* Live Badge */}
          {video.isLive && (
            <div className="absolute left-3 top-3">
              <Badge variant="live" className="animate-pulse">
                <Radio className="h-3 w-3" />
                LIVE
              </Badge>
            </div>
          )}

          {/* Duration (bottom right) */}
          {!video.isLive && video.duration && (
            <div className="absolute bottom-3 right-3 rounded bg-void/80 px-2 py-1 text-xs font-medium text-starlight backdrop-blur-sm">
              {formatDuration(video.duration)}
            </div>
          )}
        </a>

        {/* Video Metadata */}
        <div className="p-4">
          {/* Title */}
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group/title mb-2 block font-semibold text-starlight transition-colors hover:text-rocket-orange',
              isFeatured ? 'text-lg' : 'text-base line-clamp-2'
            )}
          >
            {video.title}
          </a>

          {/* Channel */}
          <div className="flex items-center justify-between text-sm text-stardust">
            <a
              href={video.channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-starlight transition-colors"
            >
              {video.channel.name}
            </a>

            {/* View Count */}
            {video.viewCount !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formatViewCount(video.viewCount)}</span>
              </div>
            )}
          </div>

          {/* Description (featured variant only) */}
          {isFeatured && video.description && (
            <p className="mt-2 text-sm text-stardust line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
