import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useAgentEstimatedTime } from '@hooks/query/agent-timing.hook';
import { cn } from '@libs/utils/react';

export interface AgentProgressBarProps {
  /**
   * The name of the agent being executed (must match backend agent name)
   */
  agentName: string;

  /**
   * Optional concept UUID for concept-specific timing estimates
   */
  conceptUuid?: string;

  /**
   * Current progress value (0-100)
   * If not provided, uses time-based progress estimation
   */
  progress?: number;

  /**
   * Override estimated seconds (bypasses internal timing fetch)
   * Useful for custom pipeline estimates or when timing is fetched externally
   */
  overrideEstimatedSeconds?: number | null;

  /**
   * Number of items expected to be processed (e.g., 3 concepts, 5 profiles)
   * Used for calculating progress when actual progress events are available
   */
  expectedItemCount?: number;

  /**
   * Number of items completed so far
   * Used with expectedItemCount to calculate progress
   */
  completedItemCount?: number;

  /**
   * Array of timestamps when items were completed
   * Used for smart time estimation (like concept generation)
   */
  itemCompletionTimestamps?: number[];

  /**
   * Custom message to display below the progress bar
   */
  message?: string;

  /**
   * Show percentage value
   */
  showPercentage?: boolean;

  /**
   * Show estimated time remaining
   */
  showTimeRemaining?: boolean;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Color theme
   */
  theme?: 'brand' | 'success' | 'info' | 'warning' | 'error';

  /**
   * Loading state - shows indeterminate progress
   */
  isLoading?: boolean;

  /**
   * Callback when progress completes
   */
  onComplete?: () => void;
}

/**
 * AgentProgressBar - Universal progress indicator for AI agent executions
 *
 * Features:
 * - Fetches timing estimates from backend automatically
 * - Supports both explicit progress (0-100) and smart time-based estimation
 * - Tracks item completion for weighted moving average calculations
 * - Smooth animations and transitions
 * - Multiple size and theme variants
 *
 * @example
 * // Simple usage with explicit progress
 * <AgentProgressBar agentName="SyntheticInterviewAgent" progress={45} />
 *
 * @example
 * // Smart estimation based on concept completions
 * <AgentProgressBar
 *   agentName="ConceptGenerationPipeline"
 *   expectedItemCount={3}
 *   completedItemCount={1}
 *   itemCompletionTimestamps={[timestamp1]}
 * />
 *
 * @example
 * // With custom styling and messaging
 * <AgentProgressBar
 *   agentName="MarketScanAgent"
 *   conceptUuid={conceptUuid}
 *   showTimeRemaining
 *   message="Analyzing market trends..."
 *   theme="info"
 *   size="lg"
 * />
 */
const AgentProgressBar: React.FC<AgentProgressBarProps> = ({
  agentName,
  conceptUuid,
  progress: explicitProgress,
  overrideEstimatedSeconds,
  expectedItemCount,
  completedItemCount = 0,
  itemCompletionTimestamps = [],
  message,
  showPercentage = true,
  showTimeRemaining = true,
  className,
  size = 'md',
  theme = 'brand',
  isLoading = false,
  onComplete,
}) => {
  const startTimeRef = useRef<number>(Date.now());
  const [smartRemainingTime, setSmartRemainingTime] = useState<number | null>(
    null,
  );
  const [timeBasedProgress, setTimeBasedProgress] = useState<number>(0);
  const hasCompletedRef = useRef(false);
  const previousRemainingTime = useRef<number | null>(null);
  const maxProgressReached = useRef<number>(0);

  // Fetch timing estimate from backend (skip if override provided)
  const { data: timingData, isLoading: isLoadingTiming } =
    useAgentEstimatedTime(agentName, conceptUuid, {
      enabled: overrideEstimatedSeconds === undefined,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const estimatedSeconds =
    overrideEstimatedSeconds !== undefined
      ? overrideEstimatedSeconds
      : timingData?.estimatedSeconds
        ? Math.round(timingData.estimatedSeconds)
        : null;

  // Track if we have valid timing data from cache/history
  const hasValidTimingData = estimatedSeconds !== null;

  // Calculate smart remaining time using weighted moving average
  const calculateSmartRemainingTime = useCallback(() => {
    const MIN_BUFFER_SECONDS = 3;

    if (!estimatedSeconds) {
      return null;
    }

    const elapsedMs = Date.now() - startTimeRef.current;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    // Mode 1: Time-based estimation (no item tracking)
    if (!expectedItemCount) {
      const remaining = Math.round(estimatedSeconds) - elapsedSeconds;
      return Math.max(MIN_BUFFER_SECONDS, remaining);
    }

    // Mode 2: Item-based estimation with completion tracking
    // If no items completed yet, use original estimate minus elapsed time
    if (completedItemCount === 0 || itemCompletionTimestamps.length === 0) {
      const remaining = Math.round(estimatedSeconds) - elapsedSeconds;
      return Math.max(MIN_BUFFER_SECONDS, remaining);
    }

    // Calculate average time per item based on actual completion times
    const lastCompletionTime =
      itemCompletionTimestamps[itemCompletionTimestamps.length - 1];
    const timeToLastCompletion = lastCompletionTime - startTimeRef.current;
    const avgMsPerItem = timeToLastCompletion / completedItemCount;

    const itemsRemaining = expectedItemCount - completedItemCount;
    const projectedRemainingMs = avgMsPerItem * itemsRemaining;

    // Account for time since last completion (but keep countdown moving down, not up)
    const timeSinceLastCompletion = Date.now() - lastCompletionTime;
    const totalProjectedMs = Math.max(
      0,
      projectedRemainingMs - timeSinceLastCompletion,
    );
    const projectedRemainingSeconds = Math.ceil(totalProjectedMs / 1000);
    const calculatedRemaining = Math.max(
      MIN_BUFFER_SECONDS,
      projectedRemainingSeconds,
    );

    // Never allow countdown to go UP (only down or stay same)
    if (
      previousRemainingTime.current !== null &&
      calculatedRemaining > previousRemainingTime.current
    ) {
      return previousRemainingTime.current;
    }

    return calculatedRemaining;
  }, [
    estimatedSeconds,
    expectedItemCount,
    completedItemCount,
    itemCompletionTimestamps,
  ]);

  // Calculate time-based progress when no explicit progress provided
  const calculateTimeBasedProgress = useCallback(() => {
    if (!estimatedSeconds) return 0;

    const elapsedMs = Date.now() - startTimeRef.current;
    const elapsedSeconds = elapsedMs / 1000;

    // Progress based on time elapsed vs estimated time
    const calculatedProgress = (elapsedSeconds / estimatedSeconds) * 100;

    // Cap at 95% until actually complete (never reach 100% on time alone)
    return Math.min(95, Math.max(0, calculatedProgress));
  }, [estimatedSeconds]);

  // Update smart remaining time every second
  useEffect(() => {
    if (isLoading) return;

    const newTime = calculateSmartRemainingTime();
    setSmartRemainingTime(newTime);
    previousRemainingTime.current = newTime;

    const interval = setInterval(() => {
      const updatedTime = calculateSmartRemainingTime();
      setSmartRemainingTime(updatedTime);
      previousRemainingTime.current = updatedTime;
      setTimeBasedProgress(calculateTimeBasedProgress());
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isLoading,
    calculateSmartRemainingTime,
    calculateTimeBasedProgress,
    estimatedSeconds,
    expectedItemCount,
    completedItemCount,
  ]);

  // Determine actual progress value to display
  const displayProgress = useMemo(() => {
    let calculatedProgress = 0;

    // Explicit progress takes precedence
    if (explicitProgress !== undefined) {
      calculatedProgress = explicitProgress;
    }
    // If we have item completion data, calculate based on that
    else if (expectedItemCount && completedItemCount > 0) {
      calculatedProgress = (completedItemCount / expectedItemCount) * 100;
    }
    // Fall back to time-based estimation
    else {
      calculatedProgress = timeBasedProgress;
    }

    // NEVER allow progress to go backward (only forward or stay same)
    if (calculatedProgress > maxProgressReached.current) {
      maxProgressReached.current = calculatedProgress;
    }

    return maxProgressReached.current;
  }, [
    explicitProgress,
    expectedItemCount,
    completedItemCount,
    timeBasedProgress,
  ]);

  // Handle completion
  useEffect(() => {
    if (displayProgress >= 100 && !hasCompletedRef.current && onComplete) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [displayProgress, onComplete]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (seconds <= 3) {
      return 'Almost done...';
    }

    if (mins > 0) {
      if (secs > 0) {
        return `~${mins}:${secs.toString().padStart(2, '0')} remaining`;
      }
      return `~${mins} ${mins === 1 ? 'minute' : 'minutes'} remaining`;
    }

    return `~${secs} ${secs === 1 ? 'second' : 'seconds'} remaining`;
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  // Border classes based on theme
  const borderClasses = {
    brand: 'aucctus-border-brand',
    success: 'aucctus-border-success',
    info: 'aucctus-border-info',
    warning: 'aucctus-border-warning',
    error: 'aucctus-border-error',
  };

  // Theme colors for inline styles
  const themeColors = {
    brand: '#514141', // primary-600
    success: '#079455', // success-600
    info: '#1570EF', // blue-600
    warning: '#DC6803', // warning-600
    error: '#D02635', // error-600
  };

  // Striped gradient pattern
  const stripePattern =
    'linear-gradient(45deg, rgba(255,255,255,.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.1) 75%, transparent 75%, transparent)';

  // If no timing data and not loading, show fallback message only (no progress bar)
  if (!isLoading && !isLoadingTiming && !hasValidTimingData) {
    return (
      <div className={cn('w-full', className)}>
        <div className='flex w-full justify-center'>
          <span className='aucctus-text-xs aucctus-text-secondary'>
            This could take up to 2 minutes
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-2.5', className)}>
      {/* Progress bar */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-md',
          'bg-gray-light-200 dark:bg-gray-light-700',
          'border border-opacity-50',
          borderClasses[theme],
          sizeClasses[size],
        )}
        role='progressbar'
        aria-valuenow={Math.round(displayProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {isLoading || isLoadingTiming ? (
          // Indeterminate progress animation
          <div
            className='h-full'
            style={{
              width: '30%',
              backgroundColor: themeColors[theme],
              backgroundImage: stripePattern,
              backgroundSize: '1rem 1rem',
              backgroundRepeat: 'repeat',
              animation:
                'indeterminate 1.5s ease-in-out infinite, stripeSlide 2.5s ease-in-out infinite alternate',
            }}
          />
        ) : (
          // Determinate progress
          <div
            className='h-full'
            style={{
              width: `${Math.min(100, Math.max(0, displayProgress))}%`,
              backgroundColor: themeColors[theme],
              backgroundImage: stripePattern,
              backgroundSize: '1rem 1rem',
              backgroundRepeat: 'repeat',
              transition: 'width 500ms ease-out',
              animation: 'stripeSlide 7.5s ease-in-out infinite alternate',
            }}
          />
        )}
      </div>

      {/* Info row */}
      {message ? (
        // When there's a message, use justify-between layout
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <p className='aucctus-text-sm aucctus-text-secondary truncate'>
              {message}
            </p>
          </div>

          <div className='flex items-center gap-3 whitespace-nowrap'>
            {showTimeRemaining && smartRemainingTime !== null && !isLoading && (
              <span className='aucctus-text-xs aucctus-text-tertiary'>
                {formatTimeRemaining(smartRemainingTime)}
              </span>
            )}

            {showPercentage && !isLoading && (
              <span className='aucctus-text-xs-medium aucctus-text-secondary'>
                {Math.round(displayProgress)}%
              </span>
            )}

            {isLoading && (
              <span className='aucctus-text-xs aucctus-text-tertiary animate-pulse'>
                Loading...
              </span>
            )}
          </div>
        </div>
      ) : (
        // When no message, center the time remaining
        <div className='flex w-full items-center justify-center gap-2'>
          {showTimeRemaining && smartRemainingTime !== null && !isLoading && (
            <span className='aucctus-text-xs aucctus-text-tertiary'>
              {formatTimeRemaining(smartRemainingTime)}
            </span>
          )}

          {showPercentage &&
            !isLoading &&
            showTimeRemaining &&
            smartRemainingTime !== null && (
              <span className='aucctus-text-xs aucctus-text-quaternary'>•</span>
            )}

          {showPercentage && !isLoading && (
            <span className='aucctus-text-xs-medium aucctus-text-secondary'>
              {Math.round(displayProgress)}%
            </span>
          )}

          {isLoading && (
            <span className='aucctus-text-xs aucctus-text-tertiary animate-pulse'>
              Loading...
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Add animations to global styles if not already present
const style = document.createElement('style');
style.textContent = `
  @keyframes indeterminate {
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

  @keyframes stripeSlide {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 2rem 0;
    }
  }
`;
if (!document.querySelector('[data-agent-progress-styles]')) {
  style.setAttribute('data-agent-progress-styles', 'true');
  document.head.appendChild(style);
}

export default React.memo(AgentProgressBar);
