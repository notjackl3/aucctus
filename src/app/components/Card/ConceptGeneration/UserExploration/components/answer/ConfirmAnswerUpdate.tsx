import { useModal } from '@context/ModalContextProvider';
import React, { useEffect, useMemo } from 'react';
import Modal from '@components/Modal';
import { IActionButton } from '@components/Modal/ConfirmationModal/ConfirmationModal';

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

  const modalContent = useMemo(() => {
    if (isClarifyingQuestion) {
      return {
        title: 'Answer clarifying question?',
        subtitle:
          'Answering or updating clarifying questions will delete your previous concepts. This action cannot be reversed.',
      };
    }
    return {
      title:
        'Updating this answer will delete answers to subsequent questions.',
      subtitle: 'This action can not be reversed. Continue?',
    };
  }, [isClarifyingQuestion]);

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
