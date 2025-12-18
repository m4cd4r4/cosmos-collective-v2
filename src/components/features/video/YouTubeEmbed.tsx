'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
  showControls?: boolean;
  className?: string;
}

/**
 * YouTubeEmbed component for embedding YouTube videos
 *
 * Features:
 * - Lazy loading with click-to-play thumbnail
 * - Responsive aspect ratio (16:9)
 * - YouTube IFrame Player API
 * - Privacy-enhanced mode (youtube-nocookie.com)
 * - Autoplay support
 * - Customizable controls
 */
export function YouTubeEmbed({
  videoId,
  title,
  autoplay = false,
  showControls = true,
  className,
}: YouTubeEmbedProps): JSX.Element {
  const [isPlaying, setIsPlaying] = useState(autoplay);

  // Generate thumbnail URL
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  // Generate embed URL
  const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
  embedUrl.searchParams.set('autoplay', '1');
  embedUrl.searchParams.set('rel', '0');
  embedUrl.searchParams.set('modestbranding', '1');
  if (!showControls) {
    embedUrl.searchParams.set('controls', '0');
  }

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg bg-void',
        'aspect-video', // 16:9 aspect ratio
        className
      )}
    >
      {!isPlaying ? (
        // Thumbnail with play button
        <button
          onClick={handlePlay}
          className="group relative h-full w-full focus:outline-none focus:ring-2 focus:ring-rocket-orange focus:ring-offset-2 focus:ring-offset-void"
          aria-label={`Play video: ${title}`}
        >
          {/* Thumbnail */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-void/40 transition-colors duration-300 group-hover:bg-void/60" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rocket-orange transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600">
              <Play className="h-10 w-10 fill-current text-starlight" />
            </div>
          </div>

          {/* Title overlay (bottom) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-void to-transparent p-4">
            <p className="text-sm font-medium text-starlight line-clamp-2">{title}</p>
          </div>
        </button>
      ) : (
        // YouTube iframe
        <iframe
          src={embedUrl.toString()}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}
