import { cn } from '@libs/utils/react';
import { FunctionComponent } from 'react';
import { Bell } from 'lucide-react';

interface IVersionUpgradeBannerProps {
  onUpgrade: () => void;
  className?: string;
  isLoading?: boolean;
  buttonText?: string;
  debugMode?: boolean;
  featureName?: string;
}

const VersionUpgradeBanner: FunctionComponent<IVersionUpgradeBannerProps> = ({
  onUpgrade,
  className,
  isLoading = false,
  buttonText = 'Update',
  debugMode = false,
}) => {
  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-border-secondary relative mb-6 overflow-hidden rounded-lg border',
        'aucctus-bg-primary-hover transition-all duration-300',
        className,
      )}
    >
      {/* Subtle primary accent line */}
      <div className='aucctus-bg-brand-solid absolute left-0 top-0 h-0.5 w-full'></div>

      <div className='flex w-full items-center justify-between p-4'>
        <div className='flex flex-1 items-start gap-3'>
          {/* Icon with subtle primary accent */}
          <div className='aucctus-bg-brand-primary mt-0.5 rounded-full p-1'>
            <Bell size={16} className='aucctus-stroke-brand-primary' />
          </div>

          <div className='flex-1'>
            <div className='aucctus-text-primary aucctus-text-md-semibold mb-0.5'>
              {debugMode ? 'Debug Mode Regeneration' : 'New Features Available'}
            </div>
            <div className='aucctus-text-secondary aucctus-text-sm'>
              {debugMode ? (
                <>
                  This will regenerate the current section with fresh data for
                  testing purposes.
                  <br />
                  Previous content will be replaced.
                </>
              ) : (
                <>
                  This page has been upgraded and is ready to be updated with
                  the latest features.
                  <br />
                  Current content will be saved to version history.
                </>
              )}
            </div>
          </div>
        </div>

        <div className='ml-6 flex items-center'>
          <button
            onClick={onUpgrade}
            disabled={isLoading}
            className='btn btn-primary btn-md gap-1 px-4'
          >
            {isLoading ? 'Updating...' : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionUpgradeBanner;
