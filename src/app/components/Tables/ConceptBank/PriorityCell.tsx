/**
 * Priority cell component with visual indicator and reasoning popover.
 */

import React, { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { Icon } from '@components';
import {
  IConceptPrioritySummary,
  getPriorityLevel,
  getPriorityColorClass,
} from '@libs/api/types/concept/concept_priority';
import { cn } from '@libs/utils/react';
import {
  useConceptPriority,
  useGenerateConceptPriority,
} from '@hooks/query/concept-priority.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';

interface PriorityCellProps {
  conceptUuid: string;
  prioritySummary?: IConceptPrioritySummary | null;
}

/**
 * PriorityCell displays a visual priority indicator (battery bar style).
 * Clicking opens a popover with detailed reasoning for each score dimension.
 *
 * The full priority data (with reasoning) is only fetched when the popover is opened
 * to avoid N+1 API calls when rendering the table.
 */
export const PriorityCell: React.FC<PriorityCellProps> = ({
  conceptUuid,
  prioritySummary,
}) => {
  const [showPopover, setShowPopover] = useState(false);

  // Only fetch full priority data when popover is opened (lazy loading)
  // This avoids N+1 API calls when rendering the table
  const { priority: fullPriority, isLoading: isLoadingFullPriority } =
    useConceptPriority(showPopover ? conceptUuid : '');

  // Hook for generating priority for this single concept
  const { mutate: generatePriority, isLoading: isGenerating } =
    useGenerateConceptPriority();

  // Subscribe to query cache changes to react to WebSocket-triggered updates
  // This is necessary because setQueryData updates need to trigger re-renders
  const queryClient = useQueryClient();
  const [cachedData, setCachedData] = useState<any>(() =>
    queryClient.getQueryData([AucctusQueryKeys.conceptPriority, conceptUuid]),
  );

  useEffect(() => {
    // Subscribe to all cache changes and check if our specific query changed
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const newData = queryClient.getQueryData([
        AucctusQueryKeys.conceptPriority,
        conceptUuid,
      ]);
      setCachedData(newData);
    });
    return unsubscribe;
  }, [queryClient, conceptUuid]);

  // Check if we're in a calculating state (the marker set when generation starts)
  const isCalculatingMarker = cachedData?.isCalculating === true;
  const isCalculating = isGenerating || isCalculatingMarker;

  // Check if cached data is a real priority (has overallPriorityScore)
  const cachedPriorityData =
    cachedData && typeof cachedData?.overallPriorityScore === 'number'
      ? (cachedData as IConceptPrioritySummary)
      : null;

  // Effective priority: prefer cached data (more up-to-date from WebSocket) over prop
  const effectivePriority = cachedPriorityData || prioritySummary;

  // If no priority and not calculating, show Calculate button
  if (!effectivePriority && !isCalculating) {
    return (
      <button
        className={cn(
          'btn btn-outlined btn-sm',
          isGenerating && 'cursor-not-allowed opacity-70',
        )}
        onClick={(e) => {
          e.stopPropagation();
          generatePriority(conceptUuid);
        }}
        disabled={isGenerating}
      >
        <Icon
          variant='sparkles'
          height={12}
          width={12}
          className='aucctus-stroke-brand-primary'
        />
        <span className='aucctus-text-xs'>Calculate</span>
      </button>
    );
  }

  // Show loading state while calculating
  if (isCalculating) {
    return (
      <button
        className='btn btn-outlined btn-sm cursor-not-allowed opacity-70'
        disabled
      >
        <Icon
          variant='refresh'
          height={12}
          width={12}
          className='aucctus-stroke-brand-primary animate-spin'
        />
        <span className='aucctus-text-xs'>Calculating...</span>
      </button>
    );
  }

  // At this point, effectivePriority must exist
  if (!effectivePriority) return null;

  const score = effectivePriority.overallPriorityScore;
  const level = getPriorityLevel(score);
  const colors = getPriorityColorClass(level);

  // Calculate fill percentage for battery bar
  const fillPercentage = score;

  // Determine bar color based on score
  const getBarColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Green
    if (score >= 70) return '#eab308'; // Yellow/Gold
    if (score >= 50) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const barColor = getBarColor(score);

  return (
    <div className='relative'>
      <button
        onClick={() => setShowPopover(!showPopover)}
        className={cn(
          'flex items-center gap-3 transition-opacity hover:opacity-80',
        )}
        aria-label={`Priority: ${level} (${score}/100)`}
      >
        {/* Horizontal progress bar */}
        <div className='relative h-4 w-28 flex-shrink-0 overflow-hidden rounded-full bg-gray-200'>
          <div
            className='h-full rounded-full transition-all duration-300'
            style={{
              width: `${fillPercentage}%`,
              backgroundColor: barColor,
            }}
          />
        </div>

        {/* Score text */}
        <span className='aucctus-text-xl-bold aucctus-text-primary min-w-[2rem] text-right'>
          {score}
        </span>

        {/* Info icon */}
        <Icon
          variant='help-circle'
          className='aucctus-stroke-tertiary'
          height={16}
          width={16}
        />
      </button>

      {/* Popover with detailed reasoning */}
      {showPopover && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border shadow-lg',
            'aucctus-bg-primary aucctus-border-secondary',
            'animate-fadeIn',
          )}
          onMouseLeave={() => setShowPopover(false)}
        >
          <div className='p-4'>
            {/* Header */}
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='aucctus-text-md-semibold aucctus-text-primary'>
                Priority Breakdown
              </h3>
              <button
                onClick={() => setShowPopover(false)}
                className='aucctus-text-tertiary aucctus-bg-secondary-hover rounded p-1'
                aria-label='Close'
              >
                <Icon
                  variant='closeX'
                  className='aucctus-stroke-tertiary'
                  height={16}
                  width={16}
                />
              </button>
            </div>

            {/* Loading state for full priority data */}
            {isLoadingFullPriority && (
              <div className='space-y-3'>
                <div className='aucctus-bg-secondary h-16 animate-pulse rounded' />
                <div className='aucctus-bg-secondary h-20 animate-pulse rounded' />
                <div className='aucctus-bg-secondary h-20 animate-pulse rounded' />
                <div className='aucctus-bg-secondary h-20 animate-pulse rounded' />
              </div>
            )}

            {/* Full priority data */}
            {!isLoadingFullPriority && fullPriority && (
              <>
                {/* Overall Score */}
                <div className='aucctus-bg-secondary aucctus-border-secondary mb-4 rounded border p-3'>
                  <div className='flex items-center justify-between'>
                    <span className='aucctus-text-sm aucctus-text-secondary'>
                      Overall Priority
                    </span>
                    <span className={cn('aucctus-text-xl-bold', colors.text)}>
                      {fullPriority.overallPriorityScore}/100
                    </span>
                  </div>
                </div>

                {/* Dimension scores */}
                <div className='space-y-3'>
                  {/* Strategic Alignment */}
                  <div className='aucctus-border-secondary border-b pb-3'>
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                        Strategic Alignment
                      </span>
                      <span className='aucctus-text-sm-bold aucctus-text-brand-primary'>
                        {fullPriority.strategicAlignmentScore}/100
                      </span>
                    </div>
                    <p className='aucctus-text-xs aucctus-text-tertiary'>
                      {fullPriority.strategicAlignmentReasoning}
                    </p>
                  </div>

                  {/* Financial Opportunity */}
                  <div className='aucctus-border-secondary border-b pb-3'>
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                        Financial Opportunity
                      </span>
                      <span className='aucctus-text-sm-bold aucctus-text-brand-primary'>
                        {fullPriority.financialOpportunityScore}/100
                      </span>
                    </div>
                    <p className='aucctus-text-xs aucctus-text-tertiary'>
                      {fullPriority.financialOpportunityReasoning}
                    </p>
                  </div>

                  {/* Innovation Risk */}
                  <div className='pb-1'>
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                        Innovation Risk
                      </span>
                      <span className='aucctus-text-sm-bold aucctus-text-error-primary'>
                        {fullPriority.innovationRiskScore}/100
                      </span>
                    </div>
                    <p className='aucctus-text-xs aucctus-text-tertiary'>
                      {fullPriority.innovationRiskReasoning}
                    </p>
                    <p className='aucctus-text-xs aucctus-text-quaternary mt-1 italic'>
                      Note: Higher risk score means more risky
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Error state - no full priority data available */}
            {!isLoadingFullPriority && !fullPriority && (
              <div className='py-4 text-center'>
                <p className='aucctus-text-sm aucctus-text-tertiary'>
                  Detailed breakdown not available
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityCell;
