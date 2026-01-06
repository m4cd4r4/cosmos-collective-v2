/**
 * Sentry Error Tracking
 * Captures and reports errors in production
 *
 * Setup: Set NEXT_PUBLIC_SENTRY_DSN in .env.local
 */

interface SentryConfig {
  dsn?: string
  environment: string
  enabled: boolean
}

class ErrorTracker {
  private config: SentryConfig
  private initialized = false

  constructor() {
    this.config = {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      enabled: process.env.NODE_ENV === 'production' && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    }
  }

  async init() {
    if (!this.config.enabled || this.initialized) {
      return
    }

    try {
      // Dynamic import to reduce bundle size
      const Sentry = await import('@sentry/nextjs')

      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        tracesSampleRate: 0.1, // 10% of transactions
        beforeSend(event) {
          // Don't send events in development
          if (event.environment === 'development') {
            return null
          }
          return event
        },
        ignoreErrors: [
          // Ignore common browser errors
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
        ],
      })

      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Sentry:', error)
    }
  }

  captureException(error: Error, context?: Record<string, unknown>) {
    if (!this.config.enabled) {
      console.error('Error (Sentry disabled):', error, context)
      return
    }

    import('@sentry/nextjs').then((Sentry) => {
      if (context) {
        Sentry.setContext('additional', context)
      }
      Sentry.captureException(error)
    })
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!this.config.enabled) {
      console.log(`[Sentry ${level}]:`, message)
      return
    }

    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureMessage(message, level)
    })
  }
}

export const errorTracker = new ErrorTracker()

// Initialize on client side
if (typeof window !== 'undefined') {
  errorTracker.init()
}
