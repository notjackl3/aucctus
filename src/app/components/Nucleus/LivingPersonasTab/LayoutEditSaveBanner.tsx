/**
 * LayoutEditSaveBanner - Sticky save banner for layout edit mode
 *
 * Rounded pill at viewport bottom. Two states:
 * - No changes: shows "Edit mode" with Done button
 * - Has changes: shows pulsing dot + "Changes made" with Reset/Cancel/Save actions
 */

import { motion } from 'framer-motion';
import React from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import { GlassSurface } from '@components';
import { cn } from '@libs/utils/react';

export interface LayoutEditSaveBannerProps {
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Callback when save is clicked */
  onSave: () => void;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Callback when reset is clicked */
  onReset: () => void;
  /** Additional CSS classes */
  className?: string;
}

const LayoutEditSaveBanner: React.FC<LayoutEditSaveBannerProps> = ({
  hasChanges,
  onSave,
  onCancel,
  onReset,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('fixed bottom-6 left-1/2 z-50 -translate-x-1/2', className)}
    >
      <GlassSurface className='aucctus-border-primary flex items-center gap-3 rounded-full border px-4 py-2.5 shadow-lg'>
        {hasChanges ? (
          <>
            {/* Status: changes made */}
            <div className='flex items-center gap-2'>
              <div className='aucctus-bg-brand-solid h-2 w-2 animate-pulse rounded-full' />
              <span className='aucctus-text-sm-medium aucctus-text-primary whitespace-nowrap'>
                Changes made
              </span>
            </div>

            {/* Divider */}
            <div className='aucctus-bg-tertiary h-4 w-px' />

            {/* Actions */}
            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={onReset}
                className='aucctus-text-tertiary flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
                title='Reset to default'
              >
                <RotateCcw className='h-4 w-4' />
              </button>
              <button
                type='button'
                onClick={onCancel}
                className='aucctus-text-tertiary flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
                title='Cancel'
              >
                <X className='h-4 w-4' />
              </button>
              <button
                type='button'
                onClick={onSave}
                className='aucctus-bg-brand-solid flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90'
              >
                <Check className='h-3.5 w-3.5' />
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            {/* No changes: edit mode label + Done */}
            <span className='aucctus-text-sm-medium aucctus-text-primary whitespace-nowrap'>
              Edit mode
            </span>

            {/* Divider */}
            <div className='aucctus-bg-tertiary h-4 w-px' />

            <button
              type='button'
              onClick={onCancel}
              className='aucctus-text-primary flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
            >
              Done
            </button>
          </>
        )}
      </GlassSurface>
    </motion.div>
  );
};

export default LayoutEditSaveBanner;
