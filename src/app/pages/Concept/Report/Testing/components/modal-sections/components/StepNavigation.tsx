import React from 'react';
import { cn } from '@libs/utils/react';

interface IStepNavigationProps {
  stepNumber: number;
  title: string;
  description: string;
  isComplete: boolean;
}

const StepNavigation: React.FC<IStepNavigationProps> = ({
  stepNumber,
  title,
  description,
  isComplete,
}) => {
  return (
    <div className='mb-4 flex items-center gap-3'>
      <div className='aucctus-bg-primary aucctus-text-primary flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold'>
        {stepNumber}
      </div>
      <div>
        <h3 className='aucctus-text-md-semibold aucctus-text-primary'>
          {title}
        </h3>
        <p className='aucctus-text-sm aucctus-text-secondary'>{description}</p>
      </div>
    </div>
  );
};

export default React.memo(StepNavigation);
