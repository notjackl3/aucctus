import { BetaDisclaimer, Modal } from '@components';
import AiIntroMessage from '@components/AiInteraction/AiIntroMessage';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';
import { useModal } from '@context/ModalContextProvider';
import {
  markConceptSectionsPending,
  useConceptAiEditing,
} from '@hooks/query/concepts.hook';
import {
  IConceptReportEdit,
  IFeatureVersions,
  FeatureName,
} from '@libs/api/types';
import useStore from '@stores/store';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { AnimatePresence, motion } from 'framer-motion';
import AiEditingConversation from './AiEditingConversation';
import OutdatedSectionsBanner from './OutdatedSectionsBanner';
import { LATEST_FEATURE_VERSIONS } from '@libs/constants';
import { mapBackendSectionToReportKey } from '@libs/utils/concepts';
import type { ConceptReportStatusBySection } from '@libs/api/types/concept/concepts';
import { Trash2, X } from 'lucide-react';

interface AiEditingCardProps {
  onClose: () => void;
}

/**
 * Helper function to get outdated sections
 */
const getOutdatedSections = (featureVersions?: IFeatureVersions): string[] => {
  if (!featureVersions) return [];

  const outdatedSections: string[] = [];

  (Object.keys(LATEST_FEATURE_VERSIONS) as FeatureName[]).forEach((feature) => {
    // Skip assumptions and ecosystem
    if (feature === 'assumptions' || feature === 'ecosystem') return;

    const currentVersion = featureVersions[feature];
    const latestVersion = LATEST_FEATURE_VERSIONS[feature];

    if (currentVersion && currentVersion !== latestVersion) {
      // Convert camelCase to readable format
      const readableFeature = feature
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());
      outdatedSections.push(readableFeature);
    }
  });

  return outdatedSections;
};

/**
 * AiEditingCard - A component that provides an AI-assisted editing experience
 * for concept reports. It manages a conversation flow between the user and AI.
 */
const AiEditingCard: React.FC<AiEditingCardProps> = ({ onClose }) => {
  const [showConversation, setShowConversation] = useState(false);
  const [aiEditSubmission, setAiEditSubmission] = useState<
    IConceptReportEdit | Partial<IConceptReportEdit> | undefined
  >(undefined);

  // Ref for the message input to enable auto-focus
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Identifiers for the concept and session
  const conceptUuid = useStore((state) => state.conceptReport.conceptUuid);
  const conceptIdentifier = useStore((state) => state.conceptReport.identifier);
  const featureVersions = useStore(
    (state) => state.conceptReport.featureVersions,
  );
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
  const prepopulatedEditMessage = useStore(
    (state) => state.aiEditing.prepopulatedEditMessage,
  );
  const clearPrepopulatedEditMessage = useStore(
    (state) => state.aiEditing.clearPrepopulatedEditMessage,
  );

  const queryClient = useQueryClient();

  const isThinking = useStore((state) => state.aiEditing.isAucctusThinking);
  const thinkingMessage = useStore((state) => state.aiEditing.thinkingMessage);

  // Check for outdated sections
  const outdatedSections = useMemo(
    () => getOutdatedSections(featureVersions),
    [featureVersions],
  );

  // ===== Hooks =====
  const { mutate: aiEditConcept, isLoading: isAiEditConceptLoading } =
    useConceptAiEditing();
  const { closeModal } = useModal();

  // Auto-focus the message input when component mounts
  useEffect(() => {
    // Small delay to ensure the modal is fully rendered and animated
    const focusTimeout = setTimeout(() => {
      messageInputRef.current?.focus();
    }, 500);

    return () => clearTimeout(focusTimeout);
  }, []);

  // Consume prepopulated edit message from external navigation (e.g., Signal Scanning)
  useEffect(() => {
    if (prepopulatedEditMessage && !currentMessage) {
      setCurrentMessage(prepopulatedEditMessage);
      clearPrepopulatedEditMessage();
    }
  }, [
    prepopulatedEditMessage,
    currentMessage,
    setCurrentMessage,
    clearPrepopulatedEditMessage,
  ]);

  // Cleanup function
  useEffect(() => {
    return () => {
      setCurrentMessage('');
      setAiEditSubmission(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showIntro = messages.length === 0;

  return (
    // This has relative positioning for the use of the confirmation modal defined at the bottom of the component
    <div className='relative flex h-full w-full flex-col overflow-hidden'>
      {/* Header with close button */}
      <div className='flex shrink-0 flex-col gap-4 p-4'>
        <div className='flex flex-row justify-between gap-4'>
          <BetaDisclaimer />
          <div className='flex gap-2'>
            <button
              onClick={() => clearConversation()}
              className='aspect-square w-6 rounded-lg transition-all duration-200 hover:bg-gray-light-100 hover:bg-opacity-20'
              title='Clear conversation'
            >
              <span className='flex items-center justify-center'>
                <Trash2 size={16} className='stroke-gray-light-100' />
              </span>
            </button>
            <button
              onClick={onClose}
              className='aspect-square w-6 rounded-lg transition-all duration-200 hover:bg-gray-light-100 hover:bg-opacity-20'
              title='Close window'
            >
              <span className='flex items-center justify-center'>
                <X size={20} className='stroke-gray-light-100' />
              </span>
            </button>
          </div>
        </div>

        {/* Outdated sections banner */}
        <OutdatedSectionsBanner outdatedSections={outdatedSections} />
      </div>

      {/* Main content area with flex-grow to take available space */}
      <div className='relative flex h-full flex-1 flex-col overflow-hidden'>
        {/* Intro message (shown when no messages exist) */}
        <AnimatePresence
          onExitComplete={() => {
            setShowConversation(true);
          }}
        >
          {showIntro && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 60 }}
              className='absolute inset-0 flex items-center justify-center px-4'
            >
              <AiIntroMessage
                title='AI Editing'
                subtitle='Describe how you want this report to change'
              />
            </motion.div>
          )}
        </AnimatePresence>

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
          ref={messageInputRef}
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
        <div className='aucctus-bg-tertiary absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform bg-opacity-50 px-4 pt-32'>
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

                        // Clear the conversation after successful edit
                        clearConversation();

                        // Mark sections as pending in the cache
                        // DO NOT invalidate queries here - that would force a refetch from backend
                        // which still shows "complete" status, overwriting our pending states.
                        // WebSocket events will handle the actual data updates when backend completes.
                        if (conceptIdentifier) {
                          // Extract only the specific sections being edited from the AI response
                          let sectionsToUpdate: string[] = [];

                          if (aiEditSubmission?.edits) {
                            const mappedSections = aiEditSubmission.edits
                              .map((edit) =>
                                mapBackendSectionToReportKey(edit.section),
                              )
                              .filter(
                                (
                                  section,
                                ): section is keyof ConceptReportStatusBySection =>
                                  !!section,
                              );

                            sectionsToUpdate = Array.from(
                              new Set(mappedSections),
                            ).map((section) => section as string);
                          }

                          // If no sections were mapped, skip updating
                          if (sectionsToUpdate.length === 0) {
                            return;
                          }

                          markConceptSectionsPending(
                            queryClient,
                            conceptIdentifier,
                            sectionsToUpdate,
                          );
                        }

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
