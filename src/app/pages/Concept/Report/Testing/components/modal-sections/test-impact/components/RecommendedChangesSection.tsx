import React from 'react';
import { Icon } from '@components';
import { IEditRecommendation } from '@libs/api/types/concept/testing';

interface RecommendedChangesSectionProps {
  recommendations: IEditRecommendation[];
}

const RecommendedChangesSection: React.FC<RecommendedChangesSectionProps> = ({
  recommendations,
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className='aucctus-bg-secondary-subtle aucctus-border-secondary mt-8 space-y-4 rounded-lg border p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Icon
            variant='lightbulb'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            Recommended Concept Changes
          </h3>
        </div>
        <button
          className='btn btn-disabled flex items-center gap-2'
          disabled={true}
        >
          <Icon variant='clock' className='aucctus-stroke-disabled h-4 w-4' />
          Coming Soon
        </button>
      </div>

      {/* Detailed Recommendations List */}
      <div className='space-y-4'>
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'
          >
            <div className='flex items-start gap-3'>
              <div className='aucctus-bg-brand-secondary aucctus-border-brand-primary flex-shrink-0 rounded-full border p-1'>
                <Icon
                  variant='arrowright'
                  className='aucctus-stroke-brand-primary h-3 w-3'
                />
              </div>
              <div className='flex-1 space-y-2'>
                <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                  {recommendation.title}
                </h4>
                <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                  {recommendation.description}
                </p>
                <div className='aucctus-bg-secondary-subtle rounded-md p-3'>
                  <p className='aucctus-text-xs-medium aucctus-text-tertiary mb-1'>
                    Reason:
                  </p>
                  <p className='aucctus-text-xs-regular aucctus-text-secondary'>
                    {recommendation.reason}
                  </p>
                </div>
                {recommendation.testEvidence && (
                  <div className='aucctus-bg-brand-section rounded-md p-3'>
                    <p className='aucctus-text-xs-medium aucctus-text-brand-primary mb-1'>
                      Test Evidence:
                    </p>
                    <p className='aucctus-text-xs-regular aucctus-text-brand-secondary'>
                      {recommendation.testEvidence}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedChangesSection;
