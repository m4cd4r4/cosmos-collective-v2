'use client'

/**
 * Global Error Boundary (Root Level)
 * Catches errors in the root layout and provides a minimal fallback
 * This is the last line of defense - must be completely self-contained
 */

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(180deg, #030014 0%, #0a0a1f 100%)',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          maxWidth: '500px',
          padding: '2rem',
          textAlign: 'center',
        }}>
          {/* Error Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
          }}>
            ⚠️
          </div>

          {/* Error Message */}
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}>
            Critical Error
          </h1>

          <p style={{
            color: '#9ca3af',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}>
            The application encountered a critical error. Please try refreshing the page or contact support if the problem persists.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(127, 29, 29, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              textAlign: 'left',
            }}>
              <code style={{
                fontSize: '0.75rem',
                color: '#fca5a5',
                wordBreak: 'break-all',
              }}>
                {error.message}
              </code>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '1rem',
              }}
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '1rem',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
