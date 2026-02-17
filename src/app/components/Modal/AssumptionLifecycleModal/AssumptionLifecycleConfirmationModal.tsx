import React, { useCallback, useState } from 'react';
import { useModal } from '@context/ModalContextProvider';
import {
  IAssumptionLifecycleAddRequest,
  IAssumptionLifecycleUpdateRequest,
} from '@libs/api/types';
import { getCategoryColors } from '../../../pages/Concept/Report/Assumptions/constants/categoryColors';
import { getCategoryIcon } from '../../../pages/Concept/Report/Assumptions/utils/assumptionUtils';
import { Loader2, X } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface AssumptionLifecycleConfirmationModalProps {
  mode: 'add_edit' | 'delete';
  assumptionStatement?: string;
  assumptionData?:
    | IAssumptionLifecycleAddRequest
    | IAssumptionLifecycleUpdateRequest;
  onConfirm: () => Promise<void>;
}

const AssumptionLifecycleConfirmationModal: React.FC<
  AssumptionLifecycleConfirmationModalProps
> = ({ mode, assumptionStatement, assumptionData, onConfirm }) => {
  const { closeModal } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper functions for displaying assumption data
  const getLevel = (value: number): string => {
    // Handle both backend format (1-3) and frontend format (0-1)
    if (value >= 3 || value >= 0.66) return 'High';
    if (value >= 2 || value >= 0.33) return 'Medium';
    return 'Low';
  };

  const formatCategoryForDisplay = (category: string): string => {
    // Convert backend format back to frontend format for display
    return category.toLowerCase();
  };

  const renderAssumptionDetails = () => {
    if (mode === 'delete' || !assumptionData) {
      return (
        <div className='aucctus-bg-secondary mt-4 w-full rounded-lg p-3'>
          <p className='aucctus-text-sm aucctus-text-secondary mb-1'>
            {mode === 'delete' ? 'Assumption to be deleted:' : 'Assumption:'}
          </p>
          <p className='aucctus-text-sm aucctus-text-primary italic'>
            &ldquo;{assumptionStatement}&rdquo;
          </p>
        </div>
      );
    }

    // Show complete assumption details for add/edit
    const frontendCategory = formatCategoryForDisplay(assumptionData.category);
    const categoryColors = getCategoryColors(frontendCategory as any);
    const iconVariant = getCategoryIcon(frontendCategory);

    return (
      <div className='aucctus-bg-secondary mt-4 w-full rounded-lg p-4'>
        <h4 className='aucctus-text-md-semibold aucctus-text-primary mb-3'>
          Review Your Assumption
        </h4>

        {/* Category */}
        <div className='mb-3 flex items-center'>
          <DynamicIcon
            variant={iconVariant as any}
            className={`${categoryColors.stroke} mr-2 h-5 w-5`}
          />
          <span className='aucctus-text-sm-medium capitalize'>
            {frontendCategory}
          </span>
        </div>

        {/* Statement */}
        <div className='mb-3'>
          <p className='aucctus-text-sm aucctus-text-secondary mb-1'>
            Statement:
          </p>
          <p className='aucctus-text-sm aucctus-text-primary'>
            &ldquo;{assumptionData.statement}&rdquo;
          </p>
        </div>

        {/* Metrics */}
        <div className='flex gap-4'>
          <div>
            <p className='aucctus-text-xs aucctus-text-secondary mb-1'>
              Importance:
            </p>
            <p className='aucctus-text-sm aucctus-text-primary font-medium'>
              {getLevel(assumptionData.importance)}
            </p>
          </div>
          <div>
            <p className='aucctus-text-xs aucctus-text-secondary mb-1'>
              Certainty:
            </p>
            <p className='aucctus-text-sm aucctus-text-primary font-medium'>
              {getLevel(assumptionData.certainty)}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
          <X className='aucctus-stroke-secondary h-6 w-6' />
        </button>
      </div>

      {/* Content */}
      <div className='inline-flex w-full items-start justify-start overflow-auto p-6'>
        <div className='w-full'>
          {/* Warning Icon and Message */}
          <div className='mb-6 flex flex-col items-center text-center'>
            <div className='mb-4 rounded-full bg-orange-100 p-3'>
              <DynamicIcon
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
            {/* Show assumption details */}
            {(assumptionStatement || assumptionData) &&
              renderAssumptionDetails()}
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
                  <Loader2 className='aucctus-stroke-white mr-2 h-4 w-4 animate-spin' />
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
