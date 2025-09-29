import React, { useMemo } from 'react';
import { Icon } from '@components';

interface Finding {
  uuid: string;
  learning: string;
  impact: string;
}

interface SummaryOfFindingsProps {
  testDetail?: any; // ITestDetails with aggregated findings
}

const SummaryOfFindings: React.FC<SummaryOfFindingsProps> = ({
  testDetail,
}) => {
  // Extract AI-generated findings from test-level aggregated findings
  const { affirmingFindings, challengingFindings } = useMemo(() => {
    const affirming: Finding[] = testDetail?.affirmingFindings || [];
    const challenging: Finding[] = testDetail?.challengingFindings || [];

    return { affirmingFindings: affirming, challengingFindings: challenging };
  }, [testDetail]);

  // Don't render if no findings
  if (affirmingFindings.length === 0 && challengingFindings.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      {/* Section Header */}
      <div className='flex items-center gap-3'>
        <Icon
          variant='barchart'
          className='aucctus-stroke-brand-primary h-5 w-5 flex-shrink-0'
        />
        <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
          Summary of Findings
        </h4>
      </div>

      {/* Two-column layout */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Affirming Findings (Left Column - Green) */}
        <div className='aucctus-bg-success-subtle aucctus-border-success-subtle rounded-lg border p-6'>
          <div className='mb-4 flex items-center gap-2'>
            <Icon
              variant='check'
              className='aucctus-stroke-success-primary h-5 w-5'
            />
            <h5 className='aucctus-text-md-semibold aucctus-text-success-primary'>
              Affirming Findings
            </h5>
          </div>

          {affirmingFindings.length === 0 ? (
            <p className='aucctus-text-sm aucctus-text-secondary italic'>
              No affirming findings identified yet
            </p>
          ) : (
            <div className='space-y-3'>
              {affirmingFindings.map((finding) => (
                <div key={finding.uuid} className='flex items-start gap-3'>
                  <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500' />
                  <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                    {finding.learning}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Challenging Findings (Right Column - Red) */}
        <div className='aucctus-bg-error-subtle aucctus-border-error-subtle rounded-lg border p-6'>
          <div className='mb-4 flex items-center gap-2'>
            <Icon
              variant='closeX'
              className='aucctus-stroke-error-primary h-5 w-5'
            />
            <h5 className='aucctus-text-md-semibold aucctus-text-error-primary'>
              Challenging Findings
            </h5>
          </div>

          {challengingFindings.length === 0 ? (
            <p className='aucctus-text-sm aucctus-text-secondary italic'>
              No challenging findings identified yet
            </p>
          ) : (
            <div className='space-y-3'>
              {challengingFindings.map((finding) => (
                <div key={finding.uuid} className='flex items-start gap-3'>
                  <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-500' />
                  <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                    {finding.learning}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryOfFindings;
