import React from 'react';
import { Icon } from '@components';

interface TestMethodCardProps {
  title: string;
  description: string;
  icon?: IconVariant;
  badgeText?: string;
}

const TestMethodCard: React.FC<TestMethodCardProps> = ({
  title,
  description,
  icon = 'clipboard',
  badgeText,
}) => {
  return (
    <div className='aucctus-bg-brand-primary aucctus-border-primary relative w-full overflow-hidden rounded-xl border shadow-sm'>
      {/* Subtle left border accent */}
      <div className='absolute left-0 top-0 h-full w-1 bg-[#5E3636] opacity-30'></div>

      <div className='p-6 pl-8'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='aucctus-bg-brand-secondary rounded-md p-1.5'>
              <Icon
                variant={icon}
                className='aucctus-stroke-brand-primary h-5 w-5'
              />
            </div>
            <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
              {title}
            </h2>
          </div>
          {badgeText && (
            <span className='aucctus-bg-brand-primary aucctus-text-brand-primary aucctus-text-xs-medium aucctus-border-brand-subtle inline-flex rounded-full border px-2.5 py-0.5'>
              {badgeText}
            </span>
          )}
        </div>

        <p className='aucctus-text-sm-regular aucctus-text-secondary ml-1'>
          {description}
        </p>
      </div>
    </div>
  );
};

export default TestMethodCard;
