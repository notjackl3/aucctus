import { Icon, Modal } from '@components';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';
import { useModal } from '@context/ModalContextProvider';
import { useConceptAiEditing } from '@hooks/query/concepts.hook';
import { IConceptReportEdit } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animated, useTransition } from 'react-spring';
import { toast } from 'react-toastify';
import ChatMessages from './ChatMessages';
import FrostedLoadingCard from './FrostedLoadingCard';
import IntroMessage from './IntroMessage';

interface AiEditingCardProps {
  onClose: () => void;
}

/**
 * AiEditingCard - A component that provides an AI-assisted editing experience
 * for concept reports. It manages a conversation flow between the user and AI.
 */
const AiEditingCard: React.FC<AiEditingCardProps> = ({ onClose }) => {
  // ===== State Management =====
  const messages = useStore((state) => state.aiEditing.messages);
  const currentMessage = useStore((state) => state.aiEditing.currentMessage);
  const setCurrentMessage = useStore(
    (state) => state.aiEditing.setCurrentMessage,
  );
  const conceptUuid = useStore((state) => state.conceptReport.conceptUuid);
  const sessionId = useStore((state) => state.aiEditing.sessionId);
  const sendMessage = useStore((state) => state.aiEditing.sendMessage);
  const clearConversation = useStore(
    (state) => state.aiEditing.clearConversation,
  );
  const isThinking = useStore((state) => state.aiEditing.isAucctusThinking);
  const [aiEditSubmission, setAiEditSubmission] = useState<
    IConceptReportEdit | Partial<IConceptReportEdit> | undefined
  >(undefined);

  // ===== Hooks =====
  const { mutate: aiEditConcept, isLoading: isAiEditConceptLoading } =
    useConceptAiEditing();
  const { closeModal } = useModal();
  const navigate = useNavigate();

  // ===== Animations =====
  const transition = useTransition(messages.length === 0, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 280, friction: 60 },
  });

  // ===== Lifecycle =====
  useEffect(() => {
    return () => {
      setCurrentMessage('');
      setAiEditSubmission(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Renderers =====
  // ===== Component =====
  return (
    <div className='relative flex h-full w-full flex-col'>
      {/* Header with close button */}
      <div className='m-4 flex flex-row gap-4'>
        <span className='flex-1' />
        <button
          onClick={onClose}
          className='aspect-square w-6 rounded-lg transition-all duration-200 hover:bg-gray-light-100 hover:bg-opacity-20'
        >
          <span className='flex items-center justify-center'>
            <Icon
              variant='closeX'
              width={20}
              height={20}
              className='stroke-gray-light-100'
            />
          </span>
        </button>
      </div>

      {/* Intro message (shown when no messages exist) */}
      {transition(
        (style, item) =>
          item && (
            <animated.div
              style={style}
              className='flex flex-1 flex-col items-center justify-center'
            >
              <IntroMessage />
            </animated.div>
          ),
      )}

      <span className='flex-1' />

      {/* Conversation history */}
      <div className='no-scrollbar flex !max-h-[90%] flex-col gap-4'>
        {messages.map((message, index) => (
          <div key={message.uuid} className='flex flex-row gap-4'>
            <ChatMessages
              message={message}
              isLastMessage={index === messages.length - 1}
              onConfirmation={setAiEditSubmission}
              onRejection={clearConversation}
            />
          </div>
        ))}

        {/* Loading indicator when AI is thinking */}
        {isThinking && (
          <div
            style={{ animationDelay: `1000ms` }}
            className='mx-4 flex animate-expand flex-row gap-4'
          >
            <FrostedLoadingCard
              variant='dark'
              className='flex-1'
              defaultMessage='Got it, processing your feedback...'
            />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className='relative m-4 w-auto'>
        <AucctusMessageInput
          value={currentMessage || ''}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onSubmitMessage={async () => {
            await sendMessage();
          }}
          allowSubmitMessage={true}
          disabled={isThinking}
          className='!max-h-[150px]'
        />
      </div>

      {/* Loading overlay */}
      <LoadingMask isLoading={isAiEditConceptLoading} />

      {/* Confirmation modal */}
      {!!aiEditSubmission && (
        <div className='aucctus-bg-tertiary absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform animate-fade-in bg-opacity-50 px-4 pt-32'>
          <Modal.Confirmation
            title='Confirm Edit'
            subtitle='Are you sure you want to edit this concept?'
            actions={[
              {
                title: 'Confirm',
                variant: 'primary',
                onClick: () => {
                  aiEditConcept(
                    {
                      concept_uuid: conceptUuid!,
                      session_id: sessionId!,
                      edit: aiEditSubmission,
                    },
                    {
                      onSuccess: () => {
                        setAiEditSubmission(undefined);
                        toast.success('AI edit request submitted successfully');
                        navigate(AppPath.ConceptBank);
                        closeModal();
                      },
                    },
                  );
                },
              },
              {
                title: 'Cancel',
                variant: 'light',
                onClick: () => {
                  setAiEditSubmission(undefined);
                },
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default AiEditingCard;
