import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useSocketEvent } from './aucctus';
import { toast } from '@components';
import telemetry from '@libs/telemetry';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  ISyntheticExecutionProgressMessage,
  ISyntheticExecutionCompletedMessage,
  ISyntheticExecutionErrorMessage,
} from '@libs/api/types';

interface ISyntheticExecutionState {
  status:
    | 'idle'
    | 'running'
    | 'cancelling'
    | 'completed'
    | 'error'
    | 'cancelled';
  progress: number;
  message: string;
  currentStage?: string;
  currentPersona?: string;
  totalPersonas?: number;
  resultsCount?: number;
  error?: string;
  executionId?: string;
}

// State persistence utilities
const EXECUTION_STATE_KEY = (conceptUuid: string, testUuid: string) =>
  `synthetic_execution_state_${conceptUuid}_${testUuid}`;

const persistExecutionState = (
  conceptUuid: string,
  testUuid: string,
  state: ISyntheticExecutionState,
) => {
  if (state.status !== 'idle') {
    try {
      sessionStorage.setItem(
        EXECUTION_STATE_KEY(conceptUuid, testUuid),
        JSON.stringify(state),
      );
    } catch (error) {
      // Handle storage errors gracefully
      telemetry.warn('synthetic.execution.persistence.failed', {
        conceptUuid,
        testUuid,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
};

const getPersistedExecutionState = (
  conceptUuid: string,
  testUuid: string,
): ISyntheticExecutionState | null => {
  try {
    const stored = sessionStorage.getItem(
      EXECUTION_STATE_KEY(conceptUuid, testUuid),
    );
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the parsed state has required properties
      if (
        parsed &&
        typeof parsed.status === 'string' &&
        typeof parsed.progress === 'number'
      ) {
        return parsed;
      }
    }
  } catch (error) {
    // Handle parsing errors gracefully
    telemetry.warn('synthetic.execution.persistence.parse_failed', {
      conceptUuid,
      testUuid,
      error: error instanceof Error ? error.message : error,
    });
  }
  return null;
};

const clearPersistedExecutionState = (
  conceptUuid: string,
  testUuid: string,
) => {
  try {
    sessionStorage.removeItem(EXECUTION_STATE_KEY(conceptUuid, testUuid));
  } catch (error) {
    telemetry.warn('synthetic.execution.persistence.clear_failed', {
      conceptUuid,
      testUuid,
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const useSyntheticExecutionEvents = (
  conceptUuid: string,
  testUuid: string,
  onComplete?: (resultsCount: number) => void,
) => {
  const queryClient = useQueryClient();

  // Initialize state from persisted data or default
  const [executionState, setExecutionState] =
    useState<ISyntheticExecutionState>(() => {
      const persisted = getPersistedExecutionState(conceptUuid, testUuid);
      return (
        persisted || {
          status: 'idle',
          progress: 0,
          message: '',
        }
      );
    });

  // Persist state changes to sessionStorage
  useEffect(() => {
    persistExecutionState(conceptUuid, testUuid, executionState);
  }, [conceptUuid, testUuid, executionState]);

  // Cleanup persisted state on unmount if execution is not active
  useEffect(() => {
    return () => {
      if (
        executionState.status === 'idle' ||
        executionState.status === 'completed'
      ) {
        clearPersistedExecutionState(conceptUuid, testUuid);
      }
    };
  }, [conceptUuid, testUuid, executionState.status]);

  // Progress updates
  useSocketEvent<
    'synthetic.execution.progress.user',
    ISyntheticExecutionProgressMessage
  >(
    'synthetic.execution.progress.user',
    useCallback(
      (data: ISyntheticExecutionProgressMessage) => {
        telemetry.debug('synthetic.execution.progress.received', {
          conceptUuid: data.conceptUuid,
          testUuid: data.testUuid,
          progress: data.progress,
          stage: data.stage,
          currentPersona: data.currentPersona,
        });
        if (data.conceptUuid === conceptUuid && data.testUuid === testUuid) {
          // Check if this is the final completion (100% progress)
          const isComplete = data.progress >= 100;

          setExecutionState((prev) => {
            const newState: ISyntheticExecutionState = {
              ...prev,
              status: isComplete ? 'completed' : 'running',
              progress: data.progress,
              message: data.message,
              currentStage: data.stage,
              currentPersona: data.currentPersona,
              totalPersonas: data.totalPersonas,
            };

            // Only invalidate queries and show completion toast when reaching 100%
            if (isComplete) {
              // Clear persisted state on completion
              clearPersistedExecutionState(conceptUuid, testUuid);

              // Invalidate test results queries to show new synthetic results
              queryClient.invalidateQueries({
                queryKey: [AucctusQueryKeys.testResults, conceptUuid, testUuid],
              });

              // Show final success toast
              toast.success(
                'Synthetic testing complete! All results are now available.',
              );

              // Call completion callback with results count
              onComplete?.(prev.resultsCount || 0);
            }

            return newState;
          });
        } else {
          telemetry.debug('synthetic.execution.progress.mismatch', {
            receivedConceptUuid: data.conceptUuid,
            receivedTestUuid: data.testUuid,
            expectedConceptUuid: conceptUuid,
            expectedTestUuid: testUuid,
            conceptMatch: data.conceptUuid === conceptUuid,
            testMatch: data.testUuid === testUuid,
          });
        }
      },
      [conceptUuid, testUuid, queryClient, onComplete],
    ),
  );

  // Completion (now only for synthetic execution phase, not final completion)
  useSocketEvent<
    'synthetic.execution.completed.user',
    ISyntheticExecutionCompletedMessage
  >(
    'synthetic.execution.completed.user',
    useCallback(
      (data: ISyntheticExecutionCompletedMessage) => {
        telemetry.debug('synthetic.execution.phase.completed', {
          conceptUuid: data.conceptUuid,
          testUuid: data.testUuid,
          resultsCount: data.resultsCount,
          message: data.message,
        });
        if (data.conceptUuid === conceptUuid && data.testUuid === testUuid) {
          telemetry.debug('synthetic.execution.phase.analysis_pending', {
            conceptUuid,
            testUuid,
            resultsCount: data.resultsCount,
          });
          // Don't set status to 'completed' or invalidate queries yet
          // Just update the message and results count
          setExecutionState((prev) => ({
            ...prev,
            message: data.message,
            resultsCount: data.resultsCount,
          }));

          // Show a brief intermediate toast, but don't mark as complete
          telemetry.debug('synthetic.execution.interviews.generated', {
            conceptUuid,
            testUuid,
            resultsCount: data.resultsCount,
            message: `Generated ${data.resultsCount} synthetic interviews`,
          });
        }
      },
      [conceptUuid, testUuid],
    ),
  );

  // Error handling
  useSocketEvent<
    'synthetic.execution.error.user',
    ISyntheticExecutionErrorMessage
  >(
    'synthetic.execution.error.user',
    useCallback(
      (data: ISyntheticExecutionErrorMessage) => {
        if (data.conceptUuid === conceptUuid && data.testUuid === testUuid) {
          // Check if this is a cancellation error
          const isCancellation = data.errorMessage
            ?.toLowerCase()
            .includes('cancel');

          if (isCancellation) {
            // Clear persisted state on cancellation
            clearPersistedExecutionState(conceptUuid, testUuid);

            // For cancellation, revert to idle state and show success toast
            setExecutionState({
              status: 'idle',
              progress: 0,
              message: '',
            });
            toast.success('Execution cancelled');
          } else {
            // For actual errors, show error state
            setExecutionState((prev) => ({
              ...prev,
              status: 'error',
              message: data.errorMessage,
              error: data.errorMessage,
            }));
            toast.error(`Execution failed: ${data.errorMessage}`);
          }
        }
      },
      [conceptUuid, testUuid],
    ),
  );

  const resetExecution = useCallback(() => {
    // Clear persisted state when resetting
    clearPersistedExecutionState(conceptUuid, testUuid);

    setExecutionState({
      status: 'idle',
      progress: 0,
      message: '',
    });
  }, [conceptUuid, testUuid]);

  const setCancellingState = useCallback(() => {
    setExecutionState((prev) => ({
      ...prev,
      status: 'cancelling',
      message: 'Cancelling...',
    }));
  }, []);

  const setExecutionId = useCallback((executionId: string) => {
    setExecutionState((prev) => ({
      ...prev,
      executionId,
    }));
  }, []);

  return {
    executionState,
    setExecutionState,
    resetExecution,
    setCancellingState,
    setExecutionId,
  };
};
