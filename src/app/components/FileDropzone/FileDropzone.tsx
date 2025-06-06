import React, { useState, useCallback, useRef } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface UploadedFile {
  file: File;
  name: string;
  description: string;
}

interface FileDropzoneProps {
  onFileUpload: (uploadedFile: UploadedFile) => void;
  onFileRemove: () => void;
  className?: string;
  maxSizeInMB?: number;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileUpload,
  onFileRemove,
  className = '',
  maxSizeInMB = 10,
}) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (file.type !== 'application/pdf') {
        return 'Only PDF files are allowed';
      }

      // Check file size
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return `File size must be less than ${maxSizeInMB}MB`;
      }

      return null;
    },
    [maxSizeInMB],
  );

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        alert(error); // In a real app, use toast notification
        return;
      }

      setIsUploading(true);

      // Simulate upload delay
      setTimeout(() => {
        const uploaded: UploadedFile = {
          file,
          name: file.name.replace('.pdf', ''),
          description: '', // No description since we removed the field
        };

        setUploadedFile(uploaded);
        setIsUploading(false);
        onFileUpload(uploaded);
      }, 1000);
    },
    [onFileUpload, validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
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
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove();
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

  // Show uploaded file state
  if (uploadedFile) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-6'>
          <div className='flex items-start gap-4'>
            <div className='flex-shrink-0'>
              <Icon variant='pdf' className='h-10 w-10' />
            </div>
            <div className='min-w-0 flex-1'>
              <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-1'>
                {uploadedFile.name}
              </h4>
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
                <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                  PDF
                </span>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
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
      </div>
    );
  }

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
              Uploading File...
            </h4>
            <p className='aucctus-text-sm-regular aucctus-text-secondary'>
              Please wait while we process your file
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show dropzone with form
  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
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
            {isDragOver ? 'Drop your PDF file here' : 'Upload PDF File'}
          </h4>
          <p className='aucctus-text-sm-regular aucctus-text-secondary mb-3'>
            Drag and drop your file here, or click to browse
          </p>
          <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
            Only PDF files up to {maxSizeInMB}MB are supported
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='.pdf'
        onChange={handleFileSelect}
        className='hidden'
      />
    </div>
  );
};

export default FileDropzone;
