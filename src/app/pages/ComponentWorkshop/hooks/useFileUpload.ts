// @ts-nocheck
// DEPRECATED: This hook is no longer used. Use Concept Report Workshop tab instead.
/**
 * Custom hook for file upload state and validation
 *
 * Handles file validation, drag-and-drop, and file list management
 * for the ComponentWorkshop file upload feature.
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from '@components';
import {
  SUPPORTED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from '@libs/api/types/dynamicComponent.d';

interface IUseFileUploadOptions {
  /** Maximum number of files allowed */
  maxFiles?: number;
}

interface IUseFileUploadReturn {
  /** Currently uploaded files */
  files: File[];
  /** Whether a file is being dragged over the drop zone */
  isDragging: boolean;
  /** Ref for the hidden file input */
  fileInputRef: React.RefObject<HTMLInputElement>;
  /** Handle file selection from input or drop */
  handleFileSelect: (files: FileList | null) => void;
  /** Remove a file by index */
  handleRemoveFile: (index: number) => void;
  /** Handle drag over event */
  handleDragOver: (e: React.DragEvent) => void;
  /** Handle drag leave event */
  handleDragLeave: (e: React.DragEvent) => void;
  /** Handle drop event */
  handleDrop: (e: React.DragEvent) => void;
  /** Clear all uploaded files */
  clearFiles: () => void;
  /** Trigger the file input click */
  openFilePicker: () => void;
}

/**
 * Validates a file for upload
 * @param file - The file to validate
 * @returns Error message if invalid, null if valid
 */
const validateFile = (file: File): string | null => {
  // Check file extension
  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (
    !SUPPORTED_FILE_EXTENSIONS.includes(
      ext as (typeof SUPPORTED_FILE_EXTENSIONS)[number],
    )
  ) {
    return `Unsupported file type: ${ext}`;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 30MB)`;
  }

  return null;
};

/**
 * Custom hook for managing file upload state and handlers
 *
 * @param options - Configuration options
 * @returns File upload state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   files,
 *   isDragging,
 *   handleDragOver,
 *   handleDragLeave,
 *   handleDrop,
 *   handleFileSelect,
 *   handleRemoveFile,
 *   clearFiles,
 *   openFilePicker,
 *   fileInputRef,
 * } = useFileUpload({ maxFiles: 10 });
 * ```
 */
export const useFileUpload = (
  options: IUseFileUploadOptions = {},
): IUseFileUploadReturn => {
  const { maxFiles = 10 } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection from input or drop
   */
  const handleFileSelect = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: File[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        // Check max files limit
        if (files.length + newFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          return;
        }

        // Validate file
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
          return;
        }

        // Check for duplicates
        const isDuplicate = files.some(
          (f) => f.name === file.name && f.size === file.size,
        );
        if (isDuplicate) {
          return; // Silently skip duplicates
        }

        newFiles.push(file);
      });

      if (errors.length > 0) {
        toast.error('File Validation', errors.slice(0, 3).join('\n'));
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
      }

      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [files, maxFiles],
  );

  /**
   * Remove a file by index
   */
  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

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
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  /**
   * Clear all uploaded files
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Trigger the file input click
   */
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    files,
    isDragging,
    fileInputRef,
    handleFileSelect,
    handleRemoveFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFiles,
    openFilePicker,
  };
};

export default useFileUpload;
