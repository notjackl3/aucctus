import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useSocketEvent } from './aucctus';
import { toast } from '@components';
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
      console.warn('Failed to persist execution state:', error);
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
    console.warn('Failed to parse persisted execution state:', error);
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
    console.warn('Failed to clear persisted execution state:', error);
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
        console.log('🔵 FRONTEND: Received synthetic progress message:', data);
        if (data.conceptUuid === conceptUuid && data.testUuid === testUuid) {
          console.log(
            '🔵 FRONTEND: Message matches current concept/test, updating state',
          );

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
              console.log(
                '🎉 FRONTEND: Pipeline fully complete (100%), showing results and invalidating queries',
              );

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
          console.log(
            '🔵 FRONTEND: Message does not match current concept/test',
            {
              received: { concept: data.conceptUuid, test: data.testUuid },
              expected: { concept: conceptUuid, test: testUuid },
              conceptMatch: data.conceptUuid === conceptUuid,
              testMatch: data.testUuid === testUuid,
            },
          );
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
        console.log(
          '🟢 FRONTEND: Received synthetic execution phase completion:',
          data,
        );
        if (data.conceptUuid === conceptUuid && data.testUuid === testUuid) {
          console.log(
            '🟢 FRONTEND: Synthetic execution phase completed, but analysis pipeline is still running...',
          );
          // Don't set status to 'completed' or invalidate queries yet
          // Just update the message and results count
          setExecutionState((prev) => ({
            ...prev,
            message: data.message,
            resultsCount: data.resultsCount,
          }));

          // Show a brief intermediate toast, but don't mark as complete
          console.log(
            `🟢 FRONTEND: Generated ${data.resultsCount} synthetic interviews. Analysis pipeline is running...`,
          );
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
