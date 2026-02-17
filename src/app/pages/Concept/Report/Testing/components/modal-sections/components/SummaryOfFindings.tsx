import React, { useMemo } from 'react';
import { ChartColumn, TrendingDown, TrendingUp } from 'lucide-react';
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
      <div className='flex items-center gap-2'>
        <ChartColumn className='aucctus-stroke-brand-primary h-5 w-5 flex-shrink-0' />
        <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
          Summary of Findings
        </h4>
      </div>

      {/* Two-column layout */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Affirming Findings (Left Column - Green) */}
        <div className='aucctus-border-secondary rounded-lg border p-4'>
          <div className='mb-4 flex items-center gap-2'>
            <TrendingUp className='aucctus-stroke-success-primary h-5 w-5' />
            <h5 className='aucctus-text-md-semibold aucctus-text-primary'>
              Affirming Findings
            </h5>
          </div>

          {affirmingFindings.length === 0 ? (
            <p className='aucctus-text-sm aucctus-text-secondary italic'>
              No affirming findings identified yet
            </p>
          ) : (
            <div className='space-y-3'>
              {affirmingFindings.map((finding, index) => (
                <div
                  key={`${finding.uuid || 'na'}-${index}`}
                  className='rounded-lg border border-green-200 bg-green-50/30 p-3'
                >
                  <div className='flex items-center gap-2'>
                    <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100'>
                      <span className='text-xs font-semibold text-green-700'>
                        {index + 1}
                      </span>
                    </div>
                    <p className='aucctus-text-sm aucctus-text-primary'>
                      {finding.learning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Challenging Findings (Right Column - Red) */}
        <div className='aucctus-border-secondary rounded-lg border p-4'>
          <div className='mb-4 flex items-center gap-2'>
            <TrendingDown className='aucctus-stroke-error-primary h-5 w-5' />
            <h5 className='aucctus-text-md-semibold aucctus-text-primary'>
              Challenging Findings
            </h5>
          </div>

          {challengingFindings.length === 0 ? (
            <p className='aucctus-text-sm aucctus-text-secondary italic'>
              No challenging findings identified yet
            </p>
          ) : (
            <div className='space-y-3'>
              {challengingFindings.map((finding, index) => (
                <div
                  key={`${finding.uuid || 'na'}-${index}`}
                  className='rounded-lg border border-red-200 bg-red-50/30 p-3'
                >
                  <div className='flex items-center gap-2'>
                    <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100'>
                      <span className='text-xs font-semibold text-red-700'>
                        {index + 1}
                      </span>
                    </div>
                    <p className='aucctus-text-sm aucctus-text-primary'>
                      {finding.learning}
                    </p>
                  </div>
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
