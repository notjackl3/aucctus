import React from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@components';

interface RevertTestConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testName: string;
  isReverting: boolean;
}

const RevertTestConfirmationModal: React.FC<
  RevertTestConfirmationModalProps
> = ({ isOpen, onConfirm, onCancel, testName, isReverting }) => {
  if (!isOpen || typeof document === 'undefined' || !document.body) {
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
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className='aucctus-bg-primary aucctus-border-secondary relative max-w-md rounded-lg border p-6 shadow-lg'>
        <div className='mb-4 flex items-center gap-3'>
          <Icon
            variant='alert-circle'
            className='aucctus-stroke-warning-primary h-6 w-6'
          />
          <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
            Revert Test from History?
          </h3>
        </div>

        <div className='mb-6 space-y-3'>
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Partially completed tests will be removed and next recommended test
            will be replaced with the selected test.{' '}
            <strong className='aucctus-text-primary'>
              Only completed tests will remain unchanged.
            </strong>{' '}
            You cannot undo this.
          </p>
          <div className='aucctus-bg-warning-subtle aucctus-border-warning-subtle rounded-lg border p-3'>
            <p className='aucctus-text-sm-semibold aucctus-text-warning-primary mb-2'>
              Review Your Test
            </p>
            <p className='aucctus-text-sm aucctus-text-secondary'>
              Test:{' '}
              <span className='aucctus-text-brand-primary font-semibold'>
                {testName}
              </span>
            </p>
          </div>
        </div>

        <div className='flex justify-end gap-3'>
          <button
            className='btn btn-light btn-sm'
            onClick={onCancel}
            disabled={isReverting}
          >
            Cancel
          </button>
          <button
            className='btn btn-primary btn-sm'
            onClick={onConfirm}
            disabled={isReverting}
          >
            {isReverting ? 'Reverting...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RevertTestConfirmationModal;
