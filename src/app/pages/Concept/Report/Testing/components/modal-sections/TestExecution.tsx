import React, { useState, useEffect, useMemo } from 'react';
import { Icon, toast } from '@components';
import { cn } from '@libs/utils/react';
import api from '@libs/api';
import telemetry from '@libs/telemetry';
import { useSyntheticExecutionEvents } from '@hooks/sockets/testing';
import {
  useSyntheticExecutionStart,
  useSyntheticExecutionCancel,
  useSyntheticExecutionStatus,
} from '@hooks/query/synthetic-execution.hook';
import { useSyntheticPipelineEstimate } from '@hooks/query/agent-timing.hook';
import { ISyntheticExecutionRequest } from '@libs/api/types/concept/testing';
import { useConceptCustomerProfiles } from '@hooks/query/concepts.hook';
import SyntheticExecutionPanel from './SyntheticExecutionPanel';
import { useTestParticipants } from '@hooks/query/testing.hook';

interface TestExecutionProps {
  conceptUuid?: string;
  testUuid?: string;
  onNavigateToCollateral?: (collateralUuid: string) => void;
  onNavigateToResults?: () => void;
  onExecutionStateChange?: (executionState: any) => void; // Expose execution state to parent
  isCollateralRegenerating?: boolean;
}

const TestExecution: React.FC<TestExecutionProps> = ({
  conceptUuid,
  testUuid,
  onNavigateToCollateral,
  onNavigateToResults,
  onExecutionStateChange,
  isCollateralRegenerating = false,
}) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(
    'facilitated',
  );
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch customer profiles for quote assignment
  const { profiles } = useConceptCustomerProfiles(conceptUuid || '');
  const { participants } = useTestParticipants(
    conceptUuid || '',
    testUuid || '',
    { enabled: !!conceptUuid && !!testUuid },
  );

  const participantCountsFromApi = useMemo(() => {
    if (!participants || participants.length === 0) {
      return undefined;
    }
    const counts: Record<string, number> = {};
    participants.forEach((participant) => {
      if (participant.status === 'cancelled') {
        return;
      }
      const normalized = participant.customerProfile.uuid.replace(/_/g, '-');
      counts[normalized] = participant.count;
    });
    return counts;
  }, [participants]);

  const skippedParticipantsFromApi = useMemo(() => {
    if (!participants) {
      return new Set<string>();
    }
    return new Set(
      participants
        .filter((participant) => participant.status === 'cancelled')
        .map((participant) =>
          participant.customerProfile.uuid.replace(/_/g, '-'),
        ),
    );
  }, [participants]);

  // WebSocket events for real-time execution
  const { executionState, resetExecution, setCancellingState, setExecutionId } =
    useSyntheticExecutionEvents(
      conceptUuid || '',
      testUuid || '',
      profiles,
      (resultsCount) => {
        // Auto-switch to Results tab when completed
        // TODO: This could be enhanced to trigger tab switch via parent component
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`Execution completed with ${resultsCount} results`);
        }
      },
    );

  // Calculate number of profiles for timing estimate
  // Use totalPersonas from execution state if available, otherwise default to 2
  const numProfiles = executionState.totalPersonas || 2;

  // Fetch estimated execution time for the complete synthetic pipeline
  const { data: timingData } = useSyntheticPipelineEstimate(
    conceptUuid || '',
    numProfiles,
    { enabled: !!conceptUuid },
  );

  // Debug: Log timing data
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(
        '[TestExecution] timingData:',
        timingData,
        'numProfiles:',
        numProfiles,
      );
    }
  }, [timingData, numProfiles]);

  // Execution mutations
  const startExecution = useSyntheticExecutionStart(
    conceptUuid || '',
    testUuid || '',
  );
  const cancelExecution = useSyntheticExecutionCancel(
    conceptUuid || '',
    testUuid || '',
  );

  // Status polling for persistence (complements WebSocket)
  const { data: persistentStatus } = useSyntheticExecutionStatus(
    conceptUuid || '',
    testUuid || '',
    executionState.executionId,
    {
      enabled: !!executionState.executionId && executionState.status !== 'idle',
      refetchInterval: executionState.status === 'running' ? 2000 : 10000, // Faster polling when running
      isWebSocketActive: executionState.status !== 'idle', // Indicate WebSocket activity
      onExecutionNotFound: () => {
        // 404 from polling means execution was cancelled or expired
        resetExecution();
        toast.info('Execution Cancelled', 'Execution was cancelled or expired');
      },
    },
  );

  // Merge WebSocket state with persistent API state
  const displayState = useMemo(() => {
    // If we have persistent API status, prioritize it in these cases:
    // 1. WebSocket is idle and API shows active execution (reconnecting scenario)
    // 2. API shows completed status (regardless of WebSocket state)
    // 3. API shows cancelled status (should reset to idle)
    if (
      persistentStatus &&
      // Case 1: WebSocket idle, API shows active execution (including cancelling)
      ((executionState.status === 'idle' &&
        ['running', 'pending', 'cancelling'].includes(
          persistentStatus.status,
        )) ||
        // Case 2: API shows completed (trust this over stale WebSocket state)
        persistentStatus.status === 'completed' ||
        // Case 3: API shows cancelled (should reset to idle)
        persistentStatus.status === 'cancelled')
    ) {
      const isCompleted = persistentStatus.status === 'completed';
      const isCancelled = persistentStatus.status === 'cancelled';

      // If cancelled, return to idle state
      if (isCancelled) {
        return {
          status: 'idle' as any,
          progress: 0,
          message: '',
          executionId: undefined,
          resultsCount: 0,
          currentStage: undefined,
          currentPersona: undefined,
          totalPersonas: undefined,
          error: undefined,
          quotes: [],
          completedProfileUuids: new Set<string>(),
          startTime: undefined,
        };
      }

      return {
        status: persistentStatus.status as any,
        // Force 100% progress when completed, since API doesn't store progress
        progress: isCompleted ? 100 : persistentStatus.progress || 0,
        message:
          persistentStatus.message ||
          (isCompleted ? 'Execution completed' : 'Reconnecting...'),
        executionId: persistentStatus.executionId,
        resultsCount: persistentStatus.resultsCount,
        currentStage: undefined, // API doesn't provide stage details
        currentPersona: persistentStatus.currentPersona,
        totalPersonas: persistentStatus.totalPersonas,
        error: persistentStatus.error
          ? JSON.stringify(persistentStatus.error)
          : undefined,
        quotes: executionState.quotes || [], // Include quotes from WebSocket state
        completedProfileUuids:
          executionState.completedProfileUuids || new Set<string>(), // Include completed profiles from WebSocket state
        startTime: executionState.startTime, // Include startTime from WebSocket state
      };
    }

    // WebSocket takes priority when it has active execution data
    if (executionState.status !== 'idle' && executionState.executionId) {
      return executionState;
    }

    // Fallback to persistent status from API
    if (persistentStatus) {
      const isCompleted = persistentStatus.status === 'completed';
      const isCancelled = persistentStatus.status === 'cancelled';

      // If cancelled in fallback, reset to idle
      if (isCancelled) {
        return {
          status: 'idle' as any,
          progress: 0,
          message: '',
          executionId: undefined,
          resultsCount: 0,
          currentStage: undefined,
          currentPersona: undefined,
          totalPersonas: undefined,
          error: undefined,
          quotes: [],
          startTime: undefined,
        };
      }

      return {
        status: persistentStatus.status as any,
        // Force 100% progress when completed, since API doesn't store progress
        progress: isCompleted ? 100 : persistentStatus.progress || 0,
        message:
          persistentStatus.message ||
          (isCompleted ? 'Execution completed' : ''),
        executionId: persistentStatus.executionId,
        resultsCount: persistentStatus.resultsCount,
        currentStage: undefined, // API doesn't provide stage details
        currentPersona: persistentStatus.currentPersona,
        totalPersonas: persistentStatus.totalPersonas,
        error: persistentStatus.error
          ? JSON.stringify(persistentStatus.error)
          : undefined,
        quotes: executionState.quotes || [], // Include quotes from WebSocket state
        startTime: executionState.startTime, // Include startTime from WebSocket state
      };
    }

    // Default to WebSocket state
    return executionState;
  }, [executionState, persistentStatus]);

  // Check for existing running execution on component mount and handle initialization
  useEffect(() => {
    const checkForRunningExecution = async () => {
      if (!conceptUuid || !testUuid) {
        setIsInitializing(false);
        return;
      }

      try {
        // Use the dedicated current execution endpoint
        const currentExecution = await api.testing.getCurrentSyntheticExecution(
          conceptUuid,
          testUuid,
        );

        if (
          currentExecution &&
          ['running', 'starting', 'cancelling'].includes(
            currentExecution.status,
          )
        ) {
          setExecutionId(currentExecution.executionId);

          // CRITICAL FIX: Also restore the WebSocket state to match the API status
          // This ensures the UI shows the correct state (especially 'cancelling')
          if (currentExecution.status === 'cancelling') {
            setCancellingState();
          }
        }
      } catch (error) {
        // No running execution found or error accessing endpoint - this is fine
        if (process.env.NODE_ENV === 'development') {
          telemetry.debug('synthetic.execution.check.error', {
            conceptUuid,
            testUuid,
            error: error instanceof Error ? error.message : error,
          });
        }
      } finally {
        // Set initialization complete after checking for running execution
        setTimeout(() => setIsInitializing(false), 1000); // Give WebSocket time to connect
      }
    };

    checkForRunningExecution();
  }, [conceptUuid, testUuid, setExecutionId, setCancellingState]);

  // Additional initialization timeout as fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000); // Fallback timeout

    return () => clearTimeout(timer);
  }, []);

  // Notify parent when execution state changes
  useEffect(() => {
    onExecutionStateChange?.({
      ...displayState,
      estimatedSeconds: timingData?.estimatedSeconds ?? null,
      isInitializing,
      conceptUuid,
      testUuid,
    });
  }, [
    displayState,
    onExecutionStateChange,
    timingData?.estimatedSeconds,
    isInitializing,
    conceptUuid,
    testUuid,
  ]);

  // Handlers for real-time execution
  const handleExecuteSynthetic = async (config: ISyntheticExecutionRequest) => {
    if (!conceptUuid || !testUuid) {
      toast.error(
        'Missing Test Information',
        'Missing test information. Please try again',
      );
      return;
    }

    try {
      resetExecution();
      const result = await startExecution.mutateAsync(config);
      setExecutionId(result.executionId);
      // Execution started, WebSocket will handle progress updates
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to start execution:', error);
      }
    }
  };

  // Cancel execution handler with optimized mid-execution checks
  // Backend now checks for cancellation every 5 completed interviews for faster response
  const handleCancelExecution = async () => {
    if (displayState.executionId) {
      // Immediately set to cancelling state for instant user feedback
      setCancellingState();

      // Emit event to immediately dismiss progress toast
      window.dispatchEvent(
        new CustomEvent('synthetic-execution-cancelled', {
          detail: {
            conceptUuid,
            testUuid,
          },
        }),
      );

      try {
        const result = await cancelExecution.mutateAsync(
          displayState.executionId,
        );

        // If no tasks were found, the execution is already cancelled/completed
        // Reset immediately instead of waiting for websocket event
        if (result?.revokedTasks?.status === 'no_tasks_found') {
          resetExecution();
        }
        // Otherwise, let the WebSocket error event handle the final state
      } catch (error) {
        // If the cancel request fails, reset to previous state
        // The error is already handled by the mutation's onError callback
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Failed to cancel execution:', error);
        }
      }
    }
  };

  return (
    <div className='space-y-6'>
      {/* Test Mode Selection - 2x2 Grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Facilitated Option */}
        <div
          className={cn(
            'aucctus-border-secondary cursor-pointer rounded-lg border p-4 transition-colors',
            selectedMode === 'facilitated'
              ? 'aucctus-border-brand-primary aucctus-bg-secondary-extra-subtle'
              : 'aucctus-bg-primary hover:aucctus-bg-secondary-subtle',
          )}
          onClick={() => setSelectedMode('facilitated')}
        >
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='users-03'
                className={cn(
                  'h-5 w-5',
                  selectedMode === 'facilitated'
                    ? 'aucctus-stroke-brand-primary'
                    : 'aucctus-stroke-tertiary',
                )}
              />
              <h4
                className={cn(
                  'aucctus-text-sm-semibold',
                  selectedMode === 'facilitated'
                    ? 'aucctus-text-brand-primary'
                    : 'aucctus-text-brand-primary',
                )}
              >
                Facilitated
              </h4>
            </div>
            {selectedMode === 'facilitated' && (
              <Icon
                variant='check'
                className='aucctus-stroke-brand-primary h-5 w-5'
              />
            )}
          </div>
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Run the test yourself outside of Aucctus, then return to upload
            results
          </p>
        </div>

        {/* Expert-Led Option - Coming Soon */}
        <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4 opacity-70'>
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='users-03'
                className='aucctus-stroke-tertiary h-5 w-5'
              />
              <h4 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                Expert-Led
              </h4>
            </div>
            <span className='aucctus-bg-secondary-subtle aucctus-text-tertiary aucctus-border-secondary rounded-full border px-2 py-0.5 text-xs'>
              Coming soon
            </span>
          </div>
          <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
            Testing experts at Disruptive Edge will facilitate the test for you
            with real customers, ensuring high-touch engagement and testing best
            practice
          </p>
        </div>

        {/* Automated Option - Coming Soon */}
        <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4 opacity-70'>
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='trendup'
                className='aucctus-stroke-tertiary h-5 w-5'
              />
              <h4 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                Automated
              </h4>
            </div>
            <span className='aucctus-bg-secondary-subtle aucctus-text-tertiary aucctus-border-secondary rounded-full border px-2 py-0.5 text-xs'>
              Coming soon
            </span>
          </div>
          <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
            Aucctus runs the test for you with real participants that match your
            target profiles
          </p>
        </div>

        {/* Synthetic Option */}
        <div
          className={cn(
            'cursor-pointer rounded-lg border p-4 transition-colors',
            selectedMode === 'synthetic'
              ? 'aucctus-border-brand-primary aucctus-bg-secondary-extra-subtle'
              : 'aucctus-border-secondary aucctus-bg-primary hover:aucctus-bg-secondary-subtle',
          )}
          onClick={() => setSelectedMode('synthetic')}
        >
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='ai-conclusion'
                className={cn(
                  'h-5 w-5',
                  selectedMode === 'synthetic'
                    ? 'aucctus-stroke-brand-primary'
                    : 'aucctus-stroke-tertiary',
                )}
              />
              <h4
                className={cn(
                  'aucctus-text-sm-semibold',
                  selectedMode === 'synthetic'
                    ? 'aucctus-text-brand-primary'
                    : 'aucctus-text-brand-primary',
                )}
              >
                Synthetic
              </h4>
            </div>
            {selectedMode === 'synthetic' && (
              <Icon
                variant='check'
                className='aucctus-stroke-brand-primary h-5 w-5'
              />
            )}
          </div>
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Simulate this test with AI-agents trained to behave like your target
            profiles
          </p>
        </div>
      </div>

      {/* Synthetic Mode Actions */}
      {selectedMode === 'synthetic' && (
        <div className='space-y-4'>
          {/* Real-time Execution Panel */}
          <SyntheticExecutionPanel
            status={displayState.status}
            progress={displayState.progress}
            message={displayState.message}
            currentStage={displayState.currentStage}
            currentPersona={displayState.currentPersona}
            totalPersonas={displayState.totalPersonas}
            resultsCount={displayState.resultsCount}
            error={displayState.error}
            isInitializing={isInitializing}
            isExecuting={startExecution.isLoading}
            estimatedSeconds={timingData?.estimatedSeconds ?? null}
            startTime={displayState.startTime}
            quotes={displayState.quotes}
            completedProfileUuids={displayState.completedProfileUuids}
            onCancel={handleCancelExecution}
            conceptUuid={conceptUuid || ''}
            testUuid={testUuid || ''}
            onExecute={handleExecuteSynthetic}
            onReset={resetExecution}
            onNavigateToCollateral={onNavigateToCollateral}
            onNavigateToResults={onNavigateToResults}
            initialParticipantCounts={participantCountsFromApi}
            lockedSkippedParticipants={skippedParticipantsFromApi}
            isCollateralRegenerating={isCollateralRegenerating}
          />
        </div>
      )}

      {/* Information Section */}
      <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-6'>
        <div className='flex items-start gap-3'>
          <div className='mt-1'>
            <Icon
              variant='help-circle'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
          </div>
          <div>
            <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-3'>
              {selectedMode === 'synthetic'
                ? 'How synthetic testing works'
                : 'How facilitated testing works'}
            </h4>
            <ul className='aucctus-text-sm-regular aucctus-text-secondary list-disc space-y-2 pl-5'>
              {selectedMode === 'synthetic' ? (
                <>
                  <li>
                    Select your interview materials (mockups, surveys,
                    prototypes)
                  </li>
                  <li>
                    Configure the number of AI-generated customer interviews
                  </li>
                  <li>
                    Interviews are distributed across your customer personas
                    (e.g., 7 interviews ÷ 3 personas = 2-3 interviews per
                    persona)
                  </li>
                  <li>
                    Each persona gets 1 interview from the original profile + 1
                    interview from a demographic variation
                  </li>
                  <li>
                    AI agents analyze your materials and respond as different
                    customer personas
                  </li>
                  <li>
                    Review structured insights and raw interview transcripts in
                    the Results tab
                  </li>
                  <li>
                    Update your assumptions based on the synthetic customer
                    feedback
                  </li>
                </>
              ) : (
                <>
                  <li>
                    Schedule interview sessions with your selected participants
                  </li>
                  <li>
                    Use the interview guide from the Collateral tab to conduct
                    the session
                  </li>
                  <li>
                    Take detailed notes or record the session (with permission)
                  </li>
                  <li>
                    Return to Aucctus to log your findings in the Results tab
                  </li>
                  <li>Update your assumptions based on what you learned</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Test Execution Checklist */}
      {/* <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-6'>
        <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-4'>
          Test Execution Checklist
        </h4>

        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-success-secondary flex h-6 w-6 items-center justify-center rounded-full'>
              <Icon
                variant='check'
                className='aucctus-stroke-success-primary h-4 w-4'
              />
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Invite participants
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-success-secondary flex h-6 w-6 items-center justify-center rounded-full'>
              <Icon
                variant='check'
                className='aucctus-stroke-success-primary h-4 w-4'
              />
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Prepare interview guide
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded-full border'>
              <span className='aucctus-text-xs-semibold aucctus-text-tertiary'>
                3
              </span>
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Conduct test sessions
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded-full border'>
              <span className='aucctus-text-xs-semibold aucctus-text-tertiary'>
                4
              </span>
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Record and analyze results
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded-full border'>
              <span className='aucctus-text-xs-semibold aucctus-text-tertiary'>
                5
              </span>
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Update assumptions
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default TestExecution;
