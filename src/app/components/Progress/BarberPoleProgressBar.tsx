import React, { useEffect } from 'react';
import { cn } from '@libs/utils/react';

export interface BarberPoleProgressBarProps {
  /**
   * Current progress value (0-100)
   */
  progress: number;

  /**
   * Size variant
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';

  /**
   * Color theme
   */
  theme?: 'brand' | 'success' | 'info' | 'warning' | 'error' | 'white';

  /**
   * Show indeterminate loading animation instead of progress
   */
  isIndeterminate?: boolean;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Whether to show the percentage text
   */
  showPercentage?: boolean;

  /**
   * Custom percentage text className
   */
  percentageClassName?: string;
}

// Theme colors for inline styles
const themeColors = {
  brand: '#514141', // primary-600
  success: '#079455', // success-600
  info: '#1570EF', // blue-600
  warning: '#DC6803', // warning-600
  error: '#D02635', // error-600
  white: 'rgba(255, 255, 255, 0.8)', // white with opacity
};

// Border classes based on theme
const borderClasses = {
  brand: 'border-[#514141]/50',
  success: 'border-[#079455]/50',
  info: 'border-[#1570EF]/50',
  warning: 'border-[#DC6803]/50',
  error: 'border-[#D02635]/50',
  white: 'border-white/30',
};

// Background classes based on theme
const bgClasses = {
  brand: 'bg-gray-light-200 dark:bg-gray-light-700',
  success: 'bg-gray-light-200 dark:bg-gray-light-700',
  info: 'bg-gray-light-200 dark:bg-gray-light-700',
  warning: 'bg-gray-light-200 dark:bg-gray-light-700',
  error: 'bg-gray-light-200 dark:bg-gray-light-700',
  white: 'bg-white/20',
};

// Size classes for height
const sizeClasses = {
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

// Striped gradient pattern (barber pole effect)
const stripePattern =
  'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)';

/**
 * BarberPoleProgressBar - A reusable progress bar with animated stripes
 *
 * Features:
 * - Animated diagonal stripes (barber pole effect)
 * - Multiple size and theme variants
 * - Supports both determinate and indeterminate modes
 * - Smooth progress transitions
 *
 * @example
 * // Simple usage
 * <BarberPoleProgressBar progress={45} />
 *
 * @example
 * // With theme and size
 * <BarberPoleProgressBar progress={75} theme="success" size="lg" />
 *
 * @example
 * // Indeterminate loading
 * <BarberPoleProgressBar progress={0} isIndeterminate />
 *
 * @example
 * // White theme for dark backgrounds
 * <BarberPoleProgressBar progress={60} theme="white" size="xs" />
 */
const BarberPoleProgressBar: React.FC<BarberPoleProgressBarProps> = ({
  progress,
  size = 'md',
  theme = 'brand',
  isIndeterminate = false,
  className,
  showPercentage = false,
  percentageClassName,
}) => {
  // Inject keyframe animations if not already present
  useEffect(() => {
    if (!document.querySelector('[data-barber-pole-styles]')) {
      const style = document.createElement('style');
      style.setAttribute('data-barber-pole-styles', 'true');
      style.textContent = `
        @keyframes barberPoleIndeterminate {
          0% {
            transform: translateX(-100%);
            opacity: 0.8;
          }
          50% {
            transform: translateX(250%);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0.8;
          }
        }

        @keyframes barberPoleStripeSlide {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 2rem 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative flex-1 overflow-hidden rounded-full',
          'border',
          bgClasses[theme],
          borderClasses[theme],
          sizeClasses[size],
        )}
        role='progressbar'
        aria-valuenow={Math.round(clampedProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {isIndeterminate ? (
          // Indeterminate progress animation
          <div
            className='h-full rounded-full'
            style={{
              width: '30%',
              backgroundColor: themeColors[theme],
              backgroundImage: stripePattern,
              backgroundSize: '1rem 1rem',
              backgroundRepeat: 'repeat',
              animation:
                'barberPoleIndeterminate 1.5s ease-in-out infinite, barberPoleStripeSlide 2.5s ease-in-out infinite alternate',
            }}
          />
        ) : (
          // Determinate progress
          <div
            className='h-full rounded-full'
            style={{
              width: `${clampedProgress}%`,
              backgroundColor: themeColors[theme],
              backgroundImage: stripePattern,
              backgroundSize: '1rem 1rem',
              backgroundRepeat: 'repeat',
              transition: 'width 150ms ease-out',
              animation:
                'barberPoleStripeSlide 7.5s ease-in-out infinite alternate',
            }}
          />
        )}
      </div>

      {showPercentage && !isIndeterminate && (
        <span
          className={cn(
            'aucctus-text-xs-medium min-w-[36px] text-right',
            theme === 'white' ? 'text-white/50' : 'aucctus-text-secondary',
            percentageClassName,
          )}
        >
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
};

export default React.memo(BarberPoleProgressBar);
