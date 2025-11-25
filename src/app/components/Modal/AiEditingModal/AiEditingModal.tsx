import AiInteractionDiv from '@components/AiInteraction/AiInteractionDiv';
import { useModal } from '@context/ModalContextProvider';
import React from 'react';
import AiEditingCard from './AiEditingCard';
import AiEditingSocketWrapper from './AiEditingSocketWrapper';

const AiEditing: React.FC = () => {
  const { closeModal } = useModal();

  return (
    <div className='flex h-full min-w-[500px] max-w-[500px] flex-col overflow-auto rounded-l-md'>
      <AiInteractionDiv className='h-full w-full'>
        <div className='flex h-full w-full flex-col'>
          <AiEditingCard onClose={closeModal} />
        </div>
      </AiInteractionDiv>
      {/* This is a wrapper for the socket events and handles receiving messages and updating the state */}
      <AiEditingSocketWrapper />
    </div>
  );
};

export default AiEditing;
