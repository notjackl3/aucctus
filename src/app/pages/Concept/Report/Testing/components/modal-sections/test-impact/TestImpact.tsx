import React, { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import {
  useTestDetail,
  useTestResults,
  useUpdateTestAssumption,
  useApplyRecommendations,
} from '@hooks/query/testing.hook';
import { markConceptSectionsPending } from '@hooks/query/concepts.hook';
import LoadingState from './components/LoadingState';
import NoDataState from './components/NoDataState';
import AssumptionValidationCard from './components/AssumptionValidationCard';
import RecommendedChangesSection from './components/RecommendedChangesSection';
import TestCompletionLoadingOverlay from './components/TestCompletionLoadingOverlay';
import { ITestAssumptionDetailed } from '../../../types';
import { ITestResult } from '@libs/api/types/concept/testing';
import { useTestCompletion } from '../../../Testing';
import { mapBackendSectionToReportKey } from '@libs/utils/concepts';
import type { ConceptReportStatusBySection } from '@libs/api/types/concept/concepts';
import useStore from '@stores/store';

interface TestImpactProps {
  assumptions?: any[]; // Keep for backward compatibility but won't use
  conceptUuid?: string;
  testUuid?: string;
  onCloseModal?: () => void;
}

const TestImpact: React.FC<TestImpactProps> = ({
  conceptUuid,
  testUuid,
  onCloseModal,
}) => {
  const [updatingAssumptionUuid, setUpdatingAssumptionUuid] = useState<
    string | null
  >(null);

  const queryClient = useQueryClient();
  const conceptIdentifier = useStore((state) => state.conceptReport.identifier);

  // Get completion context to show loading overlay during test completion
  const { isCompletingTest } = useTestCompletion();

  // Fetch test detail to get assumptions and comprehensive recommendations
  // Force refetch when the Impact tab is opened
  const shouldFetchDetail = !!conceptUuid && !!testUuid;
  const {
    testDetail,
    isLoading: isTestDetailLoading,
    refetch: refetchTestDetail,
  } = useTestDetail(conceptUuid || '', testUuid || '');

  // Force refetch test detail when component mounts (when Impact tab is opened)
  useEffect(() => {
    if (shouldFetchDetail) {
      refetchTestDetail();
    }
  }, [shouldFetchDetail, refetchTestDetail]);

  // Fetch test results for assumption validation context
  const { results: fetchedResults, isLoading: isResultsLoading } =
    useTestResults(conceptUuid || '', testUuid || '', {
      enabled: shouldFetchDetail,
    });

  // Use the proper mutation hook for updating test assumptions
  const updateTestAssumptionValidation = useUpdateTestAssumption();

  // Hook for applying recommendations
  const applyRecommendations = useApplyRecommendations();

  // Type cast the results to include extended properties
  const results = fetchedResults as ITestResult[];

  // Extract assumptions and comprehensive recommendations from test detail
  const assumptions: ITestAssumptionDetailed[] = testDetail?.assumptions || [];
  const comprehensiveRecommendations =
    testDetail?.comprehensiveRecommendations || [];

  // Handle validation status change using the mutation hook
  const handleValidationStatusChange = async (
    assumption: ITestAssumptionDetailed,
    newValidationStatus: 'validated' | 'invalidated' | 'untested',
  ) => {
    if (!conceptUuid || !testUuid) {
      return;
    }

    if (updateTestAssumptionValidation.isLoading) {
      return; // Prevent multiple calls while loading
    }

    // Type assertion for the mutation data
    const validationData = {
      validationStatus: newValidationStatus,
    };

    // Set loading state immediately to prevent flicker
    setUpdatingAssumptionUuid(assumption.uuid);

    try {
      await updateTestAssumptionValidation.mutateAsync({
        conceptUuid,
        testUuid,
        assumptionUuid: assumption.uuid,
        data: validationData,
      });
    } catch (error) {
      // Error handling is done by the mutation hook
    } finally {
      // Clear the updating state
      setUpdatingAssumptionUuid(null);
    }
  };

  // Handle applying recommendations
  const handleApplyRecommendations = async (selectedUuids: string[]) => {
    if (!conceptUuid || !testUuid || selectedUuids.length === 0) {
      return;
    }

    const selectedRecommendations = comprehensiveRecommendations.filter((rec) =>
      selectedUuids.includes(rec.uuid),
    );

    const mappedSections = selectedRecommendations
      .map((rec) => mapBackendSectionToReportKey(rec.section))
      .filter(
        (section): section is keyof ConceptReportStatusBySection => !!section,
      );

    const pendingSectionKeys = Array.from(new Set(mappedSections)).map(
      (section) => section as string,
    );

    try {
      await applyRecommendations.mutateAsync({
        conceptUuid,
        testUuid,
        recommendationUuids: selectedUuids,
      });

      if (conceptIdentifier && pendingSectionKeys.length > 0) {
        markConceptSectionsPending(
          queryClient,
          conceptIdentifier,
          pendingSectionKeys,
        );
      }

      // Close the test execution modal after successfully applying recommendations
      if (onCloseModal) {
        onCloseModal();
      }
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  };

  // Show loading state
  if (isTestDetailLoading || isResultsLoading) {
    return <LoadingState />;
  }

  // Calculate data states
  const hasNoAssumptions = assumptions.length === 0;
  const hasNoRecommendations = comprehensiveRecommendations.length === 0;
  const hasNoData = hasNoAssumptions && hasNoRecommendations;
  const hasNoTestResults = !results || results.length === 0;

  // Component should be disabled if there are no test results
  const isDisabled = hasNoTestResults;

  return (
    <div className='relative space-y-6'>
      {/* Loading Overlay for Test Completion */}
      {isCompletingTest && (
        <TestCompletionLoadingOverlay
          title='Completing Test'
          description="We're analyzing your results and preparing recommendations for your next test."
          subtitle='This may take a moment as we process your findings...'
        />
      )}

      <div className={`${isDisabled ? 'pointer-events-none opacity-50' : ''}`}>
        {hasNoData ? (
          <NoDataState />
        ) : (
          <div className='space-y-6'>
            {/* Assumptions Validation Results */}
            {!hasNoAssumptions && (
              <div className='space-y-4'>
                <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                  Assumption Validation Results
                </h4>
                {assumptions.map((assumption) => (
                  <AssumptionValidationCard
                    key={assumption.uuid}
                    assumption={assumption}
                    isUpdating={updatingAssumptionUuid === assumption.uuid}
                    onValidationChange={handleValidationStatusChange}
                  />
                ))}
              </div>
            )}

            {/* Recommended Concept Changes */}
            {!hasNoRecommendations && (
              <RecommendedChangesSection
                recommendations={comprehensiveRecommendations}
                onApplyRecommendations={handleApplyRecommendations}
                isApplying={applyRecommendations.isLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestImpact;
