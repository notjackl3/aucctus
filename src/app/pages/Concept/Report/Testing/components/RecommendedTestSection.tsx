import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';
import { Assumption, RecommendedTest } from '../types';
import { RISK_LEVEL_CONFIGS } from '../../Assumptions/constants/statusConfigs';
import CategoryIcon from '../../Assumptions/components/cards/category-progress-card/CategoryIcon';
import GenericStatusBadge from '../../Assumptions/components/shared/GenericStatusBadge';
import ValidationBenchmarkCard from './modal-sections/test-impact/components/ValidationBenchmarkCard';
import { useTestCompletion } from '../Testing';

interface RecommendedTestSectionProps {
  recommendedTest: RecommendedTest | null;
  onRunTest: () => void;
  onSelectAssumption: (assumption: Assumption) => void;
  showBenchmark?: boolean;
}

const RecommendedTestSection: React.FC<RecommendedTestSectionProps> = ({
  recommendedTest,
  onRunTest,
  onSelectAssumption,
  showBenchmark = false,
}) => {
  const { isCompletingTest } = useTestCompletion();

  const handleSelectAssumption = (assumption: Assumption) => {
    if (assumption && assumption.id) {
      onSelectAssumption(assumption);
    }
  };

  if (!recommendedTest) {
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
            All assumptions tested!
          </h3>
          <p className='aucctus-text-sm-regular aucctus-text-brand-secondary max-w-md text-center'>
            You&apos;ve done a great job validating your assumptions. Continue
            monitoring the market for new insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div
        className={cn(
          'aucctus-bg-primary aucctus-border-secondary relative rounded-lg border border-l-4 border-l-[#5D4037] p-5 shadow-sm',
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

        <div className='mb-4 flex items-start justify-between'>
          {/* Recommended Label */}
          <div className='aucctus-bg-brand-secondary aucctus-text-xs-semibold aucctus-text-brand-primary mb-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1'>
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
              isCompletingTest && 'cursor-not-allowed opacity-50',
            )}
            disabled={isCompletingTest}
          >
            {isCompletingTest ? (
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
            {isCompletingTest ? 'Running...' : 'Run Test'}
          </button>
        </div>

        {/* Test Name and Description */}
        <div className='mb-4 space-y-2'>
          <h3 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
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
            {recommendedTest.assumptions.map((assumption, index) => {
              const riskLevel = assumption.risk || 'medium';
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
                  key={index}
                  className='aucctus-text-sm-regular aucctus-border-secondary aucctus-bg-primary hover:aucctus-bg-secondary-hover cursor-pointer rounded-md border p-4 transition-colors'
                  onClick={() => handleSelectAssumption(assumption)}
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
                    {assumption.description}
                  </p>

                  {/* Benchmark Section */}
                  {showBenchmark && assumption.benchmark && (
                    <ValidationBenchmarkCard benchmark={assumption.benchmark} />
                  )}
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
