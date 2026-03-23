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
  IWatchtowerRuleGenerationCompletedMessage,
  IWatchtowerRuleGenerationErrorMessage,
  IWatchtowerScanCompletedMessage,
  IWatchtowerScanErrorMessage,
  IWatchtowerScanProgressMessage,
} from '@libs/api/types/socketMessages/inbound';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { useSocketEvent } from '../sockets/aucctus';

import type {
  IWatchtowerActiveScan,
  IWatchtowerDashboard,
  IWatchtowerMonitoringRule,
  IWatchtowerScanListItem,
  IWatchtowerConfigListItem,
  ICreateWatchtowerConfigPayload,
} from '@libs/api/types/watchtower';

// ============================================
// Query Keys
// ============================================

export const watchtowerKeys = {
  all: ['watchtower'] as const,
  dashboard: (scanUuid?: string, watchtowerConfigUuid?: string) =>
    [
      ...watchtowerKeys.all,
      'dashboard',
      ...(watchtowerConfigUuid
        ? (['custom', watchtowerConfigUuid] as const)
        : []),
      ...(scanUuid ? [scanUuid] : []),
    ] as const,
  scanHistory: (watchtowerConfigUuid?: string) =>
    [
      ...watchtowerKeys.all,
      'scanHistory',
      ...(watchtowerConfigUuid ? [watchtowerConfigUuid] : []),
    ] as const,
  rules: () => [...watchtowerKeys.all, 'rules'] as const,
  rule: (uuid: string) => [...watchtowerKeys.all, 'rule', uuid] as const,
  watchtowerConfigs: () =>
    [...watchtowerKeys.all, 'watchtowerConfigs'] as const,
};

// ============================================
// Dashboard Hook
// ============================================

/**
 * Fetches the complete Watchtower dashboard data.
 * Returns signals, predictions, trends, domains, opportunities, metrics, and rules.
 * Optionally pass a scanUuid to load a specific historical scan.
 */
export const useWatchtowerDashboard = (
  scanUuid?: string,
  watchtowerConfigUuid?: string,
) => {
  const query = useQuery({
    queryKey: watchtowerKeys.dashboard(scanUuid, watchtowerConfigUuid),
    queryFn: async (): Promise<IWatchtowerDashboard> => {
      return await api.watchtower.getWatchtowerDashboard(
        true,
        scanUuid,
        watchtowerConfigUuid,
      );
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
    activeScan: query.data?.activeScan ?? null, // Active scan progress for state recovery
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// Scan History Hook
// ============================================

/**
 * Fetches the list of completed scans for the account.
 * Used by the SignalHistoryPopover to show past scan dates.
 */
export const useWatchtowerScanHistory = (watchtowerConfigUuid?: string) => {
  const query = useQuery({
    queryKey: watchtowerKeys.scanHistory(watchtowerConfigUuid),
    queryFn: async (): Promise<IWatchtowerScanListItem[]> => {
      return await api.watchtower.getScanHistory(watchtowerConfigUuid);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    scans: query.data ?? [],
    isLoading: query.isLoading,
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

const DEFAULT_TOWER_KEY = '__default__';

/**
 * Hook to listen for Watchtower scan WebSocket events.
 * Updates the query cache when scan completes and provides real-time progress.
 * Scan progress is keyed per-tower so switching towers doesn't bleed state.
 * Accepts optional activeScan from dashboard data to recover scan state on page load.
 */
export const useWatchtowerSocketEvents = (
  activeScan?: IWatchtowerActiveScan | null,
  activeWatchtowerConfigUuid?: string,
) => {
  const queryClient = useQueryClient();
  const [scanProgressMap, setScanProgressMap] = useState<
    Record<string, WatchtowerScanProgress>
  >({});

  // Helper to derive the tower key from a WebSocket message or explicit UUID
  const towerKey = useCallback(
    (uuid?: string | null) => uuid || DEFAULT_TOWER_KEY,
    [],
  );

  // Seed scan progress from dashboard data on page load / refresh.
  const activeScanStage = activeScan?.stage;
  const activeScanProgress = activeScan?.progress;
  const activeScanMessage = activeScan?.message;
  const activeScanStatus = activeScan?.status;
  const seedKey = towerKey(activeWatchtowerConfigUuid);
  useEffect(() => {
    if (activeScanStatus === 'running' || activeScanStatus === 'pending') {
      setScanProgressMap((prev) => ({
        ...prev,
        [seedKey]: {
          isScanning: true,
          stage: activeScanStage || 'started',
          progress: activeScanProgress || 0,
          message: activeScanMessage || 'Scan in progress...',
        },
      }));
    }
  }, [
    activeScanStatus,
    activeScanStage,
    activeScanProgress,
    activeScanMessage,
    seedKey,
  ]);

  // Listen for scan progress events
  useSocketEvent<'watchtower.scan.progress.account'>(
    'watchtower.scan.progress.account',
    useCallback(
      (data: IWatchtowerScanProgressMessage) => {
        const key = towerKey(data.watchtowerConfigUuid);
        setScanProgressMap((prev) => ({
          ...prev,
          [key]: {
            isScanning: data.stage !== 'images_complete',
            stage: data.stage,
            progress: data.progress,
            message: data.message,
          },
        }));

        // When images are complete, refetch dashboard to get updated image URLs
        if (data.stage === 'images_complete') {
          queryClient.invalidateQueries({
            queryKey: watchtowerKeys.dashboard(
              undefined,
              data.watchtowerConfigUuid ?? undefined,
            ),
          });
        }
      },
      [queryClient, towerKey],
    ),
  );

  // Listen for scan completed events
  useSocketEvent<'watchtower.scan.completed.account'>(
    'watchtower.scan.completed.account',
    useCallback(
      (data: IWatchtowerScanCompletedMessage) => {
        const key = towerKey(data.watchtowerConfigUuid);
        // Remove progress entry for this tower (scan is complete, no longer needed)
        setScanProgressMap((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });

        // Invalidate dashboard for the specific tower
        queryClient.invalidateQueries({
          queryKey: watchtowerKeys.dashboard(
            undefined,
            data.watchtowerConfigUuid ?? undefined,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: watchtowerKeys.rules(),
        });
        // Refresh scan history to include the new scan (scoped to the tower)
        queryClient.invalidateQueries({
          queryKey: watchtowerKeys.scanHistory(
            data.watchtowerConfigUuid ?? undefined,
          ),
        });
        // Also invalidate watchtower configs list so scan status updates
        queryClient.invalidateQueries({
          queryKey: watchtowerKeys.watchtowerConfigs(),
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
      [queryClient, towerKey],
    ),
  );

  // Listen for scan error events
  useSocketEvent<'watchtower.scan.error.account'>(
    'watchtower.scan.error.account',
    useCallback(
      (data: IWatchtowerScanErrorMessage) => {
        const key = towerKey(data.watchtowerConfigUuid);
        // Remove progress entry for this tower (scan failed, no longer needed)
        setScanProgressMap((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });

        // Show error toast
        toast.error('Watchtower Scan Failed', data.message);
      },
      [towerKey],
    ),
  );

  // Listen for concept impact evaluation completed → silently refresh dashboard
  useSocketEvent<'watchtower.concept_impact.completed.account'>(
    'watchtower.concept_impact.completed.account',
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.dashboard(),
      });
    }, [queryClient]),
  );

  const resetProgress = useCallback(
    (towerUuid?: string) => {
      const key = towerKey(towerUuid);
      setScanProgressMap((prev) => ({
        ...prev,
        [key]: DEFAULT_SCAN_PROGRESS,
      }));
    },
    [towerKey],
  );

  // Remove a tower's progress entry entirely (used when a tower is deleted)
  const removeTowerProgress = useCallback(
    (towerUuid?: string) => {
      const key = towerKey(towerUuid);
      setScanProgressMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [towerKey],
  );

  // Start scanning immediately (called when mutation is triggered)
  const startScanning = useCallback(
    (towerUuid?: string) => {
      const key = towerKey(towerUuid);
      setScanProgressMap((prev) => ({
        ...prev,
        [key]: {
          isScanning: true,
          stage: 'started',
          progress: 0,
          message: 'Starting Watchtower scan...',
        },
      }));
    },
    [towerKey],
  );

  // Get scan progress for a specific tower (or the default account-level scan)
  const getScanProgress = useCallback(
    (towerUuid?: string): WatchtowerScanProgress => {
      const key = towerKey(towerUuid);
      return scanProgressMap[key] ?? DEFAULT_SCAN_PROGRESS;
    },
    [scanProgressMap, towerKey],
  );

  return {
    getScanProgress,
    resetProgress,
    startScanning,
    removeTowerProgress,
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
export const useRefreshWatchtower = (watchtowerConfigUuid?: string) => {
  const mutation = useMutation({
    mutationFn: async () => {
      return await api.watchtower.refreshWatchtower(watchtowerConfigUuid);
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
  watchtowerConfigUuid?: string,
) => {
  const { signals, isLoading, isError } = useWatchtowerDashboard(
    undefined,
    watchtowerConfigUuid,
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
  watchtowerConfigUuid?: string,
) => {
  const { signals, isLoading, isError } = useWatchtowerDashboard(
    undefined,
    watchtowerConfigUuid,
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
export const useWatchtowerPredictions = (
  scanUuid?: string,
  watchtowerConfigUuid?: string,
) => {
  const { predictions, isLoading, isError } = useWatchtowerDashboard(
    scanUuid,
    watchtowerConfigUuid,
  );

  return {
    predictions,
    isLoading,
    isError,
  };
};

/**
 * Gets trends grouped by time period.
 */
export const useWatchtowerTrends = (
  scanUuid?: string,
  watchtowerConfigUuid?: string,
) => {
  const { trends, isLoading, isError } = useWatchtowerDashboard(
    scanUuid,
    watchtowerConfigUuid,
  );

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
export const useWatchtowerDomains = (
  scanUuid?: string,
  watchtowerConfigUuid?: string,
) => {
  const { futureDomains, isLoading, isError } = useWatchtowerDashboard(
    scanUuid,
    watchtowerConfigUuid,
  );

  return {
    domains: futureDomains,
    isLoading,
    isError,
  };
};

/**
 * Gets concept opportunities from the dashboard.
 */
export const useWatchtowerOpportunities = (
  scanUuid?: string,
  watchtowerConfigUuid?: string,
) => {
  const { conceptOpportunities, isLoading, isError } = useWatchtowerDashboard(
    scanUuid,
    watchtowerConfigUuid,
  );

  return {
    opportunities: conceptOpportunities,
    isLoading,
    isError,
  };
};

/**
 * Gets metrics from the dashboard.
 */
export const useWatchtowerMetrics = (
  scanUuid?: string,
  watchtowerConfigUuid?: string,
) => {
  const { metrics, isLoading, isError } = useWatchtowerDashboard(
    scanUuid,
    watchtowerConfigUuid,
  );

  return {
    metrics,
    isLoading,
    isError,
  };
};

// ============================================
// Watchtower Config Hooks
// ============================================

/**
 * Fetches all watchtower configs for the account.
 */
export const useWatchtowerConfigs = () => {
  const query = useQuery({
    queryKey: watchtowerKeys.watchtowerConfigs(),
    queryFn: async (): Promise<IWatchtowerConfigListItem[]> => {
      return await api.watchtower.getWatchtowerConfigs();
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
  });

  return {
    watchtowerConfigs: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

/**
 * Generates AI rules for a watchtower config from a description + optional files.
 * Dispatches to Celery via POST, receives results via WebSocket.
 */
export const useGenerateWatchtowerRules = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRules, setGeneratedRules] = useState<{
    name: string;
    rules: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const taskIdRef = useRef<string | null>(null);

  const generateRules = useCallback(
    async ({ description, files }: { description: string; files?: File[] }) => {
      setIsGenerating(true);
      setGeneratedRules(null);
      setError(null);

      try {
        const data = await api.watchtower.generateWatchtowerRules(
          description,
          files,
        );
        taskIdRef.current = data.taskId;
      } catch (e) {
        setIsGenerating(false);
        const message = utils.osiris.parseFormError(e as AxiosError);
        const errorMsg =
          message || 'Unable to generate rules. Please try again.';
        setError(errorMsg);
        toast.error('Rule Generation Failed', errorMsg);
      }
    },
    [],
  );

  useSocketEvent<'watchtower.rule_generation.completed.account'>(
    'watchtower.rule_generation.completed.account',
    useCallback((data: IWatchtowerRuleGenerationCompletedMessage) => {
      if (taskIdRef.current && data.taskId === taskIdRef.current) {
        setGeneratedRules({ name: data.name, rules: data.rules });
        setIsGenerating(false);
        taskIdRef.current = null;
      }
    }, []),
  );

  useSocketEvent<'watchtower.rule_generation.error.account'>(
    'watchtower.rule_generation.error.account',
    useCallback((data: IWatchtowerRuleGenerationErrorMessage) => {
      if (taskIdRef.current && data.taskId === taskIdRef.current) {
        setIsGenerating(false);
        setError(data.message);
        taskIdRef.current = null;
        toast.error('Rule Generation Failed', data.message);
      }
    }, []),
  );

  const reset = useCallback(() => {
    setIsGenerating(false);
    setGeneratedRules(null);
    setError(null);
    taskIdRef.current = null;
  }, []);

  return {
    generateRules,
    generatedRules,
    isGenerating,
    error,
    reset,
  };
};

/**
 * Creates a new watchtower config with rules.
 */
export const useCreateWatchtowerConfig = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ICreateWatchtowerConfigPayload) => {
      return await api.watchtower.createWatchtowerConfig(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.watchtowerConfigs(),
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Creation Failed',
        message || 'Unable to create watchtower. Please try again.',
      );
    },
  });

  return {
    createWatchtower: mutation.mutate,
    createWatchtowerAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
  };
};

/**
 * Deletes a watchtower config.
 */
export const useDeleteWatchtowerConfig = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (uuid: string) => {
      return await api.watchtower.deleteWatchtowerConfig(uuid);
    },
    onSuccess: (_data, deletedUuid) => {
      // Remove cached data for the deleted tower so stale entries don't linger
      queryClient.removeQueries({
        queryKey: watchtowerKeys.dashboard(undefined, deletedUuid),
      });
      queryClient.removeQueries({
        queryKey: watchtowerKeys.scanHistory(deletedUuid),
      });
      // Refresh the configs list and default dashboard
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.watchtowerConfigs(),
      });
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.dashboard(),
      });
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.scanHistory(),
      });
      toast.success('Watchtower Deleted', 'Watchtower removed');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete watchtower. Please try again.',
      );
    },
  });

  return {
    deleteWatchtower: mutation.mutate,
    deleteWatchtowerAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

/**
 * Adds a monitoring rule to a custom watchtower config.
 */
export const useAddWatchtowerConfigRule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      configUuid,
      ruleText,
    }: {
      configUuid: string;
      ruleText: string;
    }) => {
      return await api.watchtower.addWatchtowerConfigRule(configUuid, ruleText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.dashboard(),
      });
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.rules(),
      });
      toast.success('Rule Created', 'Monitoring rule added successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Creation Failed',
        message || 'Unable to add rule. Please try again.',
      );
    },
  });

  return {
    addConfigRule: mutation.mutate,
    addConfigRuleAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
  };
};

/**
 * Deletes an individual rule from a custom watchtower config.
 */
export const useDeleteWatchtowerConfigRule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      configUuid,
      ruleUuid,
    }: {
      configUuid: string;
      ruleUuid: string;
    }) => {
      return await api.watchtower.deleteWatchtowerConfigRule(
        configUuid,
        ruleUuid,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.dashboard(),
      });
      queryClient.invalidateQueries({
        queryKey: watchtowerKeys.rules(),
      });
      toast.success('Rule Deleted', 'Monitoring rule removed');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete rule. Please try again.',
      );
    },
  });

  return {
    deleteConfigRule: mutation.mutate,
    deleteConfigRuleAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

/**
 * Triggers a scan for a watchtower config.
 */
export const useScanWatchtowerConfig = () => {
  const mutation = useMutation({
    mutationFn: async (uuid: string) => {
      return await api.watchtower.scanWatchtowerConfig(uuid);
    },
    onSuccess: () => {
      toast.success(
        'Scan Started',
        'Watchtower scan initiated. Progress will update in real-time.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      if (
        (e.response?.data as { code?: string })?.code === 'scan_in_progress'
      ) {
        toast.info(
          'Scan In Progress',
          'A scan is already running for this watchtower.',
        );
      } else {
        toast.error(
          'Scan Failed',
          message || 'Unable to start scan. Please try again.',
        );
      }
    },
  });

  return {
    scanWatchtower: mutation.mutate,
    scanWatchtowerAsync: mutation.mutateAsync,
    isScanning: mutation.isLoading,
  };
};
