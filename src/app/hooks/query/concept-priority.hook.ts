/**
 * React Query hooks for concept portfolio prioritization.
 */

import { toast } from '@components';
import api from '@libs/api';
import { IConceptPriorityDetail } from '@libs/api/types/accounts/scoring-config';
import {
  IConceptPrioritySummary,
  IGeneratePrioritiesResponse,
  IPortfolioSummaryResponse,
} from '@libs/api/types/concept/concept_priority';
import {
  IBulkPriorityCompletedMessage,
  IBulkPriorityProgressMessage,
  IConceptPriorityCompletedMessage,
  IConceptPriorityErrorMessage,
} from '@libs/api/types/socketMessages/inbound';
import utils from '@libs/utils';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useSocketEvent } from '../sockets/aucctus';

import { AucctusQueryKeys } from './query-keys';

/**
 * Hook to fetch priority for a single concept
 */
export const useConceptPriority = (conceptUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptPriority, conceptUuid],
    queryFn: async () => {
      if (!conceptUuid) return null;
      try {
        return await api.concept.getConceptPriority(conceptUuid);
      } catch (error: any) {
        // 404 is expected when priority doesn't exist yet
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!conceptUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  return { ...query, priority: query.data };
};

/**
 * Hook to fetch detailed priority with category and question breakdowns
 */
export const useConceptPriorityDetail = (conceptUuid: string | null) => {
  const query = useQuery<IConceptPriorityDetail | null>({
    queryKey: [AucctusQueryKeys.conceptPriority, conceptUuid, 'detail'],
    queryFn: async () => {
      if (!conceptUuid) return null;
      try {
        return await api.concept.getConceptPriorityDetail(conceptUuid);
      } catch (error: any) {
        // 404 is expected when priority doesn't exist yet
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!conceptUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  return { ...query, priorityDetail: query.data };
};

/**
 * Hook to fetch all concept priorities for the account
 */
export const useConceptPriorities = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptPriorities],
    queryFn: async () => await api.concept.getConceptPriorities(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  return { ...query, priorities: query.data || [] };
};

/**
 * Hook to fetch portfolio summary with AI-generated insights
 */
export const usePortfolioSummary = () => {
  const query = useQuery<IPortfolioSummaryResponse | null>({
    queryKey: [AucctusQueryKeys.portfolioSummary],
    queryFn: async () => {
      try {
        return await api.concept.getPortfolioSummary();
      } catch (error: any) {
        // 404 is expected when no portfolio summary exists yet
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 1, // 1 minutes
    cacheTime: 1000 * 60 * 1, // 1 minutes
  });

  return { ...query, portfolioSummary: query.data };
};

/**
 * Hook to listen for priority calculation WebSocket events.
 * Updates the query cache when a priority is calculated.
 */
export const usePrioritySocketEvents = () => {
  const queryClient = useQueryClient();

  // Listen for priority completed events
  useSocketEvent<'concept.priority.completed.user'>(
    'concept.priority.completed.user',
    useCallback(
      (data: IConceptPriorityCompletedMessage) => {
        // Construct priority summary from WebSocket data for immediate UI update
        // This is partial data (scores only, no reasoning) for the table display
        const prioritySummary: Partial<IConceptPrioritySummary> & {
          conceptUuid: string;
          overallPriorityScore: number;
        } = {
          conceptUuid: data.conceptUuid,
          overallPriorityScore: data.overallPriorityScore,
        };

        // Update the specific concept priority cache with partial data for immediate UI feedback
        queryClient.setQueryData(
          [AucctusQueryKeys.conceptPriority, data.conceptUuid],
          prioritySummary,
        );

        // IMPORTANT: Invalidate the query so that when the popover opens and fetches
        // full priority data, it will refetch from the API (which includes reasoning)
        // instead of returning the cached partial data
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.conceptPriority, data.conceptUuid],
        });

        // Invalidate the priorities list to refetch with full data
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.conceptPriorities],
        });
      },
      [queryClient],
    ),
  );

  // Listen for priority error events
  useSocketEvent<'concept.priority.error.user'>(
    'concept.priority.error.user',
    useCallback(
      (data: IConceptPriorityErrorMessage) => {
        // Clear the calculating state
        queryClient.setQueryData(
          [AucctusQueryKeys.conceptPriority, data.conceptUuid],
          null,
        );

        toast.error('Priority Calculation Failed', data.message);
      },
      [queryClient],
    ),
  );
};

/**
 * Hook to trigger priority generation for a single concept.
 * Uses WebSocket events (via usePrioritySocketEvents) to receive completion notification.
 */
export const useGenerateConceptPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptUuid: string) =>
      api.concept.generateConceptPriority(conceptUuid),
    onSuccess: (
      _response: IGeneratePrioritiesResponse,
      conceptUuid: string,
    ) => {
      toast.success('Priority calculation started');

      // Set the priority to a loading state immediately
      // The WebSocket event will update this when calculation completes
      queryClient.setQueryData(
        [AucctusQueryKeys.conceptPriority, conceptUuid],
        { isCalculating: true },
      );
    },
    onError: (error: any) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(
        'Failed to Generate Priority',
        message || 'Failed to start priority calculation. Please try again.',
      );
    },
  });
};

/**
 * State for bulk priority generation progress
 */
export interface BulkPriorityProgress {
  isCalculating: boolean;
  current: number;
  total: number;
  successCount: number;
  errorCount: number;
  currentConceptTitle: string;
}

// Default progress state
const DEFAULT_PROGRESS: BulkPriorityProgress = {
  isCalculating: false,
  current: 0,
  total: 0,
  successCount: 0,
  errorCount: 0,
  currentConceptTitle: '',
};

/**
 * Hook to listen for bulk priority calculation WebSocket events.
 * Returns progress state that updates in real-time.
 * Progress is persisted in React Query cache (shared across components).
 *
 * Uses React Query cache for progress so it's shared across all components -
 * critical for when user navigates away during bulk calculation.
 */
export const useBulkPrioritySocketEvents = () => {
  const queryClient = useQueryClient();

  // Use React Query cache for progress state so it's shared across all components
  // This ensures PortfolioTab and ConceptScoringConfig share the same calculating state
  const [progress, setProgressLocal] = useState<BulkPriorityProgress>(() => {
    const cached = queryClient.getQueryData<BulkPriorityProgress>([
      AucctusQueryKeys.bulkPriorityProgress,
    ]);
    return cached || DEFAULT_PROGRESS;
  });

  // Subscribe to cache changes to sync local state for progress
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const cachedProgress = queryClient.getQueryData<BulkPriorityProgress>([
        AucctusQueryKeys.bulkPriorityProgress,
      ]);
      if (cachedProgress) {
        setProgressLocal(cachedProgress);
      }
    });
    return unsubscribe;
  }, [queryClient]);

  // Helper to update progress in both local state and cache
  const setProgress = useCallback(
    (newProgress: BulkPriorityProgress) => {
      setProgressLocal(newProgress);
      queryClient.setQueryData(
        [AucctusQueryKeys.bulkPriorityProgress],
        newProgress,
      );
    },
    [queryClient],
  );

  // Listen for bulk progress events
  useSocketEvent<'concept.priority.bulk.progress.user'>(
    'concept.priority.bulk.progress.user',
    useCallback(
      (data: IBulkPriorityProgressMessage) => {
        setProgress({
          isCalculating: true,
          current: data.current,
          total: data.total,
          successCount: data.successCount,
          errorCount: data.errorCount,
          currentConceptTitle: data.currentConceptTitle,
        });
      },
      [setProgress],
    ),
  );

  // Listen for bulk completion events
  useSocketEvent<'concept.priority.bulk.completed.user'>(
    'concept.priority.bulk.completed.user',
    useCallback(
      (data: IBulkPriorityCompletedMessage) => {
        setProgress({
          isCalculating: false,
          current: data.totalCount,
          total: data.totalCount,
          successCount: data.successCount,
          errorCount: data.errorCount,
          currentConceptTitle: '',
        });

        // Invalidate the priorities list and portfolio summary to refetch with new data
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.conceptPriorities],
        });
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.portfolioSummary],
        });

        // Show completion message
        if (data.errorCount === 0) {
          toast.success(
            'Bulk Priority Complete',
            `Successfully calculated priorities for ${data.successCount} concepts`,
          );
        } else {
          toast.warning(
            'Bulk Priority Complete',
            `${data.successCount} succeeded, ${data.errorCount} failed`,
          );
        }
      },
      [queryClient, setProgress],
    ),
  );

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
  }, [setProgress]);

  // Start calculating immediately (called when mutation is triggered)
  // This prevents the skeleton from disappearing between mutation completion and first WebSocket event
  const startCalculating = useCallback(
    (total: number) => {
      setProgress({
        isCalculating: true,
        current: 0,
        total,
        successCount: 0,
        errorCount: 0,
        currentConceptTitle: 'Starting...',
      });
    },
    [setProgress],
  );

  return {
    progress,
    resetProgress,
    startCalculating,
  };
};

/**
 * Hook to trigger bulk priority generation for all Active (Complete) concepts.
 * Uses WebSocket events (via useBulkPrioritySocketEvents) to receive progress updates.
 */
export const useGenerateBulkConceptPriorities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptUuids?: string[]) =>
      api.concept.generateBulkConceptPriorities(conceptUuids),
    onSuccess: (
      response: IGeneratePrioritiesResponse,
      conceptUuids?: string[],
    ) => {
      if (response.conceptsQueued === 0) {
        toast.info(
          'No Concepts to Process',
          'No Active concepts found for priority calculation.',
        );
      } else {
        toast.success(
          'Bulk Priority Started',
          `Calculating priorities for ${response.conceptsQueued} concepts...`,
        );

        // Mark all concepts as calculating immediately to show spinner in UI
        // The WebSocket events will clear these markers as each priority completes
        if (conceptUuids && conceptUuids.length > 0) {
          conceptUuids.forEach((uuid) => {
            queryClient.setQueryData([AucctusQueryKeys.conceptPriority, uuid], {
              isCalculating: true,
            });
          });
        }
      }
    },
    onError: (error: any) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(
        'Failed to Start Bulk Priority',
        message ||
          'Failed to start bulk priority calculation. Please try again.',
      );
    },
  });
};

/**
 * Hook to update a single question score for a concept priority.
 * Recalculates overall and category scores on the backend.
 */
export const useUpdateQuestionScore = (conceptUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionUuid,
      score,
    }: {
      questionUuid: string;
      score: number;
    }) => api.concept.updateQuestionScore(conceptUuid, questionUuid, score),
    onSuccess: () => {
      // Invalidate the priority detail to refresh with new scores
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.conceptPriority, conceptUuid, 'detail'],
      });

      // Update the summary in the list view
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.conceptPriority, conceptUuid],
      });

      // Invalidate the priorities list
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.conceptPriorities],
      });
    },
    onError: (error: any) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to update question score');
    },
  });
};
