import type { AgeMode } from './common';

export interface Video {
  id: string;
  source: 'youtube' | 'vimeo' | 'other';
  externalId: string;

  title: string;
  description?: string;
  channel: VideoChannel;
  thumbnailUrl: string;
  duration?: number;
  publishedAt: Date;

  isLive: boolean;
  viewCount?: number;

  category: VideoCategory;
  relatedLaunchId?: string;
  relatedAgencyId?: string;

  ageAppropriate?: AgeMode[];
}

export interface VideoChannel {
  id: string;
  name: string;
  logo?: string;
  url: string;
}

export type VideoCategory =
  | 'launch'
  | 'documentary'
  | 'news'
  | 'educational'
  | 'interview'
  | 'livestream'
  | 'recap';
