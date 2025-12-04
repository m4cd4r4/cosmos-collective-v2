'use client'

/**
 * Card Component
 * Glass-morphism cards for displaying content
 */

import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================
// Card Variants
// ============================================

const cardVariants = cva(
  [
    'rounded-xl overflow-hidden',
    'transition-all duration-300',
  ],
  {
    variants: {
      variant: {
        default: 'glass-panel',
        solid: 'bg-cosmos-surface border border-white/10',
        ghost: 'bg-transparent',
        elevated: 'glass-panel-strong shadow-cosmic',
        interactive: [
          'glass-panel',
          'cursor-pointer',
          'hover:border-white/20 hover:shadow-glow-cyan',
          'focus-visible:ring-2 focus-visible:ring-cosmos-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-cosmos-void',
        ],
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

// ============================================
// Card Component
// ============================================

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Make the card a clickable element */
  as?: 'div' | 'article' | 'section' | 'button'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(cardVariants({ variant, padding }), className)}
        {...(props as any)}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'

// ============================================
// Card Header
// ============================================

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

// ============================================
// Card Title
// ============================================

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn('text-xl font-semibold text-white', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

// ============================================
// Card Description
// ============================================

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-400', className)}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

// ============================================
// Card Content
// ============================================

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

// ============================================
// Card Footer
// ============================================

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4 border-t border-white/10', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

// ============================================
// Image Card (for observations)
// ============================================

export interface ImageCardProps extends Omit<CardProps, 'children'> {
  /** Image source URL */
  src: string
  /** Alt text for the image */
  alt: string
  /** Title displayed over the image */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Optional badge text */
  badge?: string
  /** Badge color variant */
  badgeVariant?: 'cyan' | 'gold' | 'purple' | 'pink'
  /** Loading state */
  isLoading?: boolean
  /** Aspect ratio */
  aspectRatio?: 'video' | 'square' | 'golden' | 'astronomical'
}

export const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(
  (
    {
      className,
      src,
      alt,
      title,
      subtitle,
      badge,
      badgeVariant = 'cyan',
      isLoading,
      aspectRatio = 'video',
      ...props
    },
    ref
  ) => {
    const aspectClasses = {
      video: 'aspect-video',
      square: 'aspect-square',
      golden: 'aspect-golden',
      astronomical: 'aspect-astronomical',
    }

    const badgeColors = {
      cyan: 'bg-cosmos-cyan/20 text-cosmos-cyan',
      gold: 'bg-cosmos-gold/20 text-cosmos-gold',
      purple: 'bg-cosmos-purple/20 text-cosmos-purple',
      pink: 'bg-cosmos-pink/20 text-cosmos-pink',
    }

    return (
      <Card
        ref={ref}
        variant="interactive"
        padding="none"
        className={cn('group', className)}
        {...props}
      >
        <div className={cn('relative overflow-hidden', aspectClasses[aspectRatio])}>
          {isLoading ? (
            <div className="absolute inset-0 skeleton" />
          ) : (
            <>
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-cosmos-void via-transparent to-transparent opacity-80" />
            </>
          )}

          {/* Badge */}
          {badge && (
            <span
              className={cn(
                'absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium',
                badgeColors[badgeVariant]
              )}
            >
              {badge}
            </span>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h4 className="font-semibold text-white truncate">{title}</h4>
            {subtitle && (
              <p className="text-sm text-gray-300 truncate">{subtitle}</p>
            )}
          </div>
        </div>
      </Card>
    )
  }
)

ImageCard.displayName = 'ImageCard'
