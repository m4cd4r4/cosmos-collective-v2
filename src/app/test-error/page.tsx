'use client'

/**
 * Error Boundary Test Page (Development Only)
 * Use this page to test error boundaries in different scenarios
 * Access: /test-error
 */

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { AlertTriangle, Bug } from 'lucide-react'

export default function TestErrorPage() {
  const [errorType, setErrorType] = useState<string | null>(null)

  // Trigger different types of errors
  if (errorType === 'render') {
    throw new Error('Test render error: This is a simulated error during component rendering')
  }

  if (errorType === 'async') {
    // Simulate async error
    Promise.reject(new Error('Test async error: Simulated promise rejection'))
  }

  const triggerError = (type: string) => {
    setErrorType(type)
  }

  const triggerEventError = () => {
    throw new Error('Test event error: This error was triggered by a user interaction')
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-cosmos-void px-4">
          <div className="text-center">
            <p className="text-gray-400">This page is only available in development mode.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-cosmos-void px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/20 mb-4">
              <Bug className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Error Boundary Testing
            </h1>
            <p className="text-gray-400">
              Test error boundaries by triggering different types of errors
            </p>
          </div>

          {/* Warning Banner */}
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400 mb-1">
                  Development Mode Only
                </p>
                <p className="text-sm text-gray-400">
                  This page is only accessible in development. Triggering errors will test the error boundaries you've implemented.
                </p>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="grid gap-4">
            {/* Render Error */}
            <div className="p-6 bg-cosmos-depth/50 border border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">
                1. Render Error
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Throws an error during component rendering. Should be caught by the nearest error boundary.
              </p>
              <Button
                onClick={() => triggerError('render')}
                variant="destructive"
              >
                Trigger Render Error
              </Button>
            </div>

            {/* Event Handler Error */}
            <div className="p-6 bg-cosmos-depth/50 border border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">
                2. Event Handler Error
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Throws an error inside a click event handler. Will be logged to console.
              </p>
              <Button
                onClick={triggerEventError}
                variant="destructive"
              >
                Trigger Event Error
              </Button>
            </div>

            {/* Async Error */}
            <div className="p-6 bg-cosmos-depth/50 border border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">
                3. Async Error (Promise Rejection)
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Triggers an unhandled promise rejection. Check console for error.
              </p>
              <Button
                onClick={() => triggerError('async')}
                variant="destructive"
              >
                Trigger Async Error
              </Button>
            </div>

            {/* Console Error */}
            <div className="p-6 bg-cosmos-depth/50 border border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">
                4. Console Error
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Logs an error to console without throwing. Useful for error tracking testing.
              </p>
              <Button
                onClick={() => console.error('Test console error: This is a simulated console.error() call')}
                variant="outline"
              >
                Log Console Error
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-cosmos-depth/30 border border-gray-600 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-3">
              Testing Instructions:
            </h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>1. Open browser DevTools (F12) to see console logs</li>
              <li>2. Click a button to trigger an error</li>
              <li>3. Verify the error boundary displays correctly</li>
              <li>4. Click "Try Again" or "Go Home" to recover</li>
              <li>5. Check that navigation and recovery work properly</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
