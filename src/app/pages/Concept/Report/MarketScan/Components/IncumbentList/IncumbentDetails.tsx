import { Card, Loading, Text } from '@components';
import { IIncumbent, ISource } from '@libs/api/types';
import React, { useCallback } from 'react';
import InfoSection from '../InfoSection';
import IconBox from './IconBox';

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

interface IncumbentDetailsProps {
  incumbent: IIncumbent;
  onReasoningClick: (
    conclusion: string,
    reasoning: string,
    sources: ISource[],
  ) => void;
}

const IncumbentDetails: React.FC<IncumbentDetailsProps> = ({
  incumbent,
  onReasoningClick,
}) => {
  const handleEvidenceClick = useCallback(
    (
      content: string | undefined,
      evidence?: { insight: string; sources: ISource[] },
    ) =>
      (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (evidence) {
          onReasoningClick(content || '', evidence.insight, evidence.sources);
        }
      },
    [onReasoningClick],
  );

  if (incumbent.status !== 'completed') {
    return (
      <div className='mx-auto max-w-5xl space-y-8'>
        <div className='flex min-h-96 items-center justify-center gap-6 self-stretch text-center align-middle'>
          <section>
            <div className='self-stretch text-center text-sm font-medium text-gray-500'>
              An Agent is currently analyzing {incumbent.name}. This may take a
              moment.
            </div>
            <div className='flex flex-col items-center justify-start gap-3 self-stretch'>
              <Loading />
            </div>
          </section>
        </div>
      </div>
    );
  }

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
            {incumbent.overview && (
              <InfoSection
                title='Company Overview'
                content={incumbent.overview}
                contentClassName='text-[14px] font-semibold'
                iconVariant='link-source'
                onClick={handleEvidenceClick(
                  incumbent.overview,
                  incumbent.overviewEvidence,
                )}
              />
            )}
            {incumbent.headquarters && (
              <InfoSection
                title='Headquarters'
                content={incumbent.headquarters}
                iconVariant='link-source'
                onClick={handleEvidenceClick(
                  incumbent.headquarters,
                  incumbent.headquartersEvidence,
                )}
              />
            )}
            {incumbent.founded && (
              <InfoSection
                title='Established'
                content={incumbent.founded}
                iconVariant='link-source'
                onClick={handleEvidenceClick(
                  incumbent.founded,
                  incumbent.foundedEvidence,
                )}
              />
            )}
          </div>
        </div>
      </section>

      {/* Recommended Action Section */}
      {/* {incumbent.recommendedAction && <section>
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
      </section>} */}

      {/* Additional Sections (e.g., Recent Activity, Support) */}
      <section>
        <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
          Recent Activity
        </h2>
        <div className='space-y-2'>
          {incumbent.newsAndActivities &&
            incumbent.newsAndActivities.length > 0 &&
            incumbent.newsAndActivities.map((activity, idx) => (
              <div
                key={idx}
                className='rounded-lg border border-gray-200 bg-white p-4'
              >
                <div className='flex items-center justify-between'>
                  <Text.Collapsible
                    title=''
                    titleClassName='hidden'
                    description={activity.text.trim()}
                    descriptionClassName="font-['Inter'] text-[12px] font-normal leading-[18px] text-gray-950"
                    maxDescriptionHeight={40}
                    truncationClassName='line-clamp-2'
                  />
                  <IconBox
                    variant='link-source'
                    onClick={handleEvidenceClick(
                      activity.text,
                      activity.evidence,
                    )}
                    {...iconDefaultProps}
                  />
                </div>
              </div>
            ))}
        </div>
      </section>

      {incumbent.relevance && (
        <section className='space-y-4'>
          {incumbent.relevance && (
            <Card.AiConclusionBox
              title='Relevance to Concept'
              content={incumbent.relevance}
            />
          )}
        </section>
      )}
    </div>
  );
};

export default IncumbentDetails;
