import React, { useState, useCallback, useRef } from 'react';
import { Icon, toast } from '@components';
import { cn } from '@libs/utils/react';

interface StagedFile {
  id: string;
  file: File;
  name: string;
  description: string;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  description: string;
}

interface FileDropzoneProps {
  onFilesUpload: (uploadedFiles: UploadedFile[]) => void;
  onFileRemove?: (fileId: string) => void;
  className?: string;
  maxSizeInMB?: number;
  maxFiles?: number;
  maxTotalSizeInMB?: number;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesUpload,
  onFileRemove,
  className = '',
  maxSizeInMB = 1000, // Increased from 10MB to 1GB
  maxFiles = 100, // Increased from 5 to 100 files
  maxTotalSizeInMB = 10000, // Increased from 50MB to 10GB
}) => {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type - allow PDF and CSV files
      const allowedTypes = [
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
      ];

      const isValidType =
        allowedTypes.includes(file.type) ||
        file.name.toLowerCase().endsWith('.csv');

      if (!isValidType) {
        return 'Only PDF and CSV files are allowed';
      }

      // Check individual file size
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return `File size must be less than ${maxSizeInMB}MB`;
      }

      return null;
    },
    [maxSizeInMB],
  );

  const validateFiles = useCallback(
    (newFiles: File[]): string | null => {
      // Check total number of files (staged + uploaded + new)
      if (
        stagedFiles.length + uploadedFiles.length + newFiles.length >
        maxFiles
      ) {
        return `You can only upload up to ${maxFiles} files`;
      }

      // Check total size (staged + uploaded + new)
      const stagedTotalSize = stagedFiles.reduce(
        (sum, file) => sum + file.file.size,
        0,
      );
      const uploadedTotalSize = uploadedFiles.reduce(
        (sum, file) => sum + file.file.size,
        0,
      );
      const newTotalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
      const maxTotalSizeInBytes = maxTotalSizeInMB * 1024 * 1024;

      if (
        stagedTotalSize + uploadedTotalSize + newTotalSize >
        maxTotalSizeInBytes
      ) {
        return `Total file size must be less than ${maxTotalSizeInMB}MB`;
      }

      // Check for duplicate files (against both staged and uploaded)
      const allExistingFiles = [...stagedFiles, ...uploadedFiles];
      for (const newFile of newFiles) {
        if (
          allExistingFiles.some(
            (existingFile) => existingFile.file.name === newFile.name,
          )
        ) {
          return `File "${newFile.name}" is already added`;
        }
      }

      return null;
    },
    [stagedFiles, uploadedFiles, maxFiles, maxTotalSizeInMB],
  );

  const generateFileId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 11);
  };

  const handleFiles = useCallback(
    (files: File[]) => {
      // Validate all files first
      const validationError = validateFiles(files);
      if (validationError) {
        toast.error('Upload Error', validationError);
        return;
      }

      // Validate each file individually
      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          toast.error('Upload Error', error);
          return;
        }
      }

      // Stage files for upload
      const newStagedFiles: StagedFile[] = files.map((file) => ({
        id: generateFileId(),
        file,
        name: file.name.replace(/\.(pdf|csv)$/i, ''),
        description: '', // No description since we removed the field
      }));

      setStagedFiles((prev) => [...prev, ...newStagedFiles]);
    },
    [validateFile, validateFiles],
  );

  const handleUploadAll = useCallback(async () => {
    if (stagedFiles.length === 0) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const newUploadedFiles: UploadedFile[] = stagedFiles.map((staged) => ({
        id: staged.id,
        file: staged.file,
        name: staged.name,
        description: staged.description,
      }));

      const allUploadedFiles = [...uploadedFiles, ...newUploadedFiles];
      setUploadedFiles(allUploadedFiles);
      setStagedFiles([]); // Clear staged files after upload
      setIsUploading(false);
      onFilesUpload(allUploadedFiles);
    }, 2000); // Slightly longer to simulate batch upload
  }, [stagedFiles, uploadedFiles, onFilesUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(Array.from(files));
      }
    },
    [handleFiles],
  );

  const handleRemoveStagedFile = (fileId: string) => {
    setStagedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleRemoveUploadedFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter((file) => file.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFileRemove?.(fileId);
  };

  const handleClearAll = () => {
    setStagedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalFileSize = (files: { file: File }[]): string => {
    const totalBytes = files.reduce((sum, file) => sum + file.file.size, 0);
    return formatFileSize(totalBytes);
  };

  const totalFiles = stagedFiles.length + uploadedFiles.length;
  const canAddMore = totalFiles < maxFiles;

  // Show loading state
  if (isUploading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-8'>
          <div className='flex flex-col items-center justify-center text-center'>
            <Icon
              variant='refresh'
              className='aucctus-stroke-brand-primary mb-4 h-8 w-8 animate-spin'
            />
            <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
              Uploading {stagedFiles.length} files...
            </h4>
            <p className='aucctus-text-sm-regular aucctus-text-secondary'>
              Please wait while we process your files
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Show staged files if any */}
      {stagedFiles.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
              Ready to Upload ({stagedFiles.length} files)
            </h4>
            <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
              Size: {getTotalFileSize(stagedFiles)}
            </p>
          </div>

          {stagedFiles.map((stagedFile) => (
            <div
              key={stagedFile.id}
              className='aucctus-bg-brand-secondary aucctus-border-brand rounded-lg border p-4'
            >
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0'>
                  <Icon
                    variant={
                      stagedFile.file.type === 'application/pdf'
                        ? 'pdf'
                        : 'filecode'
                    }
                    className='aucctus-fill-brand-primary h-8 w-8'
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <h5 className='aucctus-text-sm-semibold aucctus-text-brand-primary mb-1'>
                    {stagedFile.name}
                  </h5>
                  <div className='flex items-center gap-2 text-xs'>
                    <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      {stagedFile.file.name}
                    </span>
                    <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      •
                    </span>
                    <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      {formatFileSize(stagedFile.file.size)}
                    </span>
                    <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      •
                    </span>
                    <span className='aucctus-text-xs-regular aucctus-text-brand-primary'>
                      Ready to upload
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveStagedFile(stagedFile.id)}
                  className='btn btn-secondary btn-sm flex items-center gap-1'
                >
                  <Icon
                    variant='trash'
                    className='aucctus-stroke-secondary h-4 w-4'
                  />
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Upload Actions */}
          <div className='flex items-center gap-3'>
            <button
              onClick={handleUploadAll}
              className='btn btn-primary flex items-center gap-2'
              disabled={stagedFiles.length === 0}
            >
              <Icon
                variant='arrowup'
                className='aucctus-stroke-white h-4 w-4'
              />
              Upload All ({stagedFiles.length} files)
            </button>
            <button
              onClick={handleClearAll}
              className='btn btn-secondary flex items-center gap-2'
            >
              <Icon
                variant='trash'
                className='aucctus-stroke-secondary h-4 w-4'
              />
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Show uploaded files if any */}
      {uploadedFiles.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h4 className='aucctus-text-md-semibold aucctus-text-success-primary'>
              Uploaded Files ({uploadedFiles.length})
            </h4>
            <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
              Size: {getTotalFileSize(uploadedFiles)}
            </p>
          </div>

          {uploadedFiles.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className='aucctus-bg-success-secondary aucctus-border-success rounded-lg border p-4'
            >
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0'>
                  <Icon
                    variant={
                      uploadedFile.file.type === 'application/pdf'
                        ? 'pdf'
                        : 'filecode'
                    }
                    className='aucctus-fill-success-primary h-8 w-8'
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <h5 className='aucctus-text-sm-semibold aucctus-text-success-primary mb-1'>
                    {uploadedFile.name}
                  </h5>
                  <div className='flex items-center gap-2 text-xs'>
                    <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      {uploadedFile.file.name}
                    </span>
                    <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      •
                    </span>
                    <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      {formatFileSize(uploadedFile.file.size)}
                    </span>
                    <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      •
                    </span>
                    <span className='aucctus-text-xs-regular aucctus-text-success-primary'>
                      Uploaded
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveUploadedFile(uploadedFile.id)}
                  className='btn btn-secondary btn-sm flex items-center gap-1'
                >
                  <Icon
                    variant='trash'
                    className='aucctus-stroke-secondary h-4 w-4'
                  />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show dropzone if not at max files */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleUploadClick}
          className={cn(
            'aucctus-border-secondary aucctus-bg-secondary-subtle cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors',
            isDragOver && 'aucctus-border-brand-primary aucctus-bg-primary',
          )}
        >
          <div className='flex flex-col items-center justify-center text-center'>
            <div className='aucctus-bg-secondary aucctus-border-secondary mb-4 flex h-12 w-12 items-center justify-center rounded-lg border'>
              <Icon
                variant='arrowup'
                className={cn(
                  'h-6 w-6',
                  isDragOver
                    ? 'aucctus-stroke-brand-primary'
                    : 'aucctus-stroke-secondary',
                )}
              />
            </div>
            <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
              {isDragOver
                ? 'Drop your files here'
                : totalFiles > 0
                  ? 'Add More Files'
                  : 'Select Files'}
            </h4>
            <p className='aucctus-text-sm-regular aucctus-text-secondary mb-3'>
              Drag and drop your files here, or click to browse
            </p>
            <div className='space-y-1'>
              <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                PDF and CSV files supported
              </p>
              <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                Upload multiple files (up to {maxFiles} files)
              </p>
              {totalFiles > 0 && (
                <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                  {maxFiles - totalFiles} files remaining
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary when at max files */}
      {!canAddMore && (
        <div className='aucctus-bg-tertiary aucctus-border-secondary rounded-lg border p-4 text-center'>
          <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
            Maximum files reached ({totalFiles}/{maxFiles})
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='.pdf,.csv'
        multiple
        onChange={handleFileSelect}
        className='hidden'
      />
    </div>
  );
};

export default FileDropzone;
