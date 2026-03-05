import { FunctionComponent, useCallback, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@libs/api';
import { ISubmissionLink } from '@libs/api/types/ideaSubmissions';
import { LiquidGlassModal, toast } from '@components';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { AppPath } from '@routes/routes';
import { cn } from '@libs/utils/react';

interface IDeleteSubmissionLinkModalProps {
  linkUuid: string;
  linkTitle: string;
  submissionCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called immediately after successful deletion, before navigation */
  onDeleted?: () => void;
}

/**
 * Delete Submission Link Modal
 *
 * Confirmation modal for deleting a submission link with cascade deletion warning.
 * Uses LiquidGlassModal with danger variant to match Living Personas delete modal.
 * Requires user to type "DELETE" to enable the delete button.
 */
const DeleteSubmissionLinkModal: FunctionComponent<
  IDeleteSubmissionLinkModalProps
> = ({
  linkUuid,
  linkTitle,
  submissionCount,
  open,
  onOpenChange,
  onDeleted,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isConfirmed = confirmText === 'DELETE';

  const handleClose = useCallback(() => {
    setConfirmText('');
    onOpenChange(false);
  }, [onOpenChange]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) handleClose();
    },
    [handleClose],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmText(e.target.value);
    },
    [],
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.ideaSubmissions.deleteSubmissionLink(linkUuid),
    onSuccess: () => {
      queryClient.setQueryData<ISubmissionLink[] | undefined>(
        [AucctusQueryKeys.submissionLinks],
        (previousLinks) =>
          previousLinks?.filter((link) => link.uuid !== linkUuid) ?? [],
      );
      queryClient.removeQueries({
        queryKey: [AucctusQueryKeys.submissionLink, linkUuid],
      });
      queryClient.removeQueries({
        queryKey: [AucctusQueryKeys.submissionLinkSubmissions, linkUuid],
      });
      toast.success('Submission link and all submissions deleted successfully');
      onDeleted?.();
      handleClose();
      navigate(AppPath.ConceptBankSubmissions, { replace: true });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.submissionLinks],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete submission link');
    },
  });

  const handleDelete = useCallback(() => {
    if (!isConfirmed || deleteMutation.isLoading) return;
    deleteMutation.mutate();
  }, [isConfirmed, deleteMutation]);

  const isDeleteEnabled = isConfirmed && !deleteMutation.isLoading;

  return (
    <LiquidGlassModal
      open={open}
      onOpenChange={handleOpenChange}
      title={`Delete "${linkTitle}"?`}
      variant='danger'
      size='md'
    >
      <motion.div
        className='p-6'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Description */}
        <p className='aucctus-text-sm aucctus-text-secondary mb-4'>
          This submission link and all its data will be permanently removed,
          including{' '}
          <span className='font-semibold'>
            {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
          </span>
          , scores, and analysis results.
        </p>

        {/* Type DELETE confirmation */}
        <div className='mb-5'>
          <label className='aucctus-text-sm aucctus-text-secondary mb-2 block'>
            Type{' '}
            <span className='font-mono font-semibold text-error-600 dark:text-error-400'>
              DELETE
            </span>{' '}
            to confirm
          </label>
          <input
            type='text'
            value={confirmText}
            onChange={handleInputChange}
            placeholder='DELETE'
            autoComplete='off'
            className={cn(
              'w-full rounded-md border px-3 py-2.5',
              'aucctus-bg-primary aucctus-text-primary',
              'placeholder:aucctus-text-quaternary',
              'focus:outline-none focus:ring-2',
              'text-center font-mono tracking-widest',
              'aucctus-border-primary focus:ring-primary/20',
            )}
          />
        </div>

        {/* Actions */}
        <div className='flex gap-3'>
          <motion.button
            type='button'
            onClick={handleClose}
            disabled={deleteMutation.isLoading}
            className={cn(
              'flex-1 rounded-md border px-4 py-2.5',
              'aucctus-text-primary aucctus-border-secondary',
              'aucctus-bg-primary-hover',
              'font-medium transition-colors',
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type='button'
            onClick={handleDelete}
            disabled={!isDeleteEnabled}
            aria-label='Delete submission link'
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5',
              'font-medium transition-colors',
              isDeleteEnabled
                ? 'bg-error-600 text-white hover:bg-error-700 dark:bg-error-600 dark:hover:bg-error-500'
                : 'aucctus-bg-secondary aucctus-text-quaternary cursor-not-allowed',
            )}
            whileHover={isDeleteEnabled ? { scale: 1.02 } : undefined}
            whileTap={isDeleteEnabled ? { scale: 0.98 } : undefined}
          >
            <Trash2
              className={cn(
                'aucctus-text-quaternary',
                isDeleteEnabled && 'aucctus-text-white',
              )}
              height={16}
              width={16}
            />
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </motion.button>
        </div>
      </motion.div>
    </LiquidGlassModal>
  );
};

export default DeleteSubmissionLinkModal;
