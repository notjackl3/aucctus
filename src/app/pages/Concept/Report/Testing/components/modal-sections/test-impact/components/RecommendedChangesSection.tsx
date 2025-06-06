import React from 'react';
import { Icon } from '@components';

interface EditRecommendation {
  title: string;
  reason: string;
  section: string;
  description: string;
  testEvidence: string;
}

interface RecommendedChangesSectionProps {
  recommendations: EditRecommendation[];
  onApplyRecommendations: () => void;
}

const RecommendedChangesSection: React.FC<RecommendedChangesSectionProps> = ({
  recommendations,
  onApplyRecommendations,
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className='aucctus-bg-brand-secondary aucctus-border-brand-primary mt-8 space-y-4 rounded-lg border p-6'>
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
          className='btn btn-primary flex items-center gap-2'
          onClick={onApplyRecommendations}
        >
          <Icon variant='check' className='aucctus-stroke-white h-4 w-4' />
          Apply Recommendations
        </button>
      </div>

      {/* Simplified Recommendations List */}
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
        <ul className='space-y-3'>
          {recommendations.map((recommendation, index) => (
            <li key={index} className='flex items-center gap-3'>
              <div className='aucctus-bg-brand-secondary aucctus-border-brand-primary flex-shrink-0 rounded-full border p-1'>
                <Icon
                  variant='arrowright'
                  className='aucctus-stroke-brand-primary h-3 w-3'
                />
              </div>
              <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
                {recommendation.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecommendedChangesSection;
