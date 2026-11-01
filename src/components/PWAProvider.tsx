'use client'

/**
 * PWA Provider
 * Handles service worker registration and PWA features
 */

import { useEffect, useState, useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// beforeinstallprompt fires once per page load, usually before the footer is on screen,
// so the provider keeps it here for whichever component asks later.
let installEvent: BeforeInstallPromptEvent | null = null
const installListeners = new Set<() => void>()
function setInstallEvent(e: BeforeInstallPromptEvent | null) {
  installEvent = e
  installListeners.forEach((listener) => listener())
}
function subscribeInstallEvent(listener: () => void) {
  installListeners.add(listener)
  return () => { installListeners.delete(listener) }
}

export function PWAProvider({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    let updateIntervalId: ReturnType<typeof setInterval> | undefined

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for updates periodically
          updateIntervalId = setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // Every hour
        })
        .catch(() => {
          // Service worker registration failed
        })
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }

    // Check if already installed
    const handleAppInstalled = () => {
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      if (updateIntervalId) clearInterval(updateIntervalId)
    }
  }, [])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      // App back online
    }

    const handleOffline = () => {
      // App went offline
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return <>{children}</>
}

// Hook to access install prompt
export function useInstallPrompt() {
  const deferredPrompt = useSyncExternalStore(subscribeInstallEvent, () => installEvent, () => null)

  const install = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setInstallEvent(null)

    return outcome === 'accepted'
  }

  return { canInstall: deferredPrompt !== null, install }
}

// Hook to check online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
