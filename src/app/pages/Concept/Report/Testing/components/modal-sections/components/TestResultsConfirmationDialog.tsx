import React from 'react';
import { createPortal } from 'react-dom';
import { TestResultsConfirmationDialogProps } from '../TestResults.types';

const TestResultsConfirmationDialog: React.FC<
  TestResultsConfirmationDialogProps
> = ({ confirmationDialog, onClose, isDeletingAll }) => {
  if (
    !confirmationDialog ||
    typeof document === 'undefined' ||
    !document.body
  ) {
    return null;
  }

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      data-aucctus-portal-target='true'
    >
      {/* Backdrop */}
      <div
        className='aucctus-bg-secondary-solid absolute inset-0 bg-opacity-50'
        onClick={onClose}
      />

      {/* Dialog */}
      <div className='aucctus-bg-primary aucctus-border-secondary relative max-w-md rounded-lg border p-6 shadow-lg'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
          {confirmationDialog.title}
        </h3>
        <p className='aucctus-text-sm aucctus-text-secondary mb-6'>
          {confirmationDialog.message}
        </p>

        <div className='flex justify-end gap-3'>
          <button className='btn btn-light btn-sm' onClick={onClose}>
            Cancel
          </button>
          <button
            className='btn btn-danger btn-sm'
            onClick={confirmationDialog.onConfirm}
            disabled={isDeletingAll}
          >
            {confirmationDialog.type === 'deleteAll' && isDeletingAll
              ? 'Deleting...'
              : confirmationDialog.type === 'deleteAll'
                ? 'Delete All'
                : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TestResultsConfirmationDialog;
