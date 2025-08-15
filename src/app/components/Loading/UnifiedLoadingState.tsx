import React from 'react';
import Loading from './Loading';

interface UnifiedLoadingStateProps {
  /**
   * Optional custom className for the container
   */
  className?: string;

  /**
   * Optional loading message
   */
  message?: string;
}

/**
 * UnifiedLoadingState component for concept report tabs.
 *
 * This component provides a consistent centered loading state that:
 * - Takes full width and height of its container
 * - Centers the loading spinner
 * - Hides all other content when displayed
 * - Uses the existing Loading component for consistency
 */
export const UnifiedLoadingState: React.FC<UnifiedLoadingStateProps> = ({
  className = '',
  message,
}) => {
  return (
    <div className={`flex h-full w-full flex-col gap-6 ${className}`}>
      <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
        <div className='flex flex-col items-center gap-4'>
          <Loading />
          {message && (
            <p className='aucctus-text-secondary aucctus-text-sm text-center'>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoadingState;
