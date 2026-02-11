import React from 'react';
import { Icon } from '@components';
import { useWatchtowerDomains } from '@hooks/query/watchtower.hook';

/**
 * FutureDomainsWidget - AI-suggested strategic domains
 */
const FutureDomainsWidget: React.FC = () => {
  const { domains, isLoading } = useWatchtowerDomains();

  if (isLoading || domains.length === 0) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary flex h-[540px] flex-col items-center justify-center rounded-xl border p-6'>
        <Icon
          variant='compass-03'
          height={32}
          width={32}
          className='aucctus-stroke-tertiary mb-2'
        />
        <p className='aucctus-text-tertiary text-sm'>
          {isLoading ? 'Loading domains...' : 'No future domains available'}
        </p>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-[540px] flex-col rounded-xl border p-6'>
      <div className='mb-4 flex items-center gap-2'>
        <Icon
          variant='compass-03'
          height={20}
          width={20}
          className='aucctus-stroke-secondary'
        />
        <h3 className='aucctus-text-primary aucctus-text-lg-semibold'>
          Future Domains
        </h3>
        <span className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-tertiary flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]'>
          <Icon
            variant='sparkles'
            height={12}
            width={12}
            className='aucctus-stroke-tertiary'
          />
          AI Suggested
        </span>
      </div>
      <p className='aucctus-text-secondary aucctus-text-sm mb-4'>
        Strategic domains that capitalize on current industry signals
      </p>

      <div className='scrollbar-thin scrollbar-thumb-muted flex-1 space-y-3 overflow-y-auto pr-1'>
        {domains.map((domain) => (
          <div
            key={domain.id}
            className='aucctus-bg-primary aucctus-border-secondary hover:aucctus-bg-secondary group cursor-pointer rounded-lg border p-4 transition-colors'
          >
            <div className='mb-2 flex items-start justify-between gap-3'>
              <h4 className='aucctus-text-primary aucctus-text-sm-semibold leading-snug transition-colors group-hover:text-opacity-80'>
                {domain.name}
              </h4>
              <span className='aucctus-text-tertiary flex-shrink-0 text-[10px]'>
                {domain.timeHorizon}
              </span>
            </div>

            <p className='aucctus-text-secondary mb-2 text-xs leading-relaxed'>
              {domain.description}
            </p>

            <p className='aucctus-text-secondary mb-3 text-xs leading-relaxed'>
              <span className='aucctus-text-success-primary font-semibold'>
                Opportunity:
              </span>{' '}
              {domain.whyThisMatters}
            </p>

            <div className='flex flex-wrap items-center gap-1.5'>
              {domain.evidenceBasis.map((signal, idx) => (
                <span
                  key={idx}
                  className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-tertiary rounded border px-1.5 py-0.5 text-[10px]'
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(FutureDomainsWidget);
