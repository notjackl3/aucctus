import AiInteractionDiv from '@components/AiInteraction/AiInteractionDiv';
import { useModal } from '@context/ModalContextProvider';
import useStore from '@stores/store';
import React from 'react';
import AiEditingCard from './AiEditingCard';
import AiEditingSocketWrapper from './AiEditingSocketWrapper';

const AiEditing: React.FC = () => {
  const { closeModal } = useModal();
  const clearConversation = useStore(
    (state) => state.aiEditing.clearConversation,
  );

  React.useEffect(() => {
    return () => {
      clearConversation();
    };
  }, [clearConversation]);

  return (
    <>
      <AiInteractionDiv className='h-full min-w-[500px] max-w-[500px] overflow-auto rounded-l-xl'>
        <div className='flex h-full w-full flex-col'>
          <AiEditingCard onClose={closeModal} />
        </div>
      </AiInteractionDiv>
      {/* This is a wrapper for the socket events and handles receiving messages and updating the state */}
      <AiEditingSocketWrapper />
    </>
  );
};

export default AiEditing;
