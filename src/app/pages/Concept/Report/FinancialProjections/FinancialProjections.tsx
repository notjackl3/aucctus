import React, { useEffect, useState } from 'react';
import { cn } from '@libs/utils/react';
import { Icon } from '@components';
import useStore from '@stores/store';

import { BusinessModelTab } from './tabs/BusinessModel';
import { MarketSizingTab } from './tabs/MarketSizing';
import { ProjectionsTab } from './tabs/Projections';
import { IFinancialProjectionV2 } from '@libs/api/types/concept/financialProjectionV2';

interface FinancialProjectionsProps {
  financialProjection: IFinancialProjectionV2;
}

const FinancialProjections: React.FC<FinancialProjectionsProps> = ({
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
      <span className='aucctus-text-md aucctus-text-secondary my-4'>
        Build and analyze financial models for your business concepts
      </span>

      <div className='flex flex-row gap-2 border-b px-2'>
        <button
          onClick={() => setActiveTab('business-model')}
          className={cn(
            'aucctus-text-tertiary-hover flex flex-1 items-center justify-center gap-2 rounded-t-md px-4 py-3 transition-colors',
            {
              'aucctus-text-primary aucctus-bg-brand-primary-alt border-b-brand-primary border-b-2':
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
            'aucctus-text-tertiary-hover flex flex-1 items-center justify-center gap-2 rounded-t-md px-4 py-3 transition-colors',
            {
              'aucctus-text-primary aucctus-bg-brand-primary-alt border-b-brand-primary border-b-2':
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
            'aucctus-text-tertiary-hover flex flex-1 items-center justify-center gap-2 rounded-t-md px-4 py-3 transition-colors',
            {
              'aucctus-text-primary aucctus-bg-brand-primary-alt border-b-brand-primary border-b-2':
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

export default FinancialProjections;
