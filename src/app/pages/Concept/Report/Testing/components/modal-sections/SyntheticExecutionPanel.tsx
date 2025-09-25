import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import {
  useSyntheticDistributionPreview,
  useTestCollaterals,
} from '@hooks/query/synthetic-execution.hook';
import { useConceptCustomerProfiles } from '@hooks/query/concepts.hook';
import {
  ISyntheticExecutionRequest,
  ITestCollateralOption,
} from '@libs/api/types/concept/testing';
import StepNavigation from './components/StepNavigation';
import ParticipantSelectionStep from './components/ParticipantSelectionStep';
import CollateralSelectionStep from './components/CollateralSelectionStep';
import ConfigureLaunchStep from './components/ConfigureLaunchStep';
import SyntheticLoadingUI from './components/SyntheticLoadingUI';

interface ISyntheticExecutionPanelProps {
  // Existing props
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
  onCancel: () => void;

  // New props for configuration
  conceptUuid: string;
  testUuid: string;
  onExecute: (config: ISyntheticExecutionRequest) => void;
  onReset: () => void;
  onNavigateToCollateral?: (collateralUuid: string) => void;
  onNavigateToResults?: () => void;
}

/**
 * Utility function to normalize UUID format from underscores to hyphens
 * This ensures consistency between frontend state and backend expectations
 */
const normalizeUuid = (uuid: string): string => uuid.replace(/_/g, '-');

const SyntheticExecutionPanel: React.FC<ISyntheticExecutionPanelProps> = ({
  status,
  progress,
  message,
  currentStage,
  currentPersona,
  totalPersonas,
  resultsCount,
  error,
  onCancel,
  conceptUuid,
  testUuid,
  onExecute,
  onReset,
  onNavigateToCollateral,
  onNavigateToResults,
}) => {
  // Configuration state
  const [selectedCollateralUuids, setSelectedCollateralUuids] = useState<
    string[]
  >([]);

  // Participant selection state - maps profile UUID to count
  const [participantCounts, setParticipantCounts] = useState<
    Record<string, number>
  >({});
  const [skippedParticipants, setSkippedParticipants] = useState<Set<string>>(
    new Set(),
  );

  // Hooks for data fetching
  const { data: collaterals, isLoading: collateralsLoading } =
    useTestCollaterals(conceptUuid, testUuid);
  const { profiles, isLoading: profilesLoading } =
    useConceptCustomerProfiles(conceptUuid);
  const distributionPreview = useSyntheticDistributionPreview(
    conceptUuid,
    testUuid,
  );

  // Computed values
  const totalTests = useMemo(() => {
    return Object.entries(participantCounts)
      .filter(([uuid]) => !skippedParticipants.has(uuid))
      .reduce((sum, [, count]) => sum + count, 0);
  }, [participantCounts, skippedParticipants]);

  // Filter profiles to only show selected ones for loading UI
  const selectedProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const normalizedUuid = normalizeUuid(profile.uuid);
      return (
        !skippedParticipants.has(normalizedUuid) &&
        participantCounts[normalizedUuid] > 0
      );
    });
  }, [profiles, skippedParticipants, participantCounts]);

  // Initialize participant counts when profiles load (but not during execution)
  useEffect(() => {
    if (profiles.length > 0 && status === 'idle') {
      const initialCounts: Record<string, number> = {};
      profiles.forEach((profile) => {
        // Ensure UUID format is consistent (hyphens, not underscores)
        const normalizedUuid = normalizeUuid(profile.uuid);
        initialCounts[normalizedUuid] = 5; // Default to 5 variants per profile
      });

      setParticipantCounts(initialCounts);

      // Also reset skipped participants to ensure clean state
      setSkippedParticipants(new Set());
    }
  }, [profiles, status]); // Only reset when status is idle

  // Memoized configuration object
  const executionConfig = useMemo(
    (): ISyntheticExecutionRequest => ({
      total_tests: totalTests,
      collateral_uuids:
        selectedCollateralUuids.length > 0
          ? selectedCollateralUuids
          : undefined,
      distribution_weights:
        Object.keys(participantCounts).length > 0
          ? Object.fromEntries(
              Object.entries(participantCounts)
                .filter(([uuid]) => !skippedParticipants.has(uuid))
                .map(([uuid, count]) => [uuid, count]), // Send raw counts, backend will normalize
            )
          : undefined,
    }),
    [
      totalTests,
      selectedCollateralUuids,
      participantCounts,
      skippedParticipants,
    ],
  );

  // Handler functions
  const handleExecute = () => {
    // Validate that at least one collateral is selected
    if (selectedCollateralUuids.length === 0) {
      // You can add toast notification here if needed
      return;
    }

    onExecute(executionConfig);
  };

  const handlePreviewDistribution = async () => {
    try {
      await distributionPreview.mutateAsync({
        totalTests,
        collateralUuid:
          selectedCollateralUuids.length === 1
            ? selectedCollateralUuids[0]
            : undefined,
      });
    } catch (error) {
      // Error handled by the hook
    }
  };

  // Auto-trigger distribution preview when totalTests changes
  useEffect(() => {
    if (totalTests > 0 && totalTests <= 100) {
      handlePreviewDistribution();
    }
  }, [totalTests]);

  // Step validation
  const isStep1Complete = totalTests >= 1; // Participants step (for now, just check totalTests)
  const isStep2Complete = selectedCollateralUuids.length > 0; // Collateral step
  const isStep3Complete = isStep1Complete && isStep2Complete; // Configure & Launch step

  const isReady = isStep3Complete && totalTests >= 1 && totalTests <= 100;

  // Collateral selection handler
  const handleCollateralSelectionChange = (uuids: string[]) => {
    setSelectedCollateralUuids(uuids);
  };

  // Participant count handlers
  const handleParticipantCountChange = (
    profileUuid: string,
    newCount: number,
  ) => {
    if (newCount < 1) newCount = 1; // Minimum 1 variant per participant
    if (newCount > 20) newCount = 20; // Max 20 variants per participant

    // Ensure UUID format is consistent (hyphens, not underscores)
    const normalizedUuid = normalizeUuid(profileUuid);
    setParticipantCounts((prev) => ({
      ...prev,
      [normalizedUuid]: newCount,
    }));
  };

  const handleRemoveParticipant = (profileUuid: string) => {
    // Ensure UUID format is consistent (hyphens, not underscores)
    const normalizedUuid = normalizeUuid(profileUuid);
    setParticipantCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[normalizedUuid];
      return newCounts;
    });
    // Also remove from skipped if it was skipped
    setSkippedParticipants((prev) => {
      const newSkipped = new Set(prev);
      newSkipped.delete(normalizedUuid);
      return newSkipped;
    });
  };

  const handleSkipParticipant = (profileUuid: string) => {
    // Ensure UUID format is consistent (hyphens, not underscores)
    const normalizedUuid = normalizeUuid(profileUuid);
    // Remove from participant counts completely
    setParticipantCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[normalizedUuid];
      return newCounts;
    });
    // Add to skipped set
    setSkippedParticipants((prev) => new Set(prev).add(normalizedUuid));
  };

  const handleUnskipParticipant = (profileUuid: string) => {
    // Ensure UUID format is consistent (hyphens, not underscores)
    const normalizedUuid = normalizeUuid(profileUuid);
    // Remove from skipped set
    setSkippedParticipants((prev) => {
      const newSkipped = new Set(prev);
      newSkipped.delete(normalizedUuid);
      return newSkipped;
    });
    // Add back to participant counts with default value
    setParticipantCounts((prev) => ({
      ...prev,
      [normalizedUuid]: 5,
    }));
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'aucctus-text-brand-primary';
      case 'cancelling':
        return 'aucctus-text-warning-primary';
      case 'completed':
        return 'aucctus-text-success-primary';
      case 'error':
        return 'aucctus-text-error-primary';
      case 'cancelled':
        return 'aucctus-text-secondary';
      default:
        return 'aucctus-text-secondary';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return 'loading-02';
      case 'cancelling':
        return 'loading-02';
      case 'completed':
        return 'check';
      case 'error':
        return 'alert-circle';
      case 'cancelled':
        return 'closeX';
      default:
        return 'ai-conclusion';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'idle':
        return 'Ready to Execute';
      case 'running':
        return 'Execution in Progress';
      case 'cancelling':
        return 'Cancelling Execution';
      case 'completed':
        return 'Execution Completed';
      case 'error':
        return 'Execution Failed';
      case 'cancelled':
        return 'Execution Cancelled';
      default:
        return 'Ready to Execute';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Test Preview Section - Hide when execution is running */}
      {status === 'idle' && (
        <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border border-l-4 border-l-black shadow-sm'>
          <div className='px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='aucctus-text-primary text-3xl font-bold'>
                  Test Preview
                </h2>
                <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
                  Synthetic 1-1 Customer Interviews
                </p>
              </div>

              {/* Metrics Row */}
              <div className='flex items-center gap-12'>
                <div className='flex items-center gap-3'>
                  <div className='aucctus-bg-brand-secondary rounded-lg p-2'>
                    <Icon
                      variant='users-03'
                      className='aucctus-stroke-brand-primary h-4 w-4'
                    />
                  </div>
                  <div>
                    <div className='aucctus-text-xl-bold aucctus-text-primary'>
                      {totalTests}
                    </div>
                    <div className='aucctus-text-xs aucctus-text-secondary'>
                      Participants
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='aucctus-bg-brand-secondary rounded-lg p-2'>
                    <Icon
                      variant='file-attachment'
                      className='aucctus-stroke-brand-primary h-4 w-4'
                    />
                  </div>
                  <div>
                    <div className='aucctus-text-xl-bold aucctus-text-primary'>
                      {selectedCollateralUuids.length}
                    </div>
                    <div className='aucctus-text-xs aucctus-text-secondary'>
                      Collateral
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='aucctus-bg-brand-secondary rounded-lg p-2'>
                    <Icon
                      variant='clock'
                      className='aucctus-stroke-brand-primary h-4 w-4'
                    />
                  </div>
                  <div>
                    <div className='aucctus-text-xl-bold aucctus-text-primary'>
                      5-10 min
                    </div>
                    <div className='aucctus-text-xs aucctus-text-secondary'>
                      Runtime
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step-based Configuration - Only show when idle */}
      {status === 'idle' && (
        <div className='space-y-6'>
          {/* Step 1: Select Participants */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
            <div className='px-6 py-4'>
              <StepNavigation
                stepNumber={1}
                title='Select Participants'
                description='Choose participant profiles for your synthetic test'
                isComplete={isStep1Complete}
              />

              <ParticipantSelectionStep
                profiles={profiles}
                participantCounts={participantCounts}
                skippedParticipants={skippedParticipants}
                onParticipantCountChange={handleParticipantCountChange}
                onRemoveParticipant={handleRemoveParticipant}
                onSkipParticipant={handleSkipParticipant}
                onUnskipParticipant={handleUnskipParticipant}
                isLoading={profilesLoading}
              />
            </div>
          </div>

          {/* Step 2: Select Collateral */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
            <div className='px-6 py-4'>
              <StepNavigation
                stepNumber={2}
                title='Select Collateral'
                description='Choose materials for your synthetic interviews'
                isComplete={isStep2Complete}
              />

              <CollateralSelectionStep
                collaterals={collaterals || []}
                selectedCollateralUuids={selectedCollateralUuids}
                onSelectionChange={handleCollateralSelectionChange}
                isLoading={collateralsLoading}
                maxSelection={4}
                onNavigateToCollateral={onNavigateToCollateral}
              />
            </div>
          </div>

          {/* Step 3: Configure & Launch */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
            <div className='px-6 py-4'>
              <div className='flex items-center justify-between'>
                <StepNavigation
                  stepNumber={3}
                  title='Configure & Launch'
                  description='Ready to start your synthetic test'
                  isComplete={isStep3Complete}
                />

                <ConfigureLaunchStep
                  isReady={isReady}
                  onExecute={handleExecute}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Loading UI - Show during execution states */}
      {(status === 'running' || status === 'completed') && (
        <SyntheticLoadingUI
          progress={progress}
          status={status}
          message={message}
          currentStage={currentStage}
          profiles={selectedProfiles}
          currentPersona={currentPersona}
          totalPersonas={totalPersonas}
          resultsCount={resultsCount}
          onViewResults={onNavigateToResults}
        />
      )}

      {/* Legacy Progress Section - Show for error/cancelled states */}
      {(status === 'cancelling' ||
        status === 'error' ||
        status === 'cancelled') && (
        <div className='aucctus-border-secondary border-t p-6'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='aucctus-text-sm-semibold aucctus-text-primary'>
                  Execution Progress
                </h4>
                <p className='aucctus-text-xs aucctus-text-secondary'>
                  {status === 'error'
                    ? 'Interview generation failed'
                    : status === 'cancelled'
                      ? 'Interview generation cancelled'
                      : status === 'cancelling'
                        ? 'Stopping current operations'
                        : 'Generating synthetic customer interviews...'}
                </p>
              </div>
              <div className='text-right'>
                <div className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
                  {status === 'cancelling' ? '' : `${progress}%`}
                </div>
                <div className='aucctus-text-xs aucctus-text-secondary'>
                  {status === 'cancelling' ? '' : 'Complete'}
                </div>
              </div>
            </div>
            <div className='aucctus-bg-secondary-subtle h-3 overflow-hidden rounded-full'>
              <div
                className='aucctus-bg-brand-primary h-full rounded-full transition-all duration-500 ease-out'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {status === 'error' && error && (
        <div className='aucctus-border-error border-t p-6'>
          <div className='aucctus-bg-error-subtle rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <div className='aucctus-bg-error-primary mt-0.5 rounded-full p-1.5'>
                <Icon
                  variant='alert-circle'
                  className='aucctus-stroke-white h-4 w-4'
                />
              </div>
              <div className='flex-1'>
                <h4 className='aucctus-text-sm-semibold aucctus-text-error-primary mb-1'>
                  Execution Failed
                </h4>
                <p className='aucctus-text-sm aucctus-text-error-primary'>
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Cancel button removed */}

      {/* Back Button for Completed State */}
      {status === 'completed' && (
        <div className='aucctus-border-secondary border-t p-6'>
          <button
            className='btn btn-light btn-sm flex items-center gap-2'
            onClick={onReset}
          >
            <Icon
              variant='arrowleft'
              className='aucctus-stroke-secondary h-4 w-4'
            />
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(SyntheticExecutionPanel);
