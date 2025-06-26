import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { FunctionComponent } from 'react';

interface IVersionUpgradeBannerProps {
  featureName: string;
  onUpgrade: () => void;
  className?: string;
  isLoading?: boolean;
  buttonText?: string;
}

const VersionUpgradeBanner: FunctionComponent<IVersionUpgradeBannerProps> = ({
  featureName,
  onUpgrade,
  className,
  isLoading = false,
  buttonText = 'Upgrade',
}) => {
  return (
    <div
      className={cn(
        'aucctus-bg-brand-primary aucctus-border-brand-subtle mb-6 rounded-lg border p-4',
        className,
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Icon
            variant='announcement'
            className='aucctus-stroke-brand-primary h-5 w-5 flex-shrink-0'
          />
          <div>
            <p className='aucctus-text-brand-primary aucctus-text-md-semibold'>
              New {featureName} version available
            </p>
            <p className='aucctus-text-brand-secondary aucctus-text-sm'>
              Experience enhanced features and improved performance with the
              latest version.
            </p>
          </div>
        </div>
        <button
          onClick={onUpgrade}
          disabled={isLoading}
          className='btn btn-primary btn-sm whitespace-nowrap'
        >
          {isLoading ? 'Upgrading...' : buttonText}
        </button>
      </div>
      <div className='aucctus-border-brand-subtle mt-3 border-t pt-3'>
        <p className='aucctus-text-brand-tertiary aucctus-text-xs'>
          You can always switch back to the previous version if you prefer the
          original experience.
        </p>
      </div>
    </div>
  );
};

export default VersionUpgradeBanner;
