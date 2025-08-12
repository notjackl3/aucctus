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

  const modalContent = useMemo(() => {
    if (isClarifyingQuestion) {
      const baseMessage =
        'Answering or updating clarifying questions will delete your previous concepts.';
      const cachedMessage = hasCachedConcepts
        ? " Your previously generated concepts will also be removed and you'll need to generate new ones."
        : '';

      return {
        title: 'Answer clarifying question?',
        subtitle:
          baseMessage + cachedMessage + ' This action cannot be reversed.',
      };
    }

    // For final question - warn about cached concepts and/or clarifying questions
    if (
      isFinalQuestion &&
      (hasCachedConcepts || hasExistingClarifyingQuestions)
    ) {
      let message = 'Changing your final answer will';
      const items = [];

      if (hasCachedConcepts) {
        items.push('remove your generated concepts');
      }
      if (hasExistingClarifyingQuestions) {
        items.push('delete your clarifying question answers');
      }

      if (items.length === 1) {
        message += ` ${items[0]}`;
      } else if (items.length === 2) {
        message += ` ${items[0]} and ${items[1]}`;
      }

      message += hasCachedConcepts
        ? " and you'll have to generate new ones. This action cannot be reversed."
        : '. This action cannot be reversed.';

      return {
        title: 'Update final answer?',
        subtitle: message,
      };
    }

    // For regular questions - warn about subsequent questions and cached concepts
    const baseMessage =
      'Updating this answer will delete answers to subsequent questions.';
    const cachedMessage = hasCachedConcepts
      ? ' Your cached concepts will also be removed.'
      : '';

    return {
      title:
        'Updating this answer will delete answers to subsequent questions.',
      subtitle:
        baseMessage +
        cachedMessage +
        ' This action can not be reversed. Continue?',
    };
  }, [
    isClarifyingQuestion,
    isFinalQuestion,
    hasCachedConcepts,
    hasExistingClarifyingQuestions,
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
