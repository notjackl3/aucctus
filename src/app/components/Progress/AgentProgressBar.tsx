import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useAgentEstimatedTime } from '@hooks/query/agent-timing.hook';
import { cn } from '@libs/utils/react';
import telemetry from '@libs/telemetry';
import Icon from '@components/Icon';

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
   * Fallback estimated seconds used when timing data is unavailable
   * Allows countdown UI to operate even without historical timing data
   */
  fallbackEstimatedSeconds?: number | null;

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

  /**
   * Start time (Unix timestamp) for progress calculation
   * Used to persist timing across component remounts
   */
  startTime?: number;

  /**
   * Callback when cancel button is clicked
   */
  onCancel?: () => void;

  /**
   * Callback when email button is clicked
   */
  onEmail?: () => void;

  /**
   * Whether email notification is scheduled
   */
  isEmailScheduled?: boolean;
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
  fallbackEstimatedSeconds,
  expectedItemCount,
  completedItemCount = 0,
  itemCompletionTimestamps = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  message: _message,
  showPercentage = true,
  showTimeRemaining = true,
  className,
  size = 'md',
  theme = 'brand',
  isLoading = false,
  onComplete,
  startTime: initialStartTime,
  onCancel,
  onEmail,
  isEmailScheduled,
}) => {
  const startTimeRef = useRef<number>(initialStartTime || Date.now());
  const [smartRemainingTime, setSmartRemainingTime] = useState<number | null>(
    null,
  );
  const [timeBasedProgress, setTimeBasedProgress] = useState<number>(0);
  const hasCompletedRef = useRef(false);
  const previousRemainingTime = useRef<number | null>(null);
  const maxProgressReached = useRef<number>(0);
  const estimateSourceRef = useRef<string | null>(null);

  // Fetch timing estimate from backend (skip if override provided)
  const shouldFetchTiming = overrideEstimatedSeconds === undefined;

  const { data: conceptTimingData, isLoading: isLoadingConceptTiming } =
    useAgentEstimatedTime(agentName, conceptUuid, {
      enabled: shouldFetchTiming && !!conceptUuid,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const hasConceptTiming = conceptTimingData?.estimatedSeconds != null;

  useEffect(() => {
    telemetry.debug('agent_progress_bar.timing_fetch.status', {
      agentName,
      conceptUuid,
      shouldFetchTiming,
      hasConceptTiming,
      conceptTimingMs: conceptTimingData?.estimatedSeconds,
      isLoadingConceptTiming,
    });
  }, [
    agentName,
    conceptUuid,
    shouldFetchTiming,
    hasConceptTiming,
    conceptTimingData?.estimatedSeconds,
    isLoadingConceptTiming,
  ]);

  const { data: globalTimingData, isLoading: isLoadingGlobalTiming } =
    useAgentEstimatedTime(agentName, undefined, {
      enabled: shouldFetchTiming && (!conceptUuid || !hasConceptTiming),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const isLoadingTiming = isLoadingConceptTiming || isLoadingGlobalTiming;

  useEffect(() => {
    telemetry.debug('agent_progress_bar.timing_fetch.global', {
      agentName,
      conceptUuid,
      shouldFetchTiming,
      hasConceptTiming,
      globalTimingSeconds: globalTimingData?.estimatedSeconds,
      isLoadingGlobalTiming,
    });
  }, [
    agentName,
    conceptUuid,
    shouldFetchTiming,
    hasConceptTiming,
    globalTimingData?.estimatedSeconds,
    isLoadingGlobalTiming,
  ]);

  // Calculate estimated seconds with proper loading state handling
  // Only use fallback AFTER loading is complete and no timing data was found
  // This prevents the time from switching multiple times as APIs load
  const estimatedSeconds =
    overrideEstimatedSeconds !== undefined
      ? overrideEstimatedSeconds
      : conceptTimingData?.estimatedSeconds
        ? Math.round(conceptTimingData.estimatedSeconds)
        : globalTimingData?.estimatedSeconds
          ? Math.round(globalTimingData.estimatedSeconds)
          : !isLoadingTiming && fallbackEstimatedSeconds !== undefined
            ? fallbackEstimatedSeconds
            : null;

  useEffect(() => {
    const source =
      overrideEstimatedSeconds !== undefined
        ? 'override'
        : conceptTimingData?.estimatedSeconds
          ? 'concept-history'
          : globalTimingData?.estimatedSeconds
            ? 'global-history'
            : !isLoadingTiming && fallbackEstimatedSeconds !== undefined
              ? 'fallback'
              : isLoadingTiming
                ? 'loading'
                : 'none';

    if (estimateSourceRef.current !== source) {
      estimateSourceRef.current = source;
      telemetry.debug('agent_progress_bar.estimate_source', {
        agentName,
        conceptUuid,
        source,
        estimatedSeconds:
          source === 'override'
            ? overrideEstimatedSeconds
            : source === 'concept-history'
              ? conceptTimingData?.estimatedSeconds
              : source === 'global-history'
                ? globalTimingData?.estimatedSeconds
                : source === 'fallback'
                  ? fallbackEstimatedSeconds
                  : null,
        conceptEstimateSeconds: conceptTimingData?.estimatedSeconds,
        globalEstimateSeconds: globalTimingData?.estimatedSeconds,
        fallbackSeconds: fallbackEstimatedSeconds,
        isLoadingTiming,
      });
    }
  }, [
    agentName,
    conceptUuid,
    overrideEstimatedSeconds,
    fallbackEstimatedSeconds,
    conceptTimingData?.estimatedSeconds,
    globalTimingData?.estimatedSeconds,
    isLoadingTiming,
  ]);

  // Track if we have valid timing data from cache/history
  const hasValidTimingData =
    (overrideEstimatedSeconds ?? undefined) !== undefined ||
    conceptTimingData?.estimatedSeconds != null ||
    globalTimingData?.estimatedSeconds != null;

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
    'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)';

  // If no timing data and not loading, use fallback countdown
  const usingFallbackTiming =
    !isLoading && !isLoadingTiming && !hasValidTimingData;
  const fallbackSeconds = fallbackEstimatedSeconds ?? 20 * 60; // Use prop or default to 20 minutes

  // Calculate fallback progress and remaining time
  const fallbackElapsedSeconds = usingFallbackTiming
    ? Math.floor((Date.now() - startTimeRef.current) / 1000)
    : 0;
  const fallbackRemainingSeconds = usingFallbackTiming
    ? Math.max(0, fallbackSeconds - fallbackElapsedSeconds)
    : 0;
  const fallbackProgress = usingFallbackTiming
    ? Math.min(95, (fallbackElapsedSeconds / fallbackSeconds) * 100)
    : 0;

  // Update fallback progress every second
  const [fallbackProgressState, setFallbackProgressState] =
    useState(fallbackProgress);
  const [fallbackRemainingState, setFallbackRemainingState] = useState(
    fallbackRemainingSeconds,
  );

  useEffect(() => {
    if (!usingFallbackTiming) return;

    // Update immediately
    setFallbackProgressState(fallbackProgress);
    setFallbackRemainingState(fallbackRemainingSeconds);

    // Then update every second
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, fallbackSeconds - elapsed);
      const progress = Math.min(95, (elapsed / fallbackSeconds) * 100);

      setFallbackProgressState(progress);
      setFallbackRemainingState(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    usingFallbackTiming,
    fallbackProgress,
    fallbackRemainingSeconds,
    fallbackSeconds,
  ]);

  return (
    <div className={cn('w-full space-y-2', className)}>
      {/* Progress bar with percentage on the right */}
      <div className='flex items-center gap-3'>
        <div
          className={cn(
            'relative flex-1 overflow-hidden rounded-md',
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
            // Determinate progress (use fallback if no timing data available)
            <div
              className='h-full'
              style={{
                width: `${Math.min(100, Math.max(0, usingFallbackTiming ? fallbackProgressState : displayProgress))}%`,
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

        {/* Percentage on the right of progress bar */}
        {showPercentage && !isLoading && (
          <span className='aucctus-text-xs-medium aucctus-text-secondary min-w-[36px] text-right'>
            {Math.round(
              usingFallbackTiming ? fallbackProgressState : displayProgress,
            )}
            %
          </span>
        )}

        {isLoading && (
          <span className='aucctus-text-xs aucctus-text-tertiary min-w-[36px] animate-pulse text-right'>
            ...
          </span>
        )}
      </div>

      {/* Estimated time remaining and action buttons */}
      <div
        className={cn(
          'flex items-center',
          onCancel || onEmail ? 'justify-between' : 'justify-center',
        )}
      >
        {showTimeRemaining &&
          !isLoading &&
          (usingFallbackTiming
            ? fallbackRemainingState > 0
            : smartRemainingTime !== null) && (
            <span className='aucctus-text-xs aucctus-text-tertiary'>
              {formatTimeRemaining(
                usingFallbackTiming
                  ? fallbackRemainingState
                  : smartRemainingTime!,
              )}
            </span>
          )}

        {/* Action buttons */}
        {(onCancel || onEmail) && (
          <div className='flex items-center gap-2'>
            {onCancel && (
              <button
                className='aucctus-text-xs-medium aucctus-bg-primary aucctus-text-error-primary h-7 rounded-md border border-red-600 px-2.5 transition-colors hover:bg-red-50'
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
            {onEmail && (
              <button
                className='aucctus-text-xs-medium transition-color flex h-7 items-center gap-2  rounded-md bg-[#120C0C] px-2.5 text-white hover:bg-[#0A0606]'
                onClick={onEmail}
                disabled={isEmailScheduled}
              >
                <Icon
                  variant='mail'
                  width={16}
                  height={16}
                  className='aucctus-stroke-white'
                />
                {isEmailScheduled ? 'Email scheduled' : 'Email me'}
              </button>
            )}
          </div>
        )}
      </div>
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
