import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AucctusQueryKeys } from './query-keys';
import type {
  IPocPlan,
  IPocPlanGenerationProgress,
  IPocPlanGenerationRequest,
  IPocModalContentResponse,
} from '@libs/api/types';

/**
 * Custom hook for fetching a POC Plan for a concept.
 */
export const usePocPlan = (conceptUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.pocPlan, conceptUuid],
    queryFn: async () =>
      conceptUuid ? await api.pocPlan.getPocPlan(conceptUuid) : null,
    enabled: !!conceptUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no plan found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'POC Plan Fetch Failed',
          message || 'Unable to fetch POC Plan. Please try again',
        );
      }
    },
  });

  return {
    ...query,
    pocPlan: query.data,
    hasPocPlan: !!query.data,
  };
};

/**
 * Custom hook for fetching POC Plan generation status.
 * Can optionally use polling when generation is in progress (fallback if WebSocket unavailable).
 * When using WebSocket for progress, set enablePolling: false.
 */
export const usePocPlanStatus = (
  conceptUuid?: string,
  options?: { enabled?: boolean; enablePolling?: boolean },
) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.pocPlanStatus, conceptUuid],
    queryFn: async (): Promise<IPocPlanGenerationProgress | null> =>
      conceptUuid ? await api.pocPlan.getPocPlanStatus(conceptUuid) : null,
    enabled: !!conceptUuid && (options?.enabled ?? true),
    refetchInterval: (data) => {
      // Only poll if enablePolling is true (default false to prefer WebSocket)
      if ((options?.enablePolling ?? false) && data?.status === 'generating') {
        return 1000;
      }
      return false;
    },
    staleTime: 0, // Always fetch fresh during generation
  });

  return {
    ...query,
    status: query.data?.status,
    stage: query.data?.stage,
    progress: query.data?.progress ?? 0,
    message: query.data?.message ?? '',
    isGenerating: query.data?.status === 'generating',
    isComplete: query.data?.status === 'complete',
    hasError: query.data?.status === 'failed',
  };
};

/**
 * Custom hook for generating a POC Plan.
 */
export const useGeneratePocPlan = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: IPocPlanGenerationRequest) =>
      await api.pocPlan.generatePocPlan(request),
    onSuccess: (_data, variables) => {
      toast.success(
        'POC Plan Generation Started',
        'Your proof of concept plan is being generated...',
      );

      // Start polling for status
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.pocPlanStatus, variables.conceptUuid],
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Generation Failed',
        message || 'Unable to start POC Plan generation. Please try again',
      );
    },
  });

  return {
    generatePocPlan: mutation.mutate,
    generatePocPlanAsync: mutation.mutateAsync,
    isGenerating: mutation.isLoading,
    generateError: mutation.error,
  };
};

/**
 * Custom hook for updating a POC Plan.
 */
export const useUpdatePocPlan = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      conceptUuid,
      updates,
    }: {
      conceptUuid: string;
      updates: Partial<IPocPlan>;
    }) => await api.pocPlan.updatePocPlan(conceptUuid, updates),
    onSuccess: (_data, variables) => {
      // Invalidate POC Plan query
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.pocPlan, variables.conceptUuid],
      });

      toast.success('POC Plan Updated', 'Your changes have been saved');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update POC Plan. Please try again',
      );
    },
  });

  return {
    updatePocPlan: mutation.mutate,
    updatePocPlanAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
    updateError: mutation.error,
  };
};

/**
 * Hook to check if POC generation is complete and invalidate relevant queries.
 * Used after generation completes to refresh the POC Plan data.
 */
export const useOnPocPlanReady = (conceptUuid?: string) => {
  const queryClient = useQueryClient();

  const refreshPocPlan = () => {
    if (conceptUuid) {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.pocPlan, conceptUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.concept, conceptUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.concepts],
      });
    }
  };

  return { refreshPocPlan };
};

/**
 * Custom hook for fetching contextualized POC modal content.
 * Uses Gemini Flash Lite to generate personalized descriptions for each POC planning section.
 */
export const usePocModalContent = (conceptUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.pocModalContent, conceptUuid],
    queryFn: async (): Promise<IPocModalContentResponse | null> =>
      conceptUuid ? await api.pocPlan.getModalContent(conceptUuid) : null,
    enabled: !!conceptUuid,
    staleTime: 1000 * 60 * 30, // 30 minutes - modal content doesn't change often
    cacheTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    ...query,
    modalContent: query.data?.items ?? [],
    isLoadingContent: query.isLoading,
  };
};
