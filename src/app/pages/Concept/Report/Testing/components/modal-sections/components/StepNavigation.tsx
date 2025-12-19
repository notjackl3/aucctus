import React from 'react';

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
}) => {
  return (
    <div className='mb-4 flex items-center gap-4'>
      <div className='aucctus-bg-brand-solid aucctus-text-white flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold'>
        {stepNumber}
      </div>
      <div>
        <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
          {title}
        </h3>
        <p className='aucctus-text-sm aucctus-text-secondary'>{description}</p>
      </div>
    </div>
  );
};

export default React.memo(StepNavigation);
