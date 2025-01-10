import { Card } from '@components';
import { ISource, IStartup } from '@libs/api/types';
import React from 'react';

interface StartupDetailsProps {
  startup: IStartup;
  onReasoningClick: (
    conclusion: string,
    reasoning: string,
    sources: ISource[],
  ) => React.MouseEventHandler<HTMLButtonElement>;
}

const StartupDetails: React.FC<StartupDetailsProps> = ({
  startup,
  onReasoningClick,
}) => {
  return (
    <div className='mx-auto max-w-5xl space-y-8'>
      {/* General Information Section */}
      <section>
        <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
          General Information
        </h2>
        <div className='flex justify-between gap-6'>
          <div className='flex-1 rounded-lg border border-gray-200 bg-white p-6'>
            <Card.InfoSection
              title='Company Overview'
              content={startup.overview}
              // If you have the "overviewEvidence" data:
              // onReasoningClick={onReasoningClick(
              //   startup.overview,
              //   startup.overviewEvidence.insight,
              //   startup.overviewEvidence.sources
              // )}
            />
            <Card.InfoSection
              title='Headquarters'
              content={startup.headquarters}
              onReasoningClick={onReasoningClick(
                startup.headquarters,
                startup.headquartersEvidence.insight,
                startup.headquartersEvidence.sources,
              )}
            />
            <Card.InfoSection
              title='Founded'
              content={startup.founded}
              // onReasoningClick={onReasoningClick(
              //   startup.founded,
              //   startup.foundedEvidence.insight,
              //   startup.foundedEvidence.sources
              // )}
            />
          </div>
          <div className='flex flex-1 flex-col gap-4'>
            <div className='flex-1 rounded-lg border border-gray-200 bg-white p-4'>
              <Card.InfoSection
                title='Value Proposition'
                content={startup.valueProposition}
                // onReasoningClick={startup.valuePropositionEvidence &&
                //   onReasoningClick(
                //     startup.valueProposition,
                //     startup.valuePropositionEvidence.insight,
                //     startup.valuePropositionEvidence.sources
                //   )
                // }
              />
            </div>
            <div className='flex-1 rounded-lg border border-gray-200 bg-white p-4'>
              <Card.InfoSection
                title='Competitive Advantage'
                content={startup.competitiveAdvantage}
                // onReasoningClick={onReasoningClick(
                //   startup.competitiveAdvantage,
                //   startup.competitiveAdvantageEvidence.insight,
                //   startup.competitiveAdvantageEvidence.sources
                // )}
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Conclusion / Relevance / Future Predictions */}
      <section className='space-y-4'>
        <Card.AiConclusionBox
          title='Relevance to Concept' /*content={startup.relevance}*/
        />
        <Card.AiConclusionBox
          title='Future Predictions' /*content={startup.futurePredictions}*/
        />
      </section>

      {/* Potential Engagement Tactics */}
      <section>
        <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
          Potential Engagement Tactics
        </h2>
        <div className='grid grid-cols-3 gap-4'>
          {/* {startup.engagementTactics.map((tactic, index) => (...))} */}
        </div>
      </section>

      {/* Key Facts & Contacts */}
      <section>
        <div className='flex flex-row gap-6'>
          <div className='flex max-w-[400px] flex-col gap-4'>
            <h3 className="mb-1 font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
              Key Facts
            </h3>
            <ul className='space-y-4'>
              {/* {startup.keyFacts.map((fact, index) => (...))} */}
            </ul>
          </div>
          <div className='flex flex-col gap-4'>
            <h3 className="mb-1 font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
              Key Contacts
            </h3>
            <ul className='space-y-4'>
              {/* {startup.keyContacts.map((contact, index) => (...))} */}
            </ul>
          </div>
        </div>
      </section>

      {/* Support Section */}
      {/* <section> ... </section> */}
    </div>
  );
};

export default StartupDetails;
