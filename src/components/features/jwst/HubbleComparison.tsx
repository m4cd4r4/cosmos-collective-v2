'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  jwstUrl: string
  hubbleUrl: string
  targetName: string
  onClose: () => void
}

export function HubbleComparison({ jwstUrl, hubbleUrl, targetName, onClose }: Props) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pos = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100))
    setSliderPos(pos)
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => { if (dragging.current) updateSlider(e.clientX) }
    const onMouseUp = () => { dragging.current = false }
    const onTouchMove = (e: TouchEvent) => { if (dragging.current) updateSlider(e.touches[0].clientX) }
    const onTouchEnd = () => { dragging.current = false }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [updateSlider])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    updateSlider(e.clientX)
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.2)] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37] font-bold">{targetName}</span>
          <span className="text-[10px] text-[#4a5580]">Hubble vs JWST</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#4a5580]">Drag to compare · Esc to close</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-[#8090b0] hover:text-white hover:bg-white/10 transition-colors text-lg leading-none"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Slider area */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-hidden select-none"
        style={{ cursor: dragging.current ? 'ew-resize' : 'col-resize' }}
        onPointerDown={onPointerDown}
      >
        {/* JWST image — bottom layer, always visible */}
        <img
          src={jwstUrl}
          alt={`JWST: ${targetName}`}
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />

        {/* Hubble image — top layer, clipped to left of slider */}
        <img
          src={hubbleUrl}
          alt={`Hubble: ${targetName}`}
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        />

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: `${sliderPos}%`,
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.8) 15%, rgba(255,255,255,0.8) 85%, transparent)',
            boxShadow: '0 0 8px rgba(255,255,255,0.4)',
          }}
        />

        {/* Drag handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-2xl pointer-events-none"
          style={{
            left: `${sliderPos}%`,
            background: 'rgba(20,25,45,0.9)',
            border: '1.5px solid rgba(212,175,55,0.6)',
          }}
        >
          <span className="text-[#d4af37] text-sm font-bold select-none">⟺</span>
        </div>

        {/* HUBBLE label — left side */}
        <div className="absolute bottom-5 left-5 pointer-events-none">
          <div
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-white px-2.5 py-1 rounded"
            style={{ background: 'rgba(74,144,226,0.75)', backdropFilter: 'blur(4px)' }}
          >
            HUBBLE
          </div>
        </div>

        {/* JWST label — right side */}
        <div className="absolute bottom-5 right-5 pointer-events-none">
          <div
            className="text-[11px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded"
            style={{
              background: 'rgba(212,175,55,0.2)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#d4af37',
              backdropFilter: 'blur(4px)',
            }}
          >
            JWST
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-2 bg-[rgba(4,6,18,0.97)] border-t border-[rgba(212,175,55,0.08)] shrink-0 flex items-center justify-between">
        <span className="text-[10px] text-[#4a5580]">Images: NASA / ESA / CSA / STScI</span>
        <span className="text-[10px] text-[#4a5580]">Hubble launched 1990 · JWST launched 2021</span>
      </div>
    </div>,
    document.body
  )
}
