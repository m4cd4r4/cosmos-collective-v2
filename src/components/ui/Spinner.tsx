import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'default' | 'large';
}

export function Spinner({ className, size = 'default', ...props }: SpinnerProps): JSX.Element {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <Loader2
        className={cn('animate-spin text-plasma-blue', {
          'h-4 w-4': size === 'small',
          'h-8 w-8': size === 'default',
          'h-12 w-12': size === 'large',
        })}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
