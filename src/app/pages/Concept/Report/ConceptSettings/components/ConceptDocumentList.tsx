import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Trash2 } from 'lucide-react';
import React from 'react';
import { IConceptTrainingDocument } from '@libs/api/types/conceptTrainingDocument';
import { cn } from '@libs/utils/react';

const FILE_TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pdf: {
    label: 'PDF',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
  },
  docx: {
    label: 'DOCX',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
  },
  xlsx: {
    label: 'XLSX',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
  },
  csv: {
    label: 'CSV',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
  },
  pptx: {
    label: 'PPTX',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
  },
  txt: {
    label: 'TXT',
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    text: 'text-gray-700 dark:text-gray-300',
  },
};

const getFileTypeBadge = (fileType: string) => {
  return FILE_TYPE_CONFIG[fileType.toLowerCase()] || FILE_TYPE_CONFIG.txt;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

interface ConceptDocumentListProps {
  documents: IConceptTrainingDocument[];
  onDelete: (documentUuid: string) => void;
  isDeleting?: boolean;
}

const ConceptDocumentList: React.FC<ConceptDocumentListProps> = ({
  documents,
  onDelete,
  isDeleting,
}) => {
  if (documents.length === 0) {
    return (
      <div className='aucctus-text-tertiary flex items-center justify-center py-8 text-sm'>
        No documents uploaded yet
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-1'>
      <AnimatePresence mode='popLayout'>
        {documents.map((doc) => {
          const badge = getFileTypeBadge(doc.fileType);
          const isProcessing = doc.status === 'processing';
          const isFailed = doc.status === 'failed';

          return (
            <motion.div
              key={doc.uuid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className='aucctus-bg-secondary-hover group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors'
            >
              <div
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                  badge.bg,
                  badge.text,
                )}
              >
                {badge.label}
              </div>

              <div className='min-w-0 flex-1'>
                <div className='aucctus-text-primary truncate text-sm font-medium'>
                  {doc.filename}
                </div>
                <div className='aucctus-text-tertiary flex items-center gap-2 text-xs'>
                  <span>{formatDate(doc.uploadedAt)}</span>
                  {isProcessing && (
                    <span className='flex items-center gap-1 text-amber-500'>
                      <Loader2 className='h-3 w-3 animate-spin' />
                      Processing
                    </span>
                  )}
                  {isFailed && <span className='text-red-500'>Failed</span>}
                </div>
              </div>

              <button
                onClick={() => onDelete(doc.uuid)}
                disabled={isDeleting}
                className='aucctus-text-tertiary flex-shrink-0 rounded-md p-1 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ConceptDocumentList;
