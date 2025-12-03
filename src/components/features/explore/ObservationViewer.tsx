'use client'

/**
 * Observation Viewer Component
 * Interactive pan/zoom image viewer with feature overlays
 */

import { useState, useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Observation, DetectedFeature } from '@/types'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Eye,
  EyeOff,
  Download,
  Share2,
  Layers,
} from 'lucide-react'

interface ObservationViewerProps {
  observation: Observation
}

export function ObservationViewer({ observation }: ObservationViewerProps) {
  const [showFeatures, setShowFeatures] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<DetectedFeature | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const features = observation.features || []

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Share observation
  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: observation.targetName,
        text: observation.description,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      // Would trigger a toast notification here
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative glass-panel rounded-xl overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none'
      )}
    >
      {/* Image viewer */}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        centerOnInit
        wheel={{ step: 0.1 }}
        doubleClick={{ mode: 'zoomIn' }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls toolbar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 glass-panel rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => zoomIn()}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => zoomOut()}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => resetTransform()}
                  aria-label="Reset view"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-1 glass-panel rounded-lg p-1">
                {/* Feature toggle */}
                {features.length > 0 && (
                  <Button
                    variant={showFeatures ? 'secondary' : 'ghost'}
                    size="icon-sm"
                    onClick={() => setShowFeatures(!showFeatures)}
                    aria-label={showFeatures ? 'Hide features' : 'Show features'}
                    aria-pressed={showFeatures}
                  >
                    {showFeatures ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleShare}
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Main image */}
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: isFullscreen ? '100vh' : '70vh',
              }}
            >
              <div className="relative">
                <img
                  src={observation.images.full || observation.images.preview}
                  alt={`${observation.targetName} - ${observation.description || observation.category}`}
                  className="max-w-none"
                  style={{
                    maxHeight: isFullscreen ? '100vh' : '70vh',
                    objectFit: 'contain',
                  }}
                />

                {/* Feature overlays */}
                {showFeatures &&
                  features.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() =>
                        setSelectedFeature(
                          selectedFeature?.id === feature.id ? null : feature
                        )
                      }
                      className={cn(
                        'absolute border-2 rounded transition-all cursor-pointer',
                        selectedFeature?.id === feature.id
                          ? 'border-cosmos-gold bg-cosmos-gold/20'
                          : 'border-cosmos-cyan/50 hover:border-cosmos-cyan bg-cosmos-cyan/10'
                      )}
                      style={{
                        left: `${feature.boundingBox.x}%`,
                        top: `${feature.boundingBox.y}%`,
                        width: `${feature.boundingBox.width}%`,
                        height: `${feature.boundingBox.height}%`,
                      }}
                      aria-label={`${feature.label}: ${(feature.confidence * 100).toFixed(0)}% confidence`}
                    >
                      <span className="sr-only">{feature.label}</span>
                    </button>
                  ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Feature info panel */}
      {selectedFeature && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="glass-panel rounded-lg p-4 max-w-md">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-white">{selectedFeature.label}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedFeature.description || 'No description available'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Confidence</span>
                <div className="text-cosmos-cyan font-bold">
                  {(selectedFeature.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Features legend */}
      {features.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="glass-panel rounded-lg px-3 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3" />
              <span>{features.length} features detected</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard instructions (screen reader) */}
      <div className="sr-only" aria-live="polite">
        Use mouse wheel or pinch to zoom. Drag to pan. Double-click to zoom in.
        {features.length > 0 &&
          ` ${features.length} detected features available. Press Tab to navigate.`}
      </div>
    </div>
  )
}
