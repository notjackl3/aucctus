import { Modal } from '@components';
import { AgentProgressBar } from '@components/Progress';
import { cn } from '@libs/utils/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RecommendedTest } from '../types';
import { RISK_LEVEL_CONFIGS } from '../../Assumptions/constants/statusConfigs';
import CategoryIcon from '../../Assumptions/components/cards/category-progress-card/CategoryIcon';
import GenericStatusBadge from '../../Assumptions/components/shared/GenericStatusBadge';
import AssumptionDropdown from './AssumptionDropdown';

import { useTestCompletion } from '../Testing';
import type { ITestGenerationState } from '@hooks/sockets/testing';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useAgentEstimatedTime } from '@hooks/query/agent-timing.hook';
import { useFilteredAssumptions } from '@hooks/query/assumptions.hook';
import {
  useGenerateNextTest,
  useCreateTestAssumption,
  useDeleteTestAssumption,
  useRegenerateTestDetails,
} from '@hooks/query/testing.hook';
import { useModal } from '@context/ModalContextProvider';
import type { AssumptionCategory } from '@libs/api/types/concept/assumptions';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clipboard,
  Eye,
  Plus,
  RefreshCw,
  Sparkles,
  Telescope,
  X,
} from 'lucide-react';
import ProfileStaleTestBanner from './ProfileStaleTestBanner';

interface RecommendedTestSectionProps {
  conceptUuid: string;
  conceptIdentifier: string;
  recommendedTest: RecommendedTest | null;
  onRunTest: () => void;
  generationState: ITestGenerationState;
  onCancelGeneration?: () => void;
  isViewMode?: boolean;
}

const RecommendedTestSection: React.FC<RecommendedTestSectionProps> = ({
  conceptUuid,
  conceptIdentifier,
  recommendedTest,
  onRunTest,
  generationState,
  onCancelGeneration,
  isViewMode,
}) => {
  const { isCompletingTest } = useTestCompletion();
  const isDebugModeEnabled = useDebugMode();
  const isGenerating = generationState.status === 'in_progress';
  const hasGenerationError = generationState.status === 'error';
  const currentMessage =
    generationState.message || 'Generating your next recommended test...';
  const showDebugControls =
    __ENVIRONMENT__ === 'development' && isDebugModeEnabled;

  // State for assumption management
  const { openModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingAdditions, setPendingAdditions] = useState<string[]>([]);
  const [pendingRemovals, setPendingRemovals] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mutation hooks for assumption management
  const createTestAssumption = useCreateTestAssumption({
    showSuccessToast: false,
  });
  const deleteTestAssumption = useDeleteTestAssumption({
    showSuccessToast: false,
  });
  const regenerateTestDetails = useRegenerateTestDetails();

  // Fetch assumptions to check validation status using V2 API
  // Fetch all assumptions across all categories with a high page size
  // Skip in view mode — no assumption management needed for read-only
  const { assumptions: conceptAssumptions, isLoading: isLoadingAssumptions } =
    useFilteredAssumptions(isViewMode ? '' : conceptIdentifier, {
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

  // Get assumptions from recommended test and handle pending changes
  const assumptions = useMemo(
    () => recommendedTest?.testDetails.assumptions ?? [],
    [recommendedTest],
  );

  const testUuid = recommendedTest?.testDetails.uuid ?? '';

  // Extract existing assumption UUIDs
  const existingAssumptionUuids = useMemo(() => {
    return assumptions
      .map((assumption) => {
        const assumptionObj = assumption as unknown as Record<string, any>;
        const possibleUuid =
          assumption.assumptionUuid ||
          assumptionObj.assumption_uuid ||
          assumptionObj.assumptionUuid ||
          null;
        return possibleUuid ? String(possibleUuid) : null;
      })
      .filter((uuid): uuid is string => uuid !== null);
  }, [assumptions]);

  // Extract assumption statements for versioning compatibility
  const existingAssumptionStatements = useMemo(
    () => new Set(assumptions.map((a) => a.statement)),
    [assumptions],
  );

  // Combine existing assumptions with pending ones for display
  const displayAssumptions = useMemo(() => {
    // Filter out assumptions marked for removal
    const filteredAssumptions = assumptions.filter((a) => {
      const uuid = a.assumptionUuid || (a as any).assumption_uuid || a.uuid;
      return !pendingRemovals.includes(uuid);
    });

    // Get pending assumption objects from conceptAssumptions
    const pendingAssumptionObjects = pendingAdditions
      .map((uuid) => conceptAssumptions.find((a) => a.uuid === uuid))
      .filter((a): a is (typeof conceptAssumptions)[0] => a !== undefined)
      .map((a) => ({
        ...a,
        // Add a flag to indicate this is pending
        isPending: true,
      }));

    return [...filteredAssumptions, ...pendingAssumptionObjects];
  }, [assumptions, pendingAdditions, pendingRemovals, conceptAssumptions]);

  // Fetch timing estimate for TestGenerationPipeline
  // Skip in view mode — no generation in read-only context
  const { data: timingData, refetch: refetchAgentTiming } =
    useAgentEstimatedTime('TestGenerationPipeline', conceptUuid, {
      enabled: !!conceptUuid && !isViewMode,
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

  // Handle selecting an assumption from dropdown
  const handleSelectAssumption = useCallback(
    (assumptionUuid: string) => {
      if (!conceptUuid || !testUuid) {
        return;
      }

      // Add to pending additions and mark as having unsaved changes
      setPendingAdditions((prev) => [...prev, assumptionUuid]);
      setHasUnsavedChanges(true);
    },
    [conceptUuid, testUuid],
  );

  // Handle removing an assumption
  const handleRemoveAssumption = useCallback(
    (assumptionUuid: string, isPending: boolean) => {
      if (!conceptUuid || !testUuid) {
        return;
      }

      // Mark as having unsaved changes
      setHasUnsavedChanges(true);

      if (isPending) {
        // If it's a pending addition, remove from pending additions list
        setPendingAdditions((prev) =>
          prev.filter((id) => id !== assumptionUuid),
        );
      } else {
        // If it's an existing assumption, add to pending removals list
        setPendingRemovals((prev) => [...prev, assumptionUuid]);
      }
    },
    [conceptUuid, testUuid],
  );

  // Handle clicking "Save Changes" - show regeneration warning
  const handleSaveChanges = useCallback(() => {
    if (!conceptUuid || !testUuid || !conceptIdentifier) {
      return;
    }

    // Build removed assumptions display items from existing assumptions
    const removedAssumptions = pendingRemovals
      .map((uuid) => {
        const assumption = assumptions.find((a) => {
          const aUuid =
            a.assumptionUuid || (a as any).assumption_uuid || a.uuid;
          return aUuid === uuid;
        });
        if (!assumption) return null;

        return {
          uuid,
          statement: assumption.statement,
          category: assumption.category as AssumptionCategory,
          riskCategory:
            'riskLevel' in assumption ? assumption.riskLevel : 'medium',
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Build added assumptions display items from concept assumptions
    const addedAssumptions = pendingAdditions
      .map((uuid) => {
        const assumption = conceptAssumptions.find((a) => a.uuid === uuid);
        if (!assumption) return null;

        return {
          uuid,
          statement: assumption.statement,
          category: assumption.category as AssumptionCategory,
          riskCategory: assumption.riskCategory,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    openModal(
      Modal.RegenerateTestWarningModal,
      {
        onConfirm: async () => {
          // First, remove assumptions marked for deletion
          for (const assumptionUuid of pendingRemovals) {
            await deleteTestAssumption.mutateAsync({
              conceptUuid,
              testUuid,
              assumptionUuid,
            });
          }

          // Then, link all pending additions
          for (const assumptionUuid of pendingAdditions) {
            await createTestAssumption.mutateAsync({
              conceptUuid,
              testUuid,
              data: {
                assumption_uuid: assumptionUuid,
                test_details_uuid: testUuid,
              },
            });
          }

          // Calculate final assumption list
          const finalAssumptionUuids = [
            ...existingAssumptionUuids.filter(
              (uuid) => !pendingRemovals.includes(uuid),
            ),
            ...pendingAdditions,
          ];

          // Trigger regeneration with all assumptions
          await regenerateTestDetails.mutateAsync({
            conceptUuid,
            testUuid,
            assumptionUuids: finalAssumptionUuids,
            conceptIdentifier,
          });

          // Reset state
          setPendingAdditions([]);
          setPendingRemovals([]);
          setHasUnsavedChanges(false);
        },
        removedAssumptions,
        addedAssumptions,
      },
      {
        position: 'center',
        backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-25',
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEscape: true,
      },
    );
  }, [
    conceptUuid,
    testUuid,
    conceptIdentifier,
    existingAssumptionUuids,
    pendingAdditions,
    pendingRemovals,
    regenerateTestDetails,
    openModal,
    createTestAssumption,
    deleteTestAssumption,
    assumptions,
    conceptAssumptions,
  ]);

  // Handle clicking "Cancel" for assumption changes
  const handleCancelAssumptionChanges = useCallback(() => {
    // Reset state - we never actually linked/unlinked the pending changes via API
    setPendingAdditions([]);
    setPendingRemovals([]);
    setHasUnsavedChanges(false);
  }, []);

  // Handle toggling the dropdown
  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  if (!recommendedTest) {
    // Show loading state while fetching assumptions (skip in view mode)
    if (isLoadingAssumptions && !isViewMode) {
      return (
        <div className='aucctus-bg-primary aucctus-border-secondary relative rounded-lg border p-6 shadow-sm'>
          <div className='flex flex-col items-center justify-center py-8'>
            <RefreshCw className='aucctus-stroke-brand-primary mb-3 h-8 w-8 animate-spin' />
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
            <AlertTriangle size={48} className='aucctus-stroke-error-primary' />
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

    // In view mode with no recommended test, just show a simple message
    if (isViewMode) {
      return (
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 shadow-sm'>
          <div className='flex flex-col items-center justify-center py-8'>
            <Telescope
              size={48}
              className='aucctus-stroke-brand-primary mb-4'
            />
            <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-2'>
              No active test
            </h3>
            <p className='aucctus-text-sm-regular aucctus-text-brand-secondary max-w-md text-center'>
              There is no recommended test at this time.
            </p>
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
                <RefreshCw className='aucctus-stroke-brand-primary h-8 w-8 animate-spin' />
                <p className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                  Generating next test...
                </p>
              </div>
            </div>
          )}
          <div className='flex flex-col items-center justify-center py-8'>
            <Telescope
              size={48}
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
            {!isViewMode && (
              <button
                onClick={handleGenerateNextTest}
                disabled={generateNextTest.isLoading}
                className='btn btn-primary flex items-center gap-2'
              >
                <Plus className='aucctus-stroke-white h-4 w-4' />
                Generate Next Test
              </button>
            )}
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
              <RefreshCw className='aucctus-stroke-brand-primary h-8 w-8 animate-spin' />
              <p className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                Generating next test...
              </p>
            </div>
          </div>
        )}
        <div className='flex flex-col items-center justify-center py-8'>
          <Check size={48} className='aucctus-stroke-success-primary mb-4' />
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

  // Disable interactions when completing test or generating
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
                <RefreshCw className='aucctus-stroke-brand-primary h-8 w-8 animate-spin' />
                <p className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                  Generating next test...
                </p>
              </div>
            )}
          </div>
        )}

        {hasGenerationError && (
          <div className='aucctus-bg-error-subtle aucctus-border-error mb-4 flex items-start gap-2 rounded-md border p-3 text-left'>
            <AlertTriangle className='aucctus-stroke-error-primary mt-0.5 h-4 w-4' />
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

        {!isViewMode && recommendedTest?.testDetails.profileBasisStale && (
          <ProfileStaleTestBanner
            onRegenerate={() => {
              if (testUuid) {
                regenerateTestDetails.mutate({
                  conceptUuid,
                  testUuid,
                });
              }
            }}
            isLoading={regenerateTestDetails.isLoading}
          />
        )}

        <div className='mb-4 flex items-start justify-between'>
          {/* Recommended Label */}
          <div className='aucctus-bg-brand-secondary aucctus-border-secondary aucctus-text-xs-semibold aucctus-text-brand-primary mb-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5'>
            <Sparkles className='aucctus-stroke-brand-primary h-3.5 w-3.5' />
            Recommended Next Test
          </div>

          {/* Action Buttons - Show Test (view mode) or Run Test / Save Changes */}
          {isViewMode ? (
            <button
              onClick={onRunTest}
              className='btn btn-primary flex items-center gap-1'
            >
              <Eye className='aucctus-stroke-white h-4 w-4' />
              Show Test
            </button>
          ) : (
            <>
              {hasUnsavedChanges ? (
                <div className='flex items-center gap-2'>
                  <button
                    onClick={handleCancelAssumptionChanges}
                    className='btn btn-light'
                    disabled={regenerateTestDetails.isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className='btn btn-primary flex items-center gap-1'
                    disabled={regenerateTestDetails.isLoading}
                  >
                    <ArrowRight className='aucctus-stroke-white h-4 w-4' />
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={onRunTest}
                  className={cn(
                    'btn btn-primary flex items-center gap-1',
                    disableInteractions && 'cursor-not-allowed opacity-50',
                  )}
                  disabled={disableInteractions}
                >
                  {disableInteractions ? (
                    <RefreshCw className='aucctus-stroke-white h-4 w-4 animate-spin' />
                  ) : (
                    <ArrowRight className='aucctus-stroke-white h-4 w-4' />
                  )}
                  {disableInteractions ? 'Running...' : 'Run Test'}
                </button>
              )}
            </>
          )}
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
        <div className='relative'>
          <h4 className='aucctus-text-sm-semibold aucctus-text-brand-tertiary mb-4 flex items-center gap-1.5'>
            <Clipboard className='aucctus-stroke-brand-primary h-4 w-4' />
            Assumptions to Test
          </h4>

          <ul className='space-y-3'>
            {displayAssumptions.map((assumption) => {
              // Check if this is a pending assumption
              const isPending =
                'isPending' in assumption && assumption.isPending;

              // Get risk level (pending assumptions use 'riskCategory' field, existing use 'riskLevel')
              const riskLevel = isPending
                ? 'riskCategory' in assumption
                  ? assumption.riskCategory
                  : 'medium'
                : ('riskLevel' in assumption
                    ? assumption.riskLevel
                    : 'medium') || 'medium';
              const riskColors = RISK_LEVEL_CONFIGS[riskLevel];
              // Convert string to AssumptionCategory type for CategoryIcon
              const categoryVal = (assumption.category?.toLowerCase() ||
                'desirability') as
                | 'desirability'
                | 'feasibility'
                | 'viability'
                | 'adaptability';

              // Get the assumption UUID for removal
              const assumptionUuidForRemoval = isPending
                ? assumption.uuid
                : ('assumptionUuid' in assumption
                    ? assumption.assumptionUuid
                    : null) ||
                  (assumption as unknown as Record<string, any>)
                    .assumption_uuid ||
                  assumption.uuid;

              return (
                <li
                  key={`${assumption.uuid}-${isPending ? 'pending' : 'existing'}`}
                  className='aucctus-text-sm-regular aucctus-border-secondary aucctus-bg-primary hover:aucctus-bg-secondary-hover group relative rounded-md border p-4 transition-colors'
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
                    <div className='flex items-center gap-2'>
                      <GenericStatusBadge config={riskColors} />
                      {/* Remove button - appears on hover */}
                      {!isViewMode && (
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAssumption(
                              assumptionUuidForRemoval,
                              isPending,
                            );
                          }}
                          className='flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'
                          aria-label='Remove assumption'
                        >
                          <X className='aucctus-stroke-error-primary h-4 w-4' />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className='aucctus-text-md-medium aucctus-text-brand-primary'>
                    {assumption.statement}
                  </p>
                </li>
              );
            })}
          </ul>

          {/* Add Assumption Button - Dashed Border at Bottom */}
          {!isViewMode && (
            <div className='relative mt-3'>
              <button
                type='button'
                onClick={handleToggleDropdown}
                className={cn(
                  'aucctus-border-secondary aucctus-text-brand-tertiary hover:aucctus-bg-secondary-hover aucctus-text-sm-medium flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 transition-colors',
                  (!conceptUuid || !testUuid) &&
                    'cursor-not-allowed opacity-60',
                )}
                disabled={!conceptUuid || !testUuid}
              >
                <Plus className='aucctus-stroke-primary h-4 w-4' />
                Add assumption
              </button>

              {/* Assumption Dropdown */}
              <AssumptionDropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                availableAssumptions={conceptAssumptions}
                onSelectAssumption={handleSelectAssumption}
                existingAssumptionUuids={new Set(existingAssumptionUuids)}
                existingAssumptionStatements={existingAssumptionStatements}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendedTestSection;
