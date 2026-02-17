import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';

interface AssumptionStatementModalProps {
  mode: 'add' | 'edit';
  initialStatement?: string;
  onSubmit: (statement: string) => void;
  onConfirm?: (statement: string) => Promise<void>;
}

const AssumptionStatementModal: React.FC<AssumptionStatementModalProps> = ({
  mode,
  initialStatement = '',
  onSubmit,
  onConfirm,
}) => {
  const { closeModal } = useModal();
  const navigate = useNavigate();
  const [statement, setStatement] = useState(initialStatement);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Word count validation
  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const wordCount = getWordCount(statement);
  const isWordLimitExceeded = wordCount > 40;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!statement.trim()) return;

      // Prevent submission if nothing has changed in edit mode
      if (mode === 'edit' && statement.trim() === initialStatement.trim()) {
        return;
      }

      // If onConfirm is provided, show confirmation instead of submitting directly
      if (onConfirm) {
        setShowConfirmation(true);
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(statement.trim());
        closeModal();
      } catch (error) {
        // Error handling is done in the parent component/hook
        setIsSubmitting(false);
      }
    },
    [statement, onSubmit, onConfirm, closeModal, mode, initialStatement],
  );

  const handleCancel = useCallback(() => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else {
      closeModal();
    }
  }, [closeModal, showConfirmation]);

  const handleConfirmAction = useCallback(async () => {
    if (!onConfirm) return;

    setIsSubmitting(true);
    try {
      await onConfirm(statement.trim());
      closeModal();
      // Navigate to Concept Bank after successful submission
      navigate(AppPath.ConceptBank, {
        replace: true,
      });
    } catch (error) {
      // Error handling is done in the parent component/hook
      setIsSubmitting(false);
    }
  }, [onConfirm, statement, closeModal, navigate]);

  const isFormValid = statement.trim().length > 0 && !isWordLimitExceeded;
  const hasChanged =
    mode === 'add' || statement.trim() !== initialStatement.trim();

  const getTitle = () => {
    if (showConfirmation) {
      return 'Confirm Assumption Change';
    }
    return mode === 'add' ? 'Add New Assumption' : 'Edit Assumption';
  };

  return (
    <div className='aucctus-bg-primary inline-flex max-h-[100vh] w-[600px] flex-col items-center justify-start rounded-xl'>
      {/* Header */}
      <div className='aucctus-border-primary inline-flex w-full items-center justify-between border-b p-4'>
        <span className='aucctus-text-lg-medium aucctus-text-primary pl-2'>
          {getTitle()}
        </span>
        <button
          className='aucctus-bg-primary-hover rounded-lg p-2'
          onClick={handleCancel}
          aria-label='Close modal'
          disabled={isSubmitting}
        >
          <Icon variant='closeX' className='aucctus-stroke-secondary h-6 w-6' />
        </button>
      </div>

      {/* Content */}
      <div className='relative min-h-[400px] w-full overflow-hidden'>
        <AnimatePresence mode='wait'>
          {showConfirmation ? (
            /* Confirmation View */
            <motion.div
              key='confirmation'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className='absolute inset-0'
            >
              <div className='flex h-full w-full flex-col p-6'>
                {/* Statement Preview */}
                <div className='mb-6'>
                  <h4 className='aucctus-text-md-semibold aucctus-text-primary mb-3'>
                    Review Your Assumption
                  </h4>
                  <div className='aucctus-bg-secondary aucctus-border-primary rounded-lg border-l-4 p-4'>
                    <p className='aucctus-text-sm aucctus-text-primary leading-relaxed'>
                      &ldquo;{statement.trim()}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Warning Section */}
                <div className='mb-6 flex-1'>
                  <div className='flex items-start space-x-3'>
                    <div className='flex flex-shrink-0 items-center'>
                      <div className='rounded-full bg-orange-100 p-2'>
                        <Icon
                          variant='alert-circle'
                          className='aucctus-stroke-warning-primary h-5 w-5'
                        />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                        Impact on Testing
                      </h5>
                      <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                        Partially completed tests will be removed and next
                        recommended test will be re-assessed. Only completed
                        tests will remain unchanged.
                      </p>
                      <p className='aucctus-text-xs aucctus-text-tertiary mt-2 italic'>
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <Icon
                      variant='arrowleft'
                      className='aucctus-stroke-secondary mr-2 h-4 w-4'
                    />
                    Back to Edit
                  </button>
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={handleConfirmAction}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
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
                          variant='check'
                          className='aucctus-stroke-white mr-2 h-4 w-4'
                        />
                        {mode === 'add'
                          ? 'Add Assumption'
                          : 'Update Assumption'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Form View */
            <motion.div
              key='form'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className='absolute inset-0'
            >
              <div className='h-full w-full p-6'>
                <form
                  onSubmit={handleSubmit}
                  className='flex h-full w-full flex-col'
                >
                  <div className='mb-6 flex-1'>
                    <label className='aucctus-text-sm aucctus-text-primary mb-2 block'>
                      Assumption Statement *
                    </label>
                    <textarea
                      className={`w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isWordLimitExceeded
                          ? 'aucctus-border-error aucctus-text-error-primary'
                          : 'aucctus-border-secondary aucctus-text-primary'
                      }`}
                      value={statement}
                      onChange={(e) => setStatement(e.target.value)}
                      placeholder='Enter your assumption statement here...'
                      rows={6}
                      required
                      disabled={isSubmitting}
                    />
                    <div className='mt-1 flex justify-between'>
                      <span className='aucctus-text-xs aucctus-text-tertiary'>
                        This statement will be analyzed and categorized
                        automatically.
                      </span>
                      <span
                        className={`aucctus-text-xs ${
                          isWordLimitExceeded
                            ? 'aucctus-text-error-primary'
                            : 'aucctus-text-tertiary'
                        }`}
                      >
                        {wordCount}/40 words
                      </span>
                    </div>
                    {isWordLimitExceeded && (
                      <div className='mt-1'>
                        <span className='aucctus-text-xs aucctus-text-error-primary'>
                          Please reduce your statement to 40 words or fewer.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className='flex justify-end gap-3'>
                    <button
                      type='button'
                      className='btn btn-secondary'
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='btn btn-primary'
                      disabled={!isFormValid || !hasChanged || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Icon
                            variant='loading-02'
                            className='aucctus-stroke-white mr-2 h-4 w-4 animate-spin'
                          />
                          {mode === 'add' ? 'Adding...' : 'Updating...'}
                        </>
                      ) : mode === 'add' ? (
                        'Add Assumption'
                      ) : (
                        'Update Assumption'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AssumptionStatementModal;
