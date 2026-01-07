'use client'

/**
 * Sky Map Error Boundary
 * Handles errors in the Sky Map page with astronomy-themed recovery
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { AlertTriangle, RefreshCw, Telescope } from 'lucide-react'

export default function SkyMapError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Sky Map error:', error)
  }, [error])

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-cosmos-void px-4">
        <div className="max-w-md w-full text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/20">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Sky Map Unavailable
          </h1>

          <p className="text-gray-400 mb-6">
            The interactive sky map encountered an error while loading. This could be due to a network issue or browser compatibility.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-amber-950/30 border border-amber-500/20 rounded-lg text-left">
              <p className="text-xs font-mono text-amber-300 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Suggestions */}
          <div className="mb-6 p-4 bg-cosmos-depth/50 border border-gray-700 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-white mb-2">Try these solutions:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try a different browser (Chrome, Firefox, Safari)</li>
              <li>• Disable browser extensions temporarily</li>
              <li>• Clear your browser cache</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              variant="primary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Sky Map
            </Button>

            <Button
              onClick={() => window.location.href = '/explore'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Telescope className="w-4 h-4" />
              Browse Catalog
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
