import { useModal } from '@context/ModalContextProvider';
import React, { useEffect, useMemo } from 'react';
import Modal from '@components/Modal';
import { IActionButton } from '@components/Modal/ConfirmationModal/ConfirmationModal';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import { useSeed } from '@hooks/query/concepts.hook';
import { useSearchParams } from 'react-router-dom';

interface ConfirmAnswerUpdateProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isClarifyingQuestion?: boolean;
}

const ConfirmAnswerUpdate: React.FC<ConfirmAnswerUpdateProps> = ({
  show,
  onCancel,
  onConfirm,
  isClarifyingQuestion = false,
}) => {
  const { openModal, closeModal } = useModal();

  // Get incubation store data
  const { submittedAnswers, getNextQuestion } = useConceptIncubationStore();

  // Get seed data to check for cached concepts
  const [searchParams] = useSearchParams();
  const seedUuid = searchParams.get('seed') || undefined;
  const { data: seedDraftData } = useSeed(seedUuid, { status: 'draft' });

  // Check if we have cached concepts
  const hasCachedConcepts = useMemo(() => {
    return (
      seedDraftData?.cachedConcepts &&
      Array.isArray(seedDraftData.cachedConcepts) &&
      seedDraftData.cachedConcepts.length > 0
    );
  }, [seedDraftData]);

  // Check if this is the final question
  const isFinalQuestion = useMemo(() => {
    const nextQuestion = getNextQuestion(submittedAnswers);
    return !nextQuestion; // If no next question, this is the final one
  }, [getNextQuestion, submittedAnswers]);

  // Check if there are existing clarifying questions
  const hasExistingClarifyingQuestions = useMemo(() => {
    return (
      seedDraftData?.clarifyingQuestions &&
      seedDraftData.clarifyingQuestions.length > 0
    );
  }, [seedDraftData]);

  // Check if this is a cloned seed
  const isClonedSeed = useMemo(() => {
    return seedDraftData?.isCloned === true;
  }, [seedDraftData]);

  const getWarningMessage = useMemo(() => {
    return (
      scenario: 'regular' | 'final' | 'clarifying',
      isCloned: boolean,
    ) => {
      if (isCloned) {
        // Cloned seed warning copy matrix
        switch (scenario) {
          case 'regular':
            const baseMessage =
              'Changing this answer may require updates to subsequent answers. Please review them after making this change. Clarifying questions will need to be regenerated.';
            const cachedMessage = hasCachedConcepts
              ? ' Your cached concepts will also be removed and re-generation will be required. This action cannot be reversed.'
              : '';
            return baseMessage + cachedMessage;
          case 'final':
            const finalBaseMessage =
              'Changing this answer will require you to regenerate your clarifying questions.';
            const finalCachedMessage = hasCachedConcepts
              ? ' Your cached concepts will also be removed and re-generation will be required.'
              : '';
            return (
              finalBaseMessage +
              finalCachedMessage +
              ' This action cannot be reversed.'
            );
          case 'clarifying':
            const baseMsg =
              'Answering or updating clarifying questions will delete your previously generated concepts, requiring regeneration.';
            return baseMsg + ' This action cannot be reversed.';
        }
      }

      // Non-cloned seed warning copy (existing behavior)
      switch (scenario) {
        case 'regular':
          const baseMessage =
            'Updating this answer will delete answers to subsequent questions.';
          const cachedMessage = hasCachedConcepts
            ? ' Your cached concepts will also be removed.'
            : '';
          return (
            baseMessage +
            cachedMessage +
            ' This action can not be reversed. Continue?'
          );
        case 'final':
          let message = 'Changing your final answer will';
          const items = [];
          if (hasCachedConcepts) items.push('remove your generated concepts');
          if (hasExistingClarifyingQuestions)
            items.push('delete your clarifying question answers');

          if (items.length === 1) {
            message += ` ${items[0]}`;
          } else if (items.length === 2) {
            message += ` ${items[0]} and ${items[1]}`;
          }

          message += hasCachedConcepts
            ? " and you'll have to generate new ones. This action cannot be reversed."
            : '. This action cannot be reversed.';
          return message;
        case 'clarifying':
          const baseMsg =
            'Answering or updating clarifying questions will delete your previously generated concepts, requiring regeneration.';
          return baseMsg + ' This action cannot be reversed.';
      }
    };
  }, [hasCachedConcepts, hasExistingClarifyingQuestions]);

  const modalContent = useMemo(() => {
    let scenario: 'regular' | 'final' | 'clarifying';
    let title: string;

    if (isClarifyingQuestion) {
      scenario = 'clarifying';
      title = 'Answer clarifying question?';
    } else if (
      isFinalQuestion &&
      (hasCachedConcepts || hasExistingClarifyingQuestions)
    ) {
      scenario = 'final';
      title = 'Update final answer?';
    } else {
      scenario = 'regular';
      // For cloned seeds, use different title since nothing gets deleted
      title = isClonedSeed
        ? 'Confirm answer update?'
        : 'Updating this answer will delete answers to subsequent questions.';
    }

    const subtitle = getWarningMessage(scenario, isClonedSeed);

    return {
      title,
      subtitle,
    };
  }, [
    isClarifyingQuestion,
    isFinalQuestion,
    hasCachedConcepts,
    hasExistingClarifyingQuestions,
    isClonedSeed,
    getWarningMessage,
  ]);

  const actions: IActionButton[] = useMemo(
    () => [
      {
        title: 'Cancel',
        variant: 'light',
        onClick: () => {
          closeModal();
          onCancel();
        },
      },
      {
        title: 'Confirm',
        variant: 'primary',
        onClick: () => {
          closeModal();
          onConfirm();
        },
      },
    ],
    [onCancel, onConfirm, closeModal],
  );

  useEffect(() => {
    if (show) {
      openModal(
        Modal.Confirmation,
        {
          title: modalContent.title,
          subtitle: modalContent.subtitle,
          actions: actions,
        },
        { position: 'center', shouldCloseOnOverlayClick: true },
      );
    }
  }, [show, onCancel, onConfirm, openModal, closeModal, actions, modalContent]);

  return null;
};

export default ConfirmAnswerUpdate;
