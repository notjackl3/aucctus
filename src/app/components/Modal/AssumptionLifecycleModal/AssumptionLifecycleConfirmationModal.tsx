import React, { useCallback, useState } from 'react';
import { Icon } from '@components';
import { useModal } from '@context/ModalContextProvider';

interface AssumptionLifecycleConfirmationModalProps {
  mode: 'add_edit' | 'delete';
  assumptionStatement?: string;
  onConfirm: () => Promise<void>;
}

const AssumptionLifecycleConfirmationModal: React.FC<
  AssumptionLifecycleConfirmationModalProps
> = ({ mode, assumptionStatement, onConfirm }) => {
  const { closeModal } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);

  const getModalContent = () => {
    if (mode === 'delete') {
      return {
        title: 'Delete Assumption',
        message:
          'You are deleting an assumption. Partially completed tests will be removed and next recommended test will be re-assessed. Only completed tests will remain unchanged. You cannot undo this.',
        confirmButtonText: 'Delete Assumption',
        confirmButtonVariant: 'btn-danger',
        icon: 'trash' as const,
      };
    } else {
      return {
        title: 'Confirm Assumption Change',
        message:
          'Partially completed tests will be removed and next recommended test will be re-assessed. Only completed tests will remain unchanged. You cannot undo this.',
        confirmButtonText: 'Continue',
        confirmButtonVariant: 'btn-primary',
        icon: 'alert-circle' as const,
      };
    }
  };

  const content = getModalContent();

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      closeModal();
    } catch (error) {
      // Error handling is done in the parent component/hook
      setIsProcessing(false);
    }
  }, [onConfirm, closeModal]);

  const handleCancel = useCallback(() => {
    closeModal();
  }, [closeModal]);

  return (
    <div className='aucctus-bg-primary inline-flex max-h-[100vh] w-[500px] flex-col items-center justify-start rounded-xl'>
      {/* Header */}
      <div className='aucctus-border-primary inline-flex w-full items-center justify-between border-b p-4'>
        <span className='aucctus-text-lg-medium aucctus-text-primary pl-2'>
          {content.title}
        </span>
        <button
          className='aucctus-bg-primary-hover rounded-lg p-2'
          onClick={handleCancel}
          aria-label='Close modal'
          disabled={isProcessing}
        >
          <Icon variant='closeX' className='aucctus-stroke-secondary h-6 w-6' />
        </button>
      </div>

      {/* Content */}
      <div className='inline-flex w-full items-start justify-start overflow-auto p-6'>
        <div className='w-full'>
          {/* Warning Icon and Message */}
          <div className='mb-6 flex flex-col items-center text-center'>
            <div className='mb-4 rounded-full bg-orange-100 p-3'>
              <Icon
                variant={content.icon}
                className={`h-8 w-8 ${
                  mode === 'delete'
                    ? 'aucctus-stroke-error-primary'
                    : 'aucctus-stroke-warning-primary'
                }`}
              />
            </div>
            <p className='aucctus-text-md aucctus-text-primary mb-2'>
              {content.message}
            </p>
            {mode === 'delete' && assumptionStatement && (
              <div className='aucctus-bg-secondary mt-4 w-full rounded-lg p-3'>
                <p className='aucctus-text-sm aucctus-text-secondary mb-1'>
                  Assumption to be deleted:
                </p>
                <p className='aucctus-text-sm aucctus-text-primary italic'>
                  &ldquo;{assumptionStatement}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type='button'
              className={`btn ${content.confirmButtonVariant}`}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Icon
                    variant='loading-02'
                    className='aucctus-stroke-white mr-2 h-4 w-4 animate-spin'
                  />
                  Processing...
                </>
              ) : (
                content.confirmButtonText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionLifecycleConfirmationModal;
