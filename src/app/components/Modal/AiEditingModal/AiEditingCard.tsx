import { Icon, Modal } from '@components';
import AiIntroMessage from '@components/AiInteraction/AiIntroMessage';
import FrostedLoadingCard from '@components/AiInteraction/FrostedLoadingCard';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';
import Toast from '@components/Notification/Toast';
import { useModal } from '@context/ModalContextProvider';
import { useConceptAiEditing } from '@hooks/query/concepts.hook';
import { IConceptReportEdit } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animated, useTransition } from 'react-spring';
import { toast } from 'react-toastify';
import AiEditingChatMessage from './AiEditingChatMessage';

interface AiEditingCardProps {
  onClose: () => void;
}

/**
 * AiEditingCard - A component that provides an AI-assisted editing experience
 * for concept reports. It manages a conversation flow between the user and AI.
 */
const AiEditingCard: React.FC<AiEditingCardProps> = ({ onClose }) => {
  const messageScrollRef = useRef<HTMLDivElement>(null);

  const [showConversation, setShowConversation] = useState(false);
  // ===== State Management =====
  const messages = useStore((state) => state.aiEditing.messages);
  const thinkingMessage = useStore((state) => state.aiEditing.thinkingMessage);
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

  useEffect(() => {
    setTimeout(() => {
      if (messageScrollRef.current) {
        messageScrollRef.current.scrollTop =
          messageScrollRef.current.scrollHeight;
      }
    }, 0);
  }, [messages, thinkingMessage]);

  // ===== Animations =====
  const transition = useTransition(messages.length === 0, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 280, friction: 60 },
    onRest: () => {
      setShowConversation(true);
    },
  });

  // Loading indicator animation
  const loadingTransition = useTransition(isThinking, {
    from: {
      opacity: 0,
      transform: 'translateY(40px) scale(0.9)',
      maxHeight: '0px',
    },
    enter: {
      opacity: 1,
      transform: 'translateY(0px) scale(1)',
      maxHeight: '100px',
    },
    leave: {
      opacity: 0,
      transform: 'translateY(40px) scale(0.9)',
      maxHeight: '0px',
    },
    config: {
      tension: 220,
      friction: 30,
      mass: 1,
    },
  });

  // Cleanup function
  useEffect(() => {
    return () => {
      setCurrentMessage('');
      setAiEditSubmission(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // This has relative positioning for the use of the confirmation modal defined at the bottom of the component
    <div className='relative flex h-full w-full flex-col overflow-hidden'>
      {/* Header with close button */}
      <div className='flex shrink-0 flex-row justify-end gap-4 p-4'>
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

      {/* Main content area with flex-grow to take available space */}
      <div className='relative flex h-full flex-1 flex-col overflow-hidden'>
        {/* Intro message (shown when no messages exist) */}
        {transition(
          (style, item) =>
            item && (
              <animated.div
                style={style}
                className='absolute inset-0 flex items-center justify-center px-4'
              >
                <AiIntroMessage
                  title='AI Editing'
                  subtitle='Describe how you want this report to change'
                />
              </animated.div>
            ),
        )}

        <div
          ref={messageScrollRef}
          className='no-scrollbar mt-auto scroll-smooth pb-8'
        >
          {/* Conversation history */}
          {showConversation
            ? messages.map((message) => (
                <AiEditingChatMessage
                  key={message.uuid}
                  message={message}
                  onConfirmation={setAiEditSubmission}
                  onRejection={clearConversation}
                />
              ))
            : null}
        </div>
        {/* Loading indicator when AI is thinking */}
      </div>

      {/* Message input - fixed at bottom */}
      <div className='relative flex h-auto w-full shrink-0 flex-col justify-end gap-4 p-4'>
        {loadingTransition(
          (style, item) =>
            item && (
              <animated.div
                style={style}
                className='mx-4 flex flex-row gap-4 overflow-hidden'
              >
                <FrostedLoadingCard
                  variant='dark'
                  className='flex-1'
                  defaultMessage='Got it, processing your feedback...'
                />
              </animated.div>
            ),
        )}

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
                        toast(Toast, {
                          data: {
                            primaryMessage: 'Concept update started',
                            secondaryMessage:
                              'This may take up to 10 minutes. You can navigate away.',
                            status: 'warning', // Use success/info for confirmation
                          },
                        });
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
