import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Lock,
  ChevronRight,
  Trash2,
  FileSpreadsheet,
  FileType,
  Presentation,
  File,
} from 'lucide-react';
import {
  useNucleusDocuments,
  useNucleusReportLatest,
  useNucleusDocumentUpload,
  useDeleteNucleusDocument,
} from '@hooks/query/nucleus.hook';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import Tooltip from '@components/ToolTip/Tooltip';
import { toast, Icon } from '@components';
import { useModal } from '@context/ModalContextProvider';
import type { DocumentWithUsage } from '@libs/api/types/nucleus';
import { X } from 'lucide-react';

// Accepted file types for Nucleus documents
const ACCEPTED_FILE_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.ppt',
  '.pptx',
  '.txt',
];
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];

// File type icon configuration
type LucideIconComponent =
  | typeof FileText
  | typeof FileType
  | typeof FileSpreadsheet
  | typeof Presentation
  | typeof File;

interface FileTypeConfig {
  icon: LucideIconComponent;
  color: string;
  bgColor: string;
}

const FILE_TYPE_CONFIG: Record<string, FileTypeConfig> = {
  pdf: { icon: FileText, color: 'text-red-600', bgColor: 'bg-red-100' },
  doc: { icon: FileType, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  docx: { icon: FileType, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  xls: {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  xlsx: {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  csv: {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  ppt: {
    icon: Presentation,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  pptx: {
    icon: Presentation,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  txt: { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const getFileTypeConfig = (filename: string): FileTypeConfig => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return (
    FILE_TYPE_CONFIG[extension] || {
      icon: File,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
    }
  );
};

// Category configuration matching CategoriesGrid
const CATEGORY_CONFIG: Record<string, { name: string; icon: IconVariant }> = {
  basic_profile: { name: 'Company Identity', icon: 'building' },
  geographic: { name: 'Geographic Footprint', icon: 'globe' },
  strategic: { name: 'Corporate Strategy', icon: 'target' },
  products_services: { name: 'Offerings', icon: 'inbox-02' },
  organizational: { name: 'Customers', icon: 'user-group' },
  brand_communications: { name: 'Brand & Reputation', icon: 'star-01' },
  talent_culture: { name: 'Operations', icon: 'gear' },
  financial: { name: 'Financials', icon: 'currency-dollar' },
  ecosystem: { name: 'Partnerships', icon: 'link-external' },
  technology: { name: 'Innovation Guardrails', icon: 'lightbulb' },
};

// ============================================
// Delete Document Confirmation Modal
// ============================================

interface DeleteDocumentModalProps {
  document: DocumentWithUsage;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({
  document,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  const filename = document.title || document.originalFilename || 'document';
  const fileConfig = getFileTypeConfig(filename);
  const FileIconComponent = fileConfig.icon;

  return (
    <div className='w-full max-w-md p-6'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-center gap-2'>
        <Trash2 className='h-5 w-5 text-red-500' />
        <h2 className='text-lg font-semibold text-gray-900'>Delete Document</h2>
      </div>

      {/* Document Info Card */}
      <div className='mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3'>
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${fileConfig.bgColor}`}
        >
          <FileIconComponent className={`h-5 w-5 ${fileConfig.color}`} />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-medium text-gray-900'>{filename}</p>
          {document.fileSize && (
            <p className='text-xs text-gray-500'>
              {formatFileSize(document.fileSize)}
            </p>
          )}
        </div>
      </div>

      {/* Categories Affected Section */}
      {document.categories.length > 0 && (
        <div className='mb-4'>
          <div className='mb-3 flex items-center gap-2'>
            <X className='h-4 w-4 text-red-500' />
            <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
              Will be deleted from
            </p>
            <span className='rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600'>
              {document.categories.length}
            </span>
          </div>

          <div className='space-y-2'>
            {document.categories.map((category) => {
              const categoryInfo = CATEGORY_CONFIG[category.categoryId] || {
                name: category.categoryName,
                icon: 'help-circle' as IconVariant,
              };
              return (
                <div
                  key={category.categoryId}
                  className='flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/50 p-3'
                >
                  <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-red-100'>
                    <Icon
                      variant={categoryInfo.icon}
                      className='aucctus-stroke-error-primary h-4 w-4 fill-none'
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='font-medium text-gray-900'>
                      {categoryInfo.name}
                    </p>
                    <p className='text-xs text-red-600'>
                      {category.sourceCount} source
                      {category.sourceCount !== 1 ? 's' : ''} will be deleted
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Warning Text */}
      <p className='mb-6 text-center text-xs text-gray-500'>
        This action cannot be undone.
      </p>

      {/* Action Buttons */}
      <div className='flex justify-end gap-3'>
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className='btn btn-outline btn-md'
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className='btn btn-md bg-gray-900 text-white hover:bg-gray-800'
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export interface UploadsTabProps {
  /** Callback when user clicks to navigate to a category */
  onNavigateToCategory?: (categoryId: string) => void;
}

/**
 * UploadsTab - Displays uploaded documents with category usage information
 *
 * This component shows all documents uploaded to Nucleus along with
 * which categories use each document as sources.
 */
const UploadsTab: React.FC<UploadsTabProps> = ({ onNavigateToCategory }) => {
  const { documents, isLoading, hasDocuments, isNoReportFound, refetch } =
    useNucleusDocuments();
  const { nucleusReport } = useNucleusReportLatest();
  const { uploadDocuments, isUploading } = useNucleusDocumentUpload();
  const { deleteDocument, isDeleting } = useDeleteNucleusDocument();
  const { openModal, closeModal } = useModal();
  const queryClient = useQueryClient();

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expanded document state
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  /**
   * Validate file type against accepted types
   */
  const isValidFileType = useCallback((file: File): boolean => {
    // Check MIME type
    if (ACCEPTED_MIME_TYPES.includes(file.type)) {
      return true;
    }
    // Fallback to extension check for cases where MIME type is not detected
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return ACCEPTED_FILE_EXTENSIONS.includes(extension);
  }, []);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback(
    (files: File[]) => {
      if (!nucleusReport?.uuid) {
        toast.error(
          'Upload Not Available',
          'No Nucleus report found. Please generate a report first.',
        );
        return;
      }

      // Filter valid files
      const validFiles = files.filter(isValidFileType);
      const invalidFiles = files.filter((f) => !isValidFileType(f));

      if (invalidFiles.length > 0) {
        toast.error(
          'Invalid File Types',
          `The following files have unsupported formats: ${invalidFiles.map((f) => f.name).join(', ')}`,
        );
      }

      if (validFiles.length === 0) {
        return;
      }

      uploadDocuments(
        { reportUuid: nucleusReport.uuid, files: validFiles },
        {
          onSuccess: () => {
            // Invalidate documents query to refetch the list
            queryClient.invalidateQueries([AucctusQueryKeys.nucleusDocuments]);
          },
        },
      );
    },
    [nucleusReport?.uuid, isValidFileType, uploadDocuments, queryClient],
  );

  /**
   * Handle click on upload zone
   */
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFileUpload(files);
      }
      // Reset the input so the same file can be selected again
      e.target.value = '';
    },
    [handleFileUpload],
  );

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  /**
   * Handle drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handle drop event
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload],
  );

  /**
   * Toggle document row expansion
   */
  const handleToggleExpand = useCallback((docId: string) => {
    setExpandedDocId((prev) => (prev === docId ? null : docId));
  }, []);

  /**
   * Handle delete button click - opens confirmation modal
   */
  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, doc: DocumentWithUsage) => {
      e.stopPropagation(); // Prevent row expand

      const handleConfirmDelete = () => {
        deleteDocument(doc.uuid, {
          onSuccess: () => {
            closeModal();
            // Refetch the documents list
            refetch();
            queryClient.invalidateQueries([AucctusQueryKeys.nucleusDocuments]);
          },
          onError: () => {
            // Error toast is handled by the hook
          },
        });
      };

      openModal(
        DeleteDocumentModal,
        {
          document: doc,
          onConfirm: handleConfirmDelete,
          onCancel: closeModal,
          isDeleting: isDeleting,
        },
        {
          shouldCloseOnOverlayClick: !isDeleting,
          shouldCloseOnEscape: !isDeleting,
        },
      );
    },
    [deleteDocument, closeModal, openModal, isDeleting, refetch, queryClient],
  );

  /**
   * Handle category click - navigate to category view
   */
  const handleCategoryClick = useCallback(
    (e: React.MouseEvent, categoryId: string) => {
      e.stopPropagation(); // Prevent row collapse
      if (onNavigateToCategory) {
        onNavigateToCategory(categoryId);
      }
    },
    [onNavigateToCategory],
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className='mx-auto max-w-5xl px-4 pb-8 pt-12 sm:px-6 lg:px-8'>
        {/* Action bars skeleton */}
        <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='aucctus-border-primary h-[72px] animate-pulse rounded-xl border bg-gray-100' />
          <div className='aucctus-border-primary h-[72px] animate-pulse rounded-xl border bg-gray-100' />
        </div>

        {/* Header skeleton */}
        <div className='mb-4 flex items-center gap-3'>
          <div className='h-5 w-5 animate-pulse rounded bg-gray-200' />
          <div className='h-6 w-32 animate-pulse rounded bg-gray-200' />
          <div className='h-5 w-8 animate-pulse rounded-full bg-gray-200' />
        </div>

        {/* Document rows skeleton */}
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='aucctus-border-primary h-[72px] animate-pulse rounded-lg border bg-gray-100'
            />
          ))}
        </div>
      </div>
    );
  }

  // No report found state
  if (isNoReportFound) {
    return (
      <div className='mx-auto max-w-5xl px-4 pb-8 pt-12 sm:px-6 lg:px-8'>
        <div className='aucctus-border-primary rounded-lg border border-dashed p-12 text-center'>
          <FileText className='aucctus-text-quaternary mx-auto mb-4 h-12 w-12' />
          <p className='aucctus-text-secondary aucctus-text-md mb-2'>
            No Nucleus report found
          </p>
          <p className='aucctus-text-quaternary aucctus-text-sm'>
            Documents will appear here once a Nucleus report is generated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-5xl px-4 pb-8 pt-12 sm:px-6 lg:px-8'>
      {/* Two Action Bars - Placeholder for US-015 and US-016 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2'
      >
        {/* Connected Accounts Bar */}
        <div className='aucctus-border-primary flex items-center gap-4 rounded-xl border bg-white px-5 py-4 shadow-sm'>
          {/* Lock Icon with Tooltip */}
          <Tooltip tip='Data integrations are locked. Contact your admin to unlock.'>
            <div className='flex cursor-help items-center gap-2'>
              <Lock className='h-4 w-4 text-gray-400' />
              <div className='flex flex-col'>
                <span className='text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-400'>
                  Connected
                </span>
                <span className='text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-400'>
                  Accounts
                </span>
              </div>
            </div>
          </Tooltip>

          {/* Account Toggles - All disabled */}
          <div className='flex flex-1 items-center justify-end gap-2.5'>
            {/* OneDrive Toggle */}
            <div
              className='relative h-9 w-16 cursor-not-allowed rounded-full border border-gray-200 bg-gray-100/40 shadow-inner'
              title='OneDrive integration is locked'
            >
              <div className='absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white opacity-70 shadow-sm'>
                <svg viewBox='-154.5 -165 1339 990' className='h-4 w-4'>
                  <path
                    d='M622.292 445.338l212.613-203.327C790.741 69.804 615.338-33.996 443.13 10.168a321.9 321.9 0 00-188.92 134.837c3.29-.083 368.082 300.333 368.082 300.333z'
                    fill='#0364B8'
                  />
                  <path
                    d='M392.776 183.283l-.01.035A256.233 256.233 0 00257.5 144.921c-1.104 0-2.189.07-3.29.083C112.063 146.765-1.74 263.424.02 405.567a257.389 257.389 0 0046.244 144.04l318.528-39.894 244.21-196.915z'
                    fill='#0078D4'
                  />
                  <path
                    d='M834.905 242.012c-4.674-.312-9.37-.528-14.123-.528a208.464 208.464 0 00-82.93 17.117l-.006-.022-128.844 54.22 142.041 175.456 253.934 61.728c54.8-101.732 16.752-228.625-84.98-283.424a209.23 209.23 0 00-85.09-24.546z'
                    fill='#1490DF'
                  />
                  <path
                    d='M46.264 549.607C94.36 618.757 173.27 659.967 257.5 659.922h563.281c76.946.022 147.691-42.202 184.195-109.937L609.001 312.798z'
                    fill='#28A8EA'
                  />
                </svg>
              </div>
            </div>

            {/* Google Drive Toggle */}
            <div
              className='relative h-9 w-16 cursor-not-allowed rounded-full border border-gray-200 bg-gray-100/40 shadow-inner'
              title='Google Drive integration is locked'
            >
              <div className='absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white opacity-70 shadow-sm'>
                <svg viewBox='0 0 87.3 78' className='h-4 w-4'>
                  <path
                    d='M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z'
                    fill='#0066DA'
                  />
                  <path
                    d='M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 47.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z'
                    fill='#00AC47'
                  />
                  <path
                    d='M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.9 10.85 7.85 12.95z'
                    fill='#EA4335'
                  />
                  <path
                    d='M43.65 25L57.4 1.2c-1.35-.8-2.9-1.2-4.5-1.2H34.35c-1.6 0-3.15.45-4.45 1.2L43.65 25z'
                    fill='#00832D'
                  />
                  <path
                    d='M59.8 52H27.5l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2L59.8 52z'
                    fill='#2684FC'
                  />
                  <path
                    d='M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 27h27.5c0-1.55-.4-3.1-1.2-4.5l-12.7-21z'
                    fill='#FFBA00'
                  />
                </svg>
              </div>
            </div>

            {/* Dropbox Toggle */}
            <div
              className='relative h-9 w-16 cursor-not-allowed rounded-full border border-gray-200 bg-gray-100/40 shadow-inner'
              title='Dropbox integration is locked'
            >
              <div className='absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white opacity-70 shadow-sm'>
                <svg viewBox='0 0 24 24' className='h-4 w-4' fill='#0061FF'>
                  <path d='M6 2l6 3.75L6 9.5 0 5.75 6 2zm12 0l6 3.75-6 3.75-6-3.75L18 2zM0 13.25L6 9.5l6 3.75-6 3.75-6-3.75zm18-3.75l6 3.75-6 3.75-6-3.75 6-3.75zM6 18.25l6-3.75 6 3.75-6 3.75-6-3.75z' />
                </svg>
              </div>
            </div>

            {/* SharePoint Toggle */}
            <div
              className='relative h-9 w-16 cursor-not-allowed rounded-full border border-gray-200 bg-gray-100/40 shadow-inner'
              title='SharePoint integration is locked'
            >
              <div className='absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white opacity-70 shadow-sm'>
                <svg viewBox='0 0 2000 1950' className='h-4 w-4'>
                  <defs>
                    <linearGradient
                      id='sharepoint-grad'
                      x1='177'
                      y1='397'
                      x2='842'
                      y2='1549'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop offset='0' stopColor='#058f92' />
                      <stop offset='.5' stopColor='#038489' />
                      <stop offset='1' stopColor='#026d71' />
                    </linearGradient>
                  </defs>
                  <circle cx='1019' cy='556' fill='#036c70' r='556' />
                  <circle cx='1483' cy='1066' fill='#1a9ba1' r='510' />
                  <circle cx='1089' cy='1552' fill='#37c6d0' r='394' />
                  <path
                    d='M85 463h849c47 0 85 38 85 85v849c0 47-38 85-85 85H85c-47 0-85-38-85-85V548c0-47 38-85 85-85z'
                    fill='url(#sharepoint-grad)'
                  />
                  <path
                    d='M379 963a157 157 0 01-49-51 140 140 0 01-17-70 135 135 0 0132-91 186 186 0 0184-55 353 353 0 01114-18 435 435 0 01151 21v107a235 235 0 00-68-28 332 332 0 00-80-10 172 172 0 00-82 17 54 54 0 00-32 49 50 50 0 0014 35 125 125 0 0037 27c15 8 39 18 70 31l10 4a572 572 0 0188 43 157 157 0 0152 52 151 151 0 0118 79 147 147 0 01-29 95 165 165 0 01-79 53 357 357 0 01-112 16 594 594 0 01-102-8 349 349 0 01-83-24v-110a269 269 0 0076 32 351 351 0 0092 12c37 0 66-6 85-19a61 61 0 0029-55 54 54 0 00-15-38 140 140 0 00-40-29c-17-9-43-20-79-35a457 457 0 01-94-46z'
                    fill='#fff'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Bar */}
        <div
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group flex cursor-pointer items-center gap-4 rounded-xl border px-5 py-4 shadow-sm transition-all duration-200 ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'aucctus-border-primary bg-white hover:border-gray-300 hover:bg-gray-50'
          } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type='file'
            multiple
            accept={ACCEPTED_FILE_EXTENSIONS.join(',')}
            onChange={handleFileInputChange}
            className='hidden'
          />

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
              isDragging ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
            }`}
          >
            <Upload
              className={`h-5 w-5 transition-colors duration-200 ${
                isDragging
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}
            />
          </div>
          <div className='flex-1'>
            <p
              className={`aucctus-text-sm-medium transition-colors duration-200 ${
                isDragging ? 'text-blue-600' : 'aucctus-text-primary'
              }`}
            >
              {isUploading
                ? 'Uploading...'
                : isDragging
                  ? 'Drop files here!'
                  : 'Drop files or click to upload'}
            </p>
            <p className='aucctus-text-xs aucctus-text-quaternary'>
              PDF, DOC, XLS, CSV, PPT
            </p>
          </div>
          <div
            className={`aucctus-text-xs-medium rounded-lg px-3 py-1.5 transition-all duration-200 ${
              isDragging
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
            }`}
          >
            Browse
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <div className='mb-4 flex items-center gap-3'>
        <FileText className='h-5 w-5 text-gray-700' />
        <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
          Documents
        </h2>
        <span className='aucctus-text-xs-medium rounded-full bg-gray-100 px-2 py-0.5 text-gray-500'>
          {documents.length}
        </span>
      </div>

      {/* Documents List - Placeholder for US-017 */}
      <div className='space-y-3'>
        {!hasDocuments ? (
          <div className='aucctus-border-primary rounded-lg border border-dashed p-12 text-center'>
            <FileText className='aucctus-text-quaternary mx-auto mb-4 h-12 w-12' />
            <p className='aucctus-text-secondary aucctus-text-md mb-4'>
              No documents uploaded yet
            </p>
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className='btn btn-outline btn-md inline-flex items-center gap-2'
            >
              <Upload className='h-4 w-4' />
              {isUploading ? 'Uploading...' : 'Upload your first document'}
            </button>
          </div>
        ) : (
          documents.map((doc) => {
            const filename = doc.title || doc.originalFilename || 'document';
            const fileConfig = getFileTypeConfig(filename);
            const FileIcon = fileConfig.icon;
            const isExpanded = expandedDocId === doc.uuid;

            return (
              <motion.div
                key={doc.uuid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='aucctus-border-primary overflow-hidden rounded-lg border bg-white'
              >
                {/* Document Row */}
                <div
                  className='flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50'
                  onClick={() => handleToggleExpand(doc.uuid)}
                >
                  <div className='flex items-center gap-4'>
                    {/* File type icon with color */}
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${fileConfig.bgColor}`}
                    >
                      <FileIcon className={`h-5 w-5 ${fileConfig.color}`} />
                    </div>
                    <div>
                      <p className='aucctus-text-sm-medium aucctus-text-primary'>
                        {doc.title ||
                          doc.originalFilename ||
                          'Untitled Document'}
                      </p>
                      <div className='aucctus-text-xs aucctus-text-quaternary mt-1 flex items-center gap-3'>
                        {doc.fileSize && (
                          <>
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>&middot;</span>
                          </>
                        )}
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span>&middot;</span>
                        <span className='aucctus-text-brand-primary'>
                          Used in {doc.categories.length} categor
                          {doc.categories.length !== 1 ? 'ies' : 'y'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Delete and Chevron */}
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={(e) => handleDeleteClick(e, doc)}
                      className='rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600'
                      title='Delete document'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Category Usage */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className='border-t border-gray-100 bg-gray-50/50'
                    >
                      <div className='p-4'>
                        <p className='mb-3 text-xs font-medium uppercase tracking-wide text-gray-500'>
                          Used in Categories
                        </p>
                        {doc.categories.length === 0 ? (
                          <p className='text-sm italic text-gray-400'>
                            Not assigned to any categories yet
                          </p>
                        ) : (
                          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                            {doc.categories.map((category) => {
                              const categoryInfo = CATEGORY_CONFIG[
                                category.categoryId
                              ] || {
                                name: category.categoryName,
                                icon: 'help-circle' as IconVariant,
                              };
                              return (
                                <div
                                  key={category.categoryId}
                                  onClick={(e) =>
                                    handleCategoryClick(e, category.categoryId)
                                  }
                                  className='hover:aucctus-border-brand hover:aucctus-bg-brand-secondary group flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all'
                                >
                                  <div className='aucctus-bg-secondary group-hover:aucctus-bg-brand-secondary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md transition-colors'>
                                    <Icon
                                      variant={categoryInfo.icon}
                                      className='aucctus-stroke-tertiary group-hover:aucctus-stroke-brand-primary h-4 w-4 transition-colors'
                                    />
                                  </div>
                                  <div className='min-w-0 flex-1'>
                                    <p className='aucctus-text-primary truncate text-sm font-medium'>
                                      {categoryInfo.name}
                                    </p>
                                    <p className='aucctus-text-quaternary text-xs'>
                                      {category.sourceCount} source
                                      {category.sourceCount !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  <ChevronRight className='aucctus-text-quaternary group-hover:aucctus-text-brand-primary h-4 w-4 flex-shrink-0 transition-colors' />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

/**
 * Format file size in bytes to human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default UploadsTab;
