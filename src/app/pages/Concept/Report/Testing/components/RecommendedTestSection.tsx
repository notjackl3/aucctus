import { Icon } from '@components';
import { AgentProgressBar } from '@components/Progress';
import { cn } from '@libs/utils/react';
import React, { useEffect, useMemo } from 'react';
import { RecommendedTest } from '../types';
import { RISK_LEVEL_CONFIGS } from '../../Assumptions/constants/statusConfigs';
import CategoryIcon from '../../Assumptions/components/cards/category-progress-card/CategoryIcon';
import GenericStatusBadge from '../../Assumptions/components/shared/GenericStatusBadge';

import { useTestCompletion } from '../Testing';
import type { ITestGenerationState } from '@hooks/sockets/testing';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useAgentEstimatedTime } from '@hooks/query/agent-timing.hook';
import { useFilteredAssumptions } from '@hooks/query/assumptions.hook';
import { useGenerateNextTest } from '@hooks/query/testing.hook';

interface RecommendedTestSectionProps {
  conceptUuid: string;
  conceptIdentifier: string;
  recommendedTest: RecommendedTest | null;
  onRunTest: () => void;
  generationState: ITestGenerationState;
  onCancelGeneration?: () => void;
}

const RecommendedTestSection: React.FC<RecommendedTestSectionProps> = ({
  conceptUuid,
  conceptIdentifier,
  recommendedTest,
  onRunTest,
  generationState,
  onCancelGeneration,
}) => {
  const { isCompletingTest } = useTestCompletion();
  const isDebugModeEnabled = useDebugMode();
  const isGenerating = generationState.status === 'in_progress';
  const hasGenerationError = generationState.status === 'error';
  const currentMessage =
    generationState.message || 'Generating your next recommended test...';
  const showDebugControls =
    __ENVIRONMENT__ === 'development' && isDebugModeEnabled;

  // Fetch assumptions to check validation status using V2 API
  // Fetch all assumptions across all categories with a high page size
  const { assumptions: conceptAssumptions, isLoading: isLoadingAssumptions } =
    useFilteredAssumptions(conceptIdentifier, {
      page: 1,
      page_size: 100,
    });

  // Generate next test mutation
  const generateNextTest = useGenerateNextTest();

  // Check if all assumptions are validated
  const allAssumptionsValidated = useMemo(() => {
    if (!conceptAssumptions || conceptAssumptions.length === 0) {
      // If no assumptions exist, consider them "all validated" to avoid showing the button
      return true;
    }
    // V2 assumptions use 'validationStatus' field
    // Status can be: 'validated', 'invalidated', 'untested'
    // We consider an assumption validated if its validationStatus is 'validated'
    return conceptAssumptions.every(
      (assumption) => assumption.validationStatus === 'validated',
    );
  }, [conceptAssumptions]);

  // Fetch timing estimate for TestGenerationPipeline
  const { data: timingData, refetch: refetchAgentTiming } =
    useAgentEstimatedTime('TestGenerationPipeline', conceptUuid, {
      enabled: !!conceptUuid,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  useEffect(() => {
    if (conceptUuid && generationState.status === 'in_progress') {
      void refetchAgentTiming();
    }
  }, [conceptUuid, generationState.status, refetchAgentTiming]);

  // Calculate estimated seconds with fallback for first run (no history)
  const estimatedSeconds = useMemo(() => {
    if (timingData?.estimatedSeconds) {
      // Use backend estimate (has history)
      return Math.round(timingData.estimatedSeconds);
    }
    // Fallback for first run: 3 minutes
    return 180;
  }, [timingData]);

  const handleCancel = () => {
    if (onCancelGeneration) {
      onCancelGeneration();
    }
  };

  const handleGenerateNextTest = () => {
    generateNextTest.mutate({ conceptUuid });
  };

  if (!recommendedTest) {
    // Show loading state while fetching assumptions
    if (isLoadingAssumptions) {
      return (
        <div className='aucctus-bg-primary aucctus-border-secondary relative rounded-lg border p-6 shadow-sm'>
          <div className='flex flex-col items-center justify-center py-8'>
            <Icon
              variant='refresh'
              className='aucctus-stroke-brand-primary mb-3 h-8 w-8 animate-spin'
            />
            <p className='aucctus-text-sm-medium aucctus-text-brand-secondary'>
              Checking assumptions...
            </p>
          </div>
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className='aucctus-bg-primary aucctus-border-secondary relative rounded-lg border p-6 shadow-sm'>
          <div className='flex flex-col items-center gap-4 py-6'>
            <AgentProgressBar
              agentName='TestGenerationPipeline'
              conceptUuid={conceptUuid}
              progress={
                generationState.progress && generationState.progress >= 95
                  ? generationState.progress
                  : undefined
              }
              message={
                currentMessage || 'This usually takes under three minutes'
              }
              startTime={generationState.startTime}
              overrideEstimatedSeconds={estimatedSeconds}
              showPercentage={false}
            />
            {showDebugControls && onCancelGeneration && (
              <button
                type='button'
                onClick={handleCancel}
                className='btn btn-secondary btn-sm'
              >
                Cancel (debug)
              </button>
            )}
          </div>
        </div>
      );
    }

    if (hasGenerationError) {
      return (
        <div className='aucctus-bg-error-subtle aucctus-border-error relative rounded-lg border p-6 shadow-sm'>
          <div className='flex flex-col items-center justify-center gap-3 py-8 text-center'>
            <Icon
              variant='alert-triangle'
              height={48}
              width={48}
              className='aucctus-stroke-error-primary'
            />
            <h3 className='aucctus-text-lg-semibold aucctus-text-error-primary'>
              We hit a snag generating your next test
            </h3>
            <p className='aucctus-text-sm-regular aucctus-text-brand-secondary max-w-md'>
              {currentMessage}
            </p>
            {showDebugControls && onCancelGeneration && (
              <button
                type='button'
                onClick={handleCancel}
                className='btn btn-secondary btn-sm'
              >
                Clear state (debug)
              </button>
            )}
          </div>
        </div>
      );
    }

    // No recommended test and not generating - check if all assumptions validated
    if (!allAssumptionsValidated) {
      // Some assumptions still need validation - show generate next test button
      return (
        <div
          className={cn(
            'aucctus-bg-primary aucctus-border-secondary relative rounded-lg border p-6 shadow-sm',
            (isCompletingTest || generateNextTest.isLoading) &&
              'pointer-events-none',
          )}
        >
          {(isCompletingTest || generateNextTest.isLoading) && (
            <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white bg-opacity-75'>
              <div className='flex flex-col items-center gap-3'>
                <Icon
                  variant='refresh'
                  className='aucctus-stroke-brand-primary h-8 w-8 animate-spin'
                />
                <p className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                  Generating next test...
                </p>
              </div>
            </div>
          )}
          <div className='flex flex-col items-center justify-center py-8'>
            <Icon
              variant='telescope'
              height={48}
              width={48}
              className='aucctus-stroke-brand-primary mb-4'
            />
            <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-2'>
              No recommended test yet
            </h3>
            <p className='aucctus-text-sm-regular aucctus-text-brand-secondary mb-4 max-w-md text-center'>
              You have{' '}
              {
                conceptAssumptions.filter(
                  (a) => a.validationStatus !== 'validated',
                ).length
              }{' '}
              assumption
              {conceptAssumptions.filter(
                (a) => a.validationStatus !== 'validated',
              ).length !== 1
                ? 's'
                : ''}{' '}
              that still need
              {conceptAssumptions.filter(
                (a) => a.validationStatus !== 'validated',
              ).length !== 1
                ? ''
                : 's'}{' '}
              validation. Generate a test to continue validating your concept.
            </p>
            <button
              onClick={handleGenerateNextTest}
              disabled={generateNextTest.isLoading}
              className='btn btn-primary flex items-center gap-2'
            >
              <Icon variant='plus' className='aucctus-stroke-white h-4 w-4' />
              Generate Next Test
            </button>
          </div>
        </div>
      );
    }

    // All assumptions validated - show success state
    return (
      <div
        className={cn(
          'aucctus-bg-primary aucctus-border-secondary relative rounded-lg border p-6 shadow-sm',
          isCompletingTest && 'pointer-events-none',
        )}
      >
        {isCompletingTest && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white bg-opacity-75'>
            <div className='flex flex-col items-center gap-3'>
              <Icon
                variant='refresh'
                className='aucctus-stroke-brand-primary h-8 w-8 animate-spin'
              />
              <p className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                Generating next test...
              </p>
            </div>
          </div>
        )}
        <div className='flex flex-col items-center justify-center py-8'>
          <Icon
            variant='check'
            height={48}
            width={48}
            className='aucctus-stroke-success-primary mb-4'
          />
          <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-2'>
            All assumptions validated!
          </h3>
          <p className='aucctus-text-sm-regular aucctus-text-brand-secondary max-w-md text-center'>
            You&apos;ve done a great job validating all{' '}
            {conceptAssumptions.length} assumption
            {conceptAssumptions.length !== 1 ? 's' : ''}. Continue monitoring
            the market for new insights.
          </p>
        </div>
      </div>
    );
  }

  // Get assumptions from test details
  const assumptions = recommendedTest.testDetails.assumptions || [];
  const disableInteractions = isCompletingTest || isGenerating;

  return (
    <div className='space-y-3'>
      <div
        className={cn(
          'aucctus-border-secondary relative rounded-lg border border-l-4 border-l-[#5D4037] bg-primary-25 p-5 shadow-sm',
          disableInteractions && 'pointer-events-none',
        )}
      >
        {(isCompletingTest || isGenerating) && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white bg-opacity-75'>
            {isGenerating ? (
              <div className='w-full max-w-md rounded-lg border bg-white p-4 shadow-sm'>
                <AgentProgressBar
                  agentName='TestGenerationPipeline'
                  conceptUuid={conceptUuid}
                  progress={
                    generationState.progress && generationState.progress >= 95
                      ? generationState.progress
                      : undefined
                  }
                  message={
                    currentMessage || 'This usually takes under three minutes'
                  }
                  startTime={generationState.startTime}
                  overrideEstimatedSeconds={estimatedSeconds}
                  showPercentage={false}
                />
                {showDebugControls && onCancelGeneration && (
                  <div className='mt-3 flex justify-end'>
                    <button
                      type='button'
                      onClick={handleCancel}
                      className='btn btn-secondary btn-xs'
                    >
                      Cancel (debug)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex flex-col items-center gap-3'>
                <Icon
                  variant='refresh'
                  className='aucctus-stroke-brand-primary h-8 w-8 animate-spin'
                />
                <p className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                  Generating next test...
                </p>
              </div>
            )}
          </div>
        )}

        {hasGenerationError && (
          <div className='aucctus-bg-error-subtle aucctus-border-error mb-4 flex items-start gap-2 rounded-md border p-3 text-left'>
            <Icon
              variant='alert-triangle'
              className='aucctus-stroke-error-primary mt-0.5 h-4 w-4'
            />
            <div className='flex flex-1 flex-col gap-1'>
              <p className='aucctus-text-sm-semibold aucctus-text-error-primary'>
                We couldn&apos;t generate the next test
              </p>
              <p className='aucctus-text-sm-regular aucctus-text-brand-secondary'>
                {currentMessage}
              </p>
            </div>
            {showDebugControls && onCancelGeneration && (
              <button
                type='button'
                onClick={handleCancel}
                className='btn btn-secondary btn-xs whitespace-nowrap'
              >
                Clear state (debug)
              </button>
            )}
          </div>
        )}

        <div className='mb-4 flex items-start justify-between'>
          {/* Recommended Label */}
          <div className='aucctus-bg-brand-secondary aucctus-border-secondary aucctus-text-xs-semibold aucctus-text-brand-primary mb-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5'>
            <Icon
              variant='ai-conclusion'
              className='aucctus-stroke-brand-primary h-3.5 w-3.5'
            />
            Recommended Next Test
          </div>

          {/* Run Test Button */}
          <button
            onClick={onRunTest}
            className={cn(
              'btn btn-primary flex items-center gap-1',
              disableInteractions && 'cursor-not-allowed opacity-50',
            )}
            disabled={disableInteractions}
          >
            {disableInteractions ? (
              <Icon
                variant='refresh'
                className='aucctus-stroke-white h-4 w-4 animate-spin'
              />
            ) : (
              <Icon
                variant='arrowright'
                className='aucctus-stroke-white h-4 w-4'
              />
            )}
            {disableInteractions ? 'Running...' : 'Run Test'}
          </button>
        </div>

        {/* Test Name and Description */}
        <div className='mb-4 space-y-2'>
          <h3 className='aucctus-text-lg-bold aucctus-text-brand-primary'>
            {recommendedTest.testName}
          </h3>
          <p className='aucctus-text-sm-regular aucctus-text-brand-secondary'>
            {recommendedTest.description}
          </p>
        </div>

        {/* Assumptions to Test */}
        <div>
          <h4 className='aucctus-text-sm-semibold aucctus-text-brand-tertiary mb-3 flex items-center gap-1.5'>
            <Icon
              variant='clipboard'
              className='aucctus-stroke-brand-primary h-4 w-4'
            />
            Assumptions to Test
          </h4>

          <ul className='space-y-3'>
            {assumptions.map((assumption) => {
              const riskLevel = assumption.riskLevel || 'medium';
              const riskColors = RISK_LEVEL_CONFIGS[riskLevel];
              // Convert string to AssumptionCategory type for CategoryIcon
              const categoryVal = (assumption.category?.toLowerCase() ||
                'desirability') as
                | 'desirability'
                | 'feasibility'
                | 'viability'
                | 'adaptability';

              return (
                <li
                  key={assumption.uuid}
                  className='aucctus-text-sm-regular aucctus-border-secondary aucctus-bg-primary hover:aucctus-bg-secondary-hover rounded-md border p-4 transition-colors'
                >
                  <div className='mb-2 flex items-start justify-between'>
                    <div className='flex items-center gap-1.5'>
                      <div className='mr-1'>
                        <CategoryIcon category={categoryVal} />
                      </div>
                      <span className='aucctus-text-sm-medium aucctus-text-brand-secondary capitalize'>
                        {assumption.category || 'General'}
                      </span>
                    </div>
                    <GenericStatusBadge config={riskColors} />
                  </div>
                  <p className='aucctus-text-md-medium aucctus-text-brand-primary'>
                    {assumption.statement}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecommendedTestSection;
