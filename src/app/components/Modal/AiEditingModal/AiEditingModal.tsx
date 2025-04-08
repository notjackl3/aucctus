import images from '@assets/img';
import { useModal } from '@context/ModalContextProvider';
import useStore from '@stores/store';
import React from 'react';
import AiEditingCard from './AiEditingCard';
import AiEditingSocketWrapper from './AiEditingSocketWrapper';

const mainStyle = {
  backgroundImage: `url(${images.aiExplorationsBackground})`,
  backgroundSize: 'cover',
  animation: 'moveBackground 40s ease infinite',
};

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
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes moveBackground {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <div
        className='flex h-full min-w-[500px] max-w-[500px] flex-col overflow-auto rounded-l-xl'
        style={mainStyle}
      >
        <div className='flex h-full w-full flex-col'>
          <AiEditingCard onClose={closeModal} />
        </div>
      </div>
      {/* This is a wrapper for the socket events and handles receiving messages and updating the state */}
      <AiEditingSocketWrapper />
    </>
  );
};

export default AiEditing;
