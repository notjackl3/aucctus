import React, { useState } from 'react';
import { Icon, toast } from '@components';
import { cn } from '@libs/utils/react';
import api from '@libs/api';
import { useSyntheticExecutionEvents } from '@hooks/sockets/testing';
import {
  useSyntheticExecutionStart,
  useSyntheticExecutionCancel,
} from '@hooks/query/synthetic-execution.hook';
import { ISyntheticExecutionRequest } from '@libs/api/types/concept/testing';
import SyntheticExecutionPanel from './SyntheticExecutionPanel';
import { useEffect } from 'react';

interface TestExecutionProps {
  conceptUuid?: string;
  testUuid?: string;
  onNavigateToCollateral?: (collateralUuid: string) => void;
  onNavigateToResults?: () => void;
  onExecutionStateChange?: (executionState: any) => void; // Expose execution state to parent
}

const TestExecution: React.FC<TestExecutionProps> = ({
  conceptUuid,
  testUuid,
  onNavigateToCollateral,
  onNavigateToResults,
  onExecutionStateChange,
}) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(
    'facilitated',
  );

  // WebSocket events for real-time execution
  const { executionState, resetExecution, setCancellingState, setExecutionId } =
    useSyntheticExecutionEvents(
      conceptUuid || '',
      testUuid || '',
      (resultsCount) => {
        // Auto-switch to Results tab when completed
        // TODO: This could be enhanced to trigger tab switch via parent component
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`Execution completed with ${resultsCount} results`);
        }
      },
    );

  // Notify parent when execution state changes
  useEffect(() => {
    onExecutionStateChange?.(executionState);
  }, [executionState, onExecutionStateChange]);

  // Execution mutations
  const startExecution = useSyntheticExecutionStart(
    conceptUuid || '',
    testUuid || '',
  );
  const cancelExecution = useSyntheticExecutionCancel(
    conceptUuid || '',
    testUuid || '',
  );

  // Handlers for real-time execution
  const handleExecuteSynthetic = async (config: ISyntheticExecutionRequest) => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing test information. Please try again.');
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

  const handleCancelExecution = async () => {
    if (executionState.executionId) {
      // Immediately set to cancelling state for instant user feedback
      setCancellingState();

      try {
        await cancelExecution.mutateAsync(executionState.executionId);
        // Don't call resetExecution here - let the WebSocket error event handle the final state
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
            status={executionState.status}
            progress={executionState.progress}
            message={executionState.message}
            currentStage={executionState.currentStage}
            currentPersona={executionState.currentPersona}
            totalPersonas={executionState.totalPersonas}
            resultsCount={executionState.resultsCount}
            error={executionState.error}
            onCancel={handleCancelExecution}
            conceptUuid={conceptUuid || ''}
            testUuid={testUuid || ''}
            onExecute={handleExecuteSynthetic}
            onReset={resetExecution}
            onNavigateToCollateral={onNavigateToCollateral}
            onNavigateToResults={onNavigateToResults}
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
