import { createPortal } from 'react-dom';
import ConfirmationModal from '@components/Modal/ConfirmationModal/ConfirmationModal';
import React from 'react';

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
  if (!show) return null;

  return createPortal(
    <div className='fixed inset-0 z-[9999] flex animate-fade-in items-center justify-center bg-black/50'>
      <ConfirmationModal
        title='Updating this answer will delete answers to subsequent questions.'
        subtitle='This action can not be reversed. Continue?'
        actions={[
          {
            title: 'Cancel',
            variant: 'light',
            onClick: onCancel,
          },
          {
            title: 'Confirm',
            variant: 'primary',
            onClick: onConfirm,
          },
        ]}
      />
    </div>,
    document.body,
  );
};

export default ConfirmAnswerUpdate;
