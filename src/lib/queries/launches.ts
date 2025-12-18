'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from './keys';
import type { Launch } from '@/types/launch';

/**
 * Fetch the next upcoming launch
 */
export function useNextLaunch() {
  return useQuery({
    queryKey: queryKeys.launches.next(),
    queryFn: () => apiClient<Launch>('/launches/next'),
    refetchInterval: 60 * 1000, // Refetch every minute
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
  });
}

/**
 * Fetch upcoming launches
 */
export function useUpcomingLaunches(limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.launches.upcoming(),
    queryFn: () =>
      apiClient<Launch[]>('/launches/upcoming', {
        params: { limit },
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single launch by ID
 */
export function useLaunch(id: string) {
  return useQuery({
    queryKey: queryKeys.launches.detail(id),
    queryFn: () => apiClient<Launch>(`/launches/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all launches with filters
 */
export function useLaunches(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.launches.list(filters || {}),
    queryFn: () =>
      apiClient<Launch[]>('/launches', {
        params: filters as Record<string, string | number | boolean>,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
