'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface WorldMapLeafletProps {
  issPosition?: { lat: number; lon: number } | null
  className?: string
  height?: number
}

const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const TILE_ATTR = 'Tiles &copy; Esri'

export function WorldMapLeaflet({ issPosition, className, height = 200 }: WorldMapLeafletProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  const pulseRef = useRef<L.CircleMarker | null>(null)

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 1,
      minZoom: 1,
      maxZoom: 6,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    })

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR }).addTo(map)
    mapRef.current = map

    // Invalidate size after render
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
      pulseRef.current = null
    }
  }, [])

  // Update ISS marker position
  useEffect(() => {
    const map = mapRef.current
    if (!map || !issPosition) return

    const pos: L.LatLngExpression = [issPosition.lat, issPosition.lon]

    if (!markerRef.current) {
      // Create pulse ring
      pulseRef.current = L.circleMarker(pos, {
        radius: 14,
        color: '#d4af37',
        weight: 1.5,
        opacity: 0.4,
        fillColor: '#d4af37',
        fillOpacity: 0.08,
        className: 'iss-pulse',
      }).addTo(map)

      // Create core marker
      markerRef.current = L.circleMarker(pos, {
        radius: 6,
        color: '#d4af37',
        weight: 2,
        opacity: 1,
        fillColor: '#fff',
        fillOpacity: 0.9,
      }).addTo(map)

      markerRef.current.bindTooltip('ISS', {
        permanent: true,
        direction: 'top',
        offset: [0, -10],
        className: 'iss-tooltip',
      })
    } else {
      markerRef.current.setLatLng(pos)
      pulseRef.current?.setLatLng(pos)
    }

    map.panTo(pos, { animate: true, duration: 1 })
  }, [issPosition])

  // Resize handling
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const timer = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(timer)
  }, [height])

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: `${height}px`, borderRadius: '0.75rem', overflow: 'hidden' }}
      />
      <style jsx global>{`
        .iss-tooltip {
          background: rgba(10, 14, 26, 0.85) !important;
          border: 1px solid rgba(212, 175, 55, 0.5) !important;
          color: #d4af37 !important;
          font-family: var(--font-jetbrains-mono), monospace !important;
          font-size: 10px !important;
          font-weight: bold !important;
          letter-spacing: 0.1em !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.2) !important;
        }
        .iss-tooltip::before {
          border-top-color: rgba(212, 175, 55, 0.5) !important;
        }
        .iss-pulse {
          animation: iss-pulse-anim 2s ease-in-out infinite;
        }
        @keyframes iss-pulse-anim {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.1; }
        }
        .leaflet-container {
          background: #0a0e1a !important;
        }
      `}</style>
    </div>
  )
}
