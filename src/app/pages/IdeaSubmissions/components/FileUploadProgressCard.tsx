import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2, FileUp } from 'lucide-react';
import Progress from '@components/Loading/Progress';
import { cn } from '@libs/utils/react';

interface FileUploadProgressCardProps {
  isVisible: boolean;
  filename: string | null;
  stage: string;
  message: string;
  progress: number;
  ideasExtracted?: number | null;
  error?: string | null;
}

/**
 * FileUploadProgressCard
 *
 * Displays file upload progress for idea submissions.
 * Shows different states: processing, completed, error.
 */
const FileUploadProgressCard: React.FC<FileUploadProgressCardProps> = ({
  isVisible,
  filename,
  stage,
  message,
  progress,
  ideasExtracted,
}) => {
  const isCompleted = stage === 'completed';
  const isError = stage === 'error';
  const isProcessing = !isCompleted && !isError;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'aucctus-bg-primary aucctus-border-secondary mb-6 overflow-hidden rounded-xl border shadow-sm',
            isError && 'border-l-4 border-l-red-500',
            isCompleted && 'border-l-4 border-l-green-500',
            isProcessing && 'border-l-4 border-l-blue-500',
          )}
        >
          <div className='p-4'>
            <div className='flex items-start gap-3'>
              {/* Icon */}
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                  isError && 'bg-red-100',
                  isCompleted && 'bg-green-100',
                  isProcessing && 'bg-blue-100',
                )}
              >
                {isProcessing && (
                  <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
                )}
                {isCompleted && (
                  <CheckCircle2 className='h-5 w-5 text-green-600' />
                )}
                {isError && <AlertTriangle className='h-5 w-5 text-red-600' />}
              </div>

              {/* Content */}
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <h3 className='aucctus-text-md-semibold aucctus-text-primary'>
                    {isProcessing && 'Uploading File...'}
                    {isCompleted && 'Upload Complete'}
                    {isError && 'Upload Failed'}
                  </h3>
                  {isProcessing && <FileUp className='h-4 w-4 text-blue-500' />}
                </div>

                {filename && (
                  <p className='aucctus-text-sm aucctus-text-tertiary mt-0.5 truncate'>
                    {filename}
                  </p>
                )}

                <p className='aucctus-text-sm aucctus-text-secondary mt-2'>
                  {message}
                </p>

                {/* Ideas extracted count for completed state */}
                {isCompleted &&
                  ideasExtracted !== null &&
                  ideasExtracted !== undefined && (
                    <p className='aucctus-text-sm mt-1 font-medium text-green-600'>
                      {ideasExtracted} idea{ideasExtracted !== 1 ? 's' : ''}{' '}
                      extracted
                    </p>
                  )}

                {/* Progress bar (only during processing) */}
                {isProcessing && (
                  <div className='mt-3 flex items-center gap-3'>
                    <Progress progress={progress} className='flex-1' />
                    <span className='aucctus-text-xs-medium aucctus-text-tertiary min-w-[36px] text-right'>
                      {Math.round(progress)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(FileUploadProgressCard);
