import React from 'react';
import { Icon } from '@components';

interface TestMethodCardProps {
  title: string;
  description: string;
  insight: string;
  badgeText?: string;
}

const TestMethodCard: React.FC<TestMethodCardProps> = ({
  title,
  description,
  insight,
  badgeText = 'New',
}) => {
  return (
    <div className='aucctus-border-secondary aucctus-bg-secondary relative w-full overflow-hidden rounded-xl border shadow-sm'>
      {/* Subtle left border accent - using testing theme */}
      <div className='absolute left-0 top-0 h-full w-1 bg-gray-500'></div>

      <div className='p-6 pl-8'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='aucctus-bg-secondary rounded-md p-1.5'>
              <Icon variant='clipboard' className='h-5 w-5 stroke-gray-500' />
            </div>
            <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
              {title}
            </h2>
          </div>
          {badgeText && (
            <span className='aucctus-bg-secondary aucctus-text-tertiary aucctus-text-xs-medium aucctus-border-secondary inline-flex rounded-full border px-2.5 py-0.5'>
              {badgeText}
            </span>
          )}
        </div>

        <p className='aucctus-text-sm-regular aucctus-text-secondary mb-4 ml-1'>
          {description}
        </p>

        <div className='aucctus-bg-secondary aucctus-border-secondary rounded-lg border p-3'>
          <div className='flex items-start gap-2'>
            <div className='mt-0.5'>
              <Icon
                variant='ai-conclusion'
                className='h-5 w-5 stroke-gray-500'
              />
            </div>
            <p className='aucctus-text-sm-medium aucctus-text-tertiary'>
              {insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMethodCard;
