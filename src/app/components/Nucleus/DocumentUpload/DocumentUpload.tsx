import Icon from '@components/Icon';
import React, { useState, useCallback } from 'react';
import { useNucleusDocumentUpload } from '../../../hooks/query/nucleus.hook';
import { cn } from '@libs/utils/react';

interface DocumentUploadProps {
  reportUuid: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ reportUuid }) => {
  const { uploadDocuments, isUploading, isUploadSuccess } =
    useNucleusDocumentUpload();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      uploadDocuments({ reportUuid, files: fileArray });
    },
    [reportUuid, uploadDocuments],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleClick = useCallback(() => {
    if (isUploading) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.accept = '.pdf,.txt';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      handleFileUpload(files);
    };
    input.click();
  }, [isUploading, handleFileUpload]);

  return (
    <div className='col-span-3 flex flex-col gap-3'>
      {/* Document Upload Widget */}
      <div className='flex-[1.8]'>
        <div className='aucctus-bg-secondary aucctus-border-primary h-full rounded-lg border p-4 shadow-sm'>
          <h3 className='aucctus-text-xs-semibold aucctus-text-tertiary mb-3 uppercase tracking-widest'>
            QUICK CONTEXT UPLOAD
          </h3>
          <div
            className={cn(
              'flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-all duration-200',
              {
                'aucctus-border-brand hover:aucctus-border-brand-alt hover:aucctus-bg-brand-secondary':
                  !isUploading && !isDragOver,
                'aucctus-border-brand-alt aucctus-bg-brand-secondary':
                  isDragOver,
                'aucctus-border-success aucctus-bg-success-secondary':
                  isUploadSuccess,
                'aucctus-border-secondary aucctus-bg-disabled cursor-not-allowed opacity-50':
                  isUploading,
              },
            )}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <>
                <div className='border-brand-primary mb-2 h-6 w-6 animate-spin rounded-full border-2 border-b-transparent'></div>
                <p className='aucctus-text-sm-medium aucctus-text-primary mb-1'>
                  Uploading...
                </p>
                <p className='aucctus-text-xs aucctus-text-secondary'>
                  Please wait while we process your file
                </p>
              </>
            ) : (
              <>
                <Icon
                  variant={isUploadSuccess ? 'check' : 'upload'}
                  className={cn('mb-2 h-6 w-6', {
                    'aucctus-stroke-brand-primary': !isUploadSuccess,
                    'aucctus-stroke-success-primary': isUploadSuccess,
                  })}
                />
                <p className='aucctus-text-sm-medium aucctus-text-primary mb-1'>
                  {isUploadSuccess
                    ? 'Upload successful!'
                    : 'Drop file here or click to browse'}
                </p>
                <p className='aucctus-text-xs aucctus-text-secondary'>
                  PDF, TXT (max 10MB)
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
