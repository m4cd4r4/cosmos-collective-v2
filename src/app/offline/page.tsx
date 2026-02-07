'use client'

/**
 * Offline Page
 * Shown when the user is offline and the requested page is not cached
 */

import { WifiOff, RefreshCw, Home, Star, BookOpen } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-cosmos-void flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        {/* Offline Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-cosmos-surface flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-display font-bold text-white mb-4">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-gray-400 mb-8">
          It looks like you&apos;ve lost your connection to Earth.
          Don&apos;t worry - some features are still available offline!
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cosmos-gold to-cosmos-nebula-blue text-white font-semibold hover:shadow-glow-cyan transition-all mb-8"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>

        {/* Offline Features */}
        <div className="border-t border-white/10 pt-8">
          <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-4">
            Available Offline
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-cosmos-surface">
              <Star className="w-6 h-6 text-cosmos-gold mx-auto mb-2" />
              <span className="text-sm text-gray-300">Favorites</span>
            </div>
            <div className="p-4 rounded-lg bg-cosmos-surface">
              <BookOpen className="w-6 h-6 text-cosmos-gold mx-auto mb-2" />
              <span className="text-sm text-gray-300">Devlog</span>
            </div>
            <div className="p-4 rounded-lg bg-cosmos-surface">
              <Home className="w-6 h-6 text-cosmos-nebula-blue mx-auto mb-2" />
              <span className="text-sm text-gray-300">Dashboard</span>
            </div>
          </div>
        </div>

        {/* Fun fact */}
        <div className="mt-8 p-4 rounded-lg bg-cosmos-gold/5 border border-cosmos-gold/20">
          <p className="text-sm text-gray-300">
            <span className="text-cosmos-gold font-semibold">Fun fact: </span>
            The Voyager 1 spacecraft is 24 billion km from Earth,
            yet still sends data back at 160 bits per second!
          </p>
        </div>
      </div>
    </div>
  )
}
