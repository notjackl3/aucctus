import React from 'react';
import { FileDropzone } from '@components';
import { TestResultsUploadZoneProps } from '../TestResults.types';

const TestResultsUploadZone: React.FC<TestResultsUploadZoneProps> = ({
  hasResults,
  onFilesUpload,
  dropzoneKey,
}) => {
  return (
    <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4'>
      <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
        {hasResults ? 'Add More Test Results' : 'Add Test Results'}
      </h4>
      <p className='aucctus-text-sm-regular aucctus-text-secondary mb-4'>
        {hasResults
          ? 'Upload additional files containing more test results to expand your analysis.'
          : 'Upload multiple files containing your test results. Add descriptive names and optional descriptions to help organize your findings.'}
      </p>

      <FileDropzone key={dropzoneKey} onFilesUpload={onFilesUpload} />
    </div>
  );
};

export default TestResultsUploadZone;
