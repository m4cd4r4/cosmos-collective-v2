'use client'

/**
 * Citizen Science Error Boundary
 * Handles errors in the citizen science page with project recovery
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { AlertTriangle, RefreshCw, Users, ExternalLink } from 'lucide-react'

export default function CitizenScienceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Citizen Science error:', error)
  }, [error])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-cosmos-void px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/20">
              <AlertTriangle className="w-10 h-10 text-green-400" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Projects Temporarily Unavailable
          </h1>

          <p className="text-gray-400 mb-6">
            We're having trouble connecting to Zooniverse and other citizen science platforms. Please try again in a few moments.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-green-950/30 border border-green-500/20 rounded-lg text-left">
              <p className="text-xs font-mono text-green-300 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Direct Links Fallback */}
          <div className="mb-6 p-4 bg-cosmos-depth/50 border border-gray-700 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-white mb-3">Visit projects directly:</h3>
            <div className="space-y-2">
              <a
                href="https://www.zooniverse.org/projects?discipline=astronomy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-cosmos-cyan hover:text-cosmos-cyan/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Zooniverse Astronomy Projects
              </a>
              <a
                href="https://www.galaxyzoo.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-cosmos-cyan hover:text-cosmos-cyan/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Galaxy Zoo
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Projects
            </Button>

            <Button
              onClick={() => window.location.href = '/explore'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Browse Catalog
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
