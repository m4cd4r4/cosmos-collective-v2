/**
 * Events Page Loading Skeleton
 * Shows while fetching live astronomy events
 */

import { Skeleton } from '@/components/ui/Skeleton'

export function EventsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8 text-center">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      {/* Featured event skeleton */}
      <div className="mb-12 bg-gradient-to-r from-cosmos-depth/50 to-purple-900/20 border border-purple-500/20 rounded-lg p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 mt-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mb-6 flex gap-4 border-b border-gray-700">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Events list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-cosmos-depth/50 border border-gray-700 rounded-lg p-6"
          >
            <div className="flex gap-6">
              {/* Date badge skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="h-16 w-16 rounded-lg" />
              </div>

              {/* Event details skeleton */}
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>

              {/* Action skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="h-10 w-24 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
