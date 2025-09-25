import React, { useState } from 'react';
import { Icon } from '@components';
import { formatFileSize } from '../TestResults.utils';
import { UploadedFile } from '../TestResults.types';

interface FileInfo {
  uuid: string;
  originalFilename: string;
  fileExtension: string;
  fileSize: number;
  fileUrl?: string;
  filePath?: string;
  createdAt: string;
  resultUuid: string; // Add result UUID to track which result this file belongs to
}

interface RawResultsFilesProps {
  results: any[]; // ITestResult[]
  canDelete?: boolean;
  onDeleteFile?: (
    resultUuid: string,
    fileUuid: string,
    filename: string,
  ) => void;
  onDeleteAllFiles?: () => void;
  onFilesUpload?: (files: UploadedFile[]) => void;
  isViewMode?: boolean;
}

const RawResultsFiles: React.FC<RawResultsFilesProps> = ({
  results,
  canDelete = false,
  onDeleteFile,
  onDeleteAllFiles,
  onFilesUpload,
  isViewMode = false,
}) => {
  // State for expanding/collapsing file list
  const [isExpanded, setIsExpanded] = useState(false);

  // Collect all files from all test results
  const allFiles: FileInfo[] = [];

  results.forEach((result) => {
    if (result.files && Array.isArray(result.files)) {
      result.files.forEach((file: FileInfo) => {
        allFiles.push({
          ...file,
          resultUuid: result.uuid, // Add the result UUID to each file
        });
      });
    }
  });

  // Determine which files to display
  const maxInitialFiles = 3;
  const displayedFiles = isExpanded
    ? allFiles
    : allFiles.slice(0, maxInitialFiles);
  const hasMoreFiles = allFiles.length > maxInitialFiles;

  // Always render the section for upload functionality, even if no files

  const handleDownload = (file: FileInfo) => {
    if (file.fileUrl) {
      // Create a temporary link and click it to download
      const link = document.createElement('a');
      link.href = file.fileUrl;
      link.download = file.originalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (file: FileInfo) => {
    if (onDeleteFile) {
      onDeleteFile(file.resultUuid, file.uuid, file.originalFilename);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onFilesUpload) {
      // Convert File[] to UploadedFile[]
      const uploadedFiles = Array.from(files).map((file, index) => ({
        id: `${Date.now()}-${index}`, // Generate unique ID
        file: file,
        name: file.name,
        description: '', // Empty description for simple upload
      }));
      onFilesUpload(uploadedFiles);
    }
    // Reset the input value so the same file can be uploaded again
    event.target.value = '';
  };

  return (
    <div className='space-y-4'>
      {/* Section Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Icon
            variant='download'
            className='aucctus-stroke-brand-primary h-5 w-5 flex-shrink-0'
          />
          <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            Raw Results Files
          </h4>
        </div>
        <div className='flex items-center gap-2'>
          {/* Delete All Button */}
          {canDelete && allFiles.length > 0 && (
            <button
              onClick={onDeleteAllFiles}
              className='btn btn-danger btn-sm flex items-center gap-2'
              title='Delete all files'
            >
              <Icon variant='trash' className='aucctus-stroke-white h-4 w-4' />
              Delete All Files
            </button>
          )}

          {!isViewMode && (
            <>
              <input
                type='file'
                id='file-upload'
                multiple
                accept='.pdf,.csv,.docx,.xlsx,.txt,.mp4,.mp3,.json'
                onChange={handleFileUpload}
                className='hidden'
              />
              <label
                htmlFor='file-upload'
                className='btn btn-light btn-sm flex cursor-pointer items-center gap-2'
              >
                <Icon
                  variant='upload'
                  className='aucctus-stroke-secondary h-4 w-4'
                />
                Upload results
              </label>
            </>
          )}
        </div>
      </div>

      {/* Files List */}
      <div className='space-y-3'>
        {allFiles.length === 0 ? (
          <div className='aucctus-border-secondary aucctus-bg-secondary rounded-lg border p-6 text-center'>
            <Icon
              variant='file'
              className='aucctus-stroke-tertiary mx-auto mb-3 h-8 w-8'
            />
            <p className='aucctus-text-secondary aucctus-text-sm mb-2'>
              No files uploaded yet
            </p>
            <p className='aucctus-text-tertiary aucctus-text-xs'>
              Upload your test results to get started with analysis
            </p>
          </div>
        ) : (
          displayedFiles.map((file) => (
            <div
              key={file.uuid}
              className='aucctus-border-secondary aucctus-bg-primary flex items-center justify-between rounded-lg border p-4'
            >
              {/* File Info */}
              <div className='flex items-center gap-3'>
                <div className='aucctus-bg-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
                  <Icon
                    variant='file'
                    className='aucctus-stroke-brand-primary h-5 w-5'
                  />
                </div>
                <div>
                  <h5 className='aucctus-text-sm-semibold aucctus-text-primary'>
                    {file.originalFilename}
                  </h5>
                  <p className='aucctus-text-xs-regular aucctus-text-secondary'>
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center gap-2'>
                {/* Download Button */}
                <button
                  onClick={() => handleDownload(file)}
                  className='aucctus-text-secondary hover:aucctus-text-primary aucctus-bg-secondary-hover rounded p-2 transition-colors'
                  title='Download file'
                  disabled={!file.fileUrl}
                >
                  <Icon
                    variant='download'
                    className='aucctus-stroke-secondary hover:aucctus-stroke-primary h-4 w-4 transition-colors'
                  />
                </button>

                {/* Delete Button */}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(file)}
                    className='aucctus-text-secondary hover:aucctus-text-error-primary aucctus-bg-secondary-hover rounded p-2 transition-colors'
                    title='Delete file'
                  >
                    <Icon
                      variant='closeX'
                      className='aucctus-stroke-secondary hover:aucctus-stroke-error-primary h-4 w-4 transition-colors'
                    />
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* See all files link if more than 3 files */}
        {hasMoreFiles && (
          <div className='flex justify-center pt-2'>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='aucctus-text-secondary hover:aucctus-text-primary flex items-center gap-1 text-sm transition-colors'
            >
              <Icon
                variant={isExpanded ? 'chevronup' : 'chevrondown'}
                className='aucctus-stroke-secondary h-4 w-4'
              />
              {isExpanded ? 'Show less' : `See all ${allFiles.length} files`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RawResultsFiles;
