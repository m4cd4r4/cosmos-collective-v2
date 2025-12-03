'use client'

/**
 * Button Component
 * Accessible, customizable button with multiple variants
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================
// Button Variants using CVA
// ============================================

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmos-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-cosmos-void',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'touch-target', // Ensures minimum 44px touch target
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-r from-cosmos-cyan to-cosmos-purple',
          'text-white font-semibold',
          'hover:shadow-glow-cyan hover:scale-[1.02]',
          'active:scale-[0.98]',
        ],
        secondary: [
          'glass-panel',
          'text-gray-100',
          'hover:bg-white/10 hover:border-white/20',
        ],
        ghost: [
          'bg-transparent',
          'text-gray-300 hover:text-white',
          'hover:bg-white/5',
        ],
        outline: [
          'border-2 border-cosmos-cyan/50',
          'text-cosmos-cyan',
          'hover:bg-cosmos-cyan/10 hover:border-cosmos-cyan',
        ],
        danger: [
          'bg-red-600 hover:bg-red-700',
          'text-white font-semibold',
        ],
        success: [
          'bg-green-600 hover:bg-green-700',
          'text-white font-semibold',
        ],
        link: [
          'text-cosmos-cyan underline-offset-4',
          'hover:underline',
          'p-0 h-auto',
        ],
      },
      size: {
        xs: 'h-8 px-2.5 text-xs',
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

// ============================================
// Button Props
// ============================================

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Loading state - shows spinner and disables button */
  isLoading?: boolean
  /** Icon to display before text */
  leftIcon?: React.ReactNode
  /** Icon to display after text */
  rightIcon?: React.ReactNode
  /** Render as child component (for Link wrapping) */
  asChild?: boolean
}

// ============================================
// Loading Spinner
// ============================================

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// ============================================
// Button Component
// ============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="w-4 h-4" />
            <span className="sr-only">Loading</span>
            {children && <span aria-hidden="true">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

// ============================================
// Icon Button Variant
// ============================================

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  /** Accessible label for the button (required for icon-only buttons) */
  'aria-label': string
  /** The icon to display */
  icon: React.ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} {...props}>
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

// Export variants for external use
export { buttonVariants }
