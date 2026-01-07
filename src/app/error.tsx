'use client'

/**
 * Global Error Boundary
 * Catches errors in any part of the app and provides a friendly fallback UI
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console (or send to error tracking service)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmos-void px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        <p className="text-gray-400 mb-6">
          We encountered an unexpected error. This has been logged and we'll look into it.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-500/20 rounded-lg text-left">
            <p className="text-xs font-mono text-red-300 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="primary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
