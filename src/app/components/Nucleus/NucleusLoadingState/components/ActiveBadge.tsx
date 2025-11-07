import React from 'react';
import { cn } from '@libs/utils/react';

/**
 * ActiveBadge Component
 * Glassmorphic "Actively Researching" badge with green styling
 */
const ActiveBadge: React.FC = () => {
  return (
    <div
      className='mb-4 animate-slide-in-center'
      style={{ animationDelay: '0.1s' }}
    >
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5',
          'aucctus-bg-success-glass aucctus-border-success',
        )}
      >
        <div className='relative flex h-2 w-2 items-center justify-center'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75' />
          <span className='relative inline-flex h-2 w-2 rounded-full bg-success-500' />
        </div>
        <span className='aucctus-text-white aucctus-text-xs-semibold'>
          Actively Researching
        </span>
      </div>
    </div>
  );
};

export default ActiveBadge;
