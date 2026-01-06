'use client'

/**
 * OptimizedImage Component
 * Enhanced Next.js Image with error handling, fallbacks, and blur placeholders
 */

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
  showPlaceholder?: boolean
}

// Simple base64 blur placeholder (cosmic gradient)
const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmX/9k='

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder-cosmic.jpg',
  showPlaceholder = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoadingComplete}
        placeholder={showPlaceholder ? 'blur' : 'empty'}
        blurDataURL={BLUR_DATA_URL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && 'grayscale',
          props.className
        )}
      />

      {/* Loading shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}

      {/* Error indicator (subtle) */}
      {hasError && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-gray-400">
          Fallback image
        </div>
      )}
    </div>
  )
}

// Export a version for static images that don't need error handling
export function StaticImage(props: ImageProps) {
  return (
    <Image
      {...props}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
    />
  )
}
