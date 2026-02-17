import React from 'react';
import { RefreshCw } from 'lucide-react';
const LoadingState: React.FC = () => {
  return (
    <div className='flex items-center justify-center py-12'>
      <div className='flex flex-col items-center gap-3'>
        <RefreshCw className='aucctus-stroke-brand-primary h-6 w-6 animate-spin' />
        <p className='aucctus-text-sm-regular aucctus-text-secondary'>
          Loading impact analysis...
        </p>
      </div>
    </div>
  );
};

export default LoadingState;
