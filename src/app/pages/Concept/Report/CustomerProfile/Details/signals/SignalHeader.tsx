import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';

interface SignalHeaderProps {
  onAddSignal: () => void;
}

const SignalHeader: React.FC<SignalHeaderProps> = ({ onAddSignal }) => (
  <div className='flex flex-1 flex-col gap-2'>
    <div className='flex flex-row items-center gap-2'>
      <Icon
        variant='line-chart-up'
        className='aucctus-stroke-secondary h-5 w-5'
      />
      <span className='aucctus-text-primary aucctus-text-md'>
        Real World Signals
      </span>
      <div className='flex-1' />
      <button
        onClick={onAddSignal}
        className={cn({
          'aucctus-bg-primary-hover hidden aspect-square rounded-lg p-1': true, // unhide when add modal is included
        })}
        aria-label='Add signal'
      >
        <Icon variant='plus' className='aucctus-stroke-brand-primary h-5 w-5' />
      </button>
    </div>
    <span className='aucctus-text-tertiary aucctus-text-sm'>
      {"Evidence validating or challenging this persona's needs"}
    </span>
  </div>
);

export default SignalHeader;
