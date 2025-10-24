import React from 'react';
import SkeletonBlock from './SkeletonBlock';

const ExecutiveSummarySkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary w-full rounded-lg border border-l-4 border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
      <div className='flex items-start gap-3'>
        <SkeletonBlock className='h-5 w-5 flex-shrink-0 rounded-full' />
        <div className='flex-1 space-y-3'>
          <SkeletonBlock className='h-3 w-36 uppercase' />
          <SkeletonBlock className='h-4 w-full' />
          <SkeletonBlock className='h-4 w-4/5' />
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummarySkeleton;
