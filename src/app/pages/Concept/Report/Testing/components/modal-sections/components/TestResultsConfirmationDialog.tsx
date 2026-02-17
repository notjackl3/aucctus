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
      className='glass-modal-overlay fixed inset-0 z-50 flex items-center justify-center'
      data-aucctus-portal-target='true'
    >
      {/* Click-outside handler */}
      <div className='absolute inset-0' onClick={onClose} />

      {/* Glass modal */}
      <div className='relative max-w-md' onClick={(e) => e.stopPropagation()}>
        <div className='liquid-glass-modal-shell'>
          <div
            aria-hidden='true'
            className='liquid-glass-modal-rim liquid-glass-modal-rim-animated'
          >
            <div className='rim-orb rim-orb-1' />
            <div className='rim-orb rim-orb-2' />
          </div>
          <div className='liquid-glass-modal-surface p-6'>
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
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TestResultsConfirmationDialog;
