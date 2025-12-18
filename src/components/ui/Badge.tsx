import { cn } from '@/lib/utils';
import { Circle, Clock, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'live' | 'upcoming' | 'success' | 'failure' | 'tbd' | 'partial';
  size?: 'small' | 'default' | 'large';
  showIcon?: boolean;
  pulse?: boolean;
}

const ICON_MAP = {
  live: Circle,
  upcoming: Clock,
  success: CheckCircle2,
  failure: XCircle,
  tbd: HelpCircle,
  partial: XCircle,
};

export function Badge({
  className,
  variant = 'upcoming',
  size = 'default',
  showIcon = true,
  pulse = false,
  children,
  ...props
}: BadgeProps): JSX.Element {
  const Icon = ICON_MAP[variant];

  return (
    <div
      className={cn(
        // Base styles
        'inline-flex items-center gap-1.5 rounded-full font-medium',

        // Variants
        {
          // Live - Mars Red with pulse
          'bg-mars-red/20 text-mars-red': variant === 'live',
          // Upcoming - Plasma Blue
          'bg-plasma-blue/20 text-plasma-blue': variant === 'upcoming',
          // Success - Aurora Teal
          'bg-aurora-teal/20 text-aurora-teal': variant === 'success',
          // Failure - Solar Gold
          'bg-solar-gold/20 text-solar-gold': variant === 'failure',
          // TBD - Stardust Gray
          'bg-stardust/20 text-stardust': variant === 'tbd',
          // Partial Failure - Orange
          'bg-rocket-orange/20 text-rocket-orange': variant === 'partial',
        },

        // Sizes
        {
          'px-2 py-0.5 text-xs': size === 'small',
          'px-2.5 py-1 text-sm': size === 'default',
          'px-3 py-1.5 text-base': size === 'large',
        },

        // Pulse animation for live variant
        {
          'animate-pulse-slow': pulse || variant === 'live',
        },

        className
      )}
      {...props}
    >
      {showIcon && (
        <Icon
          className={cn({
            'h-3 w-3': size === 'small',
            'h-3.5 w-3.5': size === 'default',
            'h-4 w-4': size === 'large',
          })}
        />
      )}
      {children}
    </div>
  );
}
