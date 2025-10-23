import React from 'react';
import { Icon } from '@components';

interface ImageToggleControlsProps {
  isReverting?: boolean;
  onRevertToAI: () => void;
  className?: string;
}

const ImageToggleControls: React.FC<ImageToggleControlsProps> = ({
  isReverting = false,
  onRevertToAI,
  className = '',
}) => {
  return (
    <button
      onClick={onRevertToAI}
      disabled={isReverting}
      className={`aucctus-bg-primary-hover aucctus-border-secondary aucctus-text-primary group flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      aria-label='Revert to AI generated image'
    >
      {isReverting ? (
        <>
          <Icon
            variant='loading-02'
            className='aucctus-stroke-primary h-4 w-4 animate-spin'
          />
          <span className='aucctus-text-sm-medium'>Reverting...</span>
        </>
      ) : (
        <>
          <Icon
            variant='refresh'
            className='aucctus-stroke-brand-primary h-4 w-4 transition-colors'
          />
          <span className='aucctus-text-sm-medium'>Revert to AI</span>
        </>
      )}
    </button>
  );
};

export default ImageToggleControls;
