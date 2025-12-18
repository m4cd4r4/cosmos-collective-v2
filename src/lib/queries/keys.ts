/**
 * Query key factory for TanStack Query
 * Centralized query key management
 */

export const queryKeys = {
  launches: {
    all: ['launches'] as const,
    lists: () => [...queryKeys.launches.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.launches.lists(), filters] as const,
    upcoming: () => [...queryKeys.launches.all, 'upcoming'] as const,
    next: () => [...queryKeys.launches.all, 'next'] as const,
    details: () => [...queryKeys.launches.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.launches.details(), id] as const,
  },
  agencies: {
    all: ['agencies'] as const,
    lists: () => [...queryKeys.agencies.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.agencies.lists(), filters] as const,
    details: () => [...queryKeys.agencies.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.agencies.details(), id] as const,
  },
  vehicles: {
    all: ['vehicles'] as const,
    lists: () => [...queryKeys.vehicles.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.vehicles.lists(), filters] as const,
    details: () => [...queryKeys.vehicles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.vehicles.details(), id] as const,
  },
  videos: {
    all: ['videos'] as const,
    lists: () => [...queryKeys.videos.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.videos.lists(), filters] as const,
    live: () => [...queryKeys.videos.all, 'live'] as const,
  },
  predictions: {
    all: ['predictions'] as const,
    active: () => [...queryKeys.predictions.all, 'active'] as const,
  },
};
