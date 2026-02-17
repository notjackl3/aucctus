import React from 'react';
import { Clipboard } from 'lucide-react';
const TestResultsInfoSection: React.FC = () => {
  return (
    <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary rounded-lg border p-4'>
      <div className='flex items-start gap-3'>
        <div className='mt-1'>
          <Clipboard className='aucctus-stroke-brand-primary h-5 w-5' />
        </div>
        <div>
          <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
            Getting Started with Test Results
          </h4>
          <p className='aucctus-text-sm-regular aucctus-text-secondary mb-2'>
            Upload files from your test sessions to validate assumptions and
            improve your concept.
          </p>
          <ul className='aucctus-text-sm-regular aucctus-text-secondary list-disc space-y-1 pl-5'>
            <li>Focus on clear, objective observations</li>
            <li>Include specific numbers or quotes when possible</li>
            <li>Upload multiple test result files in one batch</li>
            <li>Categorize findings to connect them to your assumptions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestResultsInfoSection;
