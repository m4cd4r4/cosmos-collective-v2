'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/lib/stores/preferences';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface LaunchCountdownProps {
  targetDate: Date | string;
  size?: 'small' | 'medium' | 'large' | 'hero';
  showLabels?: boolean;
  className?: string;
}

function calculateTimeRemaining(targetDate: Date | string): TimeRemaining {
  // Ensure targetDate is a Date object (handle JSON string dates)
  const date = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const total = date.getTime() - Date.now();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

export function LaunchCountdown({
  targetDate,
  size = 'medium',
  showLabels = true,
  className,
}: LaunchCountdownProps): JSX.Element {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(targetDate)
  );
  const { ageMode } = useUserPreferences();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Size-specific classes
  const digitClasses = cn('font-mono font-bold tabular-nums', {
    'text-base': size === 'small',
    'text-countdown-medium': size === 'medium',
    'text-countdown-large': size === 'large',
    'text-countdown-hero': size === 'hero',
  });

  const labelClasses = cn('text-xs font-medium text-stardust uppercase tracking-wider', {
    'mt-1': size === 'small' || size === 'medium',
    'mt-2': size === 'large' || size === 'hero',
  });

  const containerClasses = cn(
    'flex items-center gap-2',
    {
      'gap-3': size === 'medium',
      'gap-4': size === 'large',
      'gap-6': size === 'hero',
    },
    className
  );

  // Show T- prefix for Mission Control mode
  const prefix = ageMode === 'missionControl' ? 'T-' : '';

  // If countdown is complete
  if (timeRemaining.total <= 0) {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center">
          <div className={cn(digitClasses, 'text-aurora-teal')}>
            {ageMode === 'explorer' ? '🚀' : 'LIFTOFF!'}
          </div>
          {showLabels && ageMode !== 'explorer' && (
            <div className={labelClasses}>Launched</div>
          )}
        </div>
      </div>
    );
  }

  const units = [
    { value: timeRemaining.days, label: 'Days', shortLabel: 'D' },
    { value: timeRemaining.hours, label: 'Hours', shortLabel: 'H' },
    { value: timeRemaining.minutes, label: 'Minutes', shortLabel: 'M' },
    { value: timeRemaining.seconds, label: 'Seconds', shortLabel: 'S' },
  ];

  return (
    <div className={containerClasses} role="timer" aria-live="polite">
      {prefix && size === 'hero' && (
        <span className={cn(digitClasses, 'text-plasma-blue')}>{prefix}</span>
      )}

      {units.map((unit, index) => {
        // Skip days if zero for smaller sizes
        if (unit.value === 0 && index === 0 && size !== 'hero') {
          return null;
        }

        return (
          <div key={unit.label} className="flex flex-col items-center">
            <div
              className={cn(digitClasses, 'text-gradient-space')}
              aria-label={`${unit.value} ${unit.label}`}
            >
              {String(unit.value).padStart(2, '0')}
            </div>
            {showLabels && (
              <div className={labelClasses}>
                {size === 'hero' || size === 'large' ? unit.label : unit.shortLabel}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
