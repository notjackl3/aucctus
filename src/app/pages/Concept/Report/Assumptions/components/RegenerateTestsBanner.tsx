import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
interface RegenerateTestsBannerProps {
  onRegenerate: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

const RegenerateTestsBanner: React.FC<RegenerateTestsBannerProps> = ({
  onRegenerate,
  onDismiss,
  isLoading = false,
}) => {
  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary hover:aucctus-bg-secondary-hover relative m-0 w-full border-b px-6 py-4 transition-all duration-300'>
      {/* Subtle primary accent line - positioned on top of the banner */}
      <div
        className='absolute left-0 top-0 z-30 h-0.5 w-full'
        style={{ backgroundColor: 'hsla(0, 27%, 29%, 0.6)' }}
      ></div>

      {/* Close button */}
      <button
        onClick={onDismiss}
        className='aucctus-bg-secondary-hover absolute right-4 top-4 z-10 rounded-full p-1 transition-colors'
        aria-label='Dismiss banner'
        disabled={isLoading}
      >
        <X className='aucctus-stroke-secondary h-4 w-4' />
      </button>

      <div className='flex items-center justify-between pr-8'>
        {/* Left side: Icon and text */}
        <div className='flex flex-1 items-start gap-3'>
          {/* Icon with subtle primary accent */}
          <div
            className='mt-0.5 flex items-center justify-center rounded-full p-1'
            style={{ backgroundColor: 'rgba(93, 66, 223, 0.1)' }}
          >
            <AlertTriangle
              size={16}
              className='aucctus-stroke-brand-primary'
              style={{ opacity: 0.7 }}
            />
          </div>

          <div className='flex-1'>
            <h3 className='aucctus-text-primary aucctus-text-md-semibold mb-1'>
              Looks like you&apos;ve edited assumptions
            </h3>
            <p className='aucctus-text-secondary aucctus-text-sm'>
              This will likely have an impact on testing. We recommend
              regenerating tests.
            </p>
          </div>
        </div>

        {/* Right side: Button */}
        <div className='ml-6 flex items-center'>
          <button
            onClick={onRegenerate}
            className='btn btn-primary btn-sm gap-1 px-4'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='aucctus-stroke-white h-4 w-4 animate-spin' />
                Regenerating...
              </>
            ) : (
              'Regenerate Tests'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegenerateTestsBanner;
