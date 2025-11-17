import React, { useCallback, useState } from 'react';
import { Icon } from '@components';
import { BatchAssumptionChange } from '@stores/batch-assumption-changes';
import { getCategoryColors } from '@pages/Concept/Report/Assumptions/constants/categoryColors';
import { getCategoryIcon } from '@pages/Concept/Report/Assumptions/utils/assumptionUtils';
import { useModal } from '@context/ModalContextProvider';

interface BatchConfirmationModalProps {
  changes: BatchAssumptionChange[];
  onConfirm: () => Promise<void>;
  onCancel?: () => void; // Make optional since we can use modal context
  isLoading?: boolean;
}

const BatchConfirmationModal: React.FC<BatchConfirmationModalProps> = ({
  changes,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { closeModal } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);
  const addCount = changes.filter((c) => c.type === 'add').length;
  const editCount = changes.filter((c) => c.type === 'edit').length;
  const deleteCount = changes.filter((c) => c.type === 'delete').length;

  const handleCancel = useCallback(() => {
    onCancel?.(); // Call custom onCancel if provided
    closeModal(); // Always close the modal
  }, [onCancel, closeModal]);

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

  const getLevel = (value: number): string => {
    // Handle both backend format (1-3) and frontend format (0-1)
    if (value >= 3 || value >= 0.66) return 'High';
    if (value >= 2 || value >= 0.33) return 'Medium';
    return 'Low';
  };

  // Helper function to convert status to display text
  const getStatusDisplayText = (status: string): string => {
    if (status === 'validated') return 'Validated';
    if (status === 'invalidated') return 'Invalidated';
    if (status === 'partially_validated') return 'Partially Validated';
    return 'Untested';
  };

  const renderChangesList = () => {
    if (changes.length === 0) return null;

    return (
      <div className='aucctus-bg-secondary mt-4 w-full rounded-lg p-4'>
        <h4 className='aucctus-text-md-semibold aucctus-text-primary mb-3'>
          Changes to be Applied ({changes.length})
        </h4>

        <div className='max-h-60 space-y-3 overflow-y-auto'>
          {changes.map((change) => {
            const category =
              change.changes?.category ||
              change.originalData?.category ||
              'desirability';
            const categoryColors = getCategoryColors(category);
            const iconVariant = getCategoryIcon(category);

            return (
              <div
                key={change.id}
                className='aucctus-bg-primary aucctus-border-tertiary rounded border p-3'
              >
                {/* Change Header */}
                <div className='mb-2 flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`rounded-full p-1 ${
                        change.type === 'add'
                          ? 'aucctus-bg-success-subtle'
                          : change.type === 'edit'
                            ? 'aucctus-bg-warning-subtle'
                            : 'aucctus-bg-error-subtle'
                      }`}
                    >
                      <Icon
                        variant={
                          change.type === 'add'
                            ? 'plus'
                            : change.type === 'edit'
                              ? 'edit'
                              : 'trash'
                        }
                        className={`h-3 w-3 ${
                          change.type === 'add'
                            ? 'aucctus-stroke-success-primary'
                            : change.type === 'edit'
                              ? 'aucctus-stroke-warning-primary'
                              : 'aucctus-stroke-error-primary'
                        }`}
                      />
                    </div>
                    <span className='aucctus-text-xs-semibold aucctus-text-primary capitalize'>
                      {change.type === 'add'
                        ? 'New'
                        : change.type === 'edit'
                          ? 'Edit'
                          : 'Delete'}{' '}
                      Assumption
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Icon
                      variant={iconVariant as any}
                      className={`${categoryColors.stroke} h-3 w-3`}
                    />
                    <span className='aucctus-text-xs aucctus-text-secondary capitalize'>
                      {change.changes?.category ||
                        change.originalData?.category}
                    </span>
                  </div>
                </div>

                {/* Statement */}
                <div className='mb-2'>
                  <p className='aucctus-text-xs aucctus-text-primary'>
                    {change.changes?.statement ||
                      change.originalData?.statement}
                  </p>
                </div>

                {/* Metrics - only show for add/edit, not delete */}
                {change.type !== 'delete' && change.changes && (
                  <div className='flex flex-wrap gap-3'>
                    <div className='flex items-center gap-1'>
                      <span className='aucctus-text-xs aucctus-text-tertiary'>
                        Importance:
                      </span>
                      <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                        {getLevel(change.changes.importance)}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <span className='aucctus-text-xs aucctus-text-tertiary'>
                        Certainty:
                      </span>
                      <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                        {getLevel(change.changes.certainty)}
                      </span>
                    </div>
                    {/* Show status change if it was modified */}
                    {change.changes.validationStatus !== undefined &&
                      change.originalData &&
                      change.changes.validationStatus !==
                        (change.originalData.validationStatus ||
                          change.originalData.status ||
                          'untested') && (
                        <div className='flex items-center gap-1'>
                          <span className='aucctus-text-xs aucctus-text-tertiary'>
                            Status:
                          </span>
                          <span className='aucctus-text-xs-semibold aucctus-text-primary line-through'>
                            {getStatusDisplayText(
                              change.originalData.validationStatus ||
                                change.originalData.status ||
                                'untested',
                            )}
                          </span>
                          <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                            →
                          </span>
                          <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                            {getStatusDisplayText(
                              change.changes.validationStatus || 'untested',
                            )}
                          </span>
                        </div>
                      )}
                    {/* Show status for new assumptions */}
                    {change.type === 'add' &&
                      change.changes.validationStatus !== undefined && (
                        <div className='flex items-center gap-1'>
                          <span className='aucctus-text-xs aucctus-text-tertiary'>
                            Status:
                          </span>
                          <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                            {getStatusDisplayText(
                              change.changes.validationStatus || 'untested',
                            )}
                          </span>
                        </div>
                      )}
                  </div>
                )}

                {/* Delete warning */}
                {change.type === 'delete' && (
                  <div className='aucctus-bg-error-subtle aucctus-text-error-primary rounded px-2 py-1 text-xs'>
                    ⚠️ Will be permanently deleted
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getModalContent = () => {
    return {
      title: 'Confirm Changes',
      message: `You are about to apply ${changes.length} changes to your assumptions. Partially completed tests will be removed and next recommended test will be re-assessed. Only completed tests will remain unchanged. You cannot undo this.`,
      confirmButtonText: 'Apply All Changes',
      confirmButtonVariant: 'btn-primary',
      icon: 'save' as const,
    };
  };

  const content = getModalContent();
  const isDisabled = isLoading || isProcessing;

  return (
    <div className='aucctus-bg-primary inline-flex max-h-[100vh] w-[600px] flex-col items-center justify-start rounded-xl'>
      {/* Header */}
      <div className='aucctus-border-primary inline-flex w-full items-center justify-between border-b p-4'>
        <span className='aucctus-text-lg-medium aucctus-text-primary pl-2'>
          {content.title}
        </span>
        <button
          className='aucctus-bg-primary-hover rounded-lg p-2'
          onClick={handleCancel}
          aria-label='Close modal'
          disabled={isDisabled}
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
                className='aucctus-stroke-warning-primary h-8 w-8'
              />
            </div>
            <p className='aucctus-text-md aucctus-text-primary mb-2'>
              {content.message}
            </p>

            {/* Summary badges */}
            <div className='mb-4 flex flex-wrap justify-center gap-2'>
              {addCount > 0 && (
                <div className='aucctus-bg-success-subtle aucctus-text-success-primary rounded-full px-3 py-1 text-xs font-medium'>
                  {addCount} new assumption{addCount !== 1 ? 's' : ''}
                </div>
              )}
              {editCount > 0 && (
                <div className='aucctus-bg-warning-subtle aucctus-text-warning-primary rounded-full px-3 py-1 text-xs font-medium'>
                  {editCount} edited assumption{editCount !== 1 ? 's' : ''}
                </div>
              )}
              {deleteCount > 0 && (
                <div className='aucctus-bg-error-subtle aucctus-text-error-primary rounded-full px-3 py-1 text-xs font-medium'>
                  {deleteCount} deleted assumption{deleteCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Show changes list */}
            {renderChangesList()}
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={handleCancel}
              disabled={isDisabled}
            >
              Cancel
            </button>
            <button
              type='button'
              className={`btn ${content.confirmButtonVariant}`}
              onClick={handleConfirm}
              disabled={isDisabled}
            >
              {isDisabled ? (
                <>
                  <Icon
                    variant='loading-02'
                    className='aucctus-stroke-white mr-2 h-4 w-4 animate-spin'
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Icon
                    variant='save'
                    className='aucctus-stroke-white mr-2 h-4 w-4'
                  />
                  {content.confirmButtonText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchConfirmationModal;
