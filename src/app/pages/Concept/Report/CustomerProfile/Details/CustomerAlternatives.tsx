import React from 'react';
import Badges from '@components/Badges';
import { Icon, Container } from '@components';
import SectionHeader from './components/SectionHeader';
import AiInsight from './components/AiInsight';
import type { ICustomerAlternative, ICustomerProfile } from '@libs/api/types';
import { useCustomerAlternativesList } from '@hooks/query/concepts.hook';

/**
 * Props for CustomerAlternatives component.
 * @param profile Customer profile
 */
export interface CustomerAlternativesProps {
  profile: ICustomerProfile;
}

const MAIN_ICON_STROKE = 'aucctus-stroke-brand-primary';
const CHECK_ICON_STROKE = 'aucctus-stroke-success-primary';
const CLOSE_ICON_STROKE = 'aucctus-stroke-error-primary';

const CustomerAlternatives: React.FC<CustomerAlternativesProps> = ({
  profile,
}) => {
  const { data: alternatives = [] } = useCustomerAlternativesList(profile.uuid);
  const [open, setOpen] = React.useState<string[]>(
    alternatives[0] ? [alternatives[0].name] : [],
  );
  const [insightExpanded, setInsightExpanded] = React.useState(true);

  // Update open state when alternatives data changes
  React.useEffect(() => {
    if (alternatives[0] && !open.length) {
      setOpen([alternatives[0].name]);
    }
  }, [alternatives, open.length]);

  const handleToggle = (name: string) => {
    setOpen((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const topAlt = alternatives[0];

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex min-w-0 flex-1 flex-col rounded-lg border shadow-sm'>
      <SectionHeader
        icon={'clipboard' as any}
        iconClass={MAIN_ICON_STROKE}
        iconBgClass='aucctus-bg-primary aucctus-border-secondary'
        title='Current Alternatives'
      />
      <div className='px-6 pb-0 pt-3'>
        <p className='aucctus-text-secondary aucctus-text-sm mb-4'>
          Products and solutions the customer currently uses instead of our
          offering
        </p>
        <div className='flex flex-col gap-3'>
          {alternatives.map(
            (alternative: ICustomerAlternative, idx: number) => {
              const expanded = open.includes(alternative.name);
              return (
                <div
                  key={alternative.name}
                  className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border px-4 py-2'
                >
                  <button
                    className='flex w-full items-center gap-3 text-left focus:outline-none'
                    aria-expanded={expanded}
                    aria-controls={`alt-panel-${idx}`}
                    onClick={() => handleToggle(alternative.name)}
                  >
                    <span
                      className={`aucctus-bg-secondary-subtle flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full`}
                    >
                      <Icon
                        variant='clipboard'
                        className={MAIN_ICON_STROKE}
                        height={14}
                        width={14}
                      />
                    </span>
                    <div className='min-w-0 flex-1'>
                      <h3 className='aucctus-text-primary aucctus-text-base truncate font-medium'>
                        {alternative.name}
                      </h3>
                      {alternative.usage && (
                        <div className='aucctus-text-tertiary aucctus-text-xs mt-0.5 truncate'>
                          {alternative.usage}
                        </div>
                      )}
                      <div className='mt-1 flex items-center gap-2'>
                        <Badges.Default
                          value={alternative.price}
                          classNameBadge='aucctus-bg-brand-secondary'
                          classNameLabel='aucctus-text-brand-tertiary'
                        />
                      </div>
                    </div>
                    <Icon
                      variant={expanded ? 'chevronup' : 'chevrondown'}
                      className='aucctus-stroke-secondary'
                      height={16}
                      width={16}
                    />
                  </button>
                  <Container.Collapsible open={expanded}>
                    <div id={`alt-panel-${idx}`} className='pb-1 pt-3'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <h4 className='aucctus-text-success-primary aucctus-text-sm-semibold mb-2 flex items-center'>
                            <Icon
                              variant='check'
                              className={`${CHECK_ICON_STROKE} mr-1`}
                              height={16}
                              width={16}
                            />{' '}
                            Pros
                          </h4>
                          <ul className='space-y-1'>
                            {alternative.pros.map((pro: string, i: number) => (
                              <li
                                key={`${pro}-${i}`}
                                className='aucctus-text-primary aucctus-text-sm flex items-start gap-2'
                              >
                                <span className='aucctus-bg-success-secondary mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full'>
                                  <Icon
                                    variant='check'
                                    className={CHECK_ICON_STROKE}
                                    height={12}
                                    width={12}
                                  />
                                </span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className='aucctus-text-error-primary aucctus-text-sm-semibold mb-2 flex items-center'>
                            <Icon
                              variant='closeX'
                              className={`${CLOSE_ICON_STROKE} mr-1`}
                              height={16}
                              width={16}
                            />{' '}
                            Cons
                          </h4>
                          <ul className='space-y-1'>
                            {alternative.cons.map((con: string, i: number) => (
                              <li
                                key={`${con}-${i}`}
                                className='aucctus-text-primary aucctus-text-sm flex items-start gap-2'
                              >
                                <span className='aucctus-bg-error-secondary mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full'>
                                  <Icon
                                    variant='closeX'
                                    className={CLOSE_ICON_STROKE}
                                    height={12}
                                    width={12}
                                  />
                                </span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Container.Collapsible>
                </div>
              );
            },
          )}
        </div>
        {topAlt && (
          <AiInsight
            topJob={{
              uuid:
                topAlt.uuid ||
                `alt-${topAlt.name.replace(/\s+/g, '-').toLowerCase()}`,
              description: topAlt.name,
              order: 10,
              icon: 'clipboard',
            }}
            insightExpanded={insightExpanded}
            setInsightExpanded={setInsightExpanded}
            textColorClass='aucctus-text-brand-primary'
            iconStrokeClass='aucctus-stroke-brand-primary'
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(CustomerAlternatives);
