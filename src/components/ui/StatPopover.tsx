'use client'

import { useState, useRef, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

export interface StatPopoverItem {
  label: string
  url?: string
  detail?: string
}

interface StatPopoverProps {
  items: StatPopoverItem[]
  children: React.ReactNode
  className?: string
}

export function StatPopover({ items, children, className }: StatPopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full cursor-pointer hover:bg-white/[0.03] transition-colors rounded-lg"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {children}
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-56 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(8,12,28,0.97)] backdrop-blur-xl shadow-2xl overflow-hidden animate-[fade-in_0.15s_ease-out]">
          <div className="max-h-64 overflow-y-auto py-1.5">
            {items.map((item) => (
              <div key={item.label} className="px-3 py-1.5 hover:bg-white/[0.03]">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 group"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-[#d4af37] group-hover:text-[#e0c060] transition-colors">
                        {item.label}
                      </span>
                      {item.detail && (
                        <span className="block text-[9px] text-[#4a5580] mt-0.5">{item.detail}</span>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-[#4a5580] group-hover:text-[#d4af37] shrink-0 transition-colors" />
                  </a>
                ) : (
                  <div>
                    <span className="text-[11px] font-semibold text-[#c8d4f0]">{item.label}</span>
                    {item.detail && (
                      <span className="block text-[9px] text-[#4a5580] mt-0.5">{item.detail}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
