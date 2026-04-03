import { FunctionComponent, useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LiquidGlassModal, toast } from '@components';
import { useDeleteCustomerProfile } from '@hooks/query/concepts.hook';
import { cn } from '@libs/utils/react';

interface IDeleteCustomerProfileModalProps {
  profileUuid: string;
  profileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

const DeleteCustomerProfileModal: FunctionComponent<
  IDeleteCustomerProfileModalProps
> = ({ profileUuid, profileName, open, onOpenChange, onDeleted }) => {
  const [confirmText, setConfirmText] = useState('');
  const { mutate: deleteProfile, isLoading } = useDeleteCustomerProfile();

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

  const handleDelete = useCallback(() => {
    if (!isConfirmed || isLoading) return;
    deleteProfile(profileUuid, {
      onSuccess: () => {
        toast.success('Customer profile deleted successfully');
        onDeleted?.();
        handleClose();
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to delete customer profile');
      },
    });
  }, [
    isConfirmed,
    isLoading,
    deleteProfile,
    profileUuid,
    onDeleted,
    handleClose,
  ]);

  const isDeleteEnabled = isConfirmed && !isLoading;

  return (
    <LiquidGlassModal
      open={open}
      onOpenChange={handleOpenChange}
      title={`Delete "${profileName}"?`}
      variant='danger'
      size='md'
    >
      <motion.div
        className='p-6'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <p className='aucctus-text-sm aucctus-text-secondary mb-4'>
          This will permanently delete this customer profile and all associated
          data including test participants.
        </p>

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

        <div className='flex gap-3'>
          <motion.button
            type='button'
            onClick={handleClose}
            disabled={isLoading}
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
            aria-label='Delete customer profile'
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
            {isLoading ? 'Deleting...' : 'Delete'}
          </motion.button>
        </div>
      </motion.div>
    </LiquidGlassModal>
  );
};

export default DeleteCustomerProfileModal;
