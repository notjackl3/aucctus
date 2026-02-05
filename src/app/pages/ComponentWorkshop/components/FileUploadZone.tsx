// @ts-nocheck
// DEPRECATED: This component is no longer used. Use Concept Report Workshop tab instead.
/**
 * FileUploadZone Component
 *
 * A reusable drag-and-drop file upload zone with file list display.
 * Supports multiple file selection and validation.
 */

import React from 'react';
import { Icon } from '@components';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
import { cn } from '@libs/utils/react';
import { SUPPORTED_FILE_EXTENSIONS } from '@libs/api/types/dynamicComponent.d';
import {
  FileImage,
  FileCode2,
  FileText,
  FileJson,
  File,
  FileSpreadsheet,
  type LucideIcon,
} from 'lucide-react';

interface IFileUploadZoneProps {
  /** Currently uploaded files */
  files: File[];
  /** Whether a file is being dragged over */
  isDragging: boolean;
  /** Whether the upload zone is disabled */
  disabled?: boolean;
  /** Ref for the hidden file input */
  fileInputRef: React.RefObject<HTMLInputElement>;
  /** Handle file selection from input */
  onFileSelect: (files: FileList | null) => void;
  /** Remove a file by index */
  onRemoveFile: (index: number) => void;
  /** Handle drag over event */
  onDragOver: (e: React.DragEvent) => void;
  /** Handle drag leave event */
  onDragLeave: (e: React.DragEvent) => void;
  /** Handle drop event */
  onDrop: (e: React.DragEvent) => void;
  /** Open the file picker */
  onOpenFilePicker: () => void;
}

/**
 * Get the appropriate Lucide icon for a file type
 */
const getFileIcon = (file: File): LucideIcon => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  // Images
  if (
    file.type.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(
      ext || '',
    )
  ) {
    return FileImage;
  }

  // JSON files
  if (file.type === 'application/json' || ext === 'json') {
    return FileJson;
  }

  // Code files
  if (
    [
      'tsx',
      'ts',
      'jsx',
      'js',
      'py',
      'html',
      'css',
      'scss',
      'less',
      'vue',
      'rb',
      'go',
      'rs',
      'php',
      'java',
      'c',
      'cpp',
      'h',
      'swift',
      'kt',
      'sh',
      'bash',
      'zsh',
      'yaml',
      'yml',
      'xml',
      'sql',
      'md',
      'mdx',
    ].includes(ext || '')
  ) {
    return FileCode2;
  }

  // Spreadsheet files
  if (['csv', 'xls', 'xlsx', 'numbers'].includes(ext || '')) {
    return FileSpreadsheet;
  }

  // Documents / text
  if (
    ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'].includes(ext || '')
  ) {
    return FileText;
  }

  // Default
  return File;
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
};

/**
 * Get file extension in uppercase for display
 */
const getFileExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toUpperCase();
  return ext || 'FILE';
};

/**
 * FileUploadZone - Drag and drop file upload component
 */
const FileUploadZone: React.FC<IFileUploadZoneProps> = ({
  files,
  isDragging,
  disabled = false,
  fileInputRef,
  onFileSelect,
  onRemoveFile,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpenFilePicker,
}) => {
  return (
    <div className='space-y-4'>
      {/* Drop Zone */}
      <div
        onDragOver={disabled ? undefined : onDragOver}
        onDragLeave={disabled ? undefined : onDragLeave}
        onDrop={disabled ? undefined : onDrop}
        onClick={disabled ? undefined : onOpenFilePicker}
        role='button'
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onOpenFilePicker();
          }
        }}
        aria-label='Upload files'
        aria-disabled={disabled}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
          {
            'cursor-pointer': !disabled,
            'aucctus-border-brand aucctus-bg-brand-secondary': isDragging,
            'aucctus-border-secondary hover:aucctus-border-tertiary aucctus-bg-secondary':
              !isDragging && !disabled,
            'cursor-not-allowed opacity-50': disabled,
          },
        )}
      >
        <input
          ref={fileInputRef}
          type='file'
          multiple
          accept={SUPPORTED_FILE_EXTENSIONS.join(',')}
          onChange={(e) => onFileSelect(e.target.files)}
          disabled={disabled}
          className='hidden'
          aria-hidden='true'
        />

        <Icon
          variant='upload'
          className={cn('mx-auto mb-2 h-8 w-8', {
            'aucctus-stroke-brand-primary': isDragging,
            'aucctus-stroke-tertiary': !isDragging,
          })}
        />

        <p className='aucctus-text-sm aucctus-text-secondary mb-1'>
          <span className='aucctus-text-brand-primary font-medium'>
            Click to upload
          </span>{' '}
          or drag and drop
        </p>

        <p className='aucctus-text-xs aucctus-text-tertiary'>
          Images, mockups, schemas, or code files (max 30MB each)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className='space-y-3'>
          <p className='aucctus-text-xs-medium aucctus-text-secondary'>
            {files.length} file{files.length !== 1 ? 's' : ''} attached
          </p>

          <div className='flex flex-wrap gap-3'>
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);

              return (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  className='aucctus-bg-tertiary group relative flex w-28 flex-col overflow-hidden rounded-lg'
                >
                  {/* Icon Container */}
                  <div className='aucctus-bg-secondary relative flex aspect-square w-full items-center justify-center'>
                    <FileIcon
                      className='aucctus-text-tertiary h-8 w-8'
                      strokeWidth={1.5}
                    />

                    {/* Remove Button (overlay) */}
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(index);
                      }}
                      disabled={disabled}
                      className={cn(
                        'absolute right-1 top-1 rounded-full p-1 transition-all',
                        'bg-gray-light-900/80 opacity-0 group-hover:opacity-100',
                        'hover:bg-error-600',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                      )}
                      aria-label={`Remove ${file.name}`}
                    >
                      <Icon
                        variant='closeX'
                        className='aucctus-stroke-white h-3 w-3'
                      />
                    </button>
                  </div>

                  {/* File Info */}
                  <div className='flex flex-col gap-0.5 px-2 py-1.5'>
                    <ComponentTooltip
                      tip={
                        <div className='aucctus-bg-primary-solid aucctus-text-xs aucctus-text-white max-w-64 break-all rounded-md px-2.5 py-1.5 shadow-lg'>
                          {file.name}
                        </div>
                      }
                    >
                      <span className='aucctus-text-xs aucctus-text-secondary truncate'>
                        {file.name}
                      </span>
                    </ComponentTooltip>
                    <span className='aucctus-text-xs aucctus-text-quaternary'>
                      {getFileExtension(file.name)} ·{' '}
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
