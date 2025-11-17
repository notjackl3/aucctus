import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { useSocketEvent } from './aucctus';
import { toast } from '@components';
import telemetry from '@libs/telemetry';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  ITestGenerationStartedMessage,
  ITestGenerationProgressMessage,
  ITestGenerationCompletedMessage,
  ITestGenerationErrorMessage,
  ISyntheticExecutionProgressMessage,
  ISyntheticExecutionCompletedMessage,
  ISyntheticExecutionErrorMessage,
  ISyntheticInterviewQuoteMessage,
  ISyntheticProfileCompletedMessage,
  ITestCollateralProgressMessage,
  ITestCollateralCompletedMessage,
  ITestCollateralErrorMessage,
} from '@libs/api/types';
import { ICustomerProfile } from '@libs/api/types/concept/concepts';

export type TestGenerationStatus =
  | 'idle'
  | 'in_progress'
  | 'completed'
  | 'error';

export interface ITestGenerationState {
  status: TestGenerationStatus;
  progress: number;
  message?: string;
  stage?: string;
  testUuid?: string;
  error?: string;
  startTime?: number;
}

const TEST_GENERATION_STATE_KEY = (conceptUuid: string) =>
  `test_generation_state_${conceptUuid}`;

const DEFAULT_GENERATION_STATE: ITestGenerationState = {
  status: 'idle',
  progress: 0,
  message: '',
};

const persistGenerationState = (
  conceptUuid: string,
  state: ITestGenerationState,
) => {
  if (state.status !== 'in_progress') {
    clearPersistedGenerationState(conceptUuid);
    return;
  }

  try {
    sessionStorage.setItem(
      TEST_GENERATION_STATE_KEY(conceptUuid),
      JSON.stringify(state),
    );
  } catch (error) {
    telemetry.warn('test.generation.persistence.failed', {
      conceptUuid,
      error: error instanceof Error ? error.message : error,
    });
  }
};

const getPersistedGenerationState = (
  conceptUuid: string,
): ITestGenerationState | null => {
  try {
    const stored = sessionStorage.getItem(
      TEST_GENERATION_STATE_KEY(conceptUuid),
    );
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (
      parsed &&
      typeof parsed.status === 'string' &&
      typeof parsed.progress === 'number'
    ) {
      return parsed as ITestGenerationState;
    }
  } catch (error) {
    telemetry.warn('test.generation.persistence.parse_failed', {
      conceptUuid,
      error: error instanceof Error ? error.message : error,
    });
  }

  return null;
};

const clearPersistedGenerationState = (conceptUuid: string) => {
  try {
    sessionStorage.removeItem(TEST_GENERATION_STATE_KEY(conceptUuid));
  } catch (error) {
    telemetry.warn('test.generation.persistence.clear_failed', {
      conceptUuid,
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const useTestGenerationEvents = (conceptUuid: string) => {
  const queryClient = useQueryClient();

  const [generationState, setGenerationState] = useState<ITestGenerationState>(
    () => getPersistedGenerationState(conceptUuid) ?? DEFAULT_GENERATION_STATE,
  );

  useEffect(() => {
    persistGenerationState(conceptUuid, generationState);
  }, [conceptUuid, generationState]);

  useSocketEvent<'test.generation.started.user', ITestGenerationStartedMessage>(
    'test.generation.started.user',
    useCallback(
      (data: ITestGenerationStartedMessage) => {
        if (data.conceptUuid !== conceptUuid) return;

        telemetry.debug('test.generation.started', {
          conceptUuid: data.conceptUuid,
          testUuid: data.testUuid,
        });

        setGenerationState({
          status: 'in_progress',
          progress: 0,
          message: data.message,
          stage: 'initializing',
          testUuid: data.testUuid,
          startTime: Date.now(),
        });
      },
      [conceptUuid],
    ),
  );

  useSocketEvent<
    'test.generation.progress.user',
    ITestGenerationProgressMessage
  >(
    'test.generation.progress.user',
    useCallback(
      (data: ITestGenerationProgressMessage) => {
        if (data.conceptUuid !== conceptUuid) return;

        telemetry.debug('test.generation.progress', {
          conceptUuid: data.conceptUuid,
          testUuid: data.testUuid,
          progress: data.progress,
          stage: data.stage,
        });

        setGenerationState((prev) => ({
          status: 'in_progress',
          progress: data.progress,
          message: data.message,
          stage: data.stage,
          testUuid: data.testUuid ?? prev.testUuid,
          startTime: prev.startTime ?? Date.now(),
        }));
      },
      [conceptUuid],
    ),
  );

  useSocketEvent<
    'test.generation.completed.user',
    ITestGenerationCompletedMessage
  >(
    'test.generation.completed.user',
    useCallback(
      (data: ITestGenerationCompletedMessage) => {
        if (data.conceptUuid !== conceptUuid) return;

        telemetry.debug('test.generation.completed', {
          conceptUuid: data.conceptUuid,
          testUuid: data.testUuid,
        });

        setGenerationState((prev) => ({
          status: 'completed',
          progress: 100,
          message: data.message,
          stage: 'completed',
          testUuid: data.testUuid ?? prev.testUuid,
          startTime: prev.startTime,
        }));

        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testDetails, conceptUuid],
        });
      },
      [conceptUuid, queryClient],
    ),
  );

  useSocketEvent<'test.generation.error.user', ITestGenerationErrorMessage>(
    'test.generation.error.user',
    useCallback(
      (data: ITestGenerationErrorMessage) => {
        if (data.conceptUuid !== conceptUuid) return;

        telemetry.warn('test.generation.error', {
          conceptUuid: data.conceptUuid,
          testUuid: data.testUuid,
          error: data.error,
        });

        setGenerationState({
          status: 'error',
          progress: 0,
          message: data.message,
          stage: 'error',
          testUuid: data.testUuid,
          error: data.error,
        });
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

/**
 * Hook to listen for collateral regeneration WebSocket events.
 * Manages loading state during collateral regeneration triggered by participant changes.
 * Persists regeneration state in sessionStorage to survive page refreshes.
 */
export const useCollateralRegenerationEvents = (
  conceptUuid: string,
  testUuid: string,
) => {
  const queryClient = useQueryClient();
  const storageKey = `collateral_regenerating_${conceptUuid}_${testUuid}`;
  const [isRegenerating, setIsRegenerating] = useState(() => {
    // Check sessionStorage on mount to restore regeneration state
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const { timestamp } = JSON.parse(stored);
        // Only restore if regeneration started within last 10 minutes (safety timeout)
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        if (timestamp > tenMinutesAgo) {
          return true;
        } else {
          // Clear stale state
          sessionStorage.removeItem(storageKey);
        }
      }
    }
    return false;
  });
  const toastShownRef = useRef(false);
  const completedCollateralsRef = useRef<Set<string>>(new Set());

  // Persist regeneration state to sessionStorage
  const setRegeneratingState = useCallback(
    (value: boolean) => {
      setIsRegenerating(value);
      if (typeof window !== 'undefined') {
        if (value) {
          sessionStorage.setItem(
            storageKey,
            JSON.stringify({ timestamp: Date.now() }),
          );
        } else {
          sessionStorage.removeItem(storageKey);
        }
      }
    },
    [storageKey],
  );

  // Listen for progress events
  useSocketEvent(
    'test_collateral.progress.user',
    (data: ITestCollateralProgressMessage) => {
      if (data.conceptUuid !== conceptUuid || data.testUuid !== testUuid) {
        return;
      }

      telemetry.debug('test_collateral.progress', {
        conceptUuid: data.conceptUuid,
        testUuid: data.testUuid,
        progress: data.progress,
        stage: data.stage,
      });

      setRegeneratingState(true);
      // Reset toast tracking when regeneration starts
      toastShownRef.current = false;
      completedCollateralsRef.current.clear();
    },
  );

  // Listen for completion event
  useSocketEvent(
    'test_collateral.completed.user',
    (data: ITestCollateralCompletedMessage) => {
      if (data.conceptUuid !== conceptUuid || data.testUuid !== testUuid)
        return;

      telemetry.debug('test_collateral.completed', {
        conceptUuid: data.conceptUuid,
        testUuid: data.testUuid,
        collateralUuid: data.collateralUuid,
      });

      // Track completed collaterals
      completedCollateralsRef.current.add(data.collateralUuid);

      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.testCollateral, conceptUuid, testUuid],
      });

      // Only show toast once per regeneration cycle
      if (!toastShownRef.current) {
        toastShownRef.current = true;
        setRegeneratingState(false);
        toast.success(
          'Collateral Updated',
          'Test collateral has been regenerated successfully',
        );
      }
    },
  );

  // Listen for error events
  useSocketEvent(
    'test_collateral.error.user',
    (data: ITestCollateralErrorMessage) => {
      if (data.conceptUuid !== conceptUuid || data.testUuid !== testUuid)
        return;

      telemetry.debug('test_collateral.error', {
        conceptUuid: data.conceptUuid,
        testUuid: data.testUuid,
        message: data.message,
      });

      setRegeneratingState(false);

      toast.error(
        'Collateral Regeneration Failed',
        data.message || 'Unable to regenerate collateral',
      );
    },
  );

  // Cleanup: Clear storage when component unmounts if regeneration is complete
  useEffect(() => {
    return () => {
      if (!isRegenerating && typeof window !== 'undefined') {
        sessionStorage.removeItem(storageKey);
      }
    };
  }, [isRegenerating, storageKey]);

  return { isRegenerating };
};

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
  startTime?: number; // Unix timestamp when execution started
  quotes?: Array<{ text: string; profileUuid: string }>; // Live quotes from interviews with profile associations
  completedProfileUuids?: Set<string>; // Track which profiles have completed
}

// State persistence utilities
const EXECUTION_STATE_KEY = (conceptUuid: string, testUuid: string) =>
  `synthetic_execution_state_${conceptUuid}_${testUuid}`;

const persistExecutionState = (
  conceptUuid: string,
  testUuid: string,
  state: ISyntheticExecutionState,
) => {
  // Persist active states including 'cancelling' (so it survives page navigation)
  // Only exclude truly terminal states
  if (
    state.status !== 'idle' &&
    state.status !== 'cancelled' && // Don't persist cancelled
    state.status !== 'error' && // Don't persist error
    state.status !== 'completed' // Don't persist completed
  ) {
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
  } else if (
    state.status === 'idle' ||
    state.status === 'cancelled' ||
    state.status === 'error' ||
    state.status === 'completed'
  ) {
    // Clear storage when in terminal states
    clearPersistedExecutionState(conceptUuid, testUuid);
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
  profiles: ICustomerProfile[],
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

  // Cleanup persisted state on unmount only for terminal states
  // Keep 'cancelling' persisted so it survives page navigation
  useEffect(() => {
    return () => {
      if (
        executionState.status === 'idle' ||
        executionState.status === 'completed' ||
        executionState.status === 'cancelled' ||
        executionState.status === 'error'
      ) {
        clearPersistedExecutionState(conceptUuid, testUuid);
      }
      // Note: 'cancelling' is intentionally NOT cleared here so it persists across navigation
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
              // Capture start time on first progress update
              startTime: prev.startTime || Date.now(),
            };

            // Only invalidate queries when reaching 100%
            if (isComplete) {
              // Clear persisted state on completion
              clearPersistedExecutionState(conceptUuid, testUuid);

              // Invalidate test results queries to show new synthetic results
              queryClient.invalidateQueries({
                queryKey: [AucctusQueryKeys.testResults, conceptUuid, testUuid],
              });

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
            toast.success(
              'Test Cancelled',
              'Synthetic test execution has been stopped',
            );
          } else {
            // For actual errors, show error state
            setExecutionState((prev) => ({
              ...prev,
              status: 'error',
              message: data.errorMessage,
              error: data.errorMessage,
            }));
            toast.error(
              'Test Execution Failed',
              data.errorMessage || 'An error occurred during test execution',
            );
          }
        }
      },
      [conceptUuid, testUuid],
    ),
  );

  // Live quotes from interviews
  useSocketEvent<
    'synthetic.interview.quote.user',
    ISyntheticInterviewQuoteMessage
  >(
    'synthetic.interview.quote.user',
    useCallback(
      (data: ISyntheticInterviewQuoteMessage) => {
        if (data.conceptUuid === conceptUuid && data.testUuid === testUuid) {
          // Determine which profile to assign this quote to
          let assignedProfileUuid: string;

          // Check if baseProfileUuid is provided and exists in profiles
          if (
            data.baseProfileUuid &&
            profiles.some((p) => p.uuid === data.baseProfileUuid)
          ) {
            assignedProfileUuid = data.baseProfileUuid;
          } else if (profiles.length > 0) {
            // Randomly assign to one of the available profiles
            const randomProfile =
              profiles[Math.floor(Math.random() * profiles.length)];
            assignedProfileUuid = randomProfile.uuid;
          } else {
            return; // No profiles available, skip this quote
          }

          setExecutionState((prev) => ({
            ...prev,
            quotes: [
              ...(prev.quotes || []),
              { text: data.quote, profileUuid: assignedProfileUuid },
            ],
          }));
        }
      },
      [conceptUuid, testUuid, profiles],
    ),
  );

  // Profile completion events
  useSocketEvent<
    'synthetic.profile.completed.user',
    ISyntheticProfileCompletedMessage
  >(
    'synthetic.profile.completed.user',
    useCallback(
      (data: ISyntheticProfileCompletedMessage) => {
        if (
          data.conceptUuid === conceptUuid &&
          data.testUuid === testUuid &&
          data.baseProfileUuid
        ) {
          setExecutionState((prev) => {
            const newCompleted = new Set(prev.completedProfileUuids || []);
            newCompleted.add(data.baseProfileUuid!);
            return {
              ...prev,
              completedProfileUuids: newCompleted,
            };
          });
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
