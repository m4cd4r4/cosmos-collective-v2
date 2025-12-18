'use client'

/**
 * SimpleExplanation Component
 *
 * Replaces the age-mode system from The Great Expanse.
 * Instead of maintaining 3 versions of every piece of content,
 * this provides an optional "simple explanation" toggle.
 *
 * Usage:
 * <SimpleExplanation
 *   full="The James Webb Space Telescope uses a 6.5-meter primary mirror composed of 18 hexagonal beryllium segments, optimized for infrared observations at wavelengths from 0.6 to 28.5 micrometers."
 *   simple="JWST is a giant space telescope with a huge mirror made of 18 gold-coated pieces. It can see infrared light that our eyes can't see!"
 * />
 */

import { useState, createContext, useContext, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

// ============================================
// Context for Global Toggle State
// ============================================

interface SimpleExplanationContextType {
  showSimple: boolean
  setShowSimple: (value: boolean) => void
}

const SimpleExplanationContext = createContext<SimpleExplanationContextType | null>(null)

export function SimpleExplanationProvider({ children }: { children: ReactNode }) {
  const [showSimple, setShowSimple] = useState(false)

  return (
    <SimpleExplanationContext.Provider value={{ showSimple, setShowSimple }}>
      {children}
    </SimpleExplanationContext.Provider>
  )
}

export function useSimpleExplanation() {
  const context = useContext(SimpleExplanationContext)
  if (!context) {
    // Return default values if no provider (makes it optional)
    return { showSimple: false, setShowSimple: () => {} }
  }
  return context
}

// ============================================
// Global Toggle Button (for Header/Settings)
// ============================================

interface GlobalToggleProps {
  className?: string
}

export function SimpleExplanationToggle({ className }: GlobalToggleProps) {
  const { showSimple, setShowSimple } = useSimpleExplanation()

  return (
    <button
      type="button"
      onClick={() => setShowSimple(!showSimple)}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        showSimple
          ? 'bg-amber-500/20 text-amber-400'
          : 'text-gray-400 hover:text-white hover:bg-white/5',
        className
      )}
      aria-pressed={showSimple}
      title={showSimple ? 'Show full explanations' : 'Show simple explanations'}
    >
      <Lightbulb className={cn('w-4 h-4', showSimple && 'fill-current')} aria-hidden="true" />
      <span className="hidden md:inline">
        {showSimple ? 'Simple Mode' : 'Full Mode'}
      </span>
    </button>
  )
}

// ============================================
// Inline Simple Explanation Component
// ============================================

interface SimpleExplanationProps {
  /** The full, detailed explanation */
  full: string | ReactNode
  /** The simplified explanation for younger audiences or quick understanding */
  simple: string | ReactNode
  /** Optional: Additional CSS classes */
  className?: string
  /** Optional: Whether to show the toggle inline (default: true) */
  showToggle?: boolean
}

export function SimpleExplanation({
  full,
  simple,
  className,
  showToggle = true,
}: SimpleExplanationProps) {
  const { showSimple: globalShowSimple } = useSimpleExplanation()
  const [localShowSimple, setLocalShowSimple] = useState<boolean | null>(null)

  // Use local state if set, otherwise use global
  const showSimple = localShowSimple !== null ? localShowSimple : globalShowSimple

  return (
    <div className={cn('relative', className)}>
      {/* Content */}
      <div className={cn(
        'transition-all duration-200',
        showSimple && 'text-amber-100/90'
      )}>
        {showSimple ? simple : full}
      </div>

      {/* Inline Toggle */}
      {showToggle && (
        <button
          type="button"
          onClick={() => setLocalShowSimple(prev => prev === null ? !globalShowSimple : !prev)}
          className={cn(
            'inline-flex items-center gap-1 mt-2 text-xs font-medium transition-colors',
            showSimple
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-gray-500 hover:text-gray-400'
          )}
        >
          <Lightbulb className="w-3 h-3" aria-hidden="true" />
          {showSimple ? 'Show full explanation' : 'Simpler explanation'}
        </button>
      )}
    </div>
  )
}

// ============================================
// Expandable Simple Explanation (Accordion Style)
// ============================================

interface ExpandableExplanationProps {
  /** The full, detailed explanation (always shown) */
  full: string | ReactNode
  /** The simplified explanation (revealed on click) */
  simple: string | ReactNode
  /** Label for the expandable section */
  label?: string
  /** Optional: Additional CSS classes */
  className?: string
}

export function ExpandableExplanation({
  full,
  simple,
  label = 'Simple explanation',
  className,
}: ExpandableExplanationProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn('space-y-2', className)}>
      {/* Full Content (Always Visible) */}
      <div>{full}</div>

      {/* Expandable Simple Explanation */}
      <div className="border-l-2 border-amber-500/30 pl-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
          aria-expanded={expanded}
        >
          <Lightbulb className="w-4 h-4" aria-hidden="true" />
          <span>{label}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {expanded && (
          <div className="mt-2 text-sm text-amber-100/80 bg-amber-500/5 rounded-lg p-3">
            {simple}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Card with Built-in Simple Mode
// ============================================

interface ExplanationCardProps {
  title: string
  full: string | ReactNode
  simple: string | ReactNode
  icon?: ReactNode
  className?: string
}

export function ExplanationCard({
  title,
  full,
  simple,
  icon,
  className,
}: ExplanationCardProps) {
  const { showSimple } = useSimpleExplanation()

  return (
    <div className={cn(
      'rounded-xl p-4 transition-all duration-200',
      showSimple
        ? 'bg-amber-500/10 border border-amber-500/20'
        : 'bg-white/5 border border-white/10',
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className={cn(
            'p-2 rounded-lg',
            showSimple ? 'bg-amber-500/20' : 'bg-white/10'
          )}>
            {icon}
          </div>
        )}
        <h3 className="font-semibold text-white">{title}</h3>
        {showSimple && (
          <span className="ml-auto text-xs font-medium text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
            Simple
          </span>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        'text-sm leading-relaxed',
        showSimple ? 'text-amber-100/90' : 'text-gray-300'
      )}>
        {showSimple ? simple : full}
      </div>
    </div>
  )
}

// ============================================
// Usage Examples (for documentation)
// ============================================

/*
// 1. Basic inline usage (toggle per-item)
<SimpleExplanation
  full="Neutron stars have densities of about 10^17 kg/m³, meaning a teaspoon would weigh about 6 billion tons on Earth."
  simple="Neutron stars are incredibly dense! A tiny spoonful would be heavier than a mountain!"
/>

// 2. Global toggle in header
// In your layout or header:
<SimpleExplanationProvider>
  <Header>
    <SimpleExplanationToggle />
  </Header>
  {children}
</SimpleExplanationProvider>

// 3. Expandable accordion style (shows full, option to reveal simple)
<ExpandableExplanation
  full="The cosmic microwave background radiation is thermal radiation filling the observable universe, released approximately 380,000 years after the Big Bang."
  simple="The CMB is like the oldest light in the universe - an echo of the Big Bang that we can still detect today!"
/>

// 4. Card with automatic mode switching
<ExplanationCard
  title="Black Holes"
  icon={<Circle className="w-5 h-5" />}
  full="Black holes are regions of spacetime where gravity is so strong that nothing, not even light or other electromagnetic waves, has enough energy to escape."
  simple="Black holes are like cosmic vacuum cleaners - they pull in everything, even light!"
/>
*/
