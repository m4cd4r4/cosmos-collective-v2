/**
 * Explore Page Loading Skeleton
 * Shows while fetching observation catalog
 */

import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export function ExploreSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Search and filters skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-12 w-full max-w-2xl" />

        <div className="flex gap-4 flex-wrap">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Results grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-cosmos-depth/50 border border-gray-700 rounded-lg overflow-hidden"
          >
            <SkeletonCard />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-8 flex justify-center gap-2">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-10 rounded" />
      </div>
    </div>
  )
}
