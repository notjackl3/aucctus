import React, { useState, useMemo } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import {
  useSyntheticDistributionPreview,
  useTestCollaterals,
} from '@hooks/query/synthetic-execution.hook';
import {
  ISyntheticExecutionRequest,
  IDistributionPreview,
  ITestCollateralOption,
  IProfileDistribution,
} from '@libs/api/types/concept/testing';
import MultiCollateralSelector from '@components/Testing/MultiCollateralSelector';

interface ISyntheticExecutionPanelProps {
  // Existing props
  status: 'idle' | 'running' | 'completed' | 'error' | 'cancelled';
  progress: number;
  message: string;
  currentPersona?: string;
  totalPersonas?: number;
  resultsCount?: number;
  error?: string;
  onCancel: () => void;

  // New props for configuration
  conceptUuid: string;
  testUuid: string;
  onExecute: (config: ISyntheticExecutionRequest) => void;
}

const SyntheticExecutionPanel: React.FC<ISyntheticExecutionPanelProps> = ({
  status,
  progress,
  message,
  currentPersona,
  totalPersonas,
  resultsCount,
  error,
  onCancel,
  conceptUuid,
  testUuid,
  onExecute,
}) => {
  // Configuration state
  const [totalTests, setTotalTests] = useState<number>(2);
  const [selectedCollateralUuids, setSelectedCollateralUuids] = useState<
    string[]
  >([]);
  const [showDistributionPreview, setShowDistributionPreview] =
    useState<boolean>(false);

  // Hooks for data fetching
  const { data: collaterals, isLoading: collateralsLoading } =
    useTestCollaterals(conceptUuid, testUuid);
  const distributionPreview = useSyntheticDistributionPreview(
    conceptUuid,
    testUuid,
  );

  // Memoized configuration object
  const executionConfig = useMemo(
    (): ISyntheticExecutionRequest => ({
      total_tests: totalTests,
      collateral_uuids:
        selectedCollateralUuids.length > 0
          ? selectedCollateralUuids
          : undefined,
      distribution_weights: undefined, // TODO: Add custom weights UI later
    }),
    [totalTests, selectedCollateralUuids],
  );

  // Handler functions
  const handleExecute = () => {
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
      setShowDistributionPreview(true);
    } catch (error) {
      // Error handled by the hook
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'aucctus-text-brand-primary';
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
        return 'Generating Synthetic Interviews';
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
    <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-6'>
      <div className='flex items-start gap-3'>
        <div className='mt-1'>
          <Icon
            variant={getStatusIcon()}
            className={cn('h-5 w-5', getStatusColor())}
          />
        </div>

        <div className='flex-1'>
          <h4 className={cn('aucctus-text-md-semibold mb-3', getStatusColor())}>
            {getStatusTitle()}
          </h4>

          {/* Configuration Form - Only show when idle */}
          {status === 'idle' && (
            <div className='mb-6 space-y-4'>
              {/* Total Tests Input */}
              <div>
                <label className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                  Total Synthetic Tests
                </label>
                <input
                  type='number'
                  min='1'
                  max='100'
                  value={totalTests}
                  onChange={(e) => setTotalTests(Number(e.target.value))}
                  className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary focus:border-brand-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
                  placeholder='5'
                />
                <p className='aucctus-text-xs aucctus-text-secondary mt-1'>
                  Number of synthetic interviews to generate (1-100)
                </p>
              </div>

              {/* Multi-Collateral Selection */}
              <div>
                <label className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                  Interview Materials (Optional)
                </label>
                <MultiCollateralSelector
                  collaterals={collaterals || []}
                  selectedCollateralUuids={selectedCollateralUuids}
                  onSelectionChange={setSelectedCollateralUuids}
                  isLoading={collateralsLoading}
                  disabled={status !== 'idle'}
                />
              </div>

              {/* Distribution Preview */}
              <div>
                <button
                  type='button'
                  onClick={handlePreviewDistribution}
                  disabled={distributionPreview.isLoading}
                  className='btn btn-light btn-sm flex items-center gap-2'
                >
                  {distributionPreview.isLoading ? (
                    <Icon
                      variant='loading-02'
                      className='aucctus-stroke-secondary h-4 w-4'
                    />
                  ) : (
                    <Icon
                      variant='eye'
                      className='aucctus-stroke-secondary h-4 w-4'
                    />
                  )}
                  Preview Distribution
                </button>
              </div>

              {/* Distribution Preview Results */}
              {showDistributionPreview && distributionPreview.data && (
                <div className='aucctus-bg-primary aucctus-border-secondary rounded-md border p-4'>
                  <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-3'>
                    Distribution Preview
                  </h5>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='aucctus-text-secondary'>Strategy:</span>
                      <span className='aucctus-text-primary capitalize'>
                        {distributionPreview.data.distributionStrategy.replace(
                          '_',
                          ' ',
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='aucctus-text-secondary'>
                        Total Tests:
                      </span>
                      <span className='aucctus-text-primary'>
                        {distributionPreview.data.totalTests}
                      </span>
                    </div>
                    {distributionPreview.data.collateralTitle && (
                      <div className='flex justify-between text-sm'>
                        <span className='aucctus-text-secondary'>
                          Collateral:
                        </span>
                        <span className='aucctus-text-primary'>
                          {distributionPreview.data.collateralTitle}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='mt-3'>
                    <h6 className='aucctus-text-xs-semibold aucctus-text-secondary mb-2'>
                      Profile Distribution:
                    </h6>
                    <div className='space-y-1'>
                      {distributionPreview.data.profileDistributions.map(
                        (profile: IProfileDistribution) => (
                          <div
                            key={profile.profileUuid}
                            className='flex justify-between text-xs'
                          >
                            <span className='aucctus-text-secondary'>
                              {profile.profileName}{' '}
                              {profile.isPrimary && '(Primary)'}
                            </span>
                            <span className='aucctus-text-primary'>
                              {profile.testCount} tests (
                              {Math.round(profile.weight * 100)}%)
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Execute Button */}
              <div className='flex gap-3'>
                <button
                  onClick={handleExecute}
                  className='btn btn-primary btn-md flex items-center gap-2'
                >
                  <Icon
                    variant='play-square'
                    className='aucctus-stroke-white h-4 w-4'
                  />
                  Execute Synthetic Testing
                </button>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {(status === 'running' || status === 'completed') && (
            <div className='mb-4'>
              <div className='aucctus-bg-secondary mb-2 h-2 rounded-full'>
                <div
                  className='aucctus-bg-brand-primary h-2 rounded-full transition-all duration-300'
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className='aucctus-text-xs aucctus-text-secondary flex justify-between'>
                <span>{progress}% Complete</span>
                {currentPersona && totalPersonas && (
                  <span>
                    Processing {currentPersona} ({totalPersonas} total)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Status Message */}
          {status !== 'completed' && (
            <p className='aucctus-text-sm-regular aucctus-text-secondary mb-4'>
              {message ||
                (status === 'idle'
                  ? 'Configure your synthetic testing parameters above and click Execute to start'
                  : 'Processing synthetic interviews...')}
            </p>
          )}

          {/* Results Count */}
          {status === 'completed' && resultsCount && (
            <div className='aucctus-bg-success-secondary mb-4 rounded-md p-3'>
              <div className='flex items-center gap-2'>
                <Icon
                  variant='check'
                  className='aucctus-stroke-success-primary h-4 w-4'
                />
                <p className='aucctus-text-sm-medium aucctus-text-success-primary'>
                  {resultsCount} results generated
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {status === 'error' && error && (
            <div className='aucctus-bg-error-secondary mb-4 rounded-md p-3'>
              <div className='flex items-start gap-2'>
                <Icon
                  variant='alert-circle'
                  className='aucctus-stroke-error-primary mt-0.5 h-4 w-4'
                />
                <div>
                  <p className='aucctus-text-sm-medium aucctus-text-error-primary mb-1'>
                    Execution Failed
                  </p>
                  <p className='aucctus-text-sm-regular aucctus-text-error-primary'>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Button */}
          {status === 'running' && (
            <button
              className='btn btn-light btn-sm flex items-center gap-2'
              onClick={onCancel}
            >
              <Icon
                variant='closeX'
                className='aucctus-stroke-secondary h-4 w-4'
              />
              Cancel Execution
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SyntheticExecutionPanel);
