/**
 * Portfolio Executive Summary React Query Hooks
 *
 * Provides data fetching hooks for the Portfolio Executive Summary feature.
 * Uses real API endpoints from PortfolioApi.
 * Includes WebSocket integration for real-time generation progress updates.
 */

import { toast } from '@components';
import api from '@libs/api';
import { IPortfolioExecutiveSummary } from '@libs/api/types/portfolio';
import {
  IPortfolioExecutiveSummaryGenerationCompletedMessage,
  IPortfolioExecutiveSummaryGenerationErrorMessage,
  IPortfolioExecutiveSummaryGenerationProgressMessage,
} from '@libs/api/types/socketMessages/inbound';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { useSocketEvent } from '../sockets/aucctus';

// ============================================
// Query Keys
// ============================================

export const portfolioKeys = {
  all: ['portfolio'] as const,
  executiveSummary: () => [...portfolioKeys.all, 'executiveSummary'] as const,
};

// ============================================
// Portfolio Executive Summary Hook
// ============================================

/**
 * Fetches the latest portfolio executive summary for the account.
 * Returns the most recent AI-generated executive summary analyzing
 * the entire concept portfolio in context of the company's Nucleus data.
 */
export const usePortfolioExecutiveSummary = () => {
  const query = useQuery({
    queryKey: portfolioKeys.executiveSummary(),
    queryFn: async (): Promise<IPortfolioExecutiveSummary | null> => {
      try {
        return await api.portfolio.getPortfolioExecutiveSummary();
      } catch (error) {
        // If 404, there's no summary yet - this is not an error state
        if ((error as AxiosError)?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no data found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Portfolio Summary Fetch Failed',
          message ||
            'Unable to fetch portfolio executive summary. Please try again',
        );
      }
    },
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    isError: query.isError && query.error?.response?.status !== 404,
    error: query.error,
    refetch: query.refetch,
    isEmpty: query.data === null && !query.isLoading && !query.isError,
  };
};

// ============================================
// WebSocket Events Hook
// ============================================

/**
 * State for Portfolio Executive Summary generation progress
 */
export interface PortfolioSummaryGenerationProgress {
  isGenerating: boolean;
  stage: string;
  progress: number;
  message: string;
}

const DEFAULT_GENERATION_PROGRESS: PortfolioSummaryGenerationProgress = {
  isGenerating: false,
  stage: '',
  progress: 0,
  message: '',
};

/**
 * Hook to listen for Portfolio Executive Summary generation WebSocket events.
 * Updates the query cache when generation completes and provides real-time progress.
 */
export const usePortfolioExecutiveSummarySocketEvents = () => {
  const queryClient = useQueryClient();
  const [generationProgress, setGenerationProgress] =
    useState<PortfolioSummaryGenerationProgress>(DEFAULT_GENERATION_PROGRESS);

  // Listen for generation progress events
  useSocketEvent<'portfolio_executive_summary.generation.progress.account'>(
    'portfolio_executive_summary.generation.progress.account',
    useCallback((data: IPortfolioExecutiveSummaryGenerationProgressMessage) => {
      setGenerationProgress({
        isGenerating: data.stage !== 'completed',
        stage: data.stage,
        progress: data.progress,
        message: data.message,
      });
    }, []),
  );

  // Listen for generation completed events
  useSocketEvent<'portfolio_executive_summary.generation.completed.account'>(
    'portfolio_executive_summary.generation.completed.account',
    useCallback(
      (data: IPortfolioExecutiveSummaryGenerationCompletedMessage) => {
        // Reset progress state
        setGenerationProgress(DEFAULT_GENERATION_PROGRESS);

        // Invalidate summary to fetch fresh data
        queryClient.invalidateQueries({
          queryKey: portfolioKeys.executiveSummary(),
        });

        // Show success toast with summary
        toast.success(
          'Portfolio Summary Complete',
          `Analyzed ${data.conceptCount} concepts and generated executive summary.`,
        );
      },
      [queryClient],
    ),
  );

  // Listen for generation error events
  useSocketEvent<'portfolio_executive_summary.generation.error.account'>(
    'portfolio_executive_summary.generation.error.account',
    useCallback((data: IPortfolioExecutiveSummaryGenerationErrorMessage) => {
      // Reset progress state
      setGenerationProgress(DEFAULT_GENERATION_PROGRESS);

      // Show error toast
      toast.error('Portfolio Summary Generation Failed', data.message);
    }, []),
  );

  const resetProgress = useCallback(() => {
    setGenerationProgress(DEFAULT_GENERATION_PROGRESS);
  }, []);

  return {
    generationProgress,
    resetProgress,
  };
};
