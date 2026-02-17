import React from 'react';
import { cn } from '@libs/utils/react';
import { RegularResultViewProps } from '../TestResults.types';
import { formatFileSize, formatDate } from '../TestResults.utils';
import { Calendar, Download, FileCode, Trash2 } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

const RegularResultView: React.FC<RegularResultViewProps> = ({
  result,
  canDelete,
  isProcessingComplete,
  onDeleteFile,
}) => {
  return (
    <>
      {result.files.map((file: any) => (
        <div className='p-4' key={file.uuid}>
          {/* Description if available */}
          {file.originalFilename && (
            <div className='mb-3'>
              <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                {file.originalFilename}
              </p>
            </div>
          )}

          {/* Metadata in compact grid */}
          <div className='grid grid-cols-2 gap-3 text-xs'>
            <div className='flex items-center gap-2'>
              <FileCode className='aucctus-stroke-tertiary h-3 w-3 flex-shrink-0' />
              <div>
                <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                  Size
                </p>
                <p className='aucctus-text-xs-semibold aucctus-text-brand-primary'>
                  {formatFileSize(file.fileSize)}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Calendar className='aucctus-stroke-tertiary h-3 w-3 flex-shrink-0' />
              <div>
                <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                  Uploaded
                </p>
                <p className='aucctus-text-xs-semibold aucctus-text-brand-primary'>
                  {formatDate(file.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className='mt-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <DynamicIcon
                variant={isProcessingComplete ? 'check' : 'refresh'}
                className={cn(
                  'h-3 w-3',
                  isProcessingComplete
                    ? 'aucctus-stroke-success-primary'
                    : 'aucctus-stroke-brand-primary animate-spin',
                )}
              />
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-xs font-medium',
                  isProcessingComplete
                    ? 'aucctus-bg-success-secondary aucctus-text-success-primary'
                    : 'aucctus-bg-brand-secondary aucctus-text-brand-primary',
                )}
              >
                {isProcessingComplete ? 'Processed' : 'Processing...'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                {file.fileExtension.toUpperCase()}
              </p>
              {file.fileUrl && (
                <a
                  href={file.fileUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='btn btn-primary btn-xs flex items-center gap-1'
                  title='Download file'
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className='aucctus-stroke-white h-3 w-3' />
                </a>
              )}
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(
                      result.uuid,
                      file.uuid,
                      file.originalFilename || 'file',
                    );
                  }}
                  className='btn btn-secondary btn-xs flex items-center gap-1'
                  title='Delete file'
                >
                  <Trash2 className='aucctus-stroke-secondary h-3 w-3' />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default RegularResultView;
