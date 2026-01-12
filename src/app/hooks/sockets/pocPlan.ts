import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useSocketEvent } from './aucctus';
import { toast } from '@components';
import telemetry from '@libs/telemetry';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  IPocPlanGenerationProgressMessage,
  IPocPlanGenerationCompleteMessage,
  IPocPlanGenerationErrorMessage,
} from '@libs/api/types';

export type PocPlanGenerationStatus =
  | 'idle'
  | 'in_progress'
  | 'completed'
  | 'error';

export interface IPocPlanGenerationState {
  status: PocPlanGenerationStatus;
  progress: number;
  message?: string;
  stage?: string;
  pocPlanUuid?: string;
  error?: string;
  startTime?: number;
}

const POC_PLAN_GENERATION_STATE_KEY = (conceptUuid: string) =>
  `poc_plan_generation_state_${conceptUuid}`;

const DEFAULT_GENERATION_STATE: IPocPlanGenerationState = {
  status: 'idle',
  progress: 0,
  message: '',
};

const persistGenerationState = (
  conceptUuid: string,
  state: IPocPlanGenerationState,
) => {
  if (state.status !== 'in_progress') {
    clearPersistedGenerationState(conceptUuid);
    return;
  }

  try {
    sessionStorage.setItem(
      POC_PLAN_GENERATION_STATE_KEY(conceptUuid),
      JSON.stringify(state),
    );
  } catch (error) {
    telemetry.warn('poc_plan.generation.persistence.failed', {
      conceptUuid,
      error: error instanceof Error ? error.message : error,
    });
  }
};

const getPersistedGenerationState = (
  conceptUuid: string,
): IPocPlanGenerationState | null => {
  try {
    const stored = sessionStorage.getItem(
      POC_PLAN_GENERATION_STATE_KEY(conceptUuid),
    );
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (
      parsed &&
      typeof parsed.status === 'string' &&
      typeof parsed.progress === 'number'
    ) {
      return parsed as IPocPlanGenerationState;
    }
  } catch (error) {
    telemetry.warn('poc_plan.generation.persistence.parse_failed', {
      conceptUuid,
      error: error instanceof Error ? error.message : error,
    });
  }

  return null;
};

const clearPersistedGenerationState = (conceptUuid: string) => {
  try {
    sessionStorage.removeItem(POC_PLAN_GENERATION_STATE_KEY(conceptUuid));
  } catch (error) {
    telemetry.warn('poc_plan.generation.persistence.clear_failed', {
      conceptUuid,
      error: error instanceof Error ? error.message : error,
    });
  }
};

/**
 * Hook to listen for POC Plan generation WebSocket events.
 * Manages generation state during async Celery task execution.
 * Persists state in sessionStorage to survive page refreshes.
 */
export const usePocPlanGenerationEvents = (conceptUuid: string) => {
  const queryClient = useQueryClient();

  const [generationState, setGenerationState] =
    useState<IPocPlanGenerationState>(
      () =>
        getPersistedGenerationState(conceptUuid) ?? DEFAULT_GENERATION_STATE,
    );

  useEffect(() => {
    persistGenerationState(conceptUuid, generationState);
  }, [conceptUuid, generationState]);

  // Progress event
  useSocketEvent<
    'poc_plan.generation.progress.account',
    IPocPlanGenerationProgressMessage
  >(
    'poc_plan.generation.progress.account',
    useCallback(
      (data: IPocPlanGenerationProgressMessage) => {
        if (data.concept_uuid !== conceptUuid) return;

        telemetry.debug('poc_plan.generation.progress', {
          conceptUuid: data.concept_uuid,
          pocPlanUuid: data.poc_plan_uuid,
          progress: data.progress,
          stage: data.stage,
        });

        setGenerationState((prev) => ({
          status: 'in_progress',
          progress: data.progress,
          message: data.message,
          stage: data.stage,
          pocPlanUuid: data.poc_plan_uuid,
          startTime: prev.startTime ?? Date.now(),
        }));
      },
      [conceptUuid],
    ),
  );

  // Completion event with cache invalidation
  useSocketEvent<
    'poc_plan.generation.complete.account',
    IPocPlanGenerationCompleteMessage
  >(
    'poc_plan.generation.complete.account',
    useCallback(
      (data: IPocPlanGenerationCompleteMessage) => {
        if (data.concept_uuid !== conceptUuid) return;

        telemetry.debug('poc_plan.generation.completed', {
          conceptUuid: data.concept_uuid,
          pocPlanUuid: data.poc_plan_uuid,
        });

        setGenerationState((prev) => ({
          status: 'completed',
          progress: 100,
          message: data.message,
          stage: 'complete',
          pocPlanUuid: data.poc_plan_uuid,
          startTime: prev.startTime,
        }));

        // Invalidate POC Plan queries to refresh data
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.pocPlan, conceptUuid],
        });
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.pocPlanStatus, conceptUuid],
        });

        toast.success(
          'POC Plan Generated',
          'Your proof of concept plan is ready',
        );
      },
      [conceptUuid, queryClient],
    ),
  );

  // Error event
  useSocketEvent<
    'poc_plan.generation.error.account',
    IPocPlanGenerationErrorMessage
  >(
    'poc_plan.generation.error.account',
    useCallback(
      (data: IPocPlanGenerationErrorMessage) => {
        if (data.concept_uuid !== conceptUuid) return;

        telemetry.warn('poc_plan.generation.error', {
          conceptUuid: data.concept_uuid,
          pocPlanUuid: data.poc_plan_uuid,
          error: data.error_message,
          errorCode: data.error_code,
        });

        setGenerationState({
          status: 'error',
          progress: 0,
          message: data.error_message,
          stage: 'error',
          pocPlanUuid: data.poc_plan_uuid,
          error: data.error_message,
        });

        toast.error(
          'POC Plan Generation Failed',
          data.error_message ||
            'An error occurred while generating the POC plan',
        );
      },
      [conceptUuid],
    ),
  );

  useEffect(() => {
    return () => {
      if (generationState.status !== 'in_progress') {
        clearPersistedGenerationState(conceptUuid);
      }
    };
  }, [conceptUuid, generationState.status]);

  const resetGenerationState = useCallback(() => {
    clearPersistedGenerationState(conceptUuid);
    setGenerationState(DEFAULT_GENERATION_STATE);
  }, [conceptUuid]);

  return {
    generationState,
    resetGenerationState,
  };
};
