'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Don't show if dismissed this session
    if (sessionStorage.getItem('pwa-prompt-dismissed')) {
      setDismissed(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
    else handleDismiss()
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-prompt-dismissed', '1')
    setDismissed(true)
  }

  return (
    <div
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-72 z-40 animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Install Cosmos Collective app"
    >
      <div
        className="rounded-xl p-4 flex items-center gap-3 shadow-2xl"
        style={{
          background: 'rgba(10,14,26,0.97)',
          border: '1px solid rgba(212,175,55,0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <img src="/icon.svg" alt="" className="w-10 h-10 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white leading-tight">Install Cosmos Collective</p>
          <p className="text-[11px] text-[#6a7890] mt-0.5">Explore the universe offline</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.08em] shrink-0 transition-colors"
          style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37' }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="w-6 h-6 flex items-center justify-center rounded text-[#4a5580] hover:text-white transition-colors shrink-0 text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
