import { useModal } from '@context/ModalContextProvider';
import React, { useEffect, useMemo } from 'react';
import Modal from '@components/Modal';
import { IActionButton } from '@components/Modal/ConfirmationModal/ConfirmationModal';

interface ConfirmAnswerUpdateProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmAnswerUpdate: React.FC<ConfirmAnswerUpdateProps> = ({
  show,
  onCancel,
  onConfirm,
}) => {
  const { openModal, closeModal } = useModal();

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
          title:
            'Updating this answer will delete answers to subsequent questions.',
          subtitle: 'This action can not be reversed. Continue?',
          actions: actions,
        },
        { position: 'center', shouldCloseOnOverlayClick: true },
      );
    }
  }, [show, onCancel, onConfirm, openModal, closeModal, actions]);

  return null;
};

export default ConfirmAnswerUpdate;
