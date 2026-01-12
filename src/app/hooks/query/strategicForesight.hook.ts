/**
 * Strategic Foresight React Query Hooks (V2)
 *
 * Provides data fetching hooks for the executive-focused strategic foresight view.
 * Uses real API endpoints from SignalScanningApi.
 */

import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { AucctusQueryKeys } from './query-keys';
import type {
  IStrategicForesightDashboard,
  IStrategicInsight,
  IInsightQueryOptions,
  InsightClassification,
} from '@libs/api/types/strategicForesight';

// ============================================
// Query Keys
// ============================================

export const strategicForesightKeys = {
  all: ['strategicForesight'] as const,
  dashboard: () => [...strategicForesightKeys.all, 'dashboard'] as const,
  insights: (filters?: IInsightQueryOptions) =>
    [...strategicForesightKeys.all, 'insights', filters] as const,
  insight: (uuid: string) =>
    [...strategicForesightKeys.all, 'insight', uuid] as const,
  radarBlips: (classification?: InsightClassification | 'all') =>
    [...strategicForesightKeys.all, 'radar', classification] as const,
};

// ============================================
// Dashboard Hook
// ============================================

/**
 * Fetches the strategic foresight dashboard data including executive brief,
 * metrics, insights, and radar blips.
 */
export const useStrategicForesightDashboard = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.strategicForesightDashboard],
    queryFn: async (): Promise<IStrategicForesightDashboard> => {
      return await api.signalScanning.getStrategicDashboard();
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
            'Unable to fetch strategic foresight dashboard. Please try again',
        );
      }
    },
  });

  return {
    dashboard: query.data,
    executiveBrief: query.data?.executiveBrief ?? null,
    metrics: query.data?.metrics ?? null,
    insights: query.data?.insights ?? [],
    radarBlips: query.data?.radarBlips ?? [],
    lastRefreshedAt: query.data?.lastRefreshedAt,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// Insights Hooks
// ============================================

/**
 * Fetches insights with optional filtering.
 * Uses the insights endpoint with query parameters.
 */
export const useStrategicInsights = (options?: IInsightQueryOptions) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.strategicForesightInsights, options],
    queryFn: async () => {
      const response = await api.signalScanning.getInsights(options);
      return response.insights;
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    keepPreviousData: true, // For pagination
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Insights Fetch Failed',
        message || 'Unable to fetch insights. Please try again',
      );
    },
  });

  return {
    insights: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Fetches a single insight by UUID.
 */
export const useStrategicInsight = (uuid: string | null) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.strategicForesightInsight, uuid],
    queryFn: async (): Promise<IStrategicInsight | null> => {
      if (!uuid) return null;
      return await api.signalScanning.getInsight(uuid);
    },
    enabled: !!uuid,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Insight Fetch Failed',
        message || 'Unable to fetch insight. Please try again',
      );
    },
  });

  return {
    insight: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

// ============================================
// Radar Hooks
// ============================================

/**
 * Fetches radar blips from the dashboard.
 * Radar blips are derived from insights at query time.
 */
export const useRadarBlips = (
  classification: InsightClassification | 'all' = 'all',
) => {
  const { radarBlips, isLoading, isError } = useStrategicForesightDashboard();

  // Filter blips by classification if specified
  const filteredBlips =
    classification === 'all'
      ? radarBlips
      : radarBlips.filter((blip) => blip.classification === classification);

  return {
    blips: filteredBlips,
    isLoading,
    isError,
  };
};

// ============================================
// Mutation Hooks
// ============================================

/**
 * Updates an insight's status (acknowledge, action, or dismiss).
 */
export const useUpdateInsightStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      insightUuid,
      status,
      notes,
    }: {
      insightUuid: string;
      status: 'acknowledged' | 'actioned' | 'dismissed';
      notes?: string;
    }) => {
      return await api.signalScanning.updateInsightStatus(insightUuid, {
        status,
        notes,
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.strategicForesightDashboard],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.strategicForesightInsights],
      });
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.strategicForesightInsight,
          variables.insightUuid,
        ],
      });

      const statusLabels: Record<string, string> = {
        acknowledged: 'Tracked',
        actioned: 'Actioned',
        dismissed: 'Dismissed',
      };
      toast.success(
        'Insight Updated',
        `Status changed to ${statusLabels[variables.status]}`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update insight status. Please try again',
      );
    },
  });

  return {
    updateStatus: mutation.mutate,
    updateStatusAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

/**
 * Acknowledges an insight (marks it as tracked by executive).
 */
export const useAcknowledgeInsight = () => {
  const { updateStatus, isUpdating } = useUpdateInsightStatus();

  return {
    acknowledgeInsight: (insightUuid: string) =>
      updateStatus({ insightUuid, status: 'acknowledged' }),
    isAcknowledging: isUpdating,
  };
};

/**
 * Dismisses an insight.
 */
export const useDismissInsight = () => {
  const { updateStatus, isUpdating } = useUpdateInsightStatus();

  return {
    dismissInsight: (insightUuid: string) =>
      updateStatus({ insightUuid, status: 'dismissed' }),
    isDismissing: isUpdating,
  };
};

/**
 * Toggles the tracking (pinned) status of an insight.
 * Tracked insights appear at the top of lists.
 */
export const useToggleInsightTracking = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      insightUuid,
      isTracked,
    }: {
      insightUuid: string;
      isTracked: boolean;
    }) => {
      return await api.signalScanning.toggleInsightTracking(
        insightUuid,
        isTracked,
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.strategicForesightDashboard],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.strategicForesightInsights],
      });
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.strategicForesightInsight,
          variables.insightUuid,
        ],
      });

      const action = variables.isTracked ? 'tracked' : 'untracked';
      toast.success('Insight Updated', `Insight ${action} successfully`);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update tracking status. Please try again',
      );
    },
  });

  return {
    toggleTracking: mutation.mutate,
    toggleTrackingAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

/**
 * Creates a concept from an insight.
 * Uses the existing signal scanning concept creation endpoint.
 */
export const useCreateConceptFromInsight = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({
      insightUuid,
      title,
      description,
    }: {
      insightUuid: string;
      title?: string;
      description?: string;
    }) => {
      // Use signal scanning create concept endpoint
      // The backend maps insight UUID to the appropriate signal
      return await api.signalScanning.createConceptFromSignal(insightUuid, {
        title,
        description,
      });
    },
    onSuccess: (response) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.strategicForesightDashboard],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.strategicForesightInsights],
      });

      toast.success(
        'Concept Created',
        'A new concept has been created from this insight',
      );

      // Navigate to the new concept
      if (response.conceptUuid) {
        navigate(`/concept/${response.conceptUuid}`);
      }
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Creation Failed',
        message || 'Unable to create concept. Please try again',
      );
    },
  });

  return {
    createConcept: mutation.mutate,
    isCreating: mutation.isLoading,
  };
};

/**
 * Triggers a refresh of strategic foresight (background scan).
 */
export const useRefreshSignalScanning = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return await api.signalScanning.refreshStrategicForesight();
    },
    onSuccess: () => {
      toast.success(
        'Strategic Foresight Refresh Started',
        'Scanning for new patterns and insights. This may take a few minutes.',
      );
      // Poll after delay - scan takes 1-5 minutes as per backend docs
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.strategicForesightDashboard],
        });
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.strategicForesightInsights],
        });
      }, 30000);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      // Handle special case of refresh already in progress
      if (
        (e.response?.data as { code?: string })?.code === 'refresh_in_progress'
      ) {
        toast.info(
          'Refresh In Progress',
          'A scan is already running. Please wait.',
        );
      } else {
        toast.error(
          'Refresh Failed',
          message || 'Unable to start refresh. Please try again',
        );
      }
    },
  });

  return {
    refresh: mutation.mutate,
    isRefreshing: mutation.isLoading,
  };
};
