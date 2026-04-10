/**
 * JTBD Canvas React Query Hooks
 *
 * Provides data fetching, mutation, and WebSocket hooks for the
 * Jobs-To-Be-Done Canvas feature. Follows the competitorAssessment.hook.ts pattern.
 */

import { toast } from '@components';
import api from '@libs/api';
import type {
  IJTBDScanCompletedMessage,
  IJTBDScanErrorMessage,
  IJTBDScanProgressMessage,
  IJTBDVideoReadyMessage,
} from '@libs/api/types/socketMessages/inbound';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useSocketEvent } from '../sockets/aucctus';

import type {
  IAddJTBDRulePayload,
  ICreateJTBDConfigPayload,
  IJTBDConfigDetail,
  IJTBDConfigList,
  IJTBDJob,
  IJTBDScan,
  IJTBDScanDetail,
  IUpdateJTBDConfigPayload,
  IUpdateJTBDRulePayload,
} from '@libs/api/types/jtbd';

// ============================================
// Query Keys
// ============================================

export const jtbdKeys = {
  all: ['jtbd'] as const,
  configs: () => [...jtbdKeys.all, 'configs'] as const,
  config: (uuid: string) => [...jtbdKeys.all, 'config', uuid] as const,
  currentScan: (configUuid: string) =>
    [...jtbdKeys.all, 'currentScan', configUuid] as const,
  scans: (configUuid: string) =>
    [...jtbdKeys.all, 'scans', configUuid] as const,
  job: (uuid: string) => [...jtbdKeys.all, 'job', uuid] as const,
  activeScan: (configUuid: string) =>
    [...jtbdKeys.all, 'activeScan', configUuid] as const,
};

// ============================================
// Config Query Hooks
// ============================================

/**
 * Fetches all JTBD configs for the account.
 */
export const useJTBDConfigs = () => {
  const query = useQuery({
    queryKey: jtbdKeys.configs(),
    queryFn: async (): Promise<IJTBDConfigList[]> => {
      return await api.jtbd.listConfigs();
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'JTBD Configs Failed',
          message || 'Unable to fetch JTBD configs. Please try again',
        );
      }
    },
  });

  return {
    configs: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Fetches a single JTBD config with rules and documents.
 */
export const useJTBDConfig = (configUuid: string) => {
  const query = useQuery({
    queryKey: jtbdKeys.config(configUuid),
    queryFn: async (): Promise<IJTBDConfigDetail> => {
      return await api.jtbd.getConfig(configUuid);
    },
    enabled: !!configUuid,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Config Fetch Failed',
        message || 'Unable to fetch JTBD config. Please try again',
      );
    },
  });

  return {
    config: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// Scan Query Hooks
// ============================================

/**
 * Fetches the current scan for a config with all jobs and widgets.
 */
export const useJTBDCurrentScan = (configUuid: string) => {
  const query = useQuery({
    queryKey: jtbdKeys.currentScan(configUuid),
    queryFn: async (): Promise<IJTBDScanDetail> => {
      return await api.jtbd.getCurrentScan(configUuid);
    },
    enabled: !!configUuid,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Scan Fetch Failed',
          message || 'Unable to fetch current scan. Please try again',
        );
      }
    },
  });

  return {
    scan: query.data ?? null,
    jobs: query.data?.jobs ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Fetches all scans for a config, most recent first.
 */
export const useJTBDScans = (configUuid: string) => {
  const query = useQuery({
    queryKey: jtbdKeys.scans(configUuid),
    queryFn: async (): Promise<IJTBDScan[]> => {
      return await api.jtbd.listScans(configUuid);
    },
    enabled: !!configUuid,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Scans Fetch Failed',
        message || 'Unable to fetch scan history. Please try again',
      );
    },
  });

  return {
    scans: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// Job Query Hook
// ============================================

/**
 * Fetches a single JTBD job with nested widgets, items, and sources.
 */
export const useJTBDJob = (jobUuid: string) => {
  const query = useQuery({
    queryKey: jtbdKeys.job(jobUuid),
    queryFn: async (): Promise<IJTBDJob> => {
      return await api.jtbd.getJob(jobUuid);
    },
    enabled: !!jobUuid,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Job Fetch Failed',
        message || 'Unable to fetch JTBD job details. Please try again',
      );
    },
  });

  return {
    job: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Fetches the active (in-progress) scan for a config.
 * Only enabled when the config reports it's scanning.
 * Used to recover progress state after a page refresh.
 */
export const useJTBDActiveScan = (configUuid: string, enabled: boolean) => {
  const { data } = useQuery({
    queryKey: jtbdKeys.activeScan(configUuid),
    queryFn: () => api.jtbd.getActiveScan(configUuid),
    enabled: !!configUuid && enabled,
    staleTime: 10_000,
  });

  return { activeScan: data ?? null };
};

// ============================================
// Config Mutation Hooks
// ============================================

/**
 * Creates a new JTBD config.
 */
export const useCreateJTBDConfig = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ICreateJTBDConfigPayload) => {
      return await api.jtbd.createConfig(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
      toast.success('Config Created', 'JTBD config created successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Creation Failed',
        message || 'Unable to create JTBD config. Please try again',
      );
    },
  });

  return {
    createConfig: mutation.mutate,
    createConfigAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
  };
};

/**
 * Updates a JTBD config.
 */
export const useUpdateJTBDConfig = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      configUuid,
      data,
    }: {
      configUuid: string;
      data: IUpdateJTBDConfigPayload;
    }) => {
      return await api.jtbd.updateConfig(configUuid, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.config(variables.configUuid),
      });
      toast.success('Config Updated', 'JTBD config updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update JTBD config. Please try again',
      );
    },
  });

  return {
    updateConfig: mutation.mutate,
    updateConfigAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

/**
 * Deletes a JTBD config (cascades to rules, documents, scans, jobs).
 */
export const useDeleteJTBDConfig = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (configUuid: string) => {
      return await api.jtbd.deleteConfig(configUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
      toast.success('Config Deleted', 'JTBD config deleted');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete JTBD config. Please try again',
      );
    },
  });

  return {
    deleteConfig: mutation.mutate,
    deleteConfigAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

// ============================================
// Rule Mutation Hooks
// ============================================

/**
 * Adds a monitoring rule to a JTBD config.
 */
export const useAddJTBDRule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      configUuid,
      data,
    }: {
      configUuid: string;
      data: IAddJTBDRulePayload;
    }) => {
      return await api.jtbd.addRule(configUuid, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.config(variables.configUuid),
      });
      toast.success('Rule Added', 'Monitoring rule added successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Rule Failed',
        message || 'Unable to add rule. Please try again',
      );
    },
  });

  return {
    addRule: mutation.mutate,
    addRuleAsync: mutation.mutateAsync,
    isAdding: mutation.isLoading,
  };
};

/**
 * Updates a JTBD rule.
 */
export const useUpdateJTBDRule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: {
      ruleUuid: string;
      configUuid: string;
      data: IUpdateJTBDRulePayload;
    }) => {
      return await api.jtbd.updateRule(variables.ruleUuid, variables.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.config(variables.configUuid),
      });
      toast.success('Rule Updated', 'Monitoring rule updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update rule. Please try again',
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
 * Deletes a JTBD rule.
 */
export const useDeleteJTBDRule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: { ruleUuid: string; configUuid: string }) => {
      return await api.jtbd.deleteRule(variables.ruleUuid);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.config(variables.configUuid),
      });
      toast.success('Rule Deleted', 'Monitoring rule removed');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete rule. Please try again',
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
// Document Mutation Hooks
// ============================================

/**
 * Uploads a context document to a JTBD config.
 */
export const useUploadJTBDDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      configUuid,
      file,
    }: {
      configUuid: string;
      file: File;
    }) => {
      return await api.jtbd.uploadDocument(configUuid, file);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.config(variables.configUuid),
      });
      toast.success(
        'Document Uploaded',
        'Context document uploaded successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Upload Failed',
        message || 'Unable to upload document. Please try again',
      );
    },
  });

  return {
    uploadDocument: mutation.mutate,
    uploadDocumentAsync: mutation.mutateAsync,
    isUploading: mutation.isLoading,
  };
};

/**
 * Deletes a context document from a JTBD config.
 */
export const useDeleteJTBDDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: {
      documentUuid: string;
      configUuid: string;
    }) => {
      return await api.jtbd.deleteDocument(variables.documentUuid);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.config(variables.configUuid),
      });
      toast.success('Document Deleted', 'Context document removed');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete document. Please try again',
      );
    },
  });

  return {
    deleteDocument: mutation.mutate,
    deleteDocumentAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

// ============================================
// Scan Trigger Hook
// ============================================

/**
 * Triggers a JTBD scan for a config.
 * Returns immediately; progress comes via WebSocket.
 */
export const useTriggerJTBDScan = (
  startScanning?: (configUuid: string) => void,
) => {
  const mutation = useMutation({
    mutationFn: async (configUuid: string) => {
      return await api.jtbd.triggerScan(configUuid);
    },
    onSuccess: (_data, configUuid) => {
      startScanning?.(configUuid);
      toast.success(
        'Scan Started',
        'JTBD scan started. Progress will update in real-time.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      if (
        (e.response?.data as { code?: string })?.code === 'scan_in_progress'
      ) {
        toast.info(
          'Scan In Progress',
          'A JTBD scan is already running. Please wait.',
        );
      } else {
        toast.error(
          'Scan Failed',
          message || 'Unable to start JTBD scan. Please try again',
        );
      }
    },
  });

  return {
    triggerScan: mutation.mutate,
    triggerScanAsync: mutation.mutateAsync,
    isTriggering: mutation.isLoading,
  };
};

/**
 * Trigger concept ideation from a JTBD job.
 * Creates a seed and dispatches the concept generation pipeline.
 */
export const useIdeateFromJob = () => {
  const mutation = useMutation({
    mutationFn: async (jobUuid: string) => {
      return await api.jtbd.ideateFromJob(jobUuid);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Ideation Failed',
        message || 'Unable to start concept ideation. Please try again.',
      );
    },
  });

  return {
    ideateFromJob: mutation.mutate,
    ideateFromJobAsync: mutation.mutateAsync,
    isIdeating: mutation.isLoading,
  };
};

// ============================================
// WebSocket Events Hook
// ============================================

export interface JTBDScanProgress {
  isScanning: boolean;
  stage: string;
  progress: number;
  message: string;
  currentJob?: string;
}

const DEFAULT_SCAN_PROGRESS: JTBDScanProgress = {
  isScanning: false,
  stage: '',
  progress: 0,
  message: '',
  currentJob: undefined,
};

/**
 * Hook to listen for JTBD scan WebSocket events.
 * Maintains per-config keyed state so progress is scoped correctly.
 */
export const useJTBDScanSocketEvents = (configUuid?: string) => {
  const queryClient = useQueryClient();
  const [progressMap, setProgressMap] = useState<
    Record<string, JTBDScanProgress>
  >({});

  // Listen for scan progress events
  useSocketEvent<'jtbd.scan.progress.account'>(
    'jtbd.scan.progress.account',
    useCallback((data: IJTBDScanProgressMessage) => {
      const key = data.configUuid;
      if (!key) return;
      setProgressMap((prev) => ({
        ...prev,
        [key]: {
          isScanning: data.stage !== 'completed',
          stage: data.stage,
          progress: data.progress,
          message: data.message,
          currentJob: data.currentJob,
        },
      }));
    }, []),
  );

  // Listen for scan completed events
  useSocketEvent<'jtbd.scan.completed.account'>(
    'jtbd.scan.completed.account',
    useCallback(
      (data: IJTBDScanCompletedMessage) => {
        // Remove this config's progress entry
        if (data.configUuid) {
          setProgressMap((prev) => {
            const next = { ...prev };
            delete next[data.configUuid];
            return next;
          });
        }

        // Invalidate configs list (to update isScanning/lastScanAt)
        queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });

        // Invalidate the specific config
        const uuid = data.configUuid || configUuid;
        if (uuid) {
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.config(uuid),
          });
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.currentScan(uuid),
          });
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.scans(uuid),
          });
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.activeScan(uuid),
          });
        }

        toast.success(
          'JTBD Scan Complete',
          `Discovered ${data.jobsDiscovered} jobs to be done.`,
        );
      },
      [queryClient, configUuid],
    ),
  );

  // Listen for scan error events
  useSocketEvent<'jtbd.scan.error.account'>(
    'jtbd.scan.error.account',
    useCallback(
      (data: IJTBDScanErrorMessage) => {
        // Remove this config's progress entry
        const errorConfigUuid = data.configUuid;
        if (errorConfigUuid) {
          setProgressMap((prev) => {
            const next = { ...prev };
            delete next[errorConfigUuid];
            return next;
          });
        }

        // Invalidate caches so isScanning resets from REST
        queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });

        const uuid = errorConfigUuid || configUuid;
        if (uuid) {
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.config(uuid),
          });
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.scans(uuid),
          });
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.activeScan(uuid),
          });
        }

        toast.error('JTBD Scan Failed', data.message);
      },
      [queryClient, configUuid],
    ),
  );

  // Listen for video ready events — invalidate current scan to pick up new videoUrl
  useSocketEvent<'jtbd.video.ready.account'>(
    'jtbd.video.ready.account',
    useCallback(
      (data: IJTBDVideoReadyMessage) => {
        const uuid = data.configUuid || configUuid;
        if (uuid) {
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.currentScan(uuid),
          });
        }
      },
      [queryClient, configUuid],
    ),
  );

  const scanProgress = configUuid
    ? (progressMap[configUuid] ?? DEFAULT_SCAN_PROGRESS)
    : DEFAULT_SCAN_PROGRESS;

  const resetProgress = useCallback((uuid?: string) => {
    if (uuid) {
      setProgressMap((prev) => {
        const next = { ...prev };
        delete next[uuid];
        return next;
      });
    } else {
      setProgressMap({});
    }
  }, []);

  const startScanning = useCallback((uuid: string) => {
    setProgressMap((prev) => ({
      ...prev,
      [uuid]: {
        isScanning: true,
        stage: 'started',
        progress: 0,
        message: 'Starting JTBD scan...',
        currentJob: undefined,
      },
    }));
  }, []);

  return {
    scanProgress,
    resetProgress,
    startScanning,
  };
};
