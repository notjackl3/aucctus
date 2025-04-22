import { BetaDisclaimer, Icon, Modal } from '@components';
import AiIntroMessage from '@components/AiInteraction/AiIntroMessage';
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
import { toast } from '@components/Notification/toast';
import AiEditingConversation from './AiEditingConversation';
import { doFullConceptInvalidation } from '@hooks/query/concepts.hook';
import { useQueryClient } from 'react-query';

interface AiEditingCardProps {
  onClose: () => void;
}

/**
 * AiEditingCard - A component that provides an AI-assisted editing experience
 * for concept reports. It manages a conversation flow between the user and AI.
 */
const AiEditingCard: React.FC<AiEditingCardProps> = ({ onClose }) => {
  const [showConversation, setShowConversation] = useState(false);
  const [aiEditSubmission, setAiEditSubmission] = useState<
    IConceptReportEdit | Partial<IConceptReportEdit> | undefined
  >(undefined);

  // Identifiers for the concept and session
  const conceptUuid = useStore((state) => state.conceptReport.conceptUuid);
  const sessionId = useStore((state) => state.aiEditing.sessionId);

  // User input and messages
  const messages = useStore((state) => state.aiEditing.messages);
  const currentMessage = useStore((state) => state.aiEditing.currentMessage);
  const setCurrentMessage = useStore(
    (state) => state.aiEditing.setCurrentMessage,
  );
  const sendMessage = useStore((state) => state.aiEditing.sendMessage);
  const clearConversation = useStore(
    (state) => state.aiEditing.clearConversation,
  );

  const queryClient = useQueryClient();

  const isThinking = useStore((state) => state.aiEditing.isAucctusThinking);
  const thinkingMessage = useStore((state) => state.aiEditing.thinkingMessage);

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
    onRest: () => {
      setShowConversation(true);
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
      <div className='flex shrink-0 flex-row justify-between gap-4 p-4'>
        <BetaDisclaimer />
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

        <AiEditingConversation
          showConversation={showConversation}
          thinkingMessage={thinkingMessage}
          messages={messages}
          isThinking={isThinking}
          onConfirmation={setAiEditSubmission}
          onRejection={clearConversation}
        />
      </div>

      {/* Message input - fixed at bottom */}
      <div className='relative flex h-auto w-full flex-col justify-end gap-4 p-4'>
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
            title='Are you sure you want to proceed?'
            subtitle='Removed or changed content will be available in version history.'
            actions={[
              {
                title: 'Proceed',
                variant: 'primary',
                onClick: () => {
                  const editConceptUuid = conceptUuid!;

                  aiEditConcept(
                    {
                      concept_uuid: editConceptUuid,
                      session_id: sessionId!,
                      edit: aiEditSubmission,
                    },
                    {
                      onSuccess: () => {
                        setAiEditSubmission(undefined);
                        toast.warning(
                          'Concept update started',
                          'This may take up to 10 minutes. You can navigate away.',
                        );
                        doFullConceptInvalidation(queryClient, editConceptUuid);
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
