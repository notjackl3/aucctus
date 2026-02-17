/**
 * DeletePersonaModal - Confirmation modal for deleting personas
 *
 * Requires user to type "DELETE" to confirm deletion.
 * Ported from: lovable/team-aucctus-master-brainstorming/src/components/nucleus/DeletePersonaModal.tsx
 */

import { LiquidGlassModal } from '@components';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import React, { memo, useCallback, useState } from 'react';

/** Props for the DeletePersonaModal component */
export interface DeletePersonaModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal should close */
  onOpenChange: (open: boolean) => void;
  /** Name of the persona being deleted */
  personaName: string;
  /** Callback when delete is confirmed */
  onConfirm: () => void;
}

/**
 * DeletePersonaModal Component
 *
 * Displays a danger confirmation modal requiring the user to type "DELETE"
 * before proceeding with persona deletion.
 */
const DeletePersonaModal: React.FC<DeletePersonaModalProps> = ({
  open,
  onOpenChange,
  personaName,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState('');

  const isConfirmed = confirmText === 'DELETE';

  const handleClose = useCallback(() => {
    setConfirmText('');
    onOpenChange(false);
  }, [onOpenChange]);

  const handleConfirm = useCallback(() => {
    if (!isConfirmed) return;
    onConfirm();
    handleClose();
  }, [isConfirmed, onConfirm, handleClose]);

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

  return (
    <LiquidGlassModal
      open={open}
      onOpenChange={handleOpenChange}
      title={`Delete "${personaName}"?`}
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
          This persona and all its data will be permanently removed.
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
            onClick={handleConfirm}
            disabled={!isConfirmed}
            aria-label='Delete persona'
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5',
              'font-medium transition-colors',
              isConfirmed
                ? 'bg-error-600 text-white hover:bg-error-700 dark:bg-error-600 dark:hover:bg-error-500'
                : 'aucctus-bg-secondary aucctus-text-quaternary cursor-not-allowed',
            )}
            whileHover={isConfirmed ? { scale: 1.02 } : undefined}
            whileTap={isConfirmed ? { scale: 0.98 } : undefined}
          >
            <Trash2
              className={cn(
                'aucctus-text-quaternary',
                isConfirmed && 'aucctus-text-white',
              )}
              height={16}
              width={16}
            />
            Delete
          </motion.button>
        </div>
      </motion.div>
    </LiquidGlassModal>
  );
};

export default memo(DeletePersonaModal);
