/**
 * Watchtower React Query Hooks
 *
 * Provides data fetching hooks for the Watchtower signal monitoring feature.
 * Uses real API endpoints from WatchtowerApi.
 * Includes WebSocket integration for real-time scan progress updates.
 */

import { toast } from '@components';
import api from '@libs/api';
import {
  IWatchtowerScanCompletedMessage,
  IWatchtowerScanErrorMessage,
  IWatchtowerScanProgressMessage,
} from '@libs/api/types/socketMessages/inbound';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { useSocketEvent } from '../sockets/aucctus';

import type {
  IWatchtowerDashboard,
  IWatchtowerMonitoringRule,
} from '@libs/api/types/watchtower';

// ============================================
// Query Keys
// ============================================

export const watchtowerKeys = {
  all: ['watchtower'] as const,
  dashboard: () => [...watchtowerKeys.all, 'dashboard'] as const,
  rules: () => [...watchtowerKeys.all, 'rules'] as const,
  rule: (uuid: string) => [...watchtowerKeys.all, 'rule', uuid] as const,
};

// ============================================
// Dashboard Hook
// ============================================

/**
 * Fetches the complete Watchtower dashboard data.
 * Returns signals, predictions, trends, domains, opportunities, metrics, and rules.
 */
export const useWatchtowerDashboard = (
  includeConceptImpacts: boolean = false,
) => {
  const query = useQuery({
    queryKey: [...watchtowerKeys.dashboard(), includeConceptImpacts],
    queryFn: async (): Promise<IWatchtowerDashboard> => {
      return await api.watchtower.getWatchtowerDashboard(includeConceptImpacts);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no data found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Dashboard Fetch Failed',
          message || 'Unable to fetch Watchtower dashboard. Please try again',
        );
      }
    },
  });

  return {
    dashboard: query.data,
    signals: query.data?.signals ?? [],
    predictions: query.data?.predictions ?? [],
    trends: query.data?.trends ?? {
      period6mo: [],
      period12mo: [],
      period12plus: [],
    },
    futureDomains: query.data?.futureDomains ?? [],
    conceptOpportunities: query.data?.conceptOpportunities ?? [],
    metrics: query.data?.metrics ?? null,
    monitoringRules: query.data?.monitoringRules ?? [],
    lastRefreshedAt: query.data?.lastRefreshedAt,
    isAutoRefreshing: query.data?.isRefreshing ?? false, // True if stale data triggered auto-refresh
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// Monitoring Rules Hooks
// ============================================

/**
 * Fetches all monitoring rules for the account.
 */
export const useMonitoringRules = () => {
  const query = useQuery({
    queryKey: watchtowerKeys.rules(),
    queryFn: async (): Promise<IWatchtowerMonitoringRule[]> => {
      return await api.watchtower.getMonitoringRules();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Rules Fetch Failed',
        message || 'Unable to fetch monitoring rules. Please try again',
      );
    },
  });

  return {
    rules: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Creates a new monitoring rule.
 */
export const useCreateMonitoringRule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (ruleText: string) => {
      return await api.watchtower.createMonitoringRule({ ruleText });
    },
    onSuccess: () => {
      // Invalidate rules query
      queryClient.invalidateQueries({ queryKey: watchtowerKeys.rules() });
      queryClient.invalidateQueries({ queryKey: watchtowerKeys.dashboard() });
      toast.success('Rule Created', 'Monitoring rule added successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Creation Failed',
        message || 'Unable to create monitoring rule. Please try again',
      );
    },
  });

  return {
    createRule: mutation.mutate,
    createRuleAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
  };
};

/**
 * Updates a monitoring rule.
 */
export const useUpdateMonitoringRule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      ruleUuid,
      data,
    }: {
      ruleUuid: string;
      data: { ruleText?: string; isActive?: boolean };
    }) => {
      return await api.watchtower.updateMonitoringRule(ruleUuid, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: watchtowerKeys.rules() });
      queryClient.invalidateQueries({ queryKey: watchtowerKeys.dashboard() });
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.rule(variables.ruleUuid),
      });
      toast.success('Rule Updated', 'Monitoring rule updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update monitoring rule. Please try again',
      );
    },
  });

  return {
    updateRule: mutation.mutate,
    updateRuleAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

/**
 * Deletes a monitoring rule.
 */
export const useDeleteMonitoringRule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (ruleUuid: string) => {
      return await api.watchtower.deleteMonitoringRule(ruleUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchtowerKeys.rules() });
      queryClient.invalidateQueries({ queryKey: watchtowerKeys.dashboard() });
      toast.success('Rule Deleted', 'Monitoring rule removed');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete monitoring rule. Please try again',
      );
    },
  });

  return {
    deleteRule: mutation.mutate,
    deleteRuleAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

// ============================================
// WebSocket Events Hook
// ============================================

/**
 * State for Watchtower scan progress
 */
export interface WatchtowerScanProgress {
  isScanning: boolean;
  stage: string;
  progress: number;
  message: string;
}

const DEFAULT_SCAN_PROGRESS: WatchtowerScanProgress = {
  isScanning: false,
  stage: '',
  progress: 0,
  message: '',
};

/**
 * Hook to listen for Watchtower scan WebSocket events.
 * Updates the query cache when scan completes and provides real-time progress.
 */
export const useWatchtowerSocketEvents = () => {
  const queryClient = useQueryClient();
  const [scanProgress, setScanProgress] = useState<WatchtowerScanProgress>(
    DEFAULT_SCAN_PROGRESS,
  );

  // Listen for scan progress events
  useSocketEvent<'watchtower.scan.progress.account'>(
    'watchtower.scan.progress.account',
    useCallback(
      (data: IWatchtowerScanProgressMessage) => {
        setScanProgress({
          isScanning: data.stage !== 'images_complete',
          stage: data.stage,
          progress: data.progress,
          message: data.message,
        });

        // When images are complete, refetch dashboard to get updated image URLs
        if (data.stage === 'images_complete') {
          queryClient.invalidateQueries({
            queryKey: watchtowerKeys.dashboard(),
          });
        }
      },
      [queryClient],
    ),
  );

  // Listen for scan completed events
  useSocketEvent<'watchtower.scan.completed.account'>(
    'watchtower.scan.completed.account',
    useCallback(
      (data: IWatchtowerScanCompletedMessage) => {
        // Reset progress state
        setScanProgress(DEFAULT_SCAN_PROGRESS);

        // Invalidate dashboard to fetch fresh data
        queryClient.invalidateQueries({
          queryKey: watchtowerKeys.dashboard(),
        });
        queryClient.invalidateQueries({
          queryKey: watchtowerKeys.rules(),
        });

        // Show success toast with summary
        const totalItems =
          data.insightsCreated +
          data.predictionsCreated +
          data.trendsCreated +
          data.domainsCreated +
          data.opportunitiesCreated;

        toast.success(
          'Watchtower Scan Complete',
          `Found ${data.insightsCreated} strategic insights and ${totalItems} total items.`,
        );
      },
      [queryClient],
    ),
  );

  // Listen for scan error events
  useSocketEvent<'watchtower.scan.error.account'>(
    'watchtower.scan.error.account',
    useCallback((data: IWatchtowerScanErrorMessage) => {
      // Reset progress state
      setScanProgress(DEFAULT_SCAN_PROGRESS);

      // Show error toast
      toast.error('Watchtower Scan Failed', data.message);
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
      message: 'Starting Watchtower scan...',
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
 * Triggers a refresh of Watchtower data (background scan).
 * Uses Gemini with Google Search for signal discovery.
 * Integrates with WebSocket events for real-time progress updates.
 */
export const useRefreshWatchtower = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      return await api.watchtower.refreshWatchtower();
    },
    onSuccess: () => {
      toast.success(
        'Watchtower Scan Started',
        'Scanning for market signals. Progress will update in real-time.',
      );
      // Note: Dashboard will be invalidated by WebSocket completion event
      // No need for setTimeout polling anymore
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      // Handle special case of refresh already in progress
      if (
        (e.response?.data as { code?: string })?.code === 'refresh_in_progress'
      ) {
        toast.info(
          'Scan In Progress',
          'A Watchtower scan is already running. Please wait.',
        );
      } else {
        toast.error(
          'Scan Failed',
          message || 'Unable to start Watchtower scan. Please try again',
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
// Add Opportunity to Concept Bank Hook
// ============================================

/**
 * Adds a Watchtower concept opportunity to the concept bank.
 * Creates a new Concept from the opportunity data.
 */
export const useAddOpportunityToConceptBank = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (opportunityUuid: string) => {
      return await api.watchtower.addOpportunityToConceptBank(opportunityUuid);
    },
    onSuccess: (data) => {
      // Invalidate dashboard to refresh opportunities list
      queryClient.invalidateQueries({ queryKey: watchtowerKeys.dashboard() });
      toast.success(
        'Added to Concept Bank',
        `Concept "${data.conceptIdentifier}" has been created and added to your concept bank.`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      // Handle specific error cases
      if (
        (e.response?.data as { code?: string })?.code ===
        'opportunity_not_found'
      ) {
        toast.error(
          'Opportunity Not Found',
          'The selected opportunity could not be found.',
        );
      } else {
        toast.error(
          'Failed to Add',
          message ||
            'Unable to add opportunity to concept bank. Please try again.',
        );
      }
    },
  });

  return {
    addToBank: mutation.mutate,
    addToBankAsync: mutation.mutateAsync,
    isAdding: mutation.isLoading,
    // Expose the UUID currently being added so we can show loading only for that specific item
    addingOpportunityId: mutation.isLoading ? mutation.variables : null,
  };
};

// ============================================
// Track/Pin Signal Hook
// ============================================

/**
 * Toggles the tracking/pinned status of a Watchtower signal.
 * Tracked signals persist across refreshes and are always shown at the top.
 */
export const useToggleSignalTracking = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      signalId,
      isTracked,
    }: {
      signalId: string;
      isTracked: boolean;
    }) => {
      return await api.watchtower.toggleWatchtowerSignalTracking(
        signalId,
        isTracked,
      );
    },
    onSuccess: () => {
      // Invalidate dashboard to refresh signals list with updated tracking state
      queryClient.invalidateQueries({ queryKey: watchtowerKeys.dashboard() });
    },
    onError: (e: AxiosError, variables) => {
      const message = utils.osiris.parseFormError(e);
      const action = variables.isTracked ? 'pin' : 'unpin';
      toast.error(
        `Failed to ${action} Signal`,
        message || `Unable to ${action} signal. Please try again.`,
      );
    },
  });

  return {
    toggleTracking: mutation.mutate,
    toggleTrackingAsync: mutation.mutateAsync,
    isToggling: mutation.isLoading,
    // Expose the signal ID currently being toggled
    togglingSignalId: mutation.isLoading ? mutation.variables?.signalId : null,
  };
};

// ============================================
// Derived Data Hooks
// ============================================

/**
 * Gets signals filtered by type.
 */
export const useWatchtowerSignals = (
  type?: 'threat' | 'opportunity' | 'watch' | 'all',
  includeConceptImpacts: boolean = false,
) => {
  const { signals, isLoading, isError } = useWatchtowerDashboard(
    includeConceptImpacts,
  );

  const filteredSignals =
    !type || type === 'all' ? signals : signals.filter((s) => s.type === type);

  return {
    signals: filteredSignals,
    isLoading,
    isError,
  };
};

/**
 * Gets signals filtered by category.
 */
export const useWatchtowerSignalsByCategory = (
  category?:
    | 'competition'
    | 'market'
    | 'technology'
    | 'regulatory'
    | 'capital'
    | 'all',
  includeConceptImpacts: boolean = false,
) => {
  const { signals, isLoading, isError } = useWatchtowerDashboard(
    includeConceptImpacts,
  );

  const filteredSignals =
    !category || category === 'all'
      ? signals
      : signals.filter((s) => s.category === category);

  return {
    signals: filteredSignals,
    isLoading,
    isError,
  };
};

/**
 * Gets predictions from the dashboard.
 */
export const useWatchtowerPredictions = () => {
  const { predictions, isLoading, isError } = useWatchtowerDashboard();

  return {
    predictions,
    isLoading,
    isError,
  };
};

/**
 * Gets trends grouped by time period.
 */
export const useWatchtowerTrends = () => {
  const { trends, isLoading, isError } = useWatchtowerDashboard();

  return {
    trends,
    period6mo: trends.period6mo,
    period12mo: trends.period12mo,
    period12plus: trends.period12plus,
    isLoading,
    isError,
  };
};

/**
 * Gets future domains from the dashboard.
 */
export const useWatchtowerDomains = () => {
  const { futureDomains, isLoading, isError } = useWatchtowerDashboard();

  return {
    domains: futureDomains,
    isLoading,
    isError,
  };
};

/**
 * Gets concept opportunities from the dashboard.
 */
export const useWatchtowerOpportunities = () => {
  const { conceptOpportunities, isLoading, isError } = useWatchtowerDashboard();

  return {
    opportunities: conceptOpportunities,
    isLoading,
    isError,
  };
};

/**
 * Gets metrics from the dashboard.
 */
export const useWatchtowerMetrics = () => {
  const { metrics, isLoading, isError } = useWatchtowerDashboard();

  return {
    metrics,
    isLoading,
    isError,
  };
};
