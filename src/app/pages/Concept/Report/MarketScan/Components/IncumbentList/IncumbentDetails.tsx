import { Icon } from '@components';
import { IIncumbent, ISource } from '@libs/api/types';
import React from 'react';
import InfoSection from '../InfoSection';

interface IncumbentDetailsProps {
  incumbent: IIncumbent;
  onReasoningClick: (
    conclusion: string,
    reasoning: string,
    sources: ISource[],
  ) => React.MouseEventHandler<HTMLButtonElement>;
}

const IncumbentDetails: React.FC<IncumbentDetailsProps> = ({
  incumbent,
  onReasoningClick,
}) => {
  return (
    <div className='mx-auto max-w-5xl space-y-4'>
      {/* General Information Section */}
      <section>
        <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
          General Information
        </h2>
        <div className='flex justify-between gap-6'>
          <div className='flex-1 rounded-lg border border-gray-200 bg-white p-6'>
            {/* TODO: Change overview to Relevant Product */}
            <InfoSection
              title='Company Overview'
              content={incumbent.overview}
              contentClassName='text-[14px] font-semibold'
              iconVariant='link-source'
              onClick={
                incumbent.overviewEvidence
                  ? onReasoningClick(
                      incumbent.overview,
                      incumbent.overviewEvidence.insight,
                      incumbent.overviewEvidence.sources,
                    )
                  : undefined
              }
            />
            <InfoSection
              title='Headquarters'
              content={incumbent.headquarters}
              iconVariant='link-source'
              onClick={() =>
                incumbent.headquartersEvidence
                  ? onReasoningClick(
                      incumbent.headquarters,
                      incumbent.headquartersEvidence.insight,
                      incumbent.headquartersEvidence.sources,
                    )
                  : undefined
              }
            />
            <InfoSection
              title='Established'
              content={incumbent.founded}
              iconVariant='link-source'
              onClick={() =>
                incumbent.foundedEvidence
                  ? onReasoningClick(
                      incumbent.founded,
                      incumbent.foundedEvidence.insight,
                      incumbent.foundedEvidence.sources,
                    )
                  : undefined
              }
            />
          </div>
        </div>
      </section>

      {/* Recommended Action Section */}
      <section>
        <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
          Recommended Action
        </h2>
        <div className='rounded-lg border-2 border-[#0C111D] bg-[#FFF] p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <Icon variant='eye' height={20} width={20} stroke='#0C111D' />
            <h3 className="font-['Inter'] text-[12px] font-medium leading-[20px] text-[#0C111D]">
              Monitor
            </h3>
          </div>
          <p className="font-['Inter'] text-[12px] font-normal leading-[18px] text-[#0C111D]">
            {incumbent.recommendedAction}
          </p>
        </div>
      </section>

      {/* Additional Sections (e.g., Recent Activity, Support) */}
      {/* Uncomment and implement as needed */}
      {/*
      <section>
        <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
          Recent Activity
        </h2>
        <div className='space-y-4'>
          {incumbent.recentActivity?.map((activity, index) => (
            <div key={index} className='rounded-lg border border-gray-200 bg-white p-4'>
              <div className='flex items-center justify-between'>
                <h3 className="font-['Inter'] text-[12px] font-normal leading-[18px] text-gray-950">
                  {activity.activity}
                </h3>
                <IconBox
                  variant='link-source'
                  onClick={() => window.open(activity.source, '_blank')}
                  {...iconDefaultProps}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      */}
    </div>
  );
};

export default IncumbentDetails;
