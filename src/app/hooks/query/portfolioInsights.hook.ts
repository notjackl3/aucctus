/**
 * Portfolio Insights React Query Hooks
 *
 * Provides data fetching hooks for the Portfolio Insights feature.
 * Uses real API endpoints from PortfolioInsightsApi.
 * Includes WebSocket integration for real-time insight generation updates.
 */

import { toast } from '@components';
import api from '@libs/api';
import type { IPortfolioInsightListResponse } from '@libs/api/types/portfolioInsights';
import {
  IPortfolioInsightsErrorMessage,
  IPortfolioInsightsGeneratedMessage,
} from '@libs/api/types/socketMessages/inbound';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { useSocketEvent } from '../sockets/aucctus';

// ============================================
// Query Keys
// ============================================

export const portfolioInsightsKeys = {
  all: ['portfolioInsights'] as const,
  list: (page: number, pageSize: number) =>
    [...portfolioInsightsKeys.all, 'list', page, pageSize] as const,
};

// ============================================
// Fetch Hooks
// ============================================

/**
 * Fetches portfolio insights for the account.
 * Returns insights ordered by priority (descending), then severity (descending).
 * Supports pagination.
 */
export const usePortfolioInsights = (
  page: number = 1,
  pageSize: number = 20,
) => {
  const query = useQuery({
    queryKey: portfolioInsightsKeys.list(page, pageSize),
    queryFn: async (): Promise<IPortfolioInsightListResponse> => {
      return await api.portfolioInsights.fetchPortfolioInsights(page, pageSize);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no insights found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Insights Fetch Failed',
          message || 'Unable to fetch portfolio insights. Please try again',
        );
      }
    },
  });

  return {
    insights: query.data?.insights ?? [],
    totalCount: query.data?.totalCount ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// WebSocket Events Hook
// ============================================

/**
 * State for Portfolio Insights generation progress
 */
export interface PortfolioInsightsGenerationState {
  isGenerating: boolean;
  lastGeneratedCount: number;
  lastGeneratedUuids: string[];
}

const DEFAULT_GENERATION_STATE: PortfolioInsightsGenerationState = {
  isGenerating: false,
  lastGeneratedCount: 0,
  lastGeneratedUuids: [],
};

/**
 * Hook to listen for Portfolio Insights WebSocket events.
 * Updates the query cache when insights are generated and provides notifications.
 */
export const usePortfolioInsightsSocketEvents = () => {
  const queryClient = useQueryClient();
  const [generationState, setGenerationState] =
    useState<PortfolioInsightsGenerationState>(DEFAULT_GENERATION_STATE);

  // Listen for insights generated events
  useSocketEvent<'portfolio.insights.generated.user'>(
    'portfolio.insights.generated.user',
    useCallback(
      (data: IPortfolioInsightsGeneratedMessage) => {
        // Update generation state
        setGenerationState({
          isGenerating: false,
          lastGeneratedCount: data.insightCount,
          lastGeneratedUuids: data.insightUuids,
        });

        // Invalidate all portfolio insights queries to fetch fresh data
        queryClient.invalidateQueries({
          queryKey: portfolioInsightsKeys.all,
        });

        // Show success toast
        const message =
          data.insightCount === 1
            ? '1 new insight generated'
            : `${data.insightCount} new insights generated`;
        toast.success('Portfolio Insights Updated', message);
      },
      [queryClient],
    ),
  );

  // Listen for error events
  useSocketEvent<'portfolio.insights.error.user'>(
    'portfolio.insights.error.user',
    useCallback((data: IPortfolioInsightsErrorMessage) => {
      // Reset generation state
      setGenerationState(DEFAULT_GENERATION_STATE);

      // Show error toast
      toast.error('Insight Generation Failed', data.errorMessage);
    }, []),
  );

  const resetGenerationState = useCallback(() => {
    setGenerationState(DEFAULT_GENERATION_STATE);
  }, []);

  return {
    generationState,
    isGenerating: generationState.isGenerating,
    lastGeneratedCount: generationState.lastGeneratedCount,
    lastGeneratedUuids: generationState.lastGeneratedUuids,
    resetGenerationState,
  };
};

// ============================================
// Combined Hook for Portfolio Page
// ============================================

/**
 * Combined hook for the Portfolio page.
 * Provides all necessary data and actions for portfolio insights.
 */
export const usePortfolioInsightsDashboard = (
  page: number = 1,
  pageSize: number = 20,
) => {
  const insights = usePortfolioInsights(page, pageSize);
  const socketEvents = usePortfolioInsightsSocketEvents();

  return {
    // Insights list
    insights: insights.insights,
    totalCount: insights.totalCount,
    page: insights.page,
    pageSize: insights.pageSize,
    hasMore: insights.hasMore,
    isLoadingInsights: insights.isLoading,
    isError: insights.isError,

    // Real-time state from WebSocket
    isGenerating: socketEvents.isGenerating,
    lastGeneratedCount: socketEvents.lastGeneratedCount,
    lastGeneratedUuids: socketEvents.lastGeneratedUuids,

    // Actions
    refetchInsights: insights.refetch,
    resetGenerationState: socketEvents.resetGenerationState,
  };
};

// ============================================
// Utility Hooks
// ============================================

/**
 * Gets insights filtered by severity.
 */
export const useInsightsBySeverity = (
  severity?: 'low' | 'medium' | 'high' | 'all',
  page: number = 1,
  pageSize: number = 20,
) => {
  const { insights, isLoading, isError, ...rest } = usePortfolioInsights(
    page,
    pageSize,
  );

  const filteredInsights =
    !severity || severity === 'all'
      ? insights
      : insights.filter((insight) => insight.severity === severity);

  return {
    insights: filteredInsights,
    isLoading,
    isError,
    ...rest,
  };
};

/**
 * Gets insights filtered by type.
 */
export const useInsightsByType = (
  insightType?:
    | 'stale_concepts'
    | 'risk_concentration'
    | 'emerging_theme'
    | 'validation_gap'
    | 'strategic_misalignment'
    | 'horizon_imbalance'
    | 'all',
  page: number = 1,
  pageSize: number = 20,
) => {
  const { insights, isLoading, isError, ...rest } = usePortfolioInsights(
    page,
    pageSize,
  );

  const filteredInsights =
    !insightType || insightType === 'all'
      ? insights
      : insights.filter((insight) => insight.insightType === insightType);

  return {
    insights: filteredInsights,
    isLoading,
    isError,
    ...rest,
  };
};

/**
 * Gets high-priority insights (priority >= 70).
 */
export const useHighPriorityInsights = (
  page: number = 1,
  pageSize: number = 20,
) => {
  const { insights, isLoading, isError, ...rest } = usePortfolioInsights(
    page,
    pageSize,
  );

  const highPriorityInsights = insights.filter(
    (insight) => insight.priority >= 70,
  );

  return {
    insights: highPriorityInsights,
    isLoading,
    isError,
    ...rest,
  };
};
