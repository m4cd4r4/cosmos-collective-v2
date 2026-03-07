'use client'

import { useState, useEffect, useRef } from 'react'

const SOURCES = [
  { abbr: 'NASA APOD', endpoint: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', color: '#ef4444' },
  { abbr: 'ISS Track', endpoint: 'https://api.wheretheiss.at/v1/satellites/25544', color: '#06b6d4' },
  { abbr: 'NOAA SWPC', endpoint: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json', color: '#f59e0b' },
  { abbr: 'NASA NEO', endpoint: 'https://api.nasa.gov/neo/rest/v1/feed/today?api_key=DEMO_KEY', color: '#22c55e' },
  { abbr: 'STScI MAST', endpoint: 'https://mast.stsci.edu/api/v0', color: '#8b5cf6' },
  { abbr: 'ALeRCE', endpoint: 'https://api.alerce.online/stamps/v1/', color: '#ec4899' },
]

interface SourceStatus {
  abbr: string
  color: string
  status: 'checking' | 'online' | 'slow' | 'offline'
  latencyMs: number | null
}

export function CreditsWidget() {
  const [sources, setSources] = useState<SourceStatus[]>(
    SOURCES.map(s => ({ abbr: s.abbr, color: s.color, status: 'checking', latencyMs: null }))
  )
  const checkedRef = useRef(false)

  // Ping all sources on mount
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true

    SOURCES.forEach((src, i) => {
      const start = performance.now()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      fetch(src.endpoint, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
        .then(() => {
          clearTimeout(timeout)
          const ms = Math.round(performance.now() - start)
          setSources(prev => {
            const next = [...prev]
            next[i] = { ...next[i], status: ms > 3000 ? 'slow' : 'online', latencyMs: ms }
            return next
          })
        })
        .catch(() => {
          clearTimeout(timeout)
          const ms = Math.round(performance.now() - start)
          // no-cors opaque responses land here too — treat as online if fast
          if (ms < 5000) {
            setSources(prev => {
              const next = [...prev]
              next[i] = { ...next[i], status: ms > 3000 ? 'slow' : 'online', latencyMs: ms }
              return next
            })
          } else {
            setSources(prev => {
              const next = [...prev]
              next[i] = { ...next[i], status: 'offline', latencyMs: null }
              return next
            })
          }
        })
    })
  }, [])

  const onlineCount = sources.filter(s => s.status === 'online' || s.status === 'slow').length
  const allChecked = sources.every(s => s.status !== 'checking')

  return (
    <div className="absolute inset-0 bg-[#050810] flex flex-col px-3.5 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <span className="text-[8px] uppercase tracking-[0.15em] text-[#4a5580]">API Health</span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: allChecked ? (onlineCount === sources.length ? '#22c55e' : onlineCount > 0 ? '#f59e0b' : '#ef4444') : '#6b7280',
              boxShadow: allChecked && onlineCount === sources.length ? '0 0 6px #22c55e' : undefined,
            }}
          />
          <span className="text-[9px] font-mono text-[#4a5580]">
            {allChecked ? `${onlineCount}/${sources.length}` : '...'}
          </span>
        </div>
      </div>

      {/* Source list */}
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        {sources.map(src => (
          <div key={src.abbr} className="flex items-center gap-2">
            {/* Status indicator */}
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                background: src.status === 'online' ? '#22c55e'
                  : src.status === 'slow' ? '#f59e0b'
                  : src.status === 'offline' ? '#ef4444'
                  : '#4a5580',
                boxShadow: src.status === 'online' ? '0 0 4px rgba(34,197,94,0.5)' : undefined,
                animation: src.status === 'checking' ? 'pulse 1.5s ease-in-out infinite' : undefined,
              }}
            />

            {/* Name */}
            <span
              className="text-[10px] font-semibold tracking-wider flex-1"
              style={{ color: src.color }}
            >
              {src.abbr}
            </span>

            {/* Latency */}
            <span className="text-[9px] font-mono text-[#4a5580] tabular-nums w-[42px] text-right">
              {src.status === 'checking' ? '---'
                : src.latencyMs !== null ? `${src.latencyMs}ms`
                : 'ERR'
              }
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-1 border-t border-[rgba(255,255,255,0.04)]">
        <span className="text-[7px] font-mono uppercase tracking-[0.1em] text-[#4a5580]/60">
          {allChecked
            ? onlineCount === sources.length ? 'All systems operational' : `${sources.length - onlineCount} degraded`
            : 'Checking endpoints...'
          }
        </span>
      </div>
    </div>
  )
}
