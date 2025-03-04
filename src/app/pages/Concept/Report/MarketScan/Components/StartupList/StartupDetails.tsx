import { Button, Card, Icon, Loading, Text } from '@components';
import { EngagementAction, ISource } from '@libs/api/types';
import React, { useCallback } from 'react';
import InfoSection from '../InfoSection';
import { cn } from '@libs/utils/react';
import { toTitleCase } from '@libs/utils/string';
import { useStartup } from '@hooks/query/company.hook';

// TODO: Handling Loading

const ACTION_ICON_MAPPING: Record<EngagementAction, IconVariant> = {
  acquisition: 'target',
  investment: 'shield-dollar',
  partnership: 'link-03',
  customer: 'user-group',
  supplier: 'building',
};

interface StartupDetailsProps {
  startupUuid: string;
  className?: string;
  onReasoningClick: (
    conclusion: string,
    reasoning: string,
    sources: ISource[],
  ) => React.MouseEventHandler<HTMLButtonElement>;
}

const StartupDetails: React.FC<StartupDetailsProps> = ({
  startupUuid,
  onReasoningClick,
  className = '',
}) => {
  const { startup, isLoading } = useStartup(startupUuid);

  const getEngagementIcon = useCallback((action: EngagementAction) => {
    const engagementIcon = ACTION_ICON_MAPPING[action];
    if (!engagementIcon) {
      return null;
    }

    return <Icon variant={engagementIcon} />;
  }, []);

  const handleEvidenceClick = useCallback(
    (
      content: string | undefined,
      evidence?: { insight: string; sources: ISource[] },
    ) =>
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (evidence) {
          onReasoningClick(
            content || '',
            evidence.insight,
            evidence.sources,
          )(e as React.MouseEvent<HTMLButtonElement>);
        }
      },
    [onReasoningClick],
  );

  if (startup?.status !== 'completed' || isLoading) {
    return (
      <div className={cn('mx-auto max-w-5xl space-y-8', className)}>
        <div className='flex min-h-96 items-center justify-center gap-6 self-stretch text-center align-middle'>
          <section>
            <div
              className={cn(
                'ease aucctus-text-tertiary self-stretch text-center text-sm font-medium opacity-0',
                {
                  'opacity-100 transition-all duration-300': !isLoading,
                  'opacity-0': isLoading,
                },
              )}
            >
              An Agent is currently analyzing {startup?.name}. This may take a
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
    <div className={cn('mx-auto max-w-5xl space-y-8', className)}>
      {/* General Information Section */}
      <section>
        <h2 className='aucctus-text-brand-primary aucctus-text-xs-bold mb-4 h-[15px]  w-[176px]'>
          General Information
        </h2>
        <div className='flex justify-between gap-6'>
          <div className='aucctus-border-primary aucctus-bg-primary flex-1 rounded-lg border p-6'>
            {startup.overview && (
              <InfoSection
                title='Company Overview'
                onClick={handleEvidenceClick(
                  startup.overview,
                  startup.overviewEvidence,
                )}
                content={startup.overview}
              />
            )}
            {startup.headquarters && (
              <InfoSection
                title='Headquarters'
                onClick={handleEvidenceClick(
                  startup.headquarters,
                  startup.headquartersEvidence,
                )}
                content={startup.headquarters}
              />
            )}
            {startup.founded && (
              <InfoSection
                onClick={handleEvidenceClick(
                  startup.founded,
                  startup.foundedEvidence,
                )}
                title='Founded'
                content={startup.founded}
              />
            )}
          </div>

          <div className='flex flex-1 flex-col gap-4'>
            <div className='aucctus-border-primary aucctus-bg-primary flex-1 rounded-lg border p-4'>
              <InfoSection
                title='Value Proposition'
                content={startup.valueProposition}
                onClick={handleEvidenceClick(
                  startup.valueProposition,
                  startup.valuePropositionEvidence,
                )}
              />
            </div>
            <div className='aucctus-border-primary aucctus-bg-primary flex-1 rounded-lg border p-4'>
              <InfoSection
                title='Competitive Advantage'
                content={startup.competitiveAdvantage}
                onClick={handleEvidenceClick(
                  startup.competitiveAdvantage,
                  startup.competitiveAdvantageEvidence,
                )}
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
      {startup.potentialEngagements &&
        startup.potentialEngagements.length > 0 && (
          <section>
            <h2 className='aucctus-text-brand-primary aucctus-text-xs-bold mb-4 h-[15px] w-[176px]'>
              Potential Engagement Tactics
            </h2>

            <div className='grid grid-cols-3 gap-4'>
              {startup.potentialEngagements.map((engagement, index) => (
                <div
                  key={index}
                  className='aucctus-border-primary aucctus-bg-primary rounded-lg border p-4'
                >
                  <div className='flex flex-row items-center gap-2'>
                    <h3 className='aucctus-text-sm-medium aucctus-text-primary'>
                      {toTitleCase(engagement.action)}
                    </h3>
                    <span className='aucctus-text-brand-primary'>
                      {getEngagementIcon(engagement.action)}
                    </span>
                  </div>
                  <p className='aucctus-text-tertiary aucctus-text-sm mt-4 break-words'>
                    {engagement.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Key Facts & Contacts */}

      <section>
        <div className='flex flex-row gap-6'>
          {(startup.keyFacts || []).length > 0 && (
            <div className='flex max-w-[400px] flex-col gap-4'>
              <h3 className='aucctus-text-brand-primary aucctus-text-xs-bold mb-1'>
                Key Facts
              </h3>
              <ul className='space-y-4'>
                {(startup.keyFacts || []).map((fact, index) => (
                  <li
                    key={index}
                    className='aucctus-border-secondary aucctus-bg-primary flex-1 rounded-lg border p-2'
                  >
                    <div className='flex items-center justify-between'>
                      <Text.Collapsible
                        title=''
                        titleClassName='hidden'
                        description={fact.text.trim()}
                        descriptionClassName='aucctus-text-primary aucctus-text-sm !text-[12px]'
                        maxDescriptionHeight={60}
                        truncationClassName='line-clamp-4'
                      />
                      <Button
                        color='grey'
                        noBorder
                        size='xs'
                        onClick={handleEvidenceClick(fact.text, fact.evidence)}
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
              <h3 className='aucctus-text-brand-primary aucctus-text-xs-bold mb-1'>
                Key Contacts
              </h3>
              <ul className='space-y-4'>
                {startup.keyContacts.map((contact, index) => (
                  <li
                    className='aucctus-border-secondary aucctus-bg-primary flex items-center justify-between gap-6 rounded-lg border p-4'
                    key={index}
                  >
                    <div className='flex flex-col pr-6'>
                      <span className='aucctus-text-brand-secondary aucctus-text-sm-bold'>
                        {contact.name}
                      </span>
                      <span className='aucctus-text-brand-tertiary aucctus-text-sm'>
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
                          className='fill-primary-100 stroke-primary-100'
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
