import { cn } from '@libs/utils/react';
import React from 'react';

type CostEstimate = 'low' | 'medium' | 'high';

interface CostEstimateBadgeProps {
  costEstimate: CostEstimate;
}

interface CostEstimateVisuals {
  text: string;
  bg: string;
  boxCount: number; // the number of boxes to be colored
}

const COST_ESTIMATE_MAP: Record<CostEstimate, CostEstimateVisuals> = {
  low: {
    text: '$0-$5K',
    bg: 'bg-level-low',
    boxCount: 1,
  },
  medium: {
    text: '$5-$10K',
    bg: 'bg-level-medium',
    boxCount: 2,
  },
  high: {
    text: '$10-$20K',
    bg: 'bg-level-high',
    boxCount: 3,
  },
};

const CostEstimateBadge: React.FC<CostEstimateBadgeProps> = ({
  costEstimate,
}) => {
  const { text, bg, boxCount } = COST_ESTIMATE_MAP[costEstimate];

  return (
    <div
      className={
        'inline-flex items-center justify-center gap-1.5 py-1 text-sm font-semibold text-gray-600'
      }
    >
      <div className='inline-flex items-center justify-start gap-1'>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className={cn('h-5 w-3', {
              [bg]: index < boxCount,
              'bg-gray-100': index >= boxCount,
            })}
          />
        ))}
      </div>
      {text}
    </div>
  );
};

export default CostEstimateBadge;
