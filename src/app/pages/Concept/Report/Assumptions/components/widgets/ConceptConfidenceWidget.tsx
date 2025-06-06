import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { IAssumptionV2 } from '@libs/api/types';

interface ConceptConfidenceWidgetProps {
  assumptions: IAssumptionV2[];
  calculateConfidenceScore: () => number;
  className?: string;
}

const ConceptConfidenceWidget: React.FC<ConceptConfidenceWidgetProps> = ({
  // Remove the unused parameter or use it
  // assumptions,
  calculateConfidenceScore,
  className = '',
}) => {
  const confidenceScore = calculateConfidenceScore();

  // Get confidence level text based on score
  const getConfidenceLevelText = (score: number): string => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Medium Confidence';
    if (score >= 40) return 'Moderate Confidence';
    if (score >= 20) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  // Get confidence color based on score
  const getConfidenceColor = (score: number): string => {
    if (score >= 80) return 'aucctus-bg-success-primary';
    if (score >= 60) return 'aucctus-bg-success-secondary';
    if (score >= 40) return 'aucctus-bg-warning-primary';
    if (score >= 20) return 'aucctus-bg-error-secondary';
    return 'aucctus-bg-error-primary';
  };

  return (
    <div className={cn('aucctus-bg-primary rounded-lg p-6', className)}>
      <div className='mb-2 flex items-center'>
        <h3 className='aucctus-header-md-semibold aucctus-text-primary'>
          Concept Score
        </h3>
      </div>

      <p className='aucctus-text-sm aucctus-text-secondary mb-4'>
        Validating assumptions will increase your score
      </p>

      <div className='relative mb-3 h-80 w-full'>
        {/* Overlay with "Coming Soon" */}
        <div className='aucctus-bg-primary-alt/65 absolute inset-0 z-20 rounded-xl backdrop-blur-[8px]'>
          {/* Add Coming Soon text overtop */}
          <div className='absolute inset-0 z-30 flex items-center justify-center'>
            <div className='aucctus-bg-primary-alt/50 aucctus-border-tertiary rounded-md border px-4 py-2 shadow-sm backdrop-blur-sm'>
              <div className='flex items-center gap-2'>
                <Icon
                  variant='compass-03'
                  className='aucctus-stroke-secondary h-5 w-5'
                />
                <span className='aucctus-text-sm-medium aucctus-text-secondary'>
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current score implementation that will be behind the overlay */}
        <div className='my-8 flex flex-col items-center justify-center'>
          <div
            className={cn(
              'mb-3 flex h-32 w-32 items-center justify-center rounded-full',
              getConfidenceColor(confidenceScore),
            )}
          >
            <span className='aucctus-header-xl-bold aucctus-text-white'>
              {Math.round(confidenceScore)}%
            </span>
          </div>
          <p className='aucctus-text-md-semibold aucctus-text-secondary'>
            {getConfidenceLevelText(confidenceScore)}
          </p>
        </div>
      </div>

      <div className='mt-5 text-center'>
        <button className='aucctus-text-sm aucctus-text-secondary-hover mx-auto flex items-center justify-center'>
          <span>How Confidence is Calculated</span>
          <Icon
            variant='help-circle'
            className='aucctus-stroke-secondary ml-1 h-4 w-4'
          />
        </button>
      </div>
    </div>
  );
};

export default ConceptConfidenceWidget;
