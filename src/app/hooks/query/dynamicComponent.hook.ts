/**
 * Dynamic Component React Query Hooks
 *
 * Provides data fetching and mutation hooks for component generation.
 * Includes WebSocket integration for real-time generation progress.
 *
 * Architecture:
 * - Frontend calls osiris `/api/v1/dynamic-components/generate`
 * - Osiris returns 202 Accepted immediately
 * - WebSocket updates notify when generation completes
 * - Frontend fetches the generated component
 */

import { toast } from '@components';
import api from '@libs/api';
import type {
  IDynamicComponent,
  IDynamicComponentProgressMessage,
  IGenerateComponentRequest,
} from '@libs/api/types/dynamicComponent.d';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useSocketEvent } from '../sockets/aucctus';

// ============================================
// Query Keys
// ============================================

export const dynamicComponentKeys = {
  all: ['dynamicComponent'] as const,
  concept: (conceptUuid: string) =>
    [...dynamicComponentKeys.all, 'concept', conceptUuid] as const,
  component: (componentUuid: string) =>
    [...dynamicComponentKeys.all, 'component', componentUuid] as const,
};

// ============================================
// Generation Progress State
// ============================================

export interface DynamicComponentProgress {
  isGenerating: boolean;
  componentUuid: string | null;
  stage:
    | 'pending'
    | 'prd_generating'
    | 'generating'
    | 'completed'
    | 'failed'
    | null;
  message: string;
}

const DEFAULT_PROGRESS: DynamicComponentProgress = {
  isGenerating: false,
  componentUuid: null,
  stage: null,
  message: '',
};

// ============================================
// Fetch Hooks
// ============================================

/**
 * Fetches all components for a concept.
 */
export const useConceptComponents = (conceptUuid: string) => {
  const query = useQuery({
    queryKey: dynamicComponentKeys.concept(conceptUuid),
    queryFn: async () => {
      const response =
        await api.dynamicComponent.getComponentsForConcept(conceptUuid);
      return response.components;
    },
    enabled: !!conceptUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (e: AxiosError) => {
      // 404 is expected if no components exist yet
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Failed to Load Components',
          message || 'Unable to fetch components. Please try again.',
        );
      }
    },
  });

  return {
    components: (query.data ?? []) as IDynamicComponent[],
    isLoading: query.isLoading,
    isError:
      query.isError && (query.error as AxiosError)?.response?.status !== 404,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Fetches a single component by UUID.
 */
export const useComponentByUuid = (componentUuid: string | null) => {
  const query = useQuery({
    queryKey: dynamicComponentKeys.component(componentUuid ?? ''),
    queryFn: async () => {
      if (!componentUuid) throw new Error('No component UUID');
      return await api.dynamicComponent.getComponent(componentUuid);
    },
    enabled: !!componentUuid,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Failed to Load Component',
        message || 'Unable to fetch component details.',
      );
    },
  });

  return {
    component: (query.data ?? null) as IDynamicComponent | null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ============================================
// Generation Mutation
// ============================================

/**
 * Generates a new component for a concept.
 * Returns immediately with 202 - use WebSocket for progress.
 */
export const useGenerateComponent = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: IGenerateComponentRequest) => {
      return await api.dynamicComponent.generate(request);
    },
    onSuccess: (data, variables) => {
      // Invalidate the concept's component list
      queryClient.invalidateQueries({
        queryKey: dynamicComponentKeys.concept(variables.conceptUuid),
      });
      toast.info(
        'Generation Started',
        'Component generation has been queued. Please wait...',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Generation Failed',
        message || 'Unable to start component generation. Please try again.',
      );
    },
  });

  return {
    generate: mutation.mutate,
    generateAsync: mutation.mutateAsync,
    isGenerating: mutation.isLoading,
    generatedComponentUuid: mutation.data?.componentUuid ?? null,
  };
};

// ============================================
// WebSocket Events Hook
// ============================================

/**
 * Hook to listen for Dynamic Component generation WebSocket events.
 * Updates the query cache when generation completes and provides real-time progress.
 *
 * Note: This uses a generic type cast since the socket event type may not be
 * registered yet. The event 'dynamic_component.progress.account' is sent from
 * osiris when generation status changes.
 *
 * @param conceptUuid - The concept UUID to filter events for
 */
export const useDynamicComponentSocketEvents = (conceptUuid: string) => {
  const queryClient = useQueryClient();
  const [progress, setProgress] =
    useState<DynamicComponentProgress>(DEFAULT_PROGRESS);

  // Listen for progress events
  // Cast to 'any' since the socket event type might not be in the registry yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useSocketEvent<any>(
    'dynamic_component.progress.account' as any,
    useCallback(
      (data: unknown) => {
        const message = data as IDynamicComponentProgressMessage;
        // Only handle events for this concept
        if (message.conceptUuid !== conceptUuid) return;

        if (message.stage === 'completed') {
          // Generation completed - reset progress and refetch
          setProgress(DEFAULT_PROGRESS);

          // Invalidate queries to get fresh data
          queryClient.invalidateQueries({
            queryKey: dynamicComponentKeys.concept(conceptUuid),
          });
          queryClient.invalidateQueries({
            queryKey: dynamicComponentKeys.component(message.componentUuid),
          });

          toast.success(
            'Component Generated',
            `${message.componentName || 'Component'} created successfully!`,
          );
        } else if (message.stage === 'failed') {
          // Generation failed
          setProgress({
            isGenerating: false,
            componentUuid: message.componentUuid,
            stage: 'failed',
            message: message.errorMessage || 'Generation failed',
          });

          // Invalidate to update status
          queryClient.invalidateQueries({
            queryKey: dynamicComponentKeys.concept(conceptUuid),
          });

          toast.error(
            'Generation Failed',
            message.errorMessage || 'Component generation failed.',
          );
        } else {
          // In progress (pending or generating)
          setProgress({
            isGenerating: true,
            componentUuid: message.componentUuid,
            stage: message.stage,
            message: message.message,
          });
        }
      },
      [conceptUuid, queryClient],
    ),
  );

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return {
    progress,
    isGenerating: progress.isGenerating,
    currentStage: progress.stage,
    currentMessage: progress.message,
    resetProgress,
  };
};

// ============================================
// Combined Hook for Workshop Page
// ============================================

/**
 * Combined hook for the Workshop page.
 * Provides all necessary data and actions for component generation.
 */
export const useWorkshop = (conceptUuid: string) => {
  const components = useConceptComponents(conceptUuid);
  const generation = useGenerateComponent();
  const socketEvents = useDynamicComponentSocketEvents(conceptUuid);

  return {
    // Components list
    components: components.components,
    isLoadingComponents: components.isLoading,

    // Generation
    generate: generation.generate,
    generateAsync: generation.generateAsync,
    isStartingGeneration: generation.isGenerating,

    // Real-time progress from WebSocket
    isGenerating: socketEvents.isGenerating,
    generationStage: socketEvents.currentStage,
    generationMessage: socketEvents.currentMessage,
    generationProgress: socketEvents.progress,

    // Actions
    refetchComponents: components.refetch,
    resetProgress: socketEvents.resetProgress,
  };
};
