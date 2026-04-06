import {
  useSyntheticDistributionPreview,
  useTestCollaterals,
} from '@hooks/query/synthetic-execution.hook';
import {
  useTestParticipants,
  useUpdateTestParticipant,
} from '@hooks/query/testing.hook';
import { ICustomerProfile } from '@libs/api/types/concept/concepts';
import { ISyntheticExecutionRequest } from '@libs/api/types/concept/testing';
import telemetry from '@libs/telemetry';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getParticipantSourceUuid } from '../../utils/testUtils';
import CollateralSelectionStep from './components/CollateralSelectionStep';
import ConfigureLaunchStep from './components/ConfigureLaunchStep';
import ParticipantSelectionStep from './components/ParticipantSelectionStep';
import StepNavigation from './components/StepNavigation';
import SyntheticLoadingUI from './components/SyntheticLoadingUI';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  FileText,
  Loader2,
  Users,
  X,
} from 'lucide-react';

interface ISyntheticExecutionPanelProps {
  // Existing props
  status:
    | 'idle'
    | 'starting'
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
  isInitializing?: boolean; // New prop for initialization state
  isExecuting?: boolean; // New prop for execution loading state
  estimatedSeconds?: number | null; // Estimated execution time from timing API
  startTime?: number; // Start time (Unix timestamp) for progress calculation
  quotes?: Array<{ text: string; profileUuid: string }>; // Live quotes from interviews with profile associations
  completedProfileUuids?: Set<string>; // Track which profiles have completed
  onCancel: () => void;

  // New props for configuration
  conceptUuid: string;
  testUuid: string;
  testName?: string;
  onExecute: (config: ISyntheticExecutionRequest) => void;
  onReset: () => void;
  onNavigateToCollateral?: (collateralUuid: string) => void;
  onNavigateToResults?: () => void;
  onCancelSetup?: () => void;
  initialParticipantCounts?: Record<string, number>;
  lockedSkippedParticipants?: Set<string>;
  isCollateralRegenerating?: boolean;
  isViewMode?: boolean;
  profileBasisStale?: boolean;
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
  isInitializing = false,
  isExecuting = false,
  estimatedSeconds,
  startTime,
  quotes = [],
  completedProfileUuids,
  conceptUuid,
  testUuid,
  testName,
  onExecute,
  onReset,
  onCancel,
  onNavigateToCollateral,
  onNavigateToResults,
  onCancelSetup,
  initialParticipantCounts,
  lockedSkippedParticipants,
  isCollateralRegenerating = false,
  isViewMode = false,
  profileBasisStale = false,
}) => {
  // Configuration state
  const [selectedCollateralUuids, setSelectedCollateralUuids] = useState<
    string[]
  >([]);

  // Participant selection state - maps profile UUID to count
  const [participantCounts, setParticipantCounts] = useState<
    Record<string, number>
  >(initialParticipantCounts || {});

  const [syntheticSkippedParticipants, setSyntheticSkippedParticipants] =
    useState<Set<string>>(new Set());

  const lockedParticipants = useMemo(() => {
    if (lockedSkippedParticipants) {
      return new Set(lockedSkippedParticipants);
    }
    return new Set<string>();
  }, [lockedSkippedParticipants]);

  const effectiveSkippedParticipants = useMemo(() => {
    const combined = new Set<string>(lockedParticipants);
    syntheticSkippedParticipants.forEach((uuid) => combined.add(uuid));
    return combined;
  }, [lockedParticipants, syntheticSkippedParticipants]);

  // Hooks for data fetching
  const collateralQuery = useTestCollaterals(conceptUuid, testUuid);
  const collateralOptions = collateralQuery.collaterals;
  const collateralsLoading = collateralQuery.isLoading;
  const refetchCollaterals = collateralQuery.refetch;
  const distributionPreview = useSyntheticDistributionPreview(
    conceptUuid,
    testUuid,
  );

  // Fetch participants - this is the source of truth for which profiles belong to this test
  const { participants, isLoading: participantsLoading } = useTestParticipants(
    conceptUuid,
    testUuid,
    {
      enabled: !!conceptUuid && !!testUuid,
    },
  );

  // Mutation for persisting count changes to backend
  const updateParticipant = useUpdateTestParticipant();

  // Create lookup map: profileUuid/personaUuid → participantUuid
  const profileToParticipantMap = useMemo(() => {
    const map = new Map<string, string>();
    if (participants) {
      participants.forEach((participant) => {
        const sourceUuid = getParticipantSourceUuid(participant);
        if (sourceUuid) {
          const normalizedUuid = normalizeUuid(sourceUuid);
          map.set(normalizedUuid, participant.uuid);
        }
      });
    }
    return map;
  }, [participants]);

  // Map participants to ICustomerProfile format for use in UI components
  // Includes both profile-based and persona-based participants
  const participantProfiles = useMemo((): ICustomerProfile[] => {
    if (!participants || participants.length === 0) {
      return [];
    }
    return participants
      .filter(
        (participant) =>
          (participant.sourceType === 'customer_profile' &&
            participant.customerProfile != null) ||
          (participant.sourceType === 'persona' &&
            participant.personaUuid != null),
      )
      .map((participant) => {
        // TODO: The persona-to-ICustomerProfile coercion below is a known architectural issue.
        // Fixing it properly requires changing how downstream components consume participant data.
        // Tracked for a future refactor.
        if (participant.sourceType === 'persona' && participant.persona) {
          const p = participant.persona;
          return {
            uuid: participant.personaUuid!,
            version: 0,
            name: p.name,
            segment: p.segment,
            description: p.overview || '',
            geoLocation: '',
            familySize: 0,
            ageUpper: 0,
            ageLower: 0,
            ageRange: '',
            incomeUpper: 0,
            incomeLower: 0,
            incomeRange: '',
            avatarUrl: p.avatarUrl ?? undefined,
            isPrimary: true,
            jobs: [] as ICustomerProfile['jobs'],
            pains: [] as ICustomerProfile['pains'],
            journey: [],
            jobsToBeDoneInsight: '',
            painsInsight: '',
            alternativesInsight: '',
            journeyInsight: '',
            customerInsight: '',
            createdAt: '',
            updatedAt: '',
          };
        }
        const cp = participant.customerProfile!;
        return {
          uuid: cp.uuid,
          version: cp.version,
          name: cp.name,
          segment: cp.segment,
          description: cp.description,
          geoLocation: cp.geoLocation,
          familySize: cp.familySize,
          ageUpper: cp.ageUpper,
          ageLower: cp.ageLower,
          ageRange: cp.ageRange,
          incomeUpper: cp.incomeUpper,
          incomeLower: cp.incomeLower,
          incomeRange: cp.incomeRange,
          avatarUrl: cp.avatarUrl,
          isPrimary: cp.isPrimary,
          // Cast jobs/pains since participant.customerProfile has slightly different icon type
          jobs: (cp.jobs || []) as ICustomerProfile['jobs'],
          pains: (cp.pains || []) as ICustomerProfile['pains'],
          journey: [],
          jobsToBeDoneInsight: cp.jobsToBeDoneInsight,
          painsInsight: cp.painsInsight,
          alternativesInsight: cp.alternativesInsight,
          journeyInsight: cp.journeyInsight,
          customerInsight: cp.customerInsight,
          createdAt: cp.createdAt,
          updatedAt: cp.updatedAt,
        };
      });
  }, [participants]);

  // Handler to persist count change to backend
  const handlePersistCountChange = useCallback(
    (profileUuid: string, newCount: number) => {
      const participantUuid = profileToParticipantMap.get(profileUuid);
      if (!participantUuid) {
        telemetry.warn('synthetic.execution.persist_count.no_participant', {
          conceptUuid,
          testUuid,
          profileUuid,
        });
        return;
      }

      updateParticipant.mutate({
        conceptUuid,
        testUuid,
        participantUuid,
        data: { count: newCount },
      });
    },
    [conceptUuid, testUuid, profileToParticipantMap, updateParticipant],
  );

  // Clear selected collaterals when regeneration completes to avoid stale UUIDs
  const prevRegeneratingRef = React.useRef(isCollateralRegenerating);
  React.useEffect(() => {
    // Detect when regeneration transitions from true to false (completion)
    if (prevRegeneratingRef.current && !isCollateralRegenerating) {
      setSelectedCollateralUuids([]);
      if (conceptUuid && testUuid) {
        // Ensure synthetic panel sees the freshly generated collateral list
        refetchCollaterals();
      }
    }
    prevRegeneratingRef.current = isCollateralRegenerating;
  }, [conceptUuid, testUuid, isCollateralRegenerating, refetchCollaterals]);

  // Set of valid profile UUIDs from current participant profiles (handles profile regeneration)
  const validProfileUuids = useMemo(() => {
    return new Set(participantProfiles.map((p) => normalizeUuid(p.uuid)));
  }, [participantProfiles]);

  // Computed values - filter by valid profile UUIDs to handle regenerated profiles
  const totalTests = useMemo(() => {
    return Object.entries(participantCounts)
      .filter(([uuid]) => !effectiveSkippedParticipants.has(uuid))
      .filter(
        ([uuid]) => validProfileUuids.size === 0 || validProfileUuids.has(uuid),
      )
      .reduce((sum, [, count]) => sum + count, 0);
  }, [participantCounts, effectiveSkippedParticipants, validProfileUuids]);

  // Filter profiles to only show selected ones for loading UI
  const selectedProfiles = useMemo(() => {
    const filtered = participantProfiles.filter((profile) => {
      const normalizedUuid = normalizeUuid(profile.uuid);
      const isNotSkipped = !effectiveSkippedParticipants.has(normalizedUuid);
      const hasCount = participantCounts[normalizedUuid] > 0;

      return isNotSkipped && hasCount;
    });

    return filtered;
  }, [participantProfiles, effectiveSkippedParticipants, participantCounts]);

  // Storage key for preserving execution configuration
  const executionConfigKey = `synthetic-execution-config-${conceptUuid}-${testUuid}`;

  // Save execution configuration when it changes (during active execution)
  useEffect(() => {
    if (
      status !== 'idle' &&
      (Object.keys(participantCounts).length > 0 ||
        syntheticSkippedParticipants.size > 0)
    ) {
      const config = {
        participantCounts,
        skippedParticipants: Array.from(syntheticSkippedParticipants),
        timestamp: Date.now(),
      };
      sessionStorage.setItem(executionConfigKey, JSON.stringify(config));
    } else if (status === 'idle') {
      // Clean up storage when execution is idle
      sessionStorage.removeItem(executionConfigKey);
    }
  }, [
    participantCounts,
    syntheticSkippedParticipants,
    status,
    executionConfigKey,
  ]);

  // Sync participant counts and skipped state when API data changes
  // This ensures changes made on Participants tab are reflected in Execute tab
  // IMPORTANT: Only sync when idle - during running/completed, use session storage config
  useEffect(() => {
    // Don't sync with server data while test is running - rely on session storage config instead
    // This prevents overwriting the execution config with all participants from the API
    if (status !== 'idle') {
      return;
    }

    const hasInitialCounts =
      initialParticipantCounts &&
      Object.keys(initialParticipantCounts).length > 0;

    if (!hasInitialCounts) {
      return;
    }

    const skippedFromServer = new Set<string>();
    const unskippedFromServer = new Set<string>();

    Object.entries(initialParticipantCounts).forEach(([uuid, count]) => {
      if (count === 0) {
        skippedFromServer.add(uuid);
      } else {
        unskippedFromServer.add(uuid);
      }
    });

    setSyntheticSkippedParticipants((prev) => {
      const updated = new Set(prev);

      // Add server-skipped profiles
      skippedFromServer.forEach((uuid) => updated.add(uuid));

      // Remove profiles that server says are NOT skipped (user unskipped on Participants tab)
      unskippedFromServer.forEach((uuid) => updated.delete(uuid));

      return updated;
    });

    setParticipantCounts(initialParticipantCounts);
  }, [initialParticipantCounts, status]);

  // Fallback initialization (session restore or default counts)
  useEffect(() => {
    const hasInitialCountsProp =
      initialParticipantCounts &&
      Object.keys(initialParticipantCounts).length > 0;

    // During running/completed states, prioritize session storage over initialParticipantCounts
    // This preserves the actual execution configuration (which profiles were selected)
    const isExecuting = status !== 'idle';

    // Skip if we have initial counts AND we're idle (normal setup flow)
    if (hasInitialCountsProp && !isExecuting) {
      return;
    }

    const shouldInitialize =
      participantProfiles.length > 0 &&
      Object.keys(participantCounts).length === 0;

    // During execution, always try to restore from session storage even if counts exist
    // This handles the case where navigation caused counts to be cleared
    const shouldRestoreForExecution =
      isExecuting && participantProfiles.length > 0;

    if (!shouldInitialize && !shouldRestoreForExecution) {
      return;
    }

    const savedConfig = sessionStorage.getItem(executionConfigKey);
    if (savedConfig && isExecuting) {
      try {
        const config = JSON.parse(savedConfig);
        const configAge = Date.now() - config.timestamp;

        if (configAge < 60 * 60 * 1000) {
          // Only restore if current counts are empty or different from saved
          const currentCountsEmpty =
            Object.keys(participantCounts).length === 0;
          const savedCountsJson = JSON.stringify(config.participantCounts);
          const currentCountsJson = JSON.stringify(participantCounts);

          if (currentCountsEmpty || savedCountsJson !== currentCountsJson) {
            setParticipantCounts(config.participantCounts);
            setSyntheticSkippedParticipants(
              new Set(config.skippedParticipants || []),
            );
          }
          return;
        }
      } catch (error) {
        telemetry.warn('synthetic.execution.config.restore_failed', {
          conceptUuid,
          testUuid,
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    if (status === 'idle') {
      const defaultCounts: Record<string, number> = {};
      participantProfiles.forEach((profile) => {
        const normalizedUuid = normalizeUuid(profile.uuid);
        defaultCounts[normalizedUuid] = 5;
      });

      setParticipantCounts(defaultCounts);
      setSyntheticSkippedParticipants(new Set());
    }
  }, [
    participantProfiles,
    status,
    participantCounts,
    executionConfigKey,
    conceptUuid,
    testUuid,
    initialParticipantCounts,
  ]);

  // Detect and fix stale participant counts (when profiles have been regenerated)
  // This effect reinitializes counts when ALL existing counts reference stale/deleted profiles
  useEffect(() => {
    if (
      participantProfiles.length === 0 ||
      Object.keys(participantCounts).length === 0
    ) {
      return;
    }

    // Check if any of the current participant counts match valid profile UUIDs
    const hasAnyValidCount = Object.keys(participantCounts).some((uuid) =>
      validProfileUuids.has(uuid),
    );

    // If ALL counts are stale (none match current profiles), reinitialize with defaults
    if (!hasAnyValidCount) {
      // eslint-disable-next-line no-console
      console.warn(
        '[SyntheticExecutionPanel] All participant counts reference stale profile UUIDs. ' +
          'Reinitializing with current profiles. This typically happens after profiles are regenerated.',
      );

      const defaultCounts: Record<string, number> = {};
      participantProfiles.forEach((profile) => {
        const normalizedUuid = normalizeUuid(profile.uuid);
        // Use 5 as the default count per profile
        defaultCounts[normalizedUuid] = 5;
      });

      setParticipantCounts(defaultCounts);
      setSyntheticSkippedParticipants(new Set());
    }
  }, [participantProfiles, participantCounts, validProfileUuids]);

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
                .filter(([uuid]) => !effectiveSkippedParticipants.has(uuid))
                // Filter to only include valid profile UUIDs (handles regenerated profiles)
                .filter(([uuid]) => validProfileUuids.has(uuid))
                .map(([uuid, count]) => [uuid, count]), // Send raw counts, backend will normalize
            )
          : undefined,
    }),
    [
      totalTests,
      selectedCollateralUuids,
      participantCounts,
      effectiveSkippedParticipants,
      validProfileUuids,
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

  // Auto-trigger distribution preview when totalTests changes
  useEffect(() => {
    if (totalTests > 0 && totalTests <= 100) {
      distributionPreview
        .mutateAsync({
          totalTests,
          collateralUuid:
            // Don't send collateral UUID if it's regenerating (old UUID may be invalid)
            isCollateralRegenerating
              ? undefined
              : selectedCollateralUuids.length === 1
                ? selectedCollateralUuids[0]
                : undefined,
        })
        .catch(() => {
          // Error handled by the hook
        });
    }
    // Ignore distribution preview mutation, it causes an infinite when included in the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalTests, selectedCollateralUuids, isCollateralRegenerating]);

  // Step validation
  const isStep1Complete = totalTests >= 1; // Participants step (for now, just check totalTests)
  const isStep2Complete = selectedCollateralUuids.length > 0; // Collateral step
  const isStep3Complete = isStep1Complete && isStep2Complete; // Configure & Launch step

  const isReady =
    isStep3Complete &&
    totalTests >= 1 &&
    totalTests <= 100 &&
    status === 'idle' &&
    !isExecuting;
  const collateralBlockedMessage = profileBasisStale
    ? 'Customer profiles or personas have changed. Review participants and acknowledge changes before running a synthetic test.'
    : isCollateralRegenerating
      ? 'Collateral is regenerating. Wait until the update finishes before running a synthetic test.'
      : undefined;

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
    setParticipantCounts((prev) => ({
      ...prev,
      [normalizedUuid]: 0,
    }));

    setSyntheticSkippedParticipants((prev) => {
      if (!prev.has(normalizedUuid)) {
        return prev;
      }
      const updated = new Set(prev);
      updated.delete(normalizedUuid);
      return updated;
    });
  };

  const handleSkipParticipant = (profileUuid: string) => {
    const normalizedUuid = normalizeUuid(profileUuid);

    if (lockedParticipants.has(normalizedUuid)) {
      return;
    }

    setParticipantCounts((prev) => ({
      ...prev,
      [normalizedUuid]: 0,
    }));

    setSyntheticSkippedParticipants((prev) => {
      const updated = new Set(prev);
      updated.add(normalizedUuid);
      return updated;
    });

    // Persist count=0 to backend
    handlePersistCountChange(normalizedUuid, 0);
  };

  const handleUnskipParticipant = (profileUuid: string) => {
    const normalizedUuid = normalizeUuid(profileUuid);

    if (lockedParticipants.has(normalizedUuid)) {
      return;
    }

    setSyntheticSkippedParticipants((prev) => {
      if (!prev.has(normalizedUuid)) {
        return prev;
      }
      const updated = new Set(prev);
      updated.delete(normalizedUuid);
      return updated;
    });

    const defaultCount = 5;
    setParticipantCounts((prev) => ({
      ...prev,
      [normalizedUuid]: prev[normalizedUuid] || defaultCount,
    }));

    // Persist restored count to backend
    handlePersistCountChange(normalizedUuid, defaultCount);
  };

  return (
    <div className='space-y-6'>
      {/* View Mode - Completed Summary */}
      {isViewMode && (
        <div className='space-y-6'>
          {/* Header Card */}
          <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border border-l-4 border-l-emerald-500 shadow-sm'>
            <div className='px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='aucctus-bg-success-subtle rounded-full p-3'>
                    <Check className='aucctus-stroke-success-primary h-6 w-6' />
                  </div>
                  <div>
                    <h2 className='aucctus-text-primary text-2xl font-bold'>
                      Test Completed
                    </h2>
                    <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
                      Synthetic interviews were executed successfully
                    </p>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className='flex items-center gap-12'>
                  <div className='flex items-center gap-3'>
                    <div className='aucctus-bg-brand-secondary rounded-lg p-2'>
                      <Users className='aucctus-stroke-brand-primary h-4 w-4' />
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
                      <FileText className='aucctus-stroke-brand-primary h-4 w-4' />
                    </div>
                    <div>
                      <div className='aucctus-text-xl-bold aucctus-text-primary'>
                        {collateralOptions?.length || '-'}
                      </div>
                      <div className='aucctus-text-xs aucctus-text-secondary'>
                        Collateral
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Participants Used - Reuse ParticipantSelectionStep in read-only mode */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
            <div className='px-6 py-4'>
              <StepNavigation
                stepNumber={1}
                title='Participants Used'
                description='Customer profiles that participated in this test'
                isComplete={true}
              />
              <div className='pointer-events-none opacity-80'>
                <ParticipantSelectionStep
                  profiles={participantProfiles}
                  participantCounts={participantCounts}
                  skippedParticipants={effectiveSkippedParticipants}
                  lockedParticipants={new Set(Object.keys(participantCounts))}
                  onParticipantCountChange={() => {}}
                  onRemoveParticipant={() => {}}
                  onSkipParticipant={() => {}}
                  onUnskipParticipant={() => {}}
                  onPersistCountChange={() => {}}
                  isLoading={participantsLoading}
                />
              </div>
            </div>
          </div>

          {/* Collateral Used - Reuse CollateralSelectionStep in read-only mode */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
            <div className='px-6 py-4'>
              <StepNavigation
                stepNumber={2}
                title='Collateral Used'
                description='Materials used for synthetic interviews'
                isComplete={true}
              />
              <div className='pointer-events-none opacity-80'>
                <CollateralSelectionStep
                  collaterals={collateralOptions}
                  selectedCollateralUuids={
                    collateralOptions?.map((c) => c.uuid) || []
                  }
                  onSelectionChange={() => {}}
                  isLoading={collateralsLoading}
                  maxSelection={collateralOptions?.length || 4}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Preview Section - Hide when execution is running or in view mode */}
      {status === 'idle' && !isViewMode && (
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
                    <Users className='aucctus-stroke-brand-primary h-4 w-4' />
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
                    <FileText className='aucctus-stroke-brand-primary h-4 w-4' />
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
                    <Clock className='aucctus-stroke-brand-primary h-4 w-4' />
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

      {/* Step-based Configuration - Only show when idle and not in view mode */}
      {status === 'idle' && !isViewMode && (
        <div className='space-y-6'>
          {/* Step 1: Select Participants */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
            <div className='px-6 py-4'>
              <StepNavigation
                stepNumber={1}
                title='Confirm Participants'
                description='Review participant selection from the Participants tab'
                isComplete={isStep1Complete}
              />

              <ParticipantSelectionStep
                profiles={participantProfiles}
                participantCounts={participantCounts}
                skippedParticipants={effectiveSkippedParticipants}
                lockedParticipants={lockedParticipants}
                onParticipantCountChange={handleParticipantCountChange}
                onRemoveParticipant={handleRemoveParticipant}
                onSkipParticipant={handleSkipParticipant}
                onUnskipParticipant={handleUnskipParticipant}
                onPersistCountChange={handlePersistCountChange}
                isLoading={participantsLoading}
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
                collaterals={collateralOptions}
                selectedCollateralUuids={selectedCollateralUuids}
                onSelectionChange={handleCollateralSelectionChange}
                isLoading={collateralsLoading || isCollateralRegenerating}
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
                  onCancel={onCancelSetup}
                  isLoading={isExecuting}
                  disabledReason={collateralBlockedMessage}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Loading UI - Show during execution states */}
      {(status === 'running' || status === 'completed') && (
        <SyntheticLoadingUI
          progress={isInitializing ? undefined : progress}
          status={status}
          message={isInitializing ? 'Reconnecting...' : message}
          currentStage={currentStage}
          profiles={selectedProfiles}
          currentPersona={currentPersona}
          totalPersonas={totalPersonas}
          resultsCount={resultsCount}
          isInitializing={isInitializing}
          quotes={quotes}
          completedProfileUuids={completedProfileUuids}
          estimatedSeconds={estimatedSeconds}
          startTime={startTime}
          conceptUuid={conceptUuid}
          testUuid={testUuid}
          testName={testName}
          plannedParticipantCounts={participantCounts}
          onViewResults={onNavigateToResults}
        />
      )}

      {/* Cancelling State - Modern UI */}
      {status === 'cancelling' && (
        <div className='p-6'>
          <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border shadow-sm'>
            {/* Left border accent */}
            <div className='aucctus-border-error border-l-4'>
              <div className='p-6'>
                <div className='mb-4'>
                  <h2 className='aucctus-text-primary mb-1 flex items-center gap-3 text-2xl font-bold'>
                    <Loader2 className='aucctus-stroke-error-primary h-6 w-6 animate-spin' />
                    Cancelling Test
                  </h2>
                  <p className='aucctus-text-secondary aucctus-text-sm'>
                    Stopping current operations and cleaning up...
                  </p>
                </div>

                {/* Animated Progress Bar with Message */}
                <div className='space-y-1.5'>
                  <p className='aucctus-text-secondary aucctus-text-xs text-right'>
                    This may take up to 2 minutes as we wait for in-flight
                    operations to complete.
                  </p>
                  <div className='aucctus-bg-secondary-subtle h-3 overflow-hidden rounded-full'>
                    <div
                      className='aucctus-bg-error-solid h-full animate-pulse rounded-full'
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error and Cancelled States - Legacy Section */}
      {(status === 'error' || status === 'cancelled') && (
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
                    : 'Interview generation cancelled'}
                </p>
              </div>
              <div className='text-right'>
                <div className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
                  {progress}%
                </div>
                <div className='aucctus-text-xs aucctus-text-secondary'>
                  Complete
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
                <AlertCircle className='aucctus-stroke-white h-4 w-4' />
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

      {/* Action Buttons */}
      {(status === 'running' || status === 'starting') && (
        <div className='aucctus-border-secondary border-t p-6'>
          <div className='flex justify-end'>
            <button
              className='btn btn-danger btn-sm flex items-center gap-2'
              onClick={onCancel}
            >
              <X className='aucctus-stroke-white h-4 w-4' />
              Cancel Execution
            </button>
          </div>
        </div>
      )}

      {/* Back Button for Completed State */}
      {status === 'completed' && (
        <div className='aucctus-border-secondary border-t p-6'>
          <button
            className='btn btn-light btn-sm flex items-center gap-2'
            onClick={onReset}
          >
            <ArrowLeft className='aucctus-stroke-secondary h-4 w-4' />
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(SyntheticExecutionPanel);
