'use client'

/**
 * Cosmos Collective - Client-side Providers
 * Wraps the app with necessary context providers
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect, type ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { PWAProvider } from '@/components/PWAProvider'

// ============================================
// React Query Configuration
// ============================================

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: how long until data is considered stale
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Cache time: how long to keep data in cache after it's unused
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        // Retry failed requests
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for fresh data
        refetchOnWindowFocus: false,
      },
    },
  })
}

// Singleton pattern for browser
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

// ============================================
// Accessibility Preferences Provider
// ============================================

interface A11yContextType {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}

import { createContext, useContext } from 'react'

const A11yContext = createContext<A11yContextType>({
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  setFontSize: () => {},
})

export const useA11y = () => useContext(A11yContext)

function A11yProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')

  useEffect(() => {
    // Check system preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: more)')

    setReducedMotion(motionQuery.matches)
    setHighContrast(contrastQuery.matches)

    // Listen for changes
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches)

    motionQuery.addEventListener('change', handleMotionChange)
    contrastQuery.addEventListener('change', handleContrastChange)

    // Load saved font size preference
    const savedFontSize = localStorage.getItem('cosmos-font-size') as 'small' | 'medium' | 'large'
    if (savedFontSize) setFontSize(savedFontSize)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])

  useEffect(() => {
    // Apply font size to document
    const root = document.documentElement
    root.classList.remove('text-sm', 'text-base', 'text-lg')

    switch (fontSize) {
      case 'small':
        root.classList.add('text-sm')
        break
      case 'large':
        root.classList.add('text-lg')
        break
      default:
        root.classList.add('text-base')
    }

    // Save preference
    localStorage.setItem('cosmos-font-size', fontSize)
  }, [fontSize])

  useEffect(() => {
    // Apply reduced motion class
    document.documentElement.classList.toggle('motion-reduce', reducedMotion)
  }, [reducedMotion])

  useEffect(() => {
    // Apply high contrast class
    document.documentElement.classList.toggle('high-contrast', highContrast)
  }, [highContrast])

  return (
    <A11yContext.Provider value={{ reducedMotion, highContrast, fontSize, setFontSize }}>
      {children}
    </A11yContext.Provider>
  )
}

// ============================================
// Toast Notifications Context
// ============================================

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export const useToast = () => useContext(ToastContext)

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`glass-panel rounded-lg p-4 animate-slide-up ${
              toast.type === 'error'
                ? 'border-red-500/50'
                : toast.type === 'success'
                  ? 'border-green-500/50'
                  : toast.type === 'warning'
                    ? 'border-yellow-500/50'
                    : 'border-blue-500/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">
                {toast.type === 'error' && '❌'}
                {toast.type === 'success' && '✅'}
                {toast.type === 'warning' && '⚠️'}
                {toast.type === 'info' && 'ℹ️'}
              </span>
              <div className="flex-1">
                <p className="font-medium">{toast.title}</p>
                {toast.message && <p className="text-sm text-gray-400">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ============================================
// Main Providers Component
// ============================================

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <A11yProvider>
          <ToastProvider>
            <PWAProvider>{children}</PWAProvider>
          </ToastProvider>
        </A11yProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  )
}
