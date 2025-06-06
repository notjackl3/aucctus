import React, { useState } from 'react';
import { Icon, ComponentTooltip } from '@components';
import {
  useTestDetail,
  useTestResults,
  useUpdateTestAssumption,
} from '@hooks/query/testing.hook';
import LoadingState from './components/LoadingState';
import NoDataState from './components/NoDataState';
import AssumptionValidationCard from './components/AssumptionValidationCard';
import RecommendedChangesSection from './components/RecommendedChangesSection';

interface TestImpactProps {
  assumptions?: any[]; // Keep for backward compatibility but won't use
  conceptUuid?: string;
  testUuid?: string;
}

// Interface for assumptions from test detail endpoint (matches the actual API response)
interface TestAssumption {
  uuid: string;
  testDetailsUuid: string;
  assumptionUuid: string;
  validationType:
    | 'validated'
    | 'unvalidated'
    | 'partiallyValidated'
    | 'noChange'
    | 'invalidated';
  benchmark: string;
  statement: string;
  importance: number;
  category: string;
  certainty: number;
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
  testName: string;
  createdAt: string;
  updatedAt: string;
}

interface EditRecommendation {
  title: string;
  reason: string;
  section: string;
  description: string;
  testEvidence: string;
}

// Extended interface to include additional properties from API response
interface ExtendedTestResult {
  uuid: string;
  title: string;
  description?: string;
  fileType: string;
  testDetailsUuid: string;
  sourceUuid: string;
  fileUrl: string;
  filePath: string;
  fileSize: number;
  originalFilename: string;
  summary?: string;
  learnings?: Array<{
    uuid: string;
    learning: string;
    impact: string;
    testResultUuid: string;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  editRecommendations?: EditRecommendation[];
}

const TestImpact: React.FC<TestImpactProps> = ({ conceptUuid, testUuid }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [updatingAssumptionUuid, setUpdatingAssumptionUuid] = useState<
    string | null
  >(null);

  // Fetch test detail to get assumptions
  const shouldFetchDetail = !!conceptUuid && !!testUuid;
  const { testDetail, isLoading: isTestDetailLoading } = useTestDetail(
    conceptUuid || '',
    testUuid || '',
  );

  // Fetch test results to get recommendations
  const { results: fetchedResults, isLoading: isResultsLoading } =
    useTestResults(conceptUuid || '', testUuid || '', {
      enabled: shouldFetchDetail,
    });

  // Use the proper mutation hook for updating test assumptions
  const updateTestAssumptionValidation = useUpdateTestAssumption();

  // Type cast the results to include extended properties
  const results = fetchedResults as ExtendedTestResult[];

  // Extract assumptions and recommendations
  // Cast the assumptions to our extended interface since the API returns more data than the base ITestAssumption
  const assumptions = (testDetail?.assumptions ||
    []) as unknown as TestAssumption[];

  const recommendations =
    results && results.length > 0 ? results[0].editRecommendations || [] : [];

  // Handle validation type change using the mutation hook
  const handleValidationTypeChange = async (
    assumption: TestAssumption,
    newValidationType:
      | 'validated'
      | 'unvalidated'
      | 'partiallyValidated'
      | 'noChange'
      | 'invalidated',
  ) => {
    if (!conceptUuid || !testUuid) {
      return;
    }

    if (updateTestAssumptionValidation.isLoading) {
      return; // Prevent multiple calls while loading
    }

    // Set loading state immediately to prevent flicker
    setUpdatingAssumptionUuid(assumption.uuid);

    try {
      await updateTestAssumptionValidation.mutateAsync({
        conceptUuid,
        testUuid,
        assumptionUuid: assumption.uuid,
        data: { validationType: newValidationType },
      });
    } catch (error) {
      // Error handling is done by the mutation hook
    } finally {
      // Clear the updating state
      setUpdatingAssumptionUuid(null);
    }
  };

  const handleApplyRecommendations = () => {
    // Show alert instead of opening confirmation dialog
    alert('Apply Recommendations feature is coming soon!');
  };

  const handleConfirmChanges = () => {
    // This function is no longer used but keeping for consistency
    setShowConfirmation(false);
    alert('Changes applied successfully!');
  };

  // Show loading state
  if (isTestDetailLoading || isResultsLoading) {
    return <LoadingState />;
  }

  // Calculate data states
  const hasNoAssumptions = assumptions.length === 0;
  const hasNoRecommendations = recommendations.length === 0;
  const hasNoData = hasNoAssumptions && hasNoRecommendations;
  const hasNoTestResults = !results || results.length === 0;

  // Component should be disabled if there are no test results
  const isDisabled = hasNoTestResults;

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <h3
            className={`aucctus-text-lg-semibold ${isDisabled ? 'aucctus-text-disabled' : 'aucctus-text-brand-primary'}`}
          >
            Results Impact
          </h3>
          {isDisabled && (
            <ComponentTooltip tip='Upload test results first to see impact analysis and assumption validation'>
              <Icon
                variant='help-circle'
                className='aucctus-stroke-disabled h-4 w-4'
              />
            </ComponentTooltip>
          )}
        </div>
        <p
          className={`aucctus-text-sm-regular ${isDisabled ? 'aucctus-text-disabled' : 'aucctus-text-secondary'}`}
        >
          How your test results affect your assumptions and what changes to
          consider for your concept.
        </p>
      </div>

      <div className={`${isDisabled ? 'pointer-events-none opacity-50' : ''}`}>
        {hasNoData ? (
          <NoDataState />
        ) : (
          <>
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
                    onValidationChange={handleValidationTypeChange}
                  />
                ))}
              </div>
            )}

            {/* Recommended Concept Changes */}
            <RecommendedChangesSection
              recommendations={recommendations}
              onApplyRecommendations={handleApplyRecommendations}
            />

            {/* Confirmation Dialog */}
            {showConfirmation && (
              <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-6'>
                <div className='mb-4 flex items-center gap-3'>
                  <Icon
                    variant='check'
                    className='aucctus-stroke-brand-primary h-5 w-5'
                  />
                  <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                    Confirm Changes
                  </h4>
                </div>

                <p className='aucctus-text-sm-regular aucctus-text-secondary mb-4'>
                  Review the changes that will be applied to your concept
                </p>

                <div className='mb-6 space-y-3'>
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className='space-y-2'>
                      <div className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                        {recommendation.title}
                      </div>
                      <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-3'>
                        <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                          {recommendation.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='flex justify-end gap-3'>
                  <button
                    className='btn btn-secondary'
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className='btn btn-primary'
                    onClick={handleConfirmChanges}
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TestImpact;
