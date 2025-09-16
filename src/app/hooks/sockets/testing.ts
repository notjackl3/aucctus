import { useState, useCallback } from 'react';
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
  status: 'idle' | 'running' | 'completed' | 'error' | 'cancelled';
  progress: number;
  message: string;
  currentPersona?: string;
  totalPersonas?: number;
  resultsCount?: number;
  error?: string;
  executionId?: string;
}

export const useSyntheticExecutionEvents = (
  conceptUuid: string,
  testUuid: string,
  onComplete?: (resultsCount: number) => void,
) => {
  const queryClient = useQueryClient();
  const [executionState, setExecutionState] =
    useState<ISyntheticExecutionState>({
      status: 'idle',
      progress: 0,
      message: '',
    });

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
          setExecutionState((prev) => ({
            ...prev,
            status: 'running',
            progress: data.progress,
            message: data.message,
            currentPersona: data.currentPersona,
            totalPersonas: data.totalPersonas,
          }));
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
      [conceptUuid, testUuid],
    ),
  );

  // Completion
  useSocketEvent<
    'synthetic.execution.completed.user',
    ISyntheticExecutionCompletedMessage
  >(
    'synthetic.execution.completed.user',
    useCallback(
      (data: ISyntheticExecutionCompletedMessage) => {
        if (data.conceptUuid === conceptUuid && data.testUuid === testUuid) {
          setExecutionState((prev) => ({
            ...prev,
            status: 'completed',
            progress: 100,
            message: data.message,
            resultsCount: data.resultsCount,
          }));

          // Invalidate test results queries to show new synthetic results immediately
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.testResults, conceptUuid, testUuid],
          });

          toast.success(`Generated ${data.resultsCount} synthetic interviews`);
          onComplete?.(data.resultsCount);
        }
      },
      [conceptUuid, testUuid, onComplete, queryClient],
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
          setExecutionState((prev) => ({
            ...prev,
            status: 'error',
            message: data.errorMessage,
            error: data.errorMessage,
          }));

          toast.error(`Execution failed: ${data.errorMessage}`);
        }
      },
      [conceptUuid, testUuid],
    ),
  );

  const resetExecution = useCallback(() => {
    setExecutionState({
      status: 'idle',
      progress: 0,
      message: '',
    });
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
    setExecutionId,
  };
};
