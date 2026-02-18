/**
 * React Query hooks for Scoring Configuration
 *
 * Provides hooks for fetching and mutating scoring configuration data
 * used in portfolio prioritization.
 */

import { toast } from '@components';
import api from '@libs/api';
import {
  IScoringConfig,
  IScoringConfigCreate,
  IScoringConfigSave,
  IScoringConfigSummary,
  IBulkConceptUpdate,
} from '@libs/api/types';
import utils from '@libs/utils';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AucctusQueryKeys } from './query-keys';

/**
 * Hook to fetch categories and questions for a specific scoring config.
 * Requires a configUuid - returns empty data when no config is selected.
 */
export const useScoringConfig = (
  accountUuid: string | undefined,
  configUuid?: string | null,
) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.scoringConfig, accountUuid, configUuid],
    queryFn: async () => {
      if (!accountUuid || !configUuid) return null;
      return await api.account.getScoringConfigDetail(accountUuid, configUuid);
    },
    enabled: !!accountUuid && !!configUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    ...query,
    config: query.data as IScoringConfig | null,
    categories: query.data?.categories ?? [],
    totalQuestions: query.data?.totalQuestions ?? 0,
    currentVersion: query.data?.currentVersion ?? null,
  };
};

/**
 * Hook to save scoring configuration for a specific config.
 */
export const useSaveScoringConfig = (
  accountUuid: string | undefined,
  configUuid?: string | null,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IScoringConfigSave) => {
      if (!accountUuid) throw new Error('Account UUID is required');
      if (!configUuid) throw new Error('Config UUID is required');
      const response = await api.account.saveScoringConfigDetail(
        accountUuid,
        configUuid,
        data,
      );
      // Return both response and request data so onSuccess knows if rescoring was requested
      return {
        response,
        rescoreRequested: data.rescoreAll ?? false,
        affectedConceptUuids: response.affectedConceptUuids ?? [],
      };
    },
    onSuccess: ({ rescoreRequested, affectedConceptUuids }) => {
      // Invalidate queries for the specific config and the default
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.scoringConfig, accountUuid],
      });

      // Note: Task IDs are no longer returned from the API because tasks are dispatched
      // after the database transaction commits (to prevent race conditions).
      // We use the request's rescoreAll flag to determine the appropriate message.
      if (rescoreRequested) {
        // Invalidate concept bank and submission queries so the UI refreshes
        // with the new scoring_status (pending) that was set by the backend
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.concepts],
        });
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.conceptPriority],
        });
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.conceptPriorities],
        });
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.submissionLinkSubmissions],
        });

        const conceptCount = affectedConceptUuids.length;
        toast.success(
          conceptCount > 0
            ? `Scoring configuration saved. Re-scoring ${conceptCount} concept${conceptCount !== 1 ? 's' : ''} in background...`
            : 'Scoring configuration saved. Re-scoring in background...',
        );
      } else {
        toast.success('Scoring configuration saved successfully');
      }
    },
    onError: (error: unknown) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to save scoring configuration');
    },
  });
};

// ============================================================================
// Multi-config hooks
// ============================================================================

/**
 * Hook to list all scoring configs for an account
 */
export const useScoringConfigs = (accountUuid: string | undefined) => {
  const query = useQuery({
    queryKey: ['scoringConfigs', accountUuid],
    queryFn: async () => {
      if (!accountUuid) return [];
      return await api.account.listScoringConfigs(accountUuid);
    },
    enabled: !!accountUuid,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    configs: (query.data ?? []) as IScoringConfigSummary[],
  };
};

/**
 * Hook to create a new scoring config
 */
export const useCreateScoringConfig = (accountUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IScoringConfigCreate) => {
      if (!accountUuid) throw new Error('Account UUID is required');
      return await api.account.createScoringConfig(accountUuid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scoringConfigs', accountUuid],
      });
      toast.success('Scoring config created');
    },
    onError: (error: unknown) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to create scoring config');
    },
  });
};

/**
 * Hook to delete a scoring config
 */
export const useDeleteScoringConfig = (accountUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configUuid: string) => {
      if (!accountUuid) throw new Error('Account UUID is required');
      return await api.account.deleteScoringConfig(accountUuid, configUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scoringConfigs', accountUuid],
      });
      toast.success('Scoring config deleted');
    },
    onError: (error: unknown) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to delete scoring config');
    },
  });
};

/**
 * Hook to set a scoring config as the account default
 */
export const useSetDefaultScoringConfig = (accountUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configUuid: string) => {
      if (!accountUuid) throw new Error('Account UUID is required');
      return await api.account.setDefaultScoringConfig(accountUuid, configUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scoringConfigs', accountUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.scoringConfig, accountUuid],
      });
      toast.success('Default scoring config updated');
    },
    onError: (error: unknown) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to set default scoring config');
    },
  });
};

/**
 * Hook to rename a scoring config
 */
export const useRenameScoringConfig = (accountUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      configUuid,
      name,
    }: {
      configUuid: string;
      name: string;
    }) => {
      if (!accountUuid) throw new Error('Account UUID is required');
      return await api.account.updateScoringConfigName(
        accountUuid,
        configUuid,
        { name },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scoringConfigs', accountUuid],
      });
    },
    onError: (error: unknown) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to rename scoring config');
    },
  });
};

// ============================================================================
// Bulk concept update hook
// ============================================================================

/**
 * Hook to bulk update multiple concepts.
 *
 * Accepts an optional `onRescoreStarted` callback that is called with the
 * number of affected concepts when a rescore is queued. This lets the caller
 * (e.g. BankConcepts) wire up the bulk-priority calculating state without
 * this hook needing to know about useBulkPrioritySocketEvents directly.
 */
export const useBulkConceptUpdate = (options?: {
  onRescoreStarted?: (affectedConceptUuids: string[]) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IBulkConceptUpdate) => {
      return await api.concept.bulkUpdateConcepts(data);
    },
    onSuccess: (result) => {
      // Invalidate concepts and priorities
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.concepts],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.conceptPriority],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.conceptPriorities],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.conceptProperties],
      });

      // If rescoring was queued, mark affected concepts as calculating
      if (result.rescoreQueued && result.affectedConceptUuids?.length > 0) {
        // Mark each affected concept as calculating in the query cache
        result.affectedConceptUuids.forEach((uuid: string) => {
          queryClient.setQueryData([AucctusQueryKeys.conceptPriority, uuid], {
            isCalculating: true,
          });
        });

        // Notify caller so it can trigger the bulk progress UI
        options?.onRescoreStarted?.(result.affectedConceptUuids);

        toast.success(
          `Scoring ${result.affectedConceptUuids.length} concept${result.affectedConceptUuids.length !== 1 ? 's' : ''}...`,
        );
      } else {
        toast.success(result.message);
      }
    },
    onError: (error: unknown) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to update concepts');
    },
  });
};
