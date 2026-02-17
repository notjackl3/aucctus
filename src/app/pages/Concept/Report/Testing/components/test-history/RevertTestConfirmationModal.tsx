import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';
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
      className='glass-modal-overlay fixed inset-0 z-50 flex items-center justify-center'
      data-aucctus-portal-target='true'
    >
      {/* Click-outside handler */}
      <div className='absolute inset-0' onClick={onCancel} />

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
            <div className='mb-4 flex items-center gap-3'>
              <AlertCircle className='aucctus-stroke-warning-primary h-6 w-6' />
              <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Revert Test from History?
              </h3>
            </div>

            <div className='mb-6 space-y-3'>
              <p className='aucctus-text-sm aucctus-text-secondary'>
                Partially completed tests will be removed and next recommended
                test will be replaced with the selected test.{' '}
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
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RevertTestConfirmationModal;
