import { Button, Card, Icon, Loading } from '@components';
import { ISource, IStartup } from '@libs/api/types';
import React from 'react';
import InfoSection from '../InfoSection';

// TODO: Handling Loading

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
  if (startup.status !== 'completed') {
    return (
      <div className='mx-auto max-w-5xl space-y-8'>
        <div className='flex min-h-96 items-center justify-center gap-6 self-stretch text-center align-middle'>
          <section>
            <div className='self-stretch text-center text-sm font-medium text-gray-500'>
              An Agent is currently analyzing {startup.name}. This may take a
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
    <div className='mx-auto max-w-5xl space-y-8'>
      {/* General Information Section */}
      <section>
        <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
          General Information
        </h2>
        <div className='flex justify-between gap-6'>
          <div className='flex-1 rounded-lg border border-gray-200 bg-white p-6'>
            {startup.overview && (
              <InfoSection
                title='Company Overview'
                content={startup.overview}
                contentClassName='text-[14px] font-semibold'
                onClick={
                  startup.overviewEvidence
                    ? onReasoningClick(
                        startup.overview,
                        startup.overviewEvidence.insight,
                        startup.overviewEvidence.sources,
                      )
                    : undefined
                }
              />
            )}
            {startup.headquarters && (
              <InfoSection
                title='Headquarters'
                content={startup.headquarters}
                onClick={
                  startup.headquartersEvidence
                    ? onReasoningClick(
                        startup.headquarters,
                        startup.headquartersEvidence.insight,
                        startup.headquartersEvidence.sources,
                      )
                    : undefined
                }
              />
            )}
            {startup.founded && (
              <InfoSection
                title='Founded'
                content={startup.founded}
                onClick={
                  startup.foundedEvidence
                    ? onReasoningClick(
                        startup.founded,
                        startup.foundedEvidence.insight,
                        startup.foundedEvidence.sources,
                      )
                    : undefined
                }
              />
            )}
          </div>
          <div className='flex flex-1 flex-col gap-4'>
            <div className='flex-1 rounded-lg border border-gray-200 bg-white p-4'>
              <InfoSection
                title='Value Proposition'
                content={startup.valueProposition}
                onClick={
                  startup.valuePropositionEvidence
                    ? onReasoningClick(
                        startup.valueProposition,
                        startup.valuePropositionEvidence.insight,
                        startup.valuePropositionEvidence.sources,
                      )
                    : undefined
                }
              />
            </div>
            <div className='flex-1 rounded-lg border border-gray-200 bg-white p-4'>
              <InfoSection
                title='Competitive Advantage'
                content={startup.competitiveAdvantage}
                onClick={
                  startup.competitiveAdvantageEvidence
                    ? onReasoningClick(
                        startup.competitiveAdvantage,
                        startup.competitiveAdvantageEvidence.insight,
                        startup.competitiveAdvantageEvidence.sources,
                      )
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Conclusion / Relevance / Future Predictions */}
      {(startup.relevance || startup.predictions) && (
        <section className='space-y-4'>
          {startup.relevance && (
            <Card.AiConclusionBox
              title='Relevance to Concept'
              content={startup.relevance}
            />
          )}
          {startup.predictions && (
            <Card.AiConclusionBox
              title='Future Predictions'
              content={startup.predictions}
            />
          )}
        </section>
      )}

      {/* Potential Engagement Tactics */}
      {/* <section>
        <h2 className="mb-4 h-[15px] w-[176px] font-['Inter'] text-[12px] font-bold leading-[15px] text-gray-950">
          Potential Engagement Tactics
        </h2>
        <div className='grid grid-cols-3 gap-4'> */}
      {/* {startup.engagementTactics.map((tactic, index) => (...))} */}
      {/* </div>
      </section> */}

      {/* Key Facts & Contacts */}
      <section>
        <div className='flex flex-row gap-6'>
          {(startup.keyFacts || []).length > 0 && (
            <div className='flex max-w-[400px] flex-col gap-4'>
              <h3 className='mb-1 text-[12px] font-bold leading-[15px] text-gray-950'>
                Key Facts
              </h3>
              <ul className='space-y-4'>
                {(startup.keyFacts || []).map((fact, index) => (
                  <li
                    key={index}
                    className='flex-1 rounded-lg border border-gray-200 bg-white p-2'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className="font-['Inter'] text-[12px] font-normal leading-[18px] text-gray-950">
                        {fact.text}
                      </h3>
                      <Button
                        color='grey'
                        noBorder
                        size='xs'
                        onClick={() =>
                          onReasoningClick(
                            fact.text,
                            fact.evidence.insight,
                            fact.evidence.sources,
                          )
                        }
                      >
                        <Icon variant='link-source' />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {startup.keyContacts.length > 0 ? (
            <div className='flex flex-col gap-4'>
              <h3 className='mb-1 text-[12px] font-bold leading-[15px] text-gray-950'>
                Key Contacts
              </h3>
              <ul className='space-y-4'>
                {startup.keyContacts.map((contact, index) => (
                  <li
                    className='flex items-center justify-between gap-6 rounded-lg border border-gray-200 bg-white p-4'
                    key={`${contact.name}-${index}`}
                  >
                    <div className='flex flex-col pr-6'>
                      <span className='font-semibold text-gray-900'>
                        {contact.name}
                      </span>
                      <span className='text-sm text-gray-600'>
                        {contact.title}
                      </span>
                    </div>

                    {contact.linkedin || contact.email ? (
                      <Button
                        color='primary'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            contact.linkedin
                              ? contact.linkedin
                              : `mailto:${contact.email}`,
                            '_blank',
                          );
                        }}
                      >
                        <Icon
                          variant={contact.linkedin ? 'linkedin' : 'mail'}
                          stroke='#fff'
                          fill='#fff'
                          height={20}
                          width={20}
                        />
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* Support Section */}
      {/* <section> ... </section> */}
    </div>
  );
};

export default StartupDetails;
