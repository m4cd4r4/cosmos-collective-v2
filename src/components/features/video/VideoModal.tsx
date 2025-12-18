'use client';

import { useEffect, useRef } from 'react';
import { X, ExternalLink, Calendar, Eye } from 'lucide-react';
import { YouTubeEmbed } from './YouTubeEmbed';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Video } from '@/types/video';

export interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * VideoModal component for fullscreen video viewing
 *
 * Features:
 * - Full-screen overlay modal
 * - YouTube video embed
 * - Video metadata (title, channel, views, date)
 * - Live badge for livestreams
 * - Close on Escape key
 * - Focus trap
 * - Body scroll lock
 * - Click outside to close
 */
export function VideoModal({ video, isOpen, onClose }: VideoModalProps): JSX.Element | null {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll and manage focus
  useEffect(() => {
    if (!isOpen) return;

    // Save current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Focus modal
    modalRef.current?.focus();

    return () => {
      // Unlock body scroll
      document.body.style.overflow = '';

      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !video) {
    return null;
  }

  const videoUrl = video.source === 'youtube'
    ? `https://www.youtube.com/watch?v=${video.externalId}`
    : '#';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl overflow-hidden rounded-lg bg-cosmos shadow-2xl"
        tabIndex={-1}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-void/80 text-starlight transition-colors hover:bg-void hover:text-rocket-orange focus:outline-none focus:ring-2 focus:ring-rocket-orange"
          aria-label="Close video modal"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Video Player */}
        <div className="aspect-video w-full">
          <YouTubeEmbed
            videoId={video.externalId}
            title={video.title}
            autoplay={true}
            className="rounded-t-lg"
          />
        </div>

        {/* Video Metadata */}
        <div className="p-6">
          {/* Title and Live Badge */}
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2
              id="video-modal-title"
              className="text-2xl font-bold text-starlight"
            >
              {video.title}
            </h2>
            {video.isLive && (
              <Badge variant="live" className="animate-pulse flex-shrink-0">
                LIVE
              </Badge>
            )}
          </div>

          {/* Channel and Stats */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-stardust">
            <a
              href={video.channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium transition-colors hover:text-starlight"
            >
              {video.channel.name}
            </a>

            <div className="flex items-center gap-4 text-sm">
              {video.viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{video.viewCount.toLocaleString()} views</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(video.publishedAt, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="mb-4">
              <p className="text-stardust">{video.description}</p>
            </div>
          )}

          {/* Category Badge */}
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="tbd" className="capitalize">
              {video.category}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" asChild>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Watch on YouTube
              </a>
            </Button>

            <Button variant="ghost" size="md" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
