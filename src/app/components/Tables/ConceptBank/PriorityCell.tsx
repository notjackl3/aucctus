/**
 * Priority cell component with semicircle gauge and score breakdown sheet.
 */

import React, { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { Icon } from '@components';
import {
  IConceptPrioritySummary,
  getPriorityLevel,
} from '@libs/api/types/concept/concept_priority';
import { cn } from '@libs/utils/react';
import {
  useConceptPriority,
  useGenerateConceptPriority,
} from '@hooks/query/concept-priority.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import ScoreBreakdownSheet from './ScoreBreakdownSheet';

interface PriorityCellProps {
  conceptUuid: string;
  conceptTitle?: string;
  conceptDescription?: string;
  conceptImage?: string;
  prioritySummary?: IConceptPrioritySummary | null;
  isConceptComplete?: boolean;
}

/**
 * Mini semicircle score gauge for table cell
 */
const MiniScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  const getGaugeColor = (score: number) => {
    if (score >= 80) return '#16a34a'; // Green
    if (score >= 70) return '#eab308'; // Yellow
    if (score >= 60) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const gaugeColor = getGaugeColor(clampedScore);

  return (
    <svg width='120' height='72' viewBox='0 0 120 72' className='flex-shrink-0'>
      {/* Gray background arc (full) */}
      <path
        d='M 12 60 A 48 48 0 0 1 108 60'
        fill='none'
        stroke='#e5e7eb'
        strokeWidth='10'
        strokeLinecap='round'
      />

      {/* Colored progress arc (proportional to score) */}
      <path
        d='M 12 60 A 48 48 0 0 1 108 60'
        fill='none'
        stroke={gaugeColor}
        strokeWidth='10'
        strokeLinecap='round'
        pathLength={100}
        strokeDasharray={`${clampedScore} 100`}
      />

      {/* Score number in center */}
      <text
        x='60'
        y='56'
        textAnchor='middle'
        className='fill-current'
        style={{ fontSize: '26px', fontWeight: 'bold' }}
      >
        {clampedScore}
      </text>
    </svg>
  );
};

/**
 * PriorityCell displays a visual priority indicator (semicircle gauge).
 * Clicking opens a sidebar sheet with detailed reasoning for each score dimension.
 *
 * The full priority data (with reasoning) is only fetched when the sheet is opened
 * to avoid N+1 API calls when rendering the table.
 */
export const PriorityCell: React.FC<PriorityCellProps> = ({
  conceptUuid,
  conceptTitle = 'Concept',
  conceptDescription,
  conceptImage,
  prioritySummary,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isConceptComplete = false,
}) => {
  const [showSheet, setShowSheet] = useState(false);

  // Only fetch full priority data when sheet is opened (lazy loading)
  // This avoids N+1 API calls when rendering the table
  const { isLoading: isLoadingFullPriority } = useConceptPriority(
    showSheet ? conceptUuid : '',
  );

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

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowSheet(true);
        }}
        className={cn('flex items-center transition-opacity hover:opacity-80')}
        aria-label={`Priority: ${level} (${score}/100)`}
      >
        {/* Mini semicircle gauge */}
        <MiniScoreGauge score={score} />
      </button>

      {/* Score Breakdown Sheet */}
      <ScoreBreakdownSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        conceptTitle={conceptTitle}
        conceptDescription={conceptDescription}
        conceptImage={conceptImage}
        conceptUuid={conceptUuid}
        isLoading={isLoadingFullPriority}
        score={score}
      />
    </>
  );
};

export default PriorityCell;
