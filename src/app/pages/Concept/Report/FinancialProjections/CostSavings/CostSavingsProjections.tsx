import React, { useEffect, useState } from 'react';
import { cn } from '@libs/utils/react';
import { Icon } from '@components';
import useStore from '@stores/store';

import { SavingsMethodTab } from './tabs/SavingsMethod';
import { ImpactSizingTab } from './tabs/ImpactSizing';
import { ProjectionsTab } from './tabs/Projections';
import { IFinancialProjectionV2 } from '@libs/api/types/concept/financialProjectionV2';

interface CostSavingsProjectionsProps {
  financialProjection: IFinancialProjectionV2;
}

const CostSavingsProjections: React.FC<CostSavingsProjectionsProps> = ({
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

  const [activeTab, setActiveTab] = useState<string>('savings-method');

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <span className='aucctus-text-md aucctus-text-secondary my-4'>
        Build and analyze cost savings models for your business concepts
      </span>

      <div className='flex flex-row gap-2 border-b px-2'>
        <button
          onClick={() => setActiveTab('savings-method')}
          className={cn(
            'aucctus-text-tertiary-hover flex flex-1 items-center justify-center gap-2 rounded-t-md px-4 py-3 transition-colors',
            {
              'aucctus-text-primary aucctus-bg-brand-primary-alt border-b-brand-primary border-b-2':
                activeTab === 'savings-method',
            },
          )}
        >
          <Icon
            variant='piggy-bank'
            className={cn('h-4 w-4', {
              'aucctus-stroke-primary': activeTab === 'savings-method',
              'aucctus-stroke-brand-primary': activeTab !== 'savings-method',
            })}
          />
          <span>Savings Method</span>
        </button>
        <button
          onClick={() => setActiveTab('impact-sizing')}
          className={cn(
            'aucctus-text-tertiary-hover flex flex-1 items-center justify-center gap-2 rounded-t-md px-4 py-3 transition-colors',
            {
              'aucctus-text-primary aucctus-bg-brand-primary-alt border-b-brand-primary border-b-2':
                activeTab === 'impact-sizing',
            },
          )}
        >
          <Icon
            variant='barchart'
            className={cn('h-4 w-4', {
              'aucctus-stroke-primary': activeTab === 'impact-sizing',
              'aucctus-stroke-brand-primary': activeTab !== 'impact-sizing',
            })}
          />
          <span>Impact Sizing</span>
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
        {activeTab === 'savings-method' && <SavingsMethodTab />}

        {activeTab === 'impact-sizing' && <ImpactSizingTab />}

        {activeTab === 'projections' && <ProjectionsTab />}
      </div>
    </div>
  );
};

export default CostSavingsProjections;
