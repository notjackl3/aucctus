import React from 'react';
import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface ProfileStaleTestBannerProps {
  onRegenerate: () => void;
  onAcknowledge?: () => void;
  isLoading?: boolean;
  isAcknowledging?: boolean;
}

const ProfileStaleTestBanner: React.FC<ProfileStaleTestBannerProps> = ({
  onRegenerate,
  onAcknowledge,
  isLoading = false,
  isAcknowledging = false,
}) => {
  return (
    <div
      className={cn(
        'aucctus-bg-warning-primary aucctus-border-warning-primary',
        'relative mb-4 overflow-hidden rounded-lg border',
        'aucctus-bg-primary-hover transition-all duration-300',
      )}
    >
      <div className='aucctus-bg-warning-solid absolute left-0 top-0 h-0.5 w-full' />

      <div className='flex w-full items-center justify-between p-4'>
        <div className='flex flex-1 items-start gap-3'>
          <div className='aucctus-bg-warning-secondary mt-0.5 rounded-full p-1'>
            <DynamicIcon
              variant='alert-triangle'
              className='aucctus-stroke-warning-primary'
              height={16}
              width={16}
            />
          </div>

          <div className='flex-1'>
            <div className='aucctus-text-primary aucctus-text-md-semibold mb-0.5'>
              Customer profiles or personas have changed
            </div>
            <div className='aucctus-text-secondary aucctus-text-sm'>
              Some profiles or personas linked to this test were updated or
              removed. Review the test participants and regenerate if needed
              before running synthetic execution.
            </div>
          </div>
        </div>

        <div className='ml-6 flex items-center gap-2'>
          {onAcknowledge && (
            <button
              onClick={onAcknowledge}
              disabled={isAcknowledging || isLoading}
              className='btn btn-secondary btn-md gap-1 px-4'
            >
              {isAcknowledging ? 'Dismissing...' : 'Dismiss'}
            </button>
          )}
          <button
            onClick={onRegenerate}
            disabled={isLoading || isAcknowledging}
            className='btn btn-primary btn-md gap-1 px-4'
          >
            {isLoading ? 'Regenerating...' : 'Regenerate Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStaleTestBanner;
