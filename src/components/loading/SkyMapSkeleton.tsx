/**
 * Sky Map Loading Skeleton
 * Shows while Aladin Lite is initializing
 */

import { Skeleton } from '@/components/ui/Skeleton'

export function SkyMapSkeleton() {
  return (
    <div className="absolute inset-0 bg-cosmos-void">
      {/* Main map area */}
      <div className="absolute inset-0">
        <Skeleton className="w-full h-full" />

        {/* Pulsing stars effect */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cosmos-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 animate-pulse">Loading sky map...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing Aladin Lite</p>
        </div>
      </div>

      {/* Control panel skeleton (left side) */}
      <div className="absolute left-4 top-4 space-y-2">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>

      {/* Search bar skeleton (top) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>

      {/* Coordinate display skeleton (bottom) */}
      <div className="absolute bottom-4 right-4">
        <Skeleton className="w-48 h-8 rounded-lg" />
      </div>
    </div>
  )
}
