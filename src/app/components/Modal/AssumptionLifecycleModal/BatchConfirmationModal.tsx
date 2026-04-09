import React, { useCallback, useState } from 'react';
import { BatchAssumptionChange } from '@stores/batch-assumption-changes';
import { useModal } from '@context/ModalContextProvider';
import { AssumptionStatusV2 } from '@libs/api/types';

// Import existing badge components
import RiskBadge from '@pages/Concept/Report/Assumptions/components/badges/RiskBadge';
import StatusBadge from '@pages/Concept/Report/Assumptions/components/badges/StatusBadge';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface BatchConfirmationModalProps {
  changes: BatchAssumptionChange[];
  onConfirm: () => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Field labels for display
const FIELD_LABELS: Record<string, string> = {
  statement: 'Statement',
  risk: 'Risk',
  certainty: 'Certainty',
  importance: 'Importance',
  validationStatus: 'Status',
  category: 'Category',
};

// Helper to normalize value to 0-100 scale
const normalizeToPercent = (value: number): number => {
  return value <= 1 ? value * 100 : value;
};

// Get level label from percentage (matching RegenerateTestsBanner)
const getLevel = (value: number): 'high' | 'medium' | 'low' => {
  if (value >= 75) return 'high';
  if (value >= 50) return 'medium';
  return 'low';
};

// Get visual blocks for importance/certainty (3 blocks: low, medium, high)
const getBlocks = (value: number) => {
  // Determine filled blocks based on level thresholds (matching getLevel)
  let filledBlocks = 1; // low
  if (value >= 75)
    filledBlocks = 3; // high
  else if (value >= 50) filledBlocks = 2; // medium

  const getBlockColor = (filled: boolean, totalFilled: number) => {
    if (!filled) return 'bg-gray-200';
    if (totalFilled >= 3) return 'bg-red-500'; // high
    if (totalFilled >= 2) return 'bg-yellow-500'; // medium
    return 'bg-green-500'; // low
  };

  return Array.from({ length: 3 }, (_, i) => (
    <div
      key={i}
      className={`h-2.5 w-1.5 ${getBlockColor(i < filledBlocks, filledBlocks)}`}
    />
  ));
};

// Get modified fields by comparing original and changes
const getModifiedFields = (change: BatchAssumptionChange): string[] => {
  if (change.type === 'add') return [];
  if (change.type === 'delete') return [];
  if (!change.originalData || !change.changes) return [];

  const modifiedFields: string[] = [];

  if (change.changes.statement !== change.originalData.statement) {
    modifiedFields.push('statement');
  }
  if (change.changes.category !== change.originalData.category) {
    modifiedFields.push('category');
  }
  if (change.changes.importance !== change.originalData.importance) {
    modifiedFields.push('importance');
  }
  if (change.changes.certainty !== change.originalData.certainty) {
    modifiedFields.push('certainty');
  }
  if (
    change.changes.validationStatus !== undefined &&
    change.changes.validationStatus !== change.originalData.validationStatus
  ) {
    modifiedFields.push('validationStatus');
  }

  return modifiedFields;
};

const BatchConfirmationModal: React.FC<BatchConfirmationModalProps> = ({
  changes,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { closeModal } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = useCallback(() => {
    onCancel?.();
    closeModal();
  }, [onCancel, closeModal]);

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      closeModal();
    } catch (error) {
      setIsProcessing(false);
    }
  }, [onConfirm, closeModal]);

  const renderChangesList = () => {
    if (changes.length === 0) return null;

    return (
      <div className='mt-4 w-full space-y-4 px-2'>
        {/* Section Header */}
        <div className='flex items-center gap-2'>
          <AlertTriangle className='aucctus-stroke-warning-primary h-4 w-4' />
          <p className='aucctus-text-xs-medium aucctus-text-tertiary uppercase tracking-wide'>
            Modified
          </p>
          <span className='aucctus-bg-secondary aucctus-text-secondary rounded px-1.5 py-0.5 text-xs'>
            {changes.length}
          </span>
        </div>

        {/* Changes List */}
        <div className='space-y-2'>
          {changes.map((change) => {
            // Get values from changes (for add/edit) or originalData (for delete)
            const statement =
              change.changes?.statement || change.originalData?.statement || '';
            // Use risk from changes if available (for new/edited), otherwise from originalData
            const risk =
              change.changes?.risk ?? change.originalData?.risk ?? 0.5;
            const status = (change.changes?.validationStatus ||
              change.originalData?.validationStatus ||
              'untested') as AssumptionStatusV2;
            const importance =
              change.changes?.importance ??
              change.originalData?.importance ??
              0.5;
            const certainty =
              change.changes?.certainty ??
              change.originalData?.certainty ??
              0.5;

            const modifiedFields = getModifiedFields(change);

            return (
              <div
                key={change.id}
                className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'
              >
                {/* Header: Statement + Risk/Status badges */}
                <div className='mb-3 flex items-start justify-between gap-4'>
                  <p className='aucctus-text-lg-semibold aucctus-text-primary flex-1 text-left leading-tight'>
                    {statement}
                  </p>
                  <div className='flex flex-shrink-0 items-center gap-2'>
                    <RiskBadge risk={normalizeToPercent(risk)} />
                    <StatusBadge status={status} />
                  </div>
                </div>

                {/* Importance and Certainty - side by side (matching RegenerateTestsBanner) */}
                <div className='mb-3 flex items-center gap-4'>
                  {/* Importance */}
                  <div className='flex items-center gap-1.5'>
                    <span className='aucctus-text-xs-medium aucctus-text-tertiary'>
                      Importance
                    </span>
                    <div className='aucctus-bg-secondary-subtle aucctus-border-secondary flex h-7 items-center gap-1.5 rounded-md border px-2 py-0.5'>
                      <div className='flex gap-0.5'>
                        {getBlocks(normalizeToPercent(importance))}
                      </div>
                      <span className='aucctus-text-xs-semibold aucctus-text-secondary capitalize'>
                        {getLevel(normalizeToPercent(importance))}
                      </span>
                    </div>
                  </div>

                  {/* Certainty */}
                  <div className='flex items-center gap-1.5'>
                    <span className='aucctus-text-xs-medium aucctus-text-tertiary'>
                      Certainty
                    </span>
                    <div className='aucctus-bg-secondary-subtle aucctus-border-secondary flex h-7 items-center gap-1.5 rounded-md border px-2 py-0.5'>
                      <div className='flex gap-0.5'>
                        {getBlocks(normalizeToPercent(certainty))}
                      </div>
                      <span className='aucctus-text-xs-semibold aucctus-text-secondary capitalize'>
                        {getLevel(normalizeToPercent(certainty))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Modified fields or Change type indicator */}
                <div className='aucctus-border-tertiary flex items-center gap-2 border-t pt-2'>
                  {change.type === 'edit' && modifiedFields.length > 0 ? (
                    <>
                      <span className='aucctus-text-xs-medium aucctus-text-warning-primary'>
                        Modified:
                      </span>
                      <div className='flex flex-wrap gap-1.5'>
                        {modifiedFields.map((field) => (
                          <span
                            key={field}
                            className='aucctus-bg-warning-subtle aucctus-border-warning-subtle aucctus-text-warning-primary rounded border px-1.5 py-0.5 text-xs'
                          >
                            {FIELD_LABELS[field] || field}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : change.type === 'add' ? (
                    <>
                      <span className='aucctus-text-xs-medium aucctus-text-success-primary'>
                        New Assumption
                      </span>
                    </>
                  ) : change.type === 'delete' ? (
                    <div className='aucctus-bg-error-subtle aucctus-text-error-primary flex w-full items-center gap-2 rounded px-2 py-1 text-xs'>
                      <AlertTriangle className='aucctus-stroke-error-primary h-3.5 w-3.5' />
                      Will be permanently deleted
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getModalContent = () => {
    return {
      title: 'Changing Assumptions Will Regenerate The Recommended Next Test',
      message: `This action cannot be undone.`,
      confirmButtonText: 'Proceed',
      confirmButtonVariant: 'btn-primary',
    };
  };

  const content = getModalContent();
  const isDisabled = isLoading || isProcessing;

  return (
    <div className='aucctus-bg-primary relative inline-flex max-h-[90vh] w-[600px] flex-col items-center justify-start rounded-xl'>
      {/* Sticky Header */}
      <div className='relative w-full flex-shrink-0 px-6 pb-2 pt-6 text-center'>
        <button
          className='aucctus-bg-primary-hover absolute right-4 top-4 z-10 rounded-lg p-2'
          onClick={handleCancel}
          aria-label='Close modal'
          disabled={isDisabled}
        >
          <X className='aucctus-stroke-secondary h-6 w-6' />
        </button>
        <p className='aucctus-text-xl-semibold aucctus-text-primary mx-auto'>
          {content.title}
        </p>
        <p className='aucctus-text-md aucctus-text-secondary mt-4'>
          {content.message}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className='min-h-0 w-full flex-1 overflow-y-auto px-6'>
        {renderChangesList()}
      </div>

      {/* Sticky Footer */}
      <div className='aucctus-bg-primary aucctus-border-secondary w-full flex-shrink-0 border-t px-6 py-4'>
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
                <Loader2 className='aucctus-stroke-white mr-2 h-4 w-4 animate-spin' />
                Processing...
              </>
            ) : (
              <>{content.confirmButtonText}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchConfirmationModal;
