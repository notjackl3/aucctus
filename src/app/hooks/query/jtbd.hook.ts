/**
 * JTBD Canvas React Query Hooks
 *
 * Provides data fetching, mutation, and WebSocket hooks for the
 * Jobs-To-Be-Done Canvas feature.
 */

import { toast } from '@components';
import api from '@libs/api';
import type {
  IJTBDJobEditErrorMessage,
  IJTBDJobEditStartedMessage,
  IJTBDJobEditedMessage,
  IJTBDJobsMergeErrorMessage,
  IJTBDJobsMergedMessage,
  IJTBDRuleGenerationCompletedMessage,
  IJTBDRuleGenerationErrorMessage,
  IJTBDScanCompletedMessage,
  IJTBDScanErrorMessage,
  IJTBDScanStartedMessage,
  IJTBDVideoReadyMessage,
} from '@libs/api/types/socketMessages/inbound';
import utils from '@libs/utils';
import useStore from '@stores/store';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { useSocketEvent } from '../sockets/aucctus';

import type {
  IAddJTBDRulePayload,
  ICreateJTBDConfigPayload,
  ICreateJTBDNotePayload,
  IJTBDConfigDetail,
  IJTBDConfigList,
  IJTBDEditJobRequest,
  IJTBDGeneratedRule,
  IJTBDIdeateRequest,
  IJTBDJob,
  IJTBDMergeJobsRequest,
  IJTBDScan,
  IJTBDScanDetail,
  IUpdateJTBDConfigPayload,
  IUpdateJTBDNotePayload,
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
  jobs: (configUuid: string, scanUuids: string[]) =>
    [...jtbdKeys.all, 'jobs', configUuid, [...scanUuids].sort()] as const,
  job: (uuid: string) => [...jtbdKeys.all, 'job', uuid] as const,
  activeScan: (configUuid: string) =>
    [...jtbdKeys.all, 'activeScan', configUuid] as const,
};

// ============================================
// Rule Generation Hook
// ============================================

/**
 * Generates JTBD monitoring rules from a description using AI.
 * Dispatches to Celery via POST, receives results via WebSocket.
 */
export const useGenerateJTBDRules = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRules, setGeneratedRules] = useState<{
    name: string;
    rules: IJTBDGeneratedRule[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const taskIdRef = useRef<string | null>(null);

  const generateRules = useCallback(
    async ({ description, files }: { description: string; files?: File[] }) => {
      setIsGenerating(true);
      setGeneratedRules(null);
      setError(null);

      try {
        const data = await api.jtbd.generateRules(description, files);
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

  useSocketEvent<'jtbd.rule_generation.completed.account'>(
    'jtbd.rule_generation.completed.account',
    useCallback((data: IJTBDRuleGenerationCompletedMessage) => {
      if (taskIdRef.current && data.taskId === taskIdRef.current) {
        setGeneratedRules({ name: data.name, rules: data.rules });
        setIsGenerating(false);
        taskIdRef.current = null;
      }
    }, []),
  );

  useSocketEvent<'jtbd.rule_generation.error.account'>(
    'jtbd.rule_generation.error.account',
    useCallback((data: IJTBDRuleGenerationErrorMessage) => {
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

// ============================================
// Config Query Hooks
// ============================================

/**
 * Fetches all JTBD configs for the account.
 */
export const useJTBDConfigs = () => {
  const setEditingJobUuidsForConfig = useStore(
    (s) => s.jtbdActive.setEditingJobUuidsForConfig,
  );

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

  // Hydrate the per-config editing-jobs set from the API response. This
  // keeps the edit-in-progress badge + rescan gate consistent across page
  // reloads and catches WS events that fired while the tab was closed.
  //
  // Guard: if the server reports an empty set but local state has entries,
  // skip the replace. This prevents a scan-triggered config refetch from
  // clobbering optimistic `onMutate` additions before `begin_edit` has
  // committed to Redis. Authoritative non-empty server state always wins.
  useEffect(() => {
    if (!query.data) return;
    const state = useStore.getState();
    for (const config of query.data) {
      const incoming = config.activeEditJobUuids ?? [];
      const existing =
        state.jtbdActive.editingJobUuidsByConfig[config.uuid] ?? [];
      if (incoming.length > 0 || existing.length === 0) {
        setEditingJobUuidsForConfig(config.uuid, incoming);
      }
    }
  }, [query.data, setEditingJobUuidsForConfig]);

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
  const setEditingJobUuidsForConfig = useStore(
    (s) => s.jtbdActive.setEditingJobUuidsForConfig,
  );

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

  // Hydrate the per-config editing-jobs set from the detail response too, so
  // detail-only consumers (e.g. modals) converge to the same authoritative
  // set the list endpoint would produce.
  //
  // Same guard as `useJTBDConfigs`: skip the replace when the server reports
  // an empty set but local state already has entries (optimistic additions
  // that haven't yet been persisted to Redis). Non-empty server state wins.
  useEffect(() => {
    if (!query.data) return;
    const state = useStore.getState();
    const incoming = query.data.activeEditJobUuids ?? [];
    const existing =
      state.jtbdActive.editingJobUuidsByConfig[query.data.uuid] ?? [];
    if (incoming.length > 0 || existing.length === 0) {
      setEditingJobUuidsForConfig(query.data.uuid, incoming);
    }
  }, [query.data, setEditingJobUuidsForConfig]);

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
    keepPreviousData: true,
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
    isFetching: query.isFetching,
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

/**
 * Fetches the flat list of jobs across the selected scans (union) for a config.
 * When `scanUuids` is empty, the hook is disabled — no request is made.
 */
export const useJTBDJobs = (configUuid: string, scanUuids: string[]) => {
  const isEnabled = !!configUuid && scanUuids.length > 0;
  const query = useQuery({
    queryKey: jtbdKeys.jobs(configUuid, scanUuids),
    queryFn: async (): Promise<IJTBDJob[]> => {
      return await api.jtbd.listJobs(configUuid, scanUuids);
    },
    enabled: isEnabled,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Jobs Fetch Failed',
          message || 'Unable to fetch JTBD jobs. Please try again',
        );
      }
    },
  });

  // `keepPreviousData` retains the previous key's data on the observer even
  // after the cache is cleared or the query is disabled. That leaks jobs from
  // a prior config onto the canvas when the user navigates to a config with
  // no scans. Gate the returned data on whether the query is actually enabled.
  return {
    jobs: isEnabled ? (query.data ?? []) : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
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
    // The scan row is created inside the Celery worker, so it may not exist yet
    // when isScanning is optimistically set. Retry with backoff until the row appears.
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    onError: () => {
      // Suppress toast — 404 is expected during the optimistic window
    },
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
 * Clones a JTBD config (creates a duplicate with all rules and documents).
 * Accepts either a plain `configUuid` string (legacy ergonomic call) or an
 * object with an optional `newName` override piped to the backend clone
 * endpoint. Keeps the existing call-sites untouched while enabling the
 * Overseer `jtbd_config_clone` suggestion to rename on clone.
 */
export const useCloneJTBDConfig = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      variables: string | { configUuid: string; newName?: string | null },
    ) => {
      if (typeof variables === 'string') {
        return await api.jtbd.cloneConfig(variables);
      }
      return await api.jtbd.cloneConfig(variables.configUuid, {
        newName: variables.newName ?? undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
      toast.success('Config Cloned', 'Discovery area cloned successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Clone Failed',
        message || 'Unable to clone JTBD config. Please try again',
      );
    },
  });

  return {
    cloneConfig: mutation.mutate,
    cloneConfigAsync: mutation.mutateAsync,
    isCloning: mutation.isLoading,
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
// Email When Ready Hook
// ============================================

/**
 * Requests an email notification when the active scan completes.
 */
export const useJTBDEmailWhenReady = () => {
  const mutation = useMutation({
    mutationFn: async (configUuid: string) => {
      return await api.jtbd.emailWhenReady(configUuid);
    },
    onSuccess: (data) => {
      const alreadyScheduled = data?.detail?.includes('already');
      toast.success(
        alreadyScheduled ? 'Already Scheduled' : 'Email Scheduled',
        alreadyScheduled
          ? 'An email notification was already scheduled for this scan.'
          : "You'll be emailed when your scan completes.",
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Email Request Failed',
        message || 'Unable to schedule email notification. Please try again.',
      );
    },
  });

  return {
    emailWhenReady: mutation.mutate,
    isRequesting: mutation.isLoading,
    isSuccess: mutation.isSuccess,
  };
};

// ============================================
// Scan Trigger Hook
// ============================================

/**
 * Triggers a JTBD scan for a config.
 * Returns immediately; progress is displayed by AgentProgressBar.
 */
export const useTriggerJTBDScan = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (configUuid: string) => {
      return await api.jtbd.triggerScan(configUuid);
    },
    onSuccess: (_data, configUuid) => {
      // Optimistically set isScanning so the progress bar renders immediately,
      // before the Celery worker creates the scan row in the database.
      queryClient.setQueryData<IJTBDConfigList[]>(jtbdKeys.configs(), (old) =>
        old
          ? old.map((c) =>
              c.uuid === configUuid ? { ...c, isScanning: true } : c,
            )
          : old!,
      );
      queryClient.setQueryData<IJTBDConfigDetail>(
        jtbdKeys.config(configUuid),
        (old) => (old ? { ...old, isScanning: true } : old!),
      );
      toast.success(
        'Scan Started',
        'JTBD scan started. Progress will update in real-time.',
      );
    },
    onError: (e: AxiosError) => {
      const data = e.response?.data as
        | { code?: string; details?: { active_job_uuids?: string[] } }
        | undefined;
      const code = data?.code;
      if (code === 'scan_in_progress') {
        toast.info(
          'Scan In Progress',
          'A JTBD scan is already running. Please wait.',
        );
        return;
      }
      if (code === 'edits_in_progress') {
        const activeCount = data?.details?.active_job_uuids?.length ?? 1;
        const plural = activeCount === 1 ? '' : 's';
        toast.info(
          'Edits In Progress',
          `${activeCount} edit${plural} in progress. Retry the scan in a moment.`,
        );
        return;
      }
      if (code === 'edit_tracking_unavailable') {
        toast.info(
          'Edit Tracking Unavailable',
          'Edit tracking is temporarily unavailable. Try again in a moment.',
        );
        return;
      }
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Scan Failed',
        message || 'Unable to start JTBD scan. Please try again',
      );
    },
  });

  return {
    triggerScan: mutation.mutate,
    triggerScanAsync: mutation.mutateAsync,
    isTriggering: mutation.isLoading,
  };
};

/**
 * Deletes a JTBD scan (cascades to its jobs/widgets).
 * Rejects deletion of the current scan or an in-progress scan.
 */
export const useDeleteJTBDScan = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      configUuid,
      scanUuid,
    }: {
      configUuid: string;
      scanUuid: string;
    }) => {
      return await api.jtbd.deleteScan(configUuid, scanUuid);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.scans(variables.configUuid),
      });
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.currentScan(variables.configUuid),
      });
      queryClient.invalidateQueries({
        queryKey: [...jtbdKeys.all, 'jobs', variables.configUuid],
      });
      // Configs list carries lastScanAt/lastScanStatus which may shift when the current scan moves.
      queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
    },
    onError: (e: AxiosError) => {
      const code = (e.response?.data as { code?: string })?.code;
      if (code === 'scan_in_progress') {
        toast.info(
          'Scan Still Running',
          'Wait for the scan to finish before deleting it.',
        );
        return;
      }
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete scan. Please try again.',
      );
    },
  });

  return {
    deleteScan: mutation.mutate,
    deleteScanAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

// ============================================
// Job Cache Replacement Helper
// ============================================

/**
 * Replace a job in all cached queries with a freshly-edited version.
 * Used by the unified `jtbd.job.edited.account` WebSocket success handler.
 */
const replaceJTBDJobInCaches = (queryClient: QueryClient, job: IJTBDJob) => {
  // 1. Single-job cache
  queryClient.setQueryData<IJTBDJob>(jtbdKeys.job(job.uuid), job);

  // 2. Any config-scoped job lists that contain this job
  const jobsQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: [...jtbdKeys.all, 'jobs'] });

  jobsQueries.forEach((query) => {
    const key = query.queryKey;
    queryClient.setQueryData<IJTBDJob[]>(key, (old) =>
      old ? old.map((j) => (j.uuid === job.uuid ? job : j)) : old!,
    );
  });

  // 3. Current scan detail
  const currentScanQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: [...jtbdKeys.all, 'currentScan'] });

  currentScanQueries.forEach((query) => {
    const key = query.queryKey;
    queryClient.setQueryData<IJTBDScanDetail>(key, (old) => {
      if (!old?.jobs) return old!;
      return {
        ...old,
        jobs: old.jobs.map((j) => (j.uuid === job.uuid ? job : j)),
      };
    });
  });
};

/**
 * Remove a job from every JTBD cache (single-job, config-scoped job lists,
 * current-scan details). Used by the `jtbd.jobs.merged.account` WebSocket
 * success handler so the deleted secondary disappears from the canvas
 * immediately.
 */
const removeJTBDJobFromCaches = (queryClient: QueryClient, jobUuid: string) => {
  // 1. Single-job cache — drop it entirely rather than leaving a stale entry
  queryClient.removeQueries({ queryKey: jtbdKeys.job(jobUuid) });

  // 2. Any config-scoped job lists that contain this job
  const jobsQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: [...jtbdKeys.all, 'jobs'] });

  jobsQueries.forEach((query) => {
    const key = query.queryKey;
    queryClient.setQueryData<IJTBDJob[]>(key, (old) =>
      old ? old.filter((j) => j.uuid !== jobUuid) : old!,
    );
  });

  // 3. Current scan detail
  const currentScanQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: [...jtbdKeys.all, 'currentScan'] });

  currentScanQueries.forEach((query) => {
    const key = query.queryKey;
    queryClient.setQueryData<IJTBDScanDetail>(key, (old) => {
      if (!old?.jobs) return old!;
      return {
        ...old,
        jobs: old.jobs.filter((j) => j.uuid !== jobUuid),
      };
    });
  });
};

// ============================================
// Unified Job Edit Hook
// ============================================

/**
 * Dispatch a unified JTBD job edit (widget / whole-job / widget-add) via
 * `POST /jtbd/jobs/{uuid}/edit/`. Returns 202 with a task ID; the refreshed
 * job arrives via the `jtbd.job.edited.account` WebSocket event. A 409
 * response with code `job_edit_in_progress` surfaces an info toast.
 *
 * No optimistic update — the real job state is replaced in caches once the
 * backend research agent finishes and emits the edited event. The `onSuccess`
 * invalidation is a defensive backup: if the socket event is missed, the
 * single-job cache will refetch.
 */
export const useJobEdit = () => {
  const queryClient = useQueryClient();
  const addEditingJobUuid = useStore((s) => s.jtbdActive.addEditingJobUuid);
  const removeEditingJobUuid = useStore(
    (s) => s.jtbdActive.removeEditingJobUuid,
  );

  const mutation = useMutation({
    mutationFn: async (variables: {
      jobUuid: string;
      body: IJTBDEditJobRequest;
    }) => {
      return await api.jtbd.editJob(variables.jobUuid, variables.body);
    },
    onMutate: (variables) => {
      // Optimistic: add the job to the active config's editing set so the
      // UI surfaces the editing badge / gates the rescan button instantly,
      // without waiting for the `jtbd.job.edit.started.account` WS event.
      // Read the active config from the Zustand slice — edits only fire
      // from the active canvas, and the WS event will reconcile if anything
      // drifts.
      const configUuid = useStore.getState().jtbdActive.activeConfigUuid;
      if (configUuid) {
        addEditingJobUuid(configUuid, variables.jobUuid);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: jtbdKeys.job(variables.jobUuid),
      });
    },
    onSettled: (_data, _err, variables) => {
      // Safety net: if the WS path (edit.started → edited/edit.error) fails
      // for any reason (network drop between mutation ack and completion
      // event, stale WS connection, etc.), fall back to removing the
      // optimistic entry when the mutation itself completes. The WS
      // completion events also call `removeEditingJobUuid`; double-remove
      // is a no-op.
      //
      // Note: `onSettled` fires immediately after the HTTP 202 ack — well
      // before the backend actually finishes the edit. We intentionally
      // DON'T remove here on success; the WS event is authoritative for
      // edit lifetime. Only remove on client-side error (no server ack).
      if (_err) {
        const configUuid = useStore.getState().jtbdActive.activeConfigUuid;
        if (configUuid) {
          removeEditingJobUuid(configUuid, variables.jobUuid);
        }
      }
    },
    onError: (e: AxiosError) => {
      const code = (e.response?.data as { code?: string })?.code;
      if (code === 'scan_in_progress') {
        toast.info(
          'Scan In Progress',
          'A scan is running on this config. Your edit will be available once it completes.',
        );
        return;
      }
      if (code === 'job_edit_in_progress' || e.response?.status === 409) {
        toast.info(
          'Edit In Progress',
          'Edit already in progress for this job. Please wait.',
        );
        return;
      }
      if (code === 'edit_tracking_unavailable') {
        toast.info(
          'Edit Tracking Unavailable',
          'Edit tracking is temporarily unavailable. Try again in a moment.',
        );
        return;
      }

      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Edit Failed',
        message || 'Unable to edit this opportunity. Please try again.',
      );
    },
  });

  return {
    editJob: mutation.mutate,
    editJobAsync: mutation.mutateAsync,
    isEditing: mutation.isLoading,
  };
};

/**
 * Dispatch a user-initiated JTBD job merge via
 * `POST /jtbd/jobs/{primary_uuid}/merge/`. Secondary UUIDs are sent in the
 * request body (supports 1-4 secondaries). Returns 202 with a task ID; the
 * refreshed primary arrives via `jtbd.jobs.merged.account` and the
 * secondaries are removed from caches by the same listener. A 409 response
 * with `code: "locked"` indicates one of the jobs is already being
 * edited/merged.
 */
export const useMergeJTBDJobs = () => {
  const queryClient = useQueryClient();
  const addEditingJobUuid = useStore((s) => s.jtbdActive.addEditingJobUuid);
  const removeEditingJobUuid = useStore(
    (s) => s.jtbdActive.removeEditingJobUuid,
  );

  const mutation = useMutation({
    mutationFn: async (variables: {
      primaryJobUuid: string;
      body: IJTBDMergeJobsRequest;
    }) => {
      return await api.jtbd.mergeJobs(variables.primaryJobUuid, variables.body);
    },
    onMutate: (variables) => {
      // Optimistic: add the primary AND every secondary to the active config's
      // editing set so every involved card flips to its loading badge instantly,
      // without waiting for the per-uuid `jtbd.job.edit.started.account` WS
      // events. Mirrors `useJobEdit.onMutate`. The WS handler is idempotent
      // and will reconcile if anything drifts.
      const configUuid = useStore.getState().jtbdActive.activeConfigUuid;
      if (configUuid) {
        addEditingJobUuid(configUuid, variables.primaryJobUuid);
        for (const secondaryUuid of variables.body.secondaryJobUuids) {
          addEditingJobUuid(configUuid, secondaryUuid);
        }
      }
    },
    onSuccess: (_data, variables) => {
      // Resolve the primary job title for a descriptive toast
      const cached = queryClient.getQueryData<IJTBDJob>(
        jtbdKeys.job(variables.primaryJobUuid),
      );
      const primaryTitle = cached?.jtbdTitle ?? 'the primary job';
      const count = variables.body.secondaryJobUuids.length;
      toast.success(
        'Merging jobs...',
        `Merged ${count} job${count !== 1 ? 's' : ''} into ${primaryTitle}.`,
      );
    },
    onSettled: (_data, err, variables) => {
      // Safety net: if the mutation itself errored client-side (no server
      // ack), peel the optimistic editing entries back off. On success the
      // WS path (`jtbd.jobs.merged.account` / `jtbd.jobs.merge.error.account`)
      // is authoritative for the merge lifetime — the HTTP 202 ack fires
      // long before the merge actually completes.
      if (err) {
        const configUuid = useStore.getState().jtbdActive.activeConfigUuid;
        if (configUuid) {
          removeEditingJobUuid(configUuid, variables.primaryJobUuid);
          for (const secondaryUuid of variables.body.secondaryJobUuids) {
            removeEditingJobUuid(configUuid, secondaryUuid);
          }
        }
      }
    },
    onError: (e: AxiosError) => {
      const data = e.response?.data as
        | { code?: string; details?: { lockedJobUuid?: string } }
        | undefined;
      if (e.response?.status === 409 && data?.code === 'locked') {
        toast.info(
          'Merge Blocked',
          'One of these jobs is already being edited or merged. Please wait.',
        );
        return;
      }
      if (data?.code === 'edit_tracking_unavailable') {
        toast.info(
          'Edit Tracking Unavailable',
          'Edit tracking is temporarily unavailable. Try again in a moment.',
        );
        return;
      }
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Merge Failed',
        message || 'Unable to merge these jobs. Please try again.',
      );
    },
  });

  return {
    mergeJobs: mutation.mutate,
    mergeJobsAsync: mutation.mutateAsync,
    isMerging: mutation.isLoading,
  };
};

/**
 * Permanently delete a JTBD job via `DELETE /jtbd/jobs/{uuid}/`. On 204 the
 * job is evicted from every JTBD cache so the canvas converges immediately.
 * A 409 response with `code: "locked"` indicates the job is currently being
 * edited or merged; the info toast asks the user to retry in a moment.
 */
export const useDeleteJTBDJob = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (jobUuid: string) => {
      await api.jtbd.deleteJob(jobUuid);
      return jobUuid;
    },
    onSuccess: (jobUuid) => {
      // Resolve the job title BEFORE removing the job from caches so the
      // toast can reference the job by name rather than by UUID.
      const cached = queryClient.getQueryData<IJTBDJob>(jtbdKeys.job(jobUuid));
      let title = cached?.jtbdTitle ?? null;
      if (!title) {
        const jobsQueries = queryClient.getQueriesData<IJTBDJob[]>({
          queryKey: [...jtbdKeys.all, 'jobs'],
        });
        for (const [, jobs] of jobsQueries) {
          const match = jobs?.find((j) => j.uuid === jobUuid);
          if (match?.jtbdTitle) {
            title = match.jtbdTitle;
            break;
          }
        }
      }

      removeJTBDJobFromCaches(queryClient, jobUuid);
      // Also invalidate the active-scan jobs list so any config-scoped job
      // queries refetch in case this deletion leaves the scan empty.
      queryClient.invalidateQueries({
        queryKey: [...jtbdKeys.all, 'jobs'],
      });

      toast.success('Job deleted', title ? `Removed ${title}.` : undefined);
    },
    onError: (e: AxiosError) => {
      const data = e.response?.data as
        | { code?: string; details?: { lockedJobUuid?: string } }
        | undefined;
      if (e.response?.status === 409 && data?.code === 'locked') {
        toast.info(
          'Job Locked',
          'That job is currently being edited — try again in a moment.',
        );
        return;
      }
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete this job. Please try again.',
      );
    },
  });

  return {
    deleteJob: mutation.mutate,
    deleteJobAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

/**
 * Trigger concept ideation from a JTBD job.
 * Creates a seed and dispatches the concept generation pipeline. Accepts an
 * optional `generationInstructions` string that is piped to the concept
 * ideation agent as free-form user guidance (2000-char cap server-side).
 * The card-button path passes no payload and retains its original behavior.
 */
export const useIdeateFromJob = () => {
  const mutation = useMutation({
    mutationFn: async (variables: {
      jobUuid: string;
      payload?: IJTBDIdeateRequest;
    }) => {
      return await api.jtbd.ideateFromJob(variables.jobUuid, variables.payload);
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

/**
 * Hook to listen for JTBD scan WebSocket events.
 * Handles completion/error toasts and query invalidation.
 * Progress display is delegated to AgentProgressBar.
 */
export const useJTBDScanSocketEvents = (configUuid?: string) => {
  const queryClient = useQueryClient();
  const addEditingJobUuid = useStore((s) => s.jtbdActive.addEditingJobUuid);
  const removeEditingJobUuid = useStore(
    (s) => s.jtbdActive.removeEditingJobUuid,
  );

  // Listen for scan STARTED events — flip the configs-list `isScanning` flag
  // immediately so the rescan button gates to "Scanning..." before the next
  // `useJTBDConfigs` refetch completes. Works for cross-client triggers too
  // (e.g. another user in the account started the scan).
  useSocketEvent<'jtbd.scan.started.account'>(
    'jtbd.scan.started.account',
    useCallback(
      (data: IJTBDScanStartedMessage) => {
        if (!configUuid || data.configUuid !== configUuid) return;
        queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });
        queryClient.invalidateQueries({
          queryKey: jtbdKeys.config(data.configUuid),
        });
      },
      [queryClient, configUuid],
    ),
  );

  // Listen for job-edit STARTED events — mark the job as editing in the
  // Zustand slice so cards render the loading badge and the rescan button
  // gates. Idempotent with the optimistic `onMutate` in `useJobEdit`.
  useSocketEvent<'jtbd.job.edit.started.account'>(
    'jtbd.job.edit.started.account',
    useCallback(
      (data: IJTBDJobEditStartedMessage) => {
        if (!configUuid || data.configUuid !== configUuid) return;
        addEditingJobUuid(data.configUuid, data.jobUuid);
      },
      [configUuid, addEditingJobUuid],
    ),
  );

  // Listen for scan completed events
  useSocketEvent<'jtbd.scan.completed.account'>(
    'jtbd.scan.completed.account',
    useCallback(
      (data: IJTBDScanCompletedMessage) => {
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
            queryKey: [...jtbdKeys.all, 'jobs', uuid],
          });
          // Remove (don't invalidate) activeScan — the scan is COMPLETED so a
          // refetch would 404 and the global QueryCache.onError toast would fire.
          queryClient.removeQueries({
            queryKey: jtbdKeys.activeScan(uuid),
          });
        }

        toast.success(
          'JTBD Scan Complete',
          data.jobsDiscovered === 1
            ? '1 job on canvas. Merged jobs are labeled; check the canvas for new vs merged.'
            : `${data.jobsDiscovered} jobs on canvas. Merged jobs are labeled; check the canvas for new vs merged.`,
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
        // Invalidate caches so isScanning resets from REST
        queryClient.invalidateQueries({ queryKey: jtbdKeys.configs() });

        const uuid = data.configUuid || configUuid;
        if (uuid) {
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.config(uuid),
          });
          queryClient.invalidateQueries({
            queryKey: jtbdKeys.scans(uuid),
          });
          queryClient.removeQueries({
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

  // Listen for unified job-edit completion — replace the job wherever it's
  // cached (single-job, jobs lists, current scan) so the UI picks up the
  // refreshed evidence + scoring immediately. Also clear the editing flag
  // so the per-job loading badge and rescan-button gate release.
  useSocketEvent<'jtbd.job.edited.account'>(
    'jtbd.job.edited.account',
    useCallback(
      (data: IJTBDJobEditedMessage) => {
        replaceJTBDJobInCaches(queryClient, data.job);
        if (data.configUuid) {
          removeEditingJobUuid(data.configUuid, data.jobUuid);
        }
        toast.success(
          'Opportunity Updated',
          data.message ||
            'The refreshed evidence and scoring have been applied.',
        );
      },
      [queryClient, removeEditingJobUuid],
    ),
  );

  // Listen for unified job-edit errors — surface the failure message and
  // clear the editing flag for the affected job so the UI recovers.
  useSocketEvent<'jtbd.job.edit.error.account'>(
    'jtbd.job.edit.error.account',
    useCallback(
      (data: IJTBDJobEditErrorMessage) => {
        // The error payload doesn't carry configUuid — fall back to the
        // active config UUID from the Zustand slice (we only listen on the
        // active canvas) to find the right editing set.
        const configUuid = useStore.getState().jtbdActive.activeConfigUuid;
        if (configUuid) {
          removeEditingJobUuid(configUuid, data.jobUuid);
        }
        toast.error(
          'Edit Failed',
          data.message ||
            'Unable to update this opportunity. Please try again.',
        );
      },
      [removeEditingJobUuid],
    ),
  );

  // Listen for user-initiated job-merge completion — replace the primary in
  // caches with the refreshed version, remove every secondary from every
  // JTBD cache, and clear any editing flags so the canvas converges.
  useSocketEvent<'jtbd.jobs.merged.account'>(
    'jtbd.jobs.merged.account',
    useCallback(
      (data: IJTBDJobsMergedMessage) => {
        replaceJTBDJobInCaches(queryClient, data.job);
        for (const secondaryUuid of data.secondaryJobUuids) {
          removeJTBDJobFromCaches(queryClient, secondaryUuid);
        }
        if (data.configUuid) {
          removeEditingJobUuid(data.configUuid, data.primaryJobUuid);
          for (const secondaryUuid of data.secondaryJobUuids) {
            removeEditingJobUuid(data.configUuid, secondaryUuid);
          }
        }
        const primaryTitle = data.job?.jtbdTitle ?? 'the primary job';
        const count = data.secondaryJobUuids.length;
        toast.success(
          'Jobs Merged',
          `Merged ${count} job${count !== 1 ? 's' : ''} into ${primaryTitle}.`,
        );
      },
      [queryClient, removeEditingJobUuid],
    ),
  );

  // Listen for job-merge errors. Any error produces a red failure toast and
  // clears editing flags for all involved jobs.
  useSocketEvent<'jtbd.jobs.merge.error.account'>(
    'jtbd.jobs.merge.error.account',
    useCallback(
      (data: IJTBDJobsMergeErrorMessage) => {
        const activeConfigUuid =
          useStore.getState().jtbdActive.activeConfigUuid;
        if (activeConfigUuid) {
          removeEditingJobUuid(activeConfigUuid, data.primaryJobUuid);
          for (const secondaryUuid of data.secondaryJobUuids) {
            removeEditingJobUuid(activeConfigUuid, secondaryUuid);
          }
        }
        toast.error(
          'Merge Failed',
          data.message || 'Unable to merge these jobs. Please try again.',
        );
      },
      [removeEditingJobUuid],
    ),
  );
};

// ============================================
// Note Mutation Hooks (user-authored widgets)
// ============================================

/**
 * Targeted invalidation for caches that reference a job — used by note
 * mutations so the canvas / expanded card re-fetch picks up the new/edited
 * note widget without a blanket `jtbdKeys.all` invalidation.
 */
const invalidateJobCaches = (queryClient: QueryClient, jobUuid: string) => {
  queryClient.invalidateQueries({ queryKey: jtbdKeys.job(jobUuid) });
  queryClient.invalidateQueries({ queryKey: [...jtbdKeys.all, 'jobs'] });
  queryClient.invalidateQueries({
    queryKey: [...jtbdKeys.all, 'currentScan'],
  });
};

/**
 * Create a user-authored note on a JTBD job. On success we invalidate the
 * single-job cache plus the config-scoped job lists + current-scan so the new
 * `note`-type widget appears on the canvas immediately.
 */
export const useCreateJTBDNote = (jobUuid: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ICreateJTBDNotePayload) => {
      return await api.jtbd.createNote(jobUuid, data);
    },
    onSuccess: () => {
      invalidateJobCaches(queryClient, jobUuid);
      toast.success('Note Added', 'Your note was added to the opportunity.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Note Failed',
        message || 'Unable to add note. Please try again.',
      );
    },
  });

  return {
    createNote: mutation.mutate,
    createNoteAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
  };
};

/**
 * Update the body of an existing note item. Requires the parent `jobUuid`
 * (passed as a mutation variable) so we can invalidate the right caches.
 */
export const useUpdateJTBDNote = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: {
      itemUuid: string;
      jobUuid: string;
      data: IUpdateJTBDNotePayload;
    }) => {
      return await api.jtbd.updateNote(variables.itemUuid, variables.data);
    },
    onSuccess: (_data, variables) => {
      invalidateJobCaches(queryClient, variables.jobUuid);
      toast.success('Note Saved', 'Your note was updated.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to save note. Please try again.',
      );
    },
  });

  return {
    updateNote: mutation.mutate,
    updateNoteAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

/**
 * Update the body of a note item WITHOUT requiring the parent `jobUuid`. Used
 * by the Overseer `jtbd_note_update` suggestion flow, which carries only the
 * note UUID on the wire. Invalidates every cached job / jobs-list / current-scan
 * query so whichever one contains the note picks up the new body.
 */
export const useUpdateJTBDNoteByUuid = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: {
      noteUuid: string;
      data: IUpdateJTBDNotePayload;
    }) => {
      return await api.jtbd.updateNote(variables.noteUuid, variables.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...jtbdKeys.all, 'job'] });
      queryClient.invalidateQueries({ queryKey: [...jtbdKeys.all, 'jobs'] });
      queryClient.invalidateQueries({
        queryKey: [...jtbdKeys.all, 'currentScan'],
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to save note. Please try again.',
      );
    },
  });

  return {
    updateNote: mutation.mutate,
    updateNoteAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
  };
};

/**
 * Delete a note item WITHOUT requiring the parent `jobUuid`. Mirrors
 * `useUpdateJTBDNoteByUuid` for the Overseer `jtbd_note_delete` suggestion
 * flow. Falls back to broad invalidation across every JTBD cache that might
 * reference the note.
 */
export const useDeleteJTBDNoteByUuid = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: { noteUuid: string }) => {
      return await api.jtbd.deleteNote(variables.noteUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...jtbdKeys.all, 'job'] });
      queryClient.invalidateQueries({ queryKey: [...jtbdKeys.all, 'jobs'] });
      queryClient.invalidateQueries({
        queryKey: [...jtbdKeys.all, 'currentScan'],
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete note. Please try again.',
      );
    },
  });

  return {
    deleteNote: mutation.mutate,
    deleteNoteAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};

/**
 * Delete a note item (the backend removes the parent widget when the last
 * note on it is removed). Requires the parent `jobUuid` so cache invalidation
 * refreshes the right job.
 */
export const useDeleteJTBDNote = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: { itemUuid: string; jobUuid: string }) => {
      return await api.jtbd.deleteNote(variables.itemUuid);
    },
    onSuccess: (_data, variables) => {
      invalidateJobCaches(queryClient, variables.jobUuid);
      toast.success('Note Deleted', 'The note was removed.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Deletion Failed',
        message || 'Unable to delete note. Please try again.',
      );
    },
  });

  return {
    deleteNote: mutation.mutate,
    deleteNoteAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
  };
};
