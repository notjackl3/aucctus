import React, { useEffect, useState } from 'react';
import { cn } from '@libs/utils/react';
import { Icon } from '@components';
import useStore from '@stores/store';

import { BusinessModelTab } from './tabs/BusinessModel';
import { MarketSizingTab } from './tabs/MarketSizing';
import { ProjectionsTab } from './tabs/Projections';
import { IFinancialProjectionV2 } from '@libs/api/types/concept/financialProjectionV2';

interface RevenueProjectionsProps {
  financialProjection: IFinancialProjectionV2;
}

const RevenueProjections: React.FC<RevenueProjectionsProps> = ({
  financialProjection,
}) => {
  const { setActiveFinancialProjection } = useStore(
    (state) => state.financialProjection,
  );

  useEffect(() => {
    if (financialProjection) {
      setActiveFinancialProjection(financialProjection);
    }
  }, [financialProjection, setActiveFinancialProjection]);

  const [activeTab, setActiveTab] = useState<string>('business-model');

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='aucctus-border-primary flex flex-row gap-2 px-2'>
        <button
          onClick={() => setActiveTab('business-model')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-t-lg px-4 py-3 transition-colors',
            {
              'aucctus-bg-secondary-hover aucctus-text-tertiary-hover':
                activeTab !== 'business-model',
              'aucctus-text-primary aucctus-bg-primary aucctus-border-primary border-b-2':
                activeTab === 'business-model',
            },
          )}
        >
          <Icon
            variant='building'
            className={cn('h-4 w-4', {
              'aucctus-stroke-primary': activeTab === 'business-model',
              'aucctus-stroke-brand-primary': activeTab !== 'business-model',
            })}
          />
          <span>Business Model</span>
        </button>
        <button
          onClick={() => setActiveTab('market-sizing')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-t-lg px-4 py-3 transition-colors',
            {
              'aucctus-bg-secondary-hover aucctus-text-tertiary-hover':
                activeTab !== 'market-sizing',
              'aucctus-text-primary aucctus-bg-primary aucctus-border-primary border-b-2':
                activeTab === 'market-sizing',
            },
          )}
        >
          <Icon
            variant='currency-dollar'
            className={cn('h-4 w-4', {
              'aucctus-stroke-primary': activeTab === 'market-sizing',
              'aucctus-stroke-brand-primary': activeTab !== 'market-sizing',
            })}
          />
          <span>Market Sizing</span>
        </button>
        <button
          onClick={() => setActiveTab('projections')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-t-lg px-4 py-3 transition-colors',
            {
              'aucctus-bg-secondary-hover aucctus-text-tertiary-hover':
                activeTab !== 'projections',
              'aucctus-text-primary aucctus-bg-primary aucctus-border-primary border-b-2':
                activeTab === 'projections',
            },
          )}
        >
          <Icon
            variant='trendup'
            className={cn('h-4 w-4', {
              'aucctus-stroke-primary': activeTab === 'projections',
              'aucctus-stroke-brand-primary': activeTab !== 'projections',
            })}
          />
          <span>Projections</span>
        </button>
      </div>

      <div>
        {activeTab === 'business-model' && <BusinessModelTab />}

        {activeTab === 'market-sizing' && <MarketSizingTab />}

        {activeTab === 'projections' && <ProjectionsTab />}
      </div>
    </div>
  );
};

export default RevenueProjections;
