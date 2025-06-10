import React from 'react';
import LoadingSpinner from '@components/Icon/LoadingSpinner';

interface TestCompletionLoadingOverlayProps {
  title: string;
  description: string;
  subtitle?: string;
}

const TestCompletionLoadingOverlay: React.FC<
  TestCompletionLoadingOverlayProps
> = ({ title, description, subtitle }) => {
  return (
    <div className='absolute inset-0 z-50 flex min-h-full w-full items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm'>
      <div className='flex flex-col items-center justify-center gap-4 text-center'>
        <div className='relative'>
          <LoadingSpinner className='aucctus-stroke-brand-primary h-12 w-12' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='aucctus-bg-brand-primary h-3 w-3 animate-pulse rounded-full'></div>
          </div>
        </div>
        <div className='space-y-2'>
          <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            {title}
          </h4>
          <p className='aucctus-text-sm-regular aucctus-text-secondary max-w-md'>
            {description}
          </p>
          {subtitle && (
            <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCompletionLoadingOverlay;
