'use client'

/**
 * Explore Page Error Boundary
 * Handles errors in the exploration catalog with recovery options
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { AlertTriangle, RefreshCw, Home, Map } from 'lucide-react'

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Explore page error:', error)
  }, [error])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-cosmos-void px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/20">
              <AlertTriangle className="w-10 h-10 text-purple-400" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Catalog Temporarily Unavailable
          </h1>

          <p className="text-gray-400 mb-6">
            We're having trouble loading the observation catalog. The NASA and astronomy APIs might be experiencing high traffic.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-purple-950/30 border border-purple-500/20 rounded-lg text-left">
              <p className="text-xs font-mono text-purple-300 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>

            <Button
              onClick={() => window.location.href = '/sky-map'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              Sky Map
            </Button>

            <Button
              onClick={() => window.location.href = '/'}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
