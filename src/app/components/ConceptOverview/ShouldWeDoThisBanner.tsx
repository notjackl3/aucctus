import React from 'react';
import { Icon } from '@components';

interface ShouldWeDoThisBannerProps {
  recommendation?: string;
  isLoading?: boolean;
}

const ShouldWeDoThisBanner: React.FC<ShouldWeDoThisBannerProps> = ({
  recommendation,
  isLoading = false,
}) => {
  // Don't render if no recommendation and not loading
  if (!recommendation && !isLoading) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary w-full rounded-lg border p-6 shadow-sm'>
        <div className='flex items-start gap-3'>
          <Icon
            variant='help-circle'
            className='aucctus-stroke-tertiary mt-1 flex-shrink-0'
            height={20}
            width={20}
          />
          <div className='min-w-0 flex-1'>
            <h3 className='aucctus-text-tertiary aucctus-text-sm mb-3 font-medium uppercase tracking-wider'>
              SHOULD WE DO THIS?
            </h3>
            <div className='aucctus-bg-secondary h-16 animate-pulse rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary w-full rounded-lg border p-6 shadow-sm'>
      <div className='flex items-start gap-3'>
        <Icon
          variant='help-circle'
          className='aucctus-stroke-tertiary mt-1 flex-shrink-0'
          height={20}
          width={20}
        />
        <div className='min-w-0 flex-1'>
          <h3 className='aucctus-text-tertiary aucctus-text-sm mb-3 font-medium uppercase tracking-wider'>
            SHOULD WE DO THIS?
          </h3>
          <p className='aucctus-text-primary aucctus-text-lg leading-relaxed'>
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ShouldWeDoThisBanner);
