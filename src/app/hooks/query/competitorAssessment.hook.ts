/**
 * Competitor Assessment React Query Hooks
 *
 * Provides data fetching hooks for the Competitor Assessment feature.
 * Uses real API endpoints from CompetitorAssessmentApi.
 * Includes WebSocket integration for real-time scan progress updates.
 */

import { toast } from '@components';
import api from '@libs/api';
import {
  ICompetitorAssessmentScanCompletedMessage,
  ICompetitorAssessmentScanErrorMessage,
  ICompetitorAssessmentScanProgressMessage,
} from '@libs/api/types/socketMessages/inbound';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useSocketEvent } from '../sockets/aucctus';

import type {
  ICompetitor,
  ICompetitorAssessmentDashboard,
  ICreateCompetitorPayload,
  IUpdateCompetitorPayload,
  IUpdateConfigPayload,
  IWhiteSpaceOpportunity,
} from '@libs/api/types/competitorAssessment';

// ============================================
// Query Keys
// ============================================

export const competitorAssessmentKeys = {
  all: ['competitorAssessment'] as const,
  dashboard: () => [...competitorAssessmentKeys.all, 'dashboard'] as const,
  competitors: () => [...competitorAssessmentKeys.all, 'competitors'] as const,
  competitor: (uuid: string) =>
    [...competitorAssessmentKeys.all, 'competitor', uuid] as const,
  whiteSpaces: () => [...competitorAssessmentKeys.all, 'whiteSpaces'] as const,
};

// ============================================
// Dashboard Hook
// ============================================

/**
 * Fetches the complete Competitor Assessment dashboard data.
 * Returns competitors with assessments, white spaces, config, and metrics.
 */
export const useCompetitorAssessmentDashboard = () => {
  const query = useQuery({
    queryKey: competitorAssessmentKeys.dashboard(),
    queryFn: async (): Promise<ICompetitorAssessmentDashboard> => {
      return await api.competitorAssessment.getDashboard();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no data found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Dashboard Fetch Failed',
          message ||
            'Unable to fetch Competitor Assessment dashboard. Please try again',
        );
      }
    },
  });

  return {
    dashboard: query.data,
    competitors: query.data?.competitors ?? [],
    whiteSpaces: query.data?.whiteSpaces ?? [],
    config: query.data?.config ?? null,
    metrics: query.data?.metrics ?? null,
    lastRefreshedAt: query.data?.lastRefreshedAt,
    isAutoRefreshing: query.data?.isRefreshing ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// Competitors Hooks
// ============================================

/**
 * Fetches all competitors for the account.
 */
export const useCompetitors = () => {
  const query = useQuery({
    queryKey: competitorAssessmentKeys.competitors(),
    queryFn: async (): Promise<ICompetitor[]> => {
      return await api.competitorAssessment.getCompetitors();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Competitors Fetch Failed',
        message || 'Unable to fetch competitors. Please try again',
      );
    },
  });

  return {
    competitors: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Creates a new competitor.
 */
export const useCreateCompetitor = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ICreateCompetitorPayload) => {
      return await api.competitorAssessment.createCompetitor(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: competitorAssessmentKeys.competitors(),
      });
      queryClient.invalidateQueries({
        queryKey: competitorAssessmentKeys.dashboard(),
      });
      toast.success('Competitor Added', 'Competitor added successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Creation Failed',
        message || 'Unable to add competitor. Please try again',
      );
    },
  });

  return {
    createCompetitor: mutation.mutate,
    createCompetitorAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
  };
};

/**
 * Updates a competitor.
 */
export const useUpdateCompetitor = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      competitorUuid,
      data,
    }: {
      competitorUuid: string;
      data: IUpdateCompetitorPayload;
    }) => {
      return await api.competitorAssessment.updateCompetitor(
        competitorUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: competitorAssessmentKeys.competitors(),
      });
      queryClient.invalidateQueries({
        queryKey: competitorAssessmentKeys.dashboard(),
      });
      queryClient.invalidateQueries({
        queryKey: competitorAssessmentKeys.competitor(variables.competitorUuid),
      });
      toast.success('Competitor Updated', 'Competitor updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update competitor. Please try again',
      );
    },
  });

  return {
    updateCompetitor: mutation.mutate,
    updateCompetitorAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

/**
 * Deletes a competitor.
 */
export const useDeleteCompetitor = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (competitorUuid: string) => {
      return await api.competitorAssessment.deleteCompetitor(competitorUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: competitorAssessmentKeys.competitors(),
      });
      queryClient.invalidateQueries({
        queryKey: competitorAssessmentKeys.dashboard(),
      });
      toast.success('Competitor Removed', 'Competitor removed');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to remove competitor. Please try again',
      );
    },
  });

  return {
    deleteCompetitor: mutation.mutate,
    deleteCompetitorAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

// ============================================
// Config Hook
// ============================================

/**
 * Updates Competitor Assessment configuration.
 */
export const useUpdateConfig = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: IUpdateConfigPayload) => {
      return await api.competitorAssessment.updateConfig(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: competitorAssessmentKeys.dashboard(),
      });
      toast.success('Config Updated', 'Configuration updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update configuration. Please try again',
      );
    },
  });

  return {
    updateConfig: mutation.mutate,
    updateConfigAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

// ============================================
// White Spaces Hook
// ============================================

/**
 * Fetches all white space opportunities from the latest scan.
 */
export const useWhiteSpaces = () => {
  const query = useQuery({
    queryKey: competitorAssessmentKeys.whiteSpaces(),
    queryFn: async (): Promise<IWhiteSpaceOpportunity[]> => {
      return await api.competitorAssessment.getWhiteSpaces();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'White Spaces Fetch Failed',
        message || 'Unable to fetch white spaces. Please try again',
      );
    },
  });

  return {
    whiteSpaces: query.data ?? [],
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
 * State for Competitor Assessment scan progress
 */
export interface CompetitorAssessmentScanProgress {
  isScanning: boolean;
  stage: string;
  progress: number;
  message: string;
  currentCompetitor?: string;
}

const DEFAULT_SCAN_PROGRESS: CompetitorAssessmentScanProgress = {
  isScanning: false,
  stage: '',
  progress: 0,
  message: '',
  currentCompetitor: undefined,
};

/**
 * Hook to listen for Competitor Assessment scan WebSocket events.
 * Updates the query cache when scan completes and provides real-time progress.
 */
export const useCompetitorAssessmentSocketEvents = () => {
  const queryClient = useQueryClient();
  const [scanProgress, setScanProgress] =
    useState<CompetitorAssessmentScanProgress>(DEFAULT_SCAN_PROGRESS);

  // Listen for scan progress events
  useSocketEvent<'competitor_assessment.scan.progress.account'>(
    'competitor_assessment.scan.progress.account',
    useCallback((data: ICompetitorAssessmentScanProgressMessage) => {
      setScanProgress({
        isScanning: data.stage !== 'completed',
        stage: data.stage,
        progress: data.progress,
        message: data.message,
        currentCompetitor: data.currentCompetitor,
      });
    }, []),
  );

  // Listen for scan completed events
  useSocketEvent<'competitor_assessment.scan.completed.account'>(
    'competitor_assessment.scan.completed.account',
    useCallback(
      (data: ICompetitorAssessmentScanCompletedMessage) => {
        // Reset progress state
        setScanProgress(DEFAULT_SCAN_PROGRESS);

        // Invalidate dashboard to fetch fresh data
        queryClient.invalidateQueries({
          queryKey: competitorAssessmentKeys.dashboard(),
        });
        queryClient.invalidateQueries({
          queryKey: competitorAssessmentKeys.competitors(),
        });
        queryClient.invalidateQueries({
          queryKey: competitorAssessmentKeys.whiteSpaces(),
        });

        // Show success toast with summary
        toast.success(
          'Competitor Assessment Complete',
          `Analyzed ${data.competitorsAssessed} competitors, found ${data.whiteSpacesFound} white space opportunities.`,
        );
      },
      [queryClient],
    ),
  );

  // Listen for scan error events
  useSocketEvent<'competitor_assessment.scan.error.account'>(
    'competitor_assessment.scan.error.account',
    useCallback((data: ICompetitorAssessmentScanErrorMessage) => {
      // Reset progress state
      setScanProgress(DEFAULT_SCAN_PROGRESS);

      // Show error toast
      toast.error('Competitor Assessment Failed', data.message);
    }, []),
  );

  const resetProgress = useCallback(() => {
    setScanProgress(DEFAULT_SCAN_PROGRESS);
  }, []);

  // Start scanning immediately (called when mutation is triggered)
  const startScanning = useCallback(() => {
    setScanProgress({
      isScanning: true,
      stage: 'started',
      progress: 0,
      message: 'Starting Competitor Assessment scan...',
      currentCompetitor: undefined,
    });
  }, []);

  return {
    scanProgress,
    resetProgress,
    startScanning,
  };
};

// ============================================
// Refresh Hook
// ============================================

/**
 * Triggers a refresh of Competitor Assessment data (background scan).
 * Runs competitor discovery, research, and white space analysis.
 * Integrates with WebSocket events for real-time progress updates.
 */
export const useRefreshCompetitorAssessment = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      return await api.competitorAssessment.refresh();
    },
    onSuccess: () => {
      toast.success(
        'Assessment Scan Started',
        'Researching competitors. Progress will update in real-time.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      // Handle special case of refresh already in progress
      if (
        (e.response?.data as { code?: string })?.code === 'refresh_in_progress'
      ) {
        toast.info(
          'Scan In Progress',
          'A Competitor Assessment scan is already running. Please wait.',
        );
      } else {
        toast.error(
          'Scan Failed',
          message ||
            'Unable to start Competitor Assessment scan. Please try again',
        );
      }
    },
  });

  return {
    refresh: mutation.mutate,
    refreshAsync: mutation.mutateAsync,
    isRefreshing: mutation.isLoading,
  };
};

// ============================================
// Derived Data Hooks
// ============================================

/**
 * Gets competitors filtered by type.
 */
export const useCompetitorsByType = (includeYourCompany: boolean = true) => {
  const { competitors, isLoading, isError } =
    useCompetitorAssessmentDashboard();

  const filteredCompetitors = includeYourCompany
    ? competitors
    : competitors.filter((c) => !c.isYourCompany);

  return {
    competitors: filteredCompetitors,
    isLoading,
    isError,
  };
};

/**
 * Gets the "Your Company" competitor for self-assessment.
 */
export const useYourCompanyAssessment = () => {
  const { competitors, isLoading, isError } =
    useCompetitorAssessmentDashboard();

  const yourCompany = competitors.find((c) => c.isYourCompany) ?? null;

  return {
    yourCompany,
    assessment: yourCompany?.assessment ?? null,
    isLoading,
    isError,
  };
};

/**
 * Gets white spaces filtered by urgency.
 */
export const useWhiteSpacesByUrgency = (
  urgency?: 'immediate' | 'strategic' | 'exploratory' | 'all',
) => {
  const { whiteSpaces, isLoading, isError } =
    useCompetitorAssessmentDashboard();

  const filteredWhiteSpaces =
    !urgency || urgency === 'all'
      ? whiteSpaces
      : whiteSpaces.filter((ws) => ws.urgency === urgency);

  return {
    whiteSpaces: filteredWhiteSpaces,
    isLoading,
    isError,
  };
};

/**
 * Gets metrics from the dashboard.
 */
export const useCompetitorAssessmentMetrics = () => {
  const { metrics, isLoading, isError } = useCompetitorAssessmentDashboard();

  return {
    metrics,
    isLoading,
    isError,
  };
};
