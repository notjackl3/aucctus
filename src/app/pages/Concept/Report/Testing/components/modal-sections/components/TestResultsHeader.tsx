import React from 'react';
import { TestResultsHeaderProps } from '../TestResults.types';
import { Download, Trash2 } from 'lucide-react';

const TestResultsHeader: React.FC<TestResultsHeaderProps> = ({
  resultsCount,
  hasResults,
  hasSyntheticResults,
  canDelete,
  onDownloadResults,
  onDeleteAll,
  isDownloading,
  isDeletingAll,
}) => {
  if (!hasResults) return null;

  return (
    <div className='flex items-center justify-between'>
      <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
        Test Results ({resultsCount} results)
      </h4>
      <div className='flex items-center gap-2'>
        {/* Download Button for Synthetic Results */}
        {hasSyntheticResults && (
          <button
            className='btn btn-light btn-sm flex items-center gap-2'
            onClick={onDownloadResults}
            disabled={isDownloading}
          >
            <Download className='aucctus-stroke-secondary h-4 w-4' />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        )}
        {canDelete && resultsCount > 0 && (
          <button
            className='btn btn-danger btn-sm flex items-center gap-2'
            onClick={onDeleteAll}
            disabled={isDeletingAll}
          >
            <Trash2 className='aucctus-stroke-white h-4 w-4' />
            {isDeletingAll ? 'Deleting...' : 'Delete All Results'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TestResultsHeader;
