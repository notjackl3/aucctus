/**
 * React Query hooks for Scoring Configuration
 *
 * Provides hooks for fetching and mutating scoring configuration data
 * used in portfolio prioritization.
 */

import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from '@components';
import api from '@libs/api';
import {
  IScoringCategoryCreate,
  IScoringConfig,
  IScoringConfigSave,
  IScoringConfigSaveResponse,
} from '@libs/api/types';
import utils from '@libs/utils';
import { AucctusQueryKeys } from './query-keys';
import { DEFAULT_SCORING_CATEGORIES } from '@components/Nucleus/ConceptScoringConfig/fixtures';

/**
 * Hook to fetch scoring configuration for an account
 */
export const useScoringConfig = (accountUuid: string | undefined) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.scoringConfig, accountUuid],
    queryFn: async () => {
      if (!accountUuid) return null;
      return await api.account.getScoringConfig(accountUuid);
    },
    enabled: !!accountUuid,
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
 * Hook to save scoring configuration
 */
export const useSaveScoringConfig = (accountUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IScoringConfigSave) => {
      if (!accountUuid) throw new Error('Account UUID is required');
      return await api.account.saveScoringConfig(accountUuid, data);
    },
    onSuccess: (response: IScoringConfigSaveResponse) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.scoringConfig, accountUuid],
      });

      if (response.rescoreTaskId) {
        toast.success(
          'Scoring configuration saved. Re-scoring concepts in background...',
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

/**
 * Hook to create a new scoring category
 */
export const useCreateScoringCategory = (accountUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IScoringCategoryCreate) => {
      if (!accountUuid) throw new Error('Account UUID is required');
      return await api.account.createScoringCategory(accountUuid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.scoringConfig, accountUuid],
      });
      toast.success('Category created successfully');
    },
    onError: (error: unknown) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to create category');
    },
  });
};

/**
 * Hook to delete a scoring category
 */
export const useDeleteScoringCategory = (accountUuid: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryUuid: string) => {
      if (!accountUuid) throw new Error('Account UUID is required');
      return await api.account.deleteScoringCategory(accountUuid, categoryUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.scoringConfig, accountUuid],
      });
      toast.success('Category deleted');
    },
    onError: (error: unknown) => {
      const message = utils.osiris.parseFormError(error);
      toast.error(message || 'Failed to delete category');
    },
  });
};

/**
 * Hook to auto-initialize scoring config with defaults if none exists.
 * Call this on pages that need scoring config (like Portfolio).
 * Silently saves default categories without showing toasts.
 */
export const useAutoInitScoringConfig = (accountUuid: string | undefined) => {
  const hasTriggeredInit = useRef(false);
  const queryClient = useQueryClient();

  const { categories, isLoading } = useScoringConfig(accountUuid);

  const initMutation = useMutation({
    mutationFn: async (data: IScoringConfigSave) => {
      if (!accountUuid) throw new Error('Account UUID is required');
      return await api.account.saveScoringConfig(accountUuid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.scoringConfig, accountUuid],
      });
      // Silent success - no toast for auto-init
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.warn('Failed to auto-initialize scoring config:', error);
      // Silent failure - no toast for auto-init
    },
  });

  useEffect(() => {
    // Only run once, when not loading, no categories exist, and we have an account
    if (
      !isLoading &&
      accountUuid &&
      categories.length === 0 &&
      !hasTriggeredInit.current &&
      !initMutation.isLoading
    ) {
      hasTriggeredInit.current = true;

      // Build save payload from default categories
      const saveData: IScoringConfigSave = {
        categories: DEFAULT_SCORING_CATEGORIES.map((cat, catIndex) => ({
          name: cat.name,
          icon: cat.icon,
          order: catIndex,
          questions: cat.questions.map((q, qIndex) => ({
            text: q.text,
            importance: q.importance,
            order: qIndex,
          })),
        })),
        deletedCategoryUuids: [],
        deletedQuestionUuids: [],
        rescoreAll: false,
      };

      initMutation.mutate(saveData);
    }
  }, [isLoading, accountUuid, categories.length, initMutation]);

  return {
    isInitializing: initMutation.isLoading,
    isInitialized: categories.length > 0,
  };
};
