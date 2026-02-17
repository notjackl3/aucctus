import { useModal } from '@context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import React, { useCallback, useState } from 'react';
import { Plus, RefreshCw, X } from 'lucide-react';

type SaveOption = 'new_only' | 'rescore_all';

interface SaveScoringConfigModalProps {
  onConfirm: (rescoreAll: boolean) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

const SaveScoringConfigModal: React.FC<SaveScoringConfigModalProps> = ({
  onConfirm,
  onCancel,
  isSaving = false,
}) => {
  const { closeModal } = useModal();
  const [selectedOption, setSelectedOption] = useState<SaveOption>('new_only');

  const handleConfirm = useCallback(() => {
    onConfirm(selectedOption === 'rescore_all');
  }, [onConfirm, selectedOption]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    closeModal();
  }, [onCancel, closeModal]);

  return (
    <div className='aucctus-bg-primary relative inline-flex w-[520px] flex-col items-center justify-start rounded-xl'>
      {/* Close Button */}
      <button
        className='absolute right-4 top-4 p-1 transition-colors hover:opacity-70'
        onClick={handleCancel}
        aria-label='Close modal'
        disabled={isSaving}
      >
        <X className='aucctus-stroke-tertiary h-5 w-5' />
      </button>

      {/* Header */}
      <div className='w-full px-6 pb-4 pt-6'>
        <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
          Save Scoring Configuration
        </h2>
        <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
          How would you like to apply the new scoring criteria?
        </p>
      </div>

      {/* Options */}
      <div className='w-full space-y-3 px-6'>
        {/* Option 1: Apply to new concepts only */}
        <button
          type='button'
          onClick={() => setSelectedOption('new_only')}
          disabled={isSaving}
          className={cn(
            'w-full rounded-lg border-2 p-4 text-left transition-all',
            selectedOption === 'new_only'
              ? 'aucctus-bg-brand-secondary border-blue-500'
              : 'aucctus-bg-primary aucctus-border-secondary hover:aucctus-bg-secondary-subtle',
          )}
        >
          <div className='flex items-start gap-3'>
            <div
              className={cn(
                'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                selectedOption === 'new_only'
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'aucctus-bg-secondary',
              )}
            >
              <Plus
                className={cn(
                  'h-5 w-5',
                  selectedOption === 'new_only'
                    ? 'stroke-blue-600 dark:stroke-blue-400'
                    : 'aucctus-stroke-tertiary',
                )}
              />
            </div>
            <div className='flex-1'>
              <h3
                className={cn(
                  'aucctus-text-md-semibold',
                  selectedOption === 'new_only'
                    ? 'aucctus-text-primary'
                    : 'aucctus-text-primary',
                )}
              >
                Apply to new concepts and idea submissions only
              </h3>
              <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
                Existing concept and idea submission scores will remain
                unchanged. New concepts and idea submissions will use the
                updated criteria.
              </p>
            </div>
          </div>
        </button>

        {/* Option 2: Re-score all concepts */}
        <button
          type='button'
          onClick={() => setSelectedOption('rescore_all')}
          disabled={isSaving}
          className={cn(
            'w-full rounded-lg border-2 p-4 text-left transition-all',
            selectedOption === 'rescore_all'
              ? 'aucctus-bg-brand-secondary border-blue-500'
              : 'aucctus-bg-primary aucctus-border-secondary hover:aucctus-bg-secondary-subtle',
          )}
        >
          <div className='flex items-start gap-3'>
            <div
              className={cn(
                'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                selectedOption === 'rescore_all'
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'aucctus-bg-secondary',
              )}
            >
              <RefreshCw
                className={cn(
                  'h-5 w-5',
                  selectedOption === 'rescore_all'
                    ? 'stroke-blue-600 dark:stroke-blue-400'
                    : 'aucctus-stroke-tertiary',
                )}
              />
            </div>
            <div className='flex-1'>
              <h3
                className={cn(
                  'aucctus-text-md-semibold',
                  selectedOption === 'rescore_all'
                    ? 'aucctus-text-primary'
                    : 'aucctus-text-primary',
                )}
              >
                Re-score all concepts and idea submissions
              </h3>
              <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
                All existing concepts and idea submissions will be re-evaluated
                using the new scoring criteria.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className='flex w-full justify-end gap-3 px-6 pb-6 pt-6'>
        <button
          type='button'
          className='btn btn-light btn-md'
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type='button'
          className='btn btn-primary btn-md'
          onClick={handleConfirm}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SaveScoringConfigModal;
