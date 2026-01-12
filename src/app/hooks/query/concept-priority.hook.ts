/**
 * React Query hooks for concept portfolio prioritization.
 */

import api from '@libs/api';
import {
  IConceptPrioritySummary,
  IGeneratePrioritiesResponse,
} from '@libs/api/types/concept/concept_priority';
import {
  IBulkPriorityCompletedMessage,
  IBulkPriorityProgressMessage,
  IConceptPriorityCompletedMessage,
  IConceptPriorityErrorMessage,
  IPortfolioSummaryMessage,
} from '@libs/api/types/socketMessages/inbound';
import { toast } from '@components';
import utils from '@libs/utils';
import { useCallback, useState } from 'react';
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
          strategicAlignmentScore: data.strategicAlignmentScore,
          financialOpportunityScore: data.financialOpportunityScore,
          innovationRiskScore: data.innovationRiskScore,
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

/**
 * Top priority concept for executive summary
 */
export interface TopPrioritySummary {
  title: string;
  overallScore: number;
  keyStrength: string;
}

/**
 * State for portfolio executive summary
 */
export interface PortfolioSummary {
  showSummary: boolean;
  totalAnalyzed: number;
  highPriorityCount: number;
  averageScore: number;
  executiveInsight: string;
  keyRecommendation: string;
  portfolioHealth: 'strong' | 'balanced' | 'needs_attention';
  topPriorities: TopPrioritySummary[];
}

// LocalStorage key for persisted portfolio summary (survives page refresh)
const PORTFOLIO_SUMMARY_STORAGE_KEY = 'aucctus_portfolio_summary';

// Helper to get summary from localStorage
const getStoredPortfolioSummary = (): PortfolioSummary | null => {
  try {
    const stored = localStorage.getItem(PORTFOLIO_SUMMARY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as PortfolioSummary;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

// Helper to save summary to localStorage
const savePortfolioSummary = (summary: PortfolioSummary | null) => {
  try {
    if (summary) {
      localStorage.setItem(
        PORTFOLIO_SUMMARY_STORAGE_KEY,
        JSON.stringify(summary),
      );
    } else {
      localStorage.removeItem(PORTFOLIO_SUMMARY_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

/**
 * Hook to listen for bulk priority calculation WebSocket events.
 * Returns progress state and portfolio summary that updates in real-time.
 * Portfolio summary is persisted in localStorage to survive page refresh.
 */
export const useBulkPrioritySocketEvents = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<BulkPriorityProgress>({
    isCalculating: false,
    current: 0,
    total: 0,
    successCount: 0,
    errorCount: 0,
    currentConceptTitle: '',
  });

  // Initialize from localStorage to survive page refresh
  const [portfolioSummary, setPortfolioSummaryLocal] =
    useState<PortfolioSummary | null>(() => getStoredPortfolioSummary());

  const setPortfolioSummary = useCallback(
    (summary: PortfolioSummary | null) => {
      // Update both local state and localStorage
      setPortfolioSummaryLocal(summary);
      savePortfolioSummary(summary);
    },
    [],
  );

  // Listen for bulk progress events
  useSocketEvent<'concept.priority.bulk.progress.user'>(
    'concept.priority.bulk.progress.user',
    useCallback((data: IBulkPriorityProgressMessage) => {
      setProgress({
        isCalculating: true,
        current: data.current,
        total: data.total,
        successCount: data.successCount,
        errorCount: data.errorCount,
        currentConceptTitle: data.currentConceptTitle,
      });
    }, []),
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

        // Invalidate the priorities list to refetch with new data
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.conceptPriorities],
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
      [queryClient],
    ),
  );

  // Listen for portfolio summary events
  useSocketEvent<'concept.priority.portfolio_summary.user'>(
    'concept.priority.portfolio_summary.user',
    useCallback(
      (data: IPortfolioSummaryMessage) => {
        setPortfolioSummary({
          showSummary: true,
          totalAnalyzed: data.totalAnalyzed,
          highPriorityCount: data.highPriorityCount,
          averageScore: data.averageScore,
          executiveInsight: data.executiveInsight,
          keyRecommendation: data.keyRecommendation,
          portfolioHealth: data.portfolioHealth,
          topPriorities: data.topPriorities,
        });
      },
      [setPortfolioSummary],
    ),
  );

  const resetProgress = useCallback(() => {
    setProgress({
      isCalculating: false,
      current: 0,
      total: 0,
      successCount: 0,
      errorCount: 0,
      currentConceptTitle: '',
    });
  }, []);

  const dismissSummary = useCallback(() => {
    if (portfolioSummary) {
      setPortfolioSummary({ ...portfolioSummary, showSummary: false });
    }
  }, [portfolioSummary, setPortfolioSummary]);

  const resetSummary = useCallback(() => {
    setPortfolioSummary(null);
  }, [setPortfolioSummary]);

  return {
    progress,
    resetProgress,
    portfolioSummary,
    dismissSummary,
    resetSummary,
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
