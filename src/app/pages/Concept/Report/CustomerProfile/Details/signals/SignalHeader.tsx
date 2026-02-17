import { Modal } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import React, { useCallback } from 'react';
import { LineChart, Plus } from 'lucide-react';

interface SignalHeaderProps {
  profileUuid: string;
}

const SignalHeader: React.FC<SignalHeaderProps> = ({ profileUuid }) => {
  const { openModal } = useModal();

  const handleAddSignal = useCallback(() => {
    openModal(
      Modal.EditRealWorldSignal,
      { signal: undefined, profileUuid },
      {
        position: 'center',
        backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
      },
    );
  }, [profileUuid, openModal]);

  return (
    <div className='flex flex-1 flex-col gap-2'>
      <div className='flex flex-row items-center gap-2'>
        <LineChart className='aucctus-stroke-secondary h-5 w-5' />
        <span className='aucctus-text-primary aucctus-text-md'>
          Real World Signals
        </span>
        <div className='flex-1' />
        <button
          onClick={handleAddSignal}
          className={cn({
            'aucctus-bg-primary-hover aspect-square rounded-lg p-1': true, // unhide when add modal is included
          })}
          aria-label='Add signal'
        >
          <Plus className='aucctus-stroke-brand-primary h-5 w-5' />
        </button>
      </div>
      <span className='aucctus-text-tertiary aucctus-text-sm'>
        {"Evidence validating or challenging this persona's needs"}
      </span>
    </div>
  );
};

export default SignalHeader;
