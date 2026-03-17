/**
 * TrainingDocumentsPanel - Displays uploaded training documents with status
 *
 * Shows a list of training documents for a persona with:
 * - Colored file type badge (PDF=red, CSV=green, DOCX=blue, XLSX=purple)
 * - Document name, source label, and upload date
 * - Hover-reveal delete button
 * - Add Document button opens DocumentUploadModal (3-step flow)
 * - Upload/processing progress indicator
 */

import { motion, AnimatePresence } from 'framer-motion';
import React, { useCallback, useMemo, useState } from 'react';
import { FileText, Upload, Calendar, Trash2 } from 'lucide-react';
import { GlassSurface } from '@components';
import { cn } from '@libs/utils/react';
import {
  useTrainingDocuments,
  useDeleteTrainingDocument,
} from '@hooks/query/persona.hook';
import type { PersonaDocumentProcessingProgress } from '@hooks/query/persona.hook';
import type { ITrainingDocument } from '@libs/api/types/persona';
import DocumentUploadModal from './modals/DocumentUploadModal';

/** Props for the TrainingDocumentsPanel component */
export interface TrainingDocumentsPanelProps {
  personaUuid: string;
  personaName: string;
  processingProgress: PersonaDocumentProcessingProgress;
}

/** File type badge configuration */
const fileTypeBadgeConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pdf: {
    label: 'PDF',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  },
  csv: {
    label: 'CSV',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
  },
  docx: {
    label: 'DOCX',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  xlsx: {
    label: 'XLSX',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

const defaultBadgeConfig = {
  label: 'FILE',
  bg: 'bg-gray-100 dark:bg-gray-900/30',
  text: 'text-gray-600 dark:text-gray-400',
};

/** Extract file extension from filename */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/** Get a readable source label from the filename */
function getSourceLabel(filename: string): string {
  // Remove extension and replace separators with spaces
  const name = filename.replace(/\.[^.]+$/, '');
  return name.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Format date string to short format (e.g., "Jan 9, 2025") */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Single document row */
const DocumentRow: React.FC<{
  doc: ITrainingDocument;
  onDelete: (uuid: string) => void;
}> = ({ doc, onDelete }) => {
  const ext = getFileExtension(doc.filename);
  const badge = fileTypeBadgeConfig[ext] ?? defaultBadgeConfig;
  const sourceLabel = getSourceLabel(doc.filename);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='border-border/40 bg-background/60 hover:border-border group flex items-center gap-3 rounded-lg border p-3 transition-colors'
    >
      {/* File type badge */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
          badge.bg,
          badge.text,
        )}
      >
        {badge.label}
      </div>

      {/* File info */}
      <div className='min-w-0 flex-1'>
        <p className='text-foreground truncate text-sm font-medium'>
          {doc.filename}
        </p>
        <div className='mt-0.5 flex items-center gap-2'>
          <span className='text-muted-foreground text-xs'>{sourceLabel}</span>
        </div>
      </div>

      {/* Upload date */}
      <div className='text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs'>
        <Calendar className='h-3 w-3' />
        {formatDate(doc.uploadedAt)}
      </div>

      {/* Delete button (hover-reveal) */}
      <button
        type='button'
        aria-label='Remove document'
        onClick={() => onDelete(doc.uuid)}
        className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-1.5 opacity-0 transition-all group-hover:opacity-100'
        title='Remove document'
      >
        <Trash2 className='h-3.5 w-3.5' />
      </button>
    </motion.div>
  );
};

const TrainingDocumentsPanel: React.FC<TrainingDocumentsPanelProps> = ({
  personaUuid,
  personaName,
  processingProgress,
}) => {
  const { documents, isLoading } = useTrainingDocuments(personaUuid);
  const { deleteDocument } = useDeleteTrainingDocument();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleDelete = useCallback(
    (documentUuid: string) => {
      deleteDocument({ personaUuid, documentUuid });
    },
    [personaUuid, deleteDocument],
  );

  const documentCount = useMemo(() => documents.length, [documents]);

  return (
    <>
      <GlassSurface className='p-4'>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileText className='text-muted-foreground h-4 w-4' />
            <h3 className='text-foreground text-sm font-medium'>
              Training Documents
            </h3>
            {documentCount > 0 && (
              <span className='text-muted-foreground text-xs'>
                ({documentCount})
              </span>
            )}
          </div>
          <button
            type='button'
            onClick={() => setIsUploadModalOpen(true)}
            className='btn btn-light btn-sm h-7 gap-1.5 text-xs'
          >
            <Upload className='h-3 w-3' />
            Add Document
          </button>
        </div>

        {/* Background processing progress (when modal is closed) */}
        {processingProgress.isProcessing && !isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='aucctus-bg-brand-secondary mb-3 rounded-lg p-3'
          >
            <div className='mb-2 flex items-center gap-2'>
              <div className='aucctus-border-brand h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
              <span className='aucctus-text-sm-medium aucctus-text-brand-primary'>
                {processingProgress.message || 'Processing...'}
              </span>
            </div>
            {processingProgress.progress > 0 && (
              <div className='aucctus-bg-tertiary h-1.5 overflow-hidden rounded-full'>
                <motion.div
                  className='aucctus-bg-brand-solid h-full rounded-full'
                  initial={{ width: 0 }}
                  animate={{ width: `${processingProgress.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className='animate-pulse space-y-2'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className='border-border/40 bg-background/60 flex items-center gap-3 rounded-lg border p-3'
              >
                <div className='bg-muted h-8 w-8 rounded-lg' />
                <div className='flex-1 space-y-1.5'>
                  <div className='bg-muted h-3.5 w-3/4 rounded' />
                  <div className='bg-muted h-3 w-1/3 rounded' />
                </div>
                <div className='bg-muted h-3 w-20 rounded' />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && documents.length === 0 && (
          <p className='text-muted-foreground py-4 text-center text-sm'>
            No training documents uploaded yet.
          </p>
        )}

        {/* Document list */}
        {!isLoading && documents.length > 0 && (
          <div className='space-y-2'>
            <AnimatePresence mode='popLayout'>
              {documents.map((doc) => (
                <DocumentRow key={doc.uuid} doc={doc} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer description */}
        <p className='text-muted-foreground/70 mt-3 text-xs leading-relaxed'>
          These documents are used by AI agents to understand and represent{' '}
          {personaName}. Add research reports, surveys, or analytics data to
          improve persona accuracy.
        </p>
      </GlassSurface>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        personaUuid={personaUuid}
        personaName={personaName}
        processingProgress={processingProgress}
      />
    </>
  );
};

export default TrainingDocumentsPanel;
