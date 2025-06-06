import React, { useState } from 'react';
import { Icon, ComponentTooltip } from '@components';
import {
  useTestDetail,
  useTestResults,
  useUpdateTestAssumption,
} from '@hooks/query/testing.hook';

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

  // Override the mutation callbacks to handle local state
  const updateTestAssumptionWithState = {
    ...updateTestAssumptionValidation,
    mutateAsync: async (params: {
      conceptUuid: string;
      testUuid: string;
      assumptionUuid: string;
      data: {
        validationType:
          | 'validated'
          | 'unvalidated'
          | 'partiallyValidated'
          | 'noChange'
          | 'invalidated';
      };
    }) => {
      // Set the assumption being updated
      setUpdatingAssumptionUuid(params.assumptionUuid);

      try {
        const result = await updateTestAssumptionValidation.mutateAsync(params);
        return result;
      } finally {
        // Clear the updating state
        setUpdatingAssumptionUuid(null);
      }
    },
  };

  // Type cast the results to include extended properties
  const results = fetchedResults as ExtendedTestResult[];

  // Extract assumptions and recommendations
  // Cast the assumptions to our extended interface since the API returns more data than the base ITestAssumption
  const assumptions = (testDetail?.assumptions ||
    []) as unknown as TestAssumption[];

  const recommendations =
    results && results.length > 0 ? results[0].editRecommendations || [] : [];

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'desirability':
        return (
          <Icon variant='heart' className='aucctus-stroke-brown-500 h-5 w-5' />
        );
      case 'viability':
        return (
          <Icon
            variant='currency-dollar'
            className='aucctus-stroke-purple-500 h-5 w-5'
          />
        );
      case 'feasibility':
        return (
          <Icon variant='gear' className='aucctus-stroke-blue-500 h-5 w-5' />
        );
      case 'adaptability':
        return (
          <Icon
            variant='refresh'
            className='aucctus-stroke-orange-500 h-5 w-5'
          />
        );
      default:
        return (
          <Icon
            variant='clipboard'
            className='aucctus-stroke-tertiary h-5 w-5'
          />
        );
    }
  };

  const getValidationOptions = (currentValidationType: string) => {
    const options = [
      {
        type: 'validated',
        label: 'Validated',
        icon: (
          <Icon
            variant='check'
            className='aucctus-stroke-success-primary h-4 w-4'
          />
        ),
        isSelected: currentValidationType === 'validated',
      },
      {
        type: 'invalidated',
        label: 'Invalidated',
        icon: (
          <Icon
            variant='closeX'
            className='aucctus-stroke-error-primary h-4 w-4'
          />
        ),
        isSelected: currentValidationType === 'invalidated',
      },
      {
        type: 'noChange',
        label: 'No Change',
        icon: (
          <Icon
            variant='help-circle'
            className='aucctus-stroke-tertiary h-4 w-4'
          />
        ),
        isSelected: currentValidationType === 'noChange',
      },
    ];
    return options;
  };

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

    try {
      await updateTestAssumptionWithState.mutateAsync({
        conceptUuid,
        testUuid,
        assumptionUuid: assumption.uuid,
        data: { validationType: newValidationType },
      });
    } catch (error) {
      // Error handling is done by the mutation hook
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

  if (isTestDetailLoading || isResultsLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex flex-col items-center gap-3'>
          <Icon
            variant='refresh'
            className='aucctus-stroke-brand-primary h-6 w-6 animate-spin'
          />
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Loading impact analysis...
          </p>
        </div>
      </div>
    );
  }

  // Show no data state if no assumptions or results
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
          // No data state
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-8'>
            <div className='flex flex-col items-center justify-center text-center'>
              <Icon
                variant='lightbulb'
                className='aucctus-stroke-tertiary mb-4 h-12 w-12'
              />
              <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
                No impact analysis available
              </h4>
              <p className='aucctus-text-sm-regular aucctus-text-secondary max-w-md'>
                Impact analysis will be generated once you have test results and
                validated assumptions to analyze.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Assumptions Validation Results */}
            {!hasNoAssumptions && (
              <div className='space-y-4'>
                <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                  Assumption Validation Results
                </h4>
                {assumptions.map((assumption) => {
                  // Use the correct property names based on what's available
                  const statement = assumption.statement || '';
                  const category = assumption.category || '';

                  return (
                    <div
                      key={assumption.uuid}
                      className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-6'
                    >
                      {/* Header with category */}
                      <div className='mb-4 flex items-center gap-3'>
                        <div className='aucctus-bg-secondary-subtle aucctus-border-secondary flex h-10 w-10 items-center justify-center rounded-full border'>
                          {getCategoryIcon(category)}
                        </div>
                        <div className='flex flex-col'>
                          <span className='aucctus-text-sm-semibold aucctus-text-secondary capitalize'>
                            {category}
                          </span>
                        </div>
                      </div>

                      {/* Assumption statement */}
                      <h5 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-4'>
                        {statement}
                      </h5>

                      {/* Validation Result and Benchmark - 2 columns */}
                      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                        {/* Validation Result Section - Left Column */}
                        <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-4'>
                          <div className='mb-3 flex items-center gap-2'>
                            <Icon
                              variant='clipboard'
                              className='aucctus-stroke-brand-primary h-4 w-4'
                            />
                            <span className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                              Validation Result
                            </span>
                          </div>

                          <div className='space-y-3'>
                            {getValidationOptions(
                              assumption.validationType,
                            ).map((option) => {
                              const isUpdating =
                                updatingAssumptionUuid === assumption.uuid;
                              const isCurrentlySelected = option.isSelected;

                              return (
                                <div
                                  key={option.type}
                                  className={`flex items-center gap-3 ${
                                    isUpdating
                                      ? 'cursor-not-allowed opacity-50'
                                      : 'cursor-pointer hover:opacity-80'
                                  } transition-opacity`}
                                  onClick={() => {
                                    if (!isUpdating && !isCurrentlySelected) {
                                      handleValidationTypeChange(
                                        assumption,
                                        option.type as
                                          | 'validated'
                                          | 'unvalidated'
                                          | 'partiallyValidated'
                                          | 'noChange'
                                          | 'invalidated',
                                      );
                                    }
                                  }}
                                >
                                  <div
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                      option.isSelected
                                        ? 'aucctus-border-brand-solid aucctus-bg-brand-solid'
                                        : 'aucctus-border-secondary aucctus-bg-primary'
                                    }`}
                                  >
                                    {option.isSelected && !isUpdating && (
                                      <div className='h-3 w-3 rounded-full bg-white'></div>
                                    )}
                                    {isUpdating && (
                                      <Icon
                                        variant='refresh'
                                        className='aucctus-stroke-brand-primary h-3 w-3 animate-spin'
                                      />
                                    )}
                                  </div>
                                  <span
                                    className={`aucctus-text-sm-regular ${
                                      option.isSelected
                                        ? 'aucctus-text-brand-solid'
                                        : 'aucctus-text-secondary'
                                    }`}
                                  >
                                    {option.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Validation Benchmark Section - Right Column */}
                        <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-4'>
                          <div className='mb-3 flex items-center gap-2'>
                            <Icon
                              variant='target'
                              className='aucctus-stroke-brand-primary h-4 w-4'
                            />
                            <span className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                              VALIDATION BENCHMARK
                            </span>
                          </div>
                          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                            {assumption.benchmark ||
                              `Validate through customer interviews with at least ${Math.round((assumption.importance || 0.5) * 100)}% positive responses.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommended Concept Changes */}
            {!hasNoRecommendations && (
              <div className={`space-y-4 ${!hasNoAssumptions ? 'mt-8' : ''}`}>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Icon
                      variant='lightbulb'
                      className='aucctus-stroke-brand-primary h-5 w-5'
                    />
                    <h3 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                      Recommended Concept Changes
                    </h3>
                  </div>
                  <button
                    className='btn btn-primary flex items-center gap-2'
                    onClick={handleApplyRecommendations}
                  >
                    <Icon
                      variant='check'
                      className='aucctus-stroke-white h-4 w-4'
                    />
                    Apply Recommendations
                  </button>
                </div>

                {/* Recommendations List - Full Width */}
                <ul className='aucctus-border-secondary aucctus-bg-secondary-extra-subtle space-y-4 rounded-lg border p-6'>
                  {recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4'
                    >
                      <div className='flex items-start gap-3'>
                        <div className='aucctus-bg-secondary aucctus-border-secondary mt-1 flex-shrink-0 rounded-full border p-1'>
                          <Icon
                            variant='arrowright'
                            className='aucctus-stroke-brand-primary h-4 w-4'
                          />
                        </div>
                        <div className='flex-1 space-y-2'>
                          <div className='flex items-start justify-between'>
                            <h6 className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                              {recommendation.title}
                            </h6>
                            <span className='aucctus-bg-secondary aucctus-text-tertiary aucctus-border-secondary rounded-full border px-2 py-0.5 text-xs'>
                              {recommendation.section}
                            </span>
                          </div>
                          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                            {recommendation.description}
                          </p>
                          <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded border p-3'>
                            <p className='aucctus-text-xs-regular aucctus-text-tertiary mb-1'>
                              Test Evidence:
                            </p>
                            <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                              {recommendation.testEvidence}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
