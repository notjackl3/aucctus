/**
 * Priority cell component with semicircle gauge and score breakdown sheet.
 */

import React, { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import {
  IConceptPrioritySummary,
  getPriorityLevel,
} from '@libs/api/types/concept/concept_priority';
import { ScoreGauge } from '@components';
import { cn } from '@libs/utils/react';
import {
  useConceptPriority,
  useGenerateConceptPriority,
} from '@hooks/query/concept-priority.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import ScoreBreakdownSheet from './ScoreBreakdownSheet';
import { RefreshCw, Sparkles } from 'lucide-react';

interface PriorityCellProps {
  conceptUuid: string;
  conceptTitle?: string;
  conceptDescription?: string;
  conceptImage?: string;
  prioritySummary?: IConceptPrioritySummary | null;
  isConceptComplete?: boolean;
}

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

  // Check if we're in a calculating state
  // 1. Client-side marker (set when generation starts, before WebSocket events)
  const isCalculatingMarker = cachedData?.isCalculating === true;
  // 2. Backend status (persisted in DB, survives page refresh)
  const backendScoringStatus = prioritySummary?.scoringStatus;
  const isBackendCalculating =
    backendScoringStatus === 'pending' || backendScoringStatus === 'scoring';
  // Combine all calculating states
  const isCalculating =
    isGenerating || isCalculatingMarker || isBackendCalculating;

  // Check if cached data is a real priority (has overallPriorityScore)
  const cachedPriorityData =
    cachedData && typeof cachedData?.overallPriorityScore === 'number'
      ? (cachedData as IConceptPrioritySummary)
      : null;

  // Effective priority: prefer cached data (more up-to-date from WebSocket) over prop
  const effectivePriority = cachedPriorityData || prioritySummary;

  const score = effectivePriority?.overallPriorityScore ?? 0;
  const level = effectivePriority ? getPriorityLevel(score) : null;

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
        <Sparkles size={12} className='aucctus-stroke-brand-primary' />
        <span className='aucctus-text-xs'>Calculate</span>
      </button>
    );
  }

  // Show loading state while calculating (but always keep sheet mounted below)
  if (isCalculating && !showSheet) {
    return (
      <button
        className='btn btn-outlined btn-sm cursor-not-allowed opacity-70'
        disabled
      >
        <RefreshCw
          size={12}
          className='aucctus-stroke-brand-primary animate-spin'
        />
        <span className='aucctus-text-xs'>Calculating...</span>
      </button>
    );
  }

  return (
    <>
      {isCalculating ? (
        <button
          className='btn btn-outlined btn-sm cursor-not-allowed opacity-70'
          disabled
        >
          <RefreshCw
            size={12}
            className='aucctus-stroke-brand-primary animate-spin'
          />
          <span className='aucctus-text-xs'>Calculating...</span>
        </button>
      ) : effectivePriority ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSheet(true);
          }}
          className={cn(
            'flex items-center transition-opacity hover:opacity-80',
          )}
          aria-label={`Priority: ${level} (${score}/100)`}
        >
          <ScoreGauge score={score} size='sm' />
        </button>
      ) : null}

      {/* Sheet always stays mounted when open, even during calculating */}
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
