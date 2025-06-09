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
      <div className='aucctus-border-primary flex flex-row gap-2 px-2'>
        <button
          onClick={() => setActiveTab('savings-method')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-t-lg px-4 py-3 transition-colors',
            {
              'aucctus-bg-secondary-hover aucctus-text-tertiary-hover':
                activeTab !== 'savings-method',
              'aucctus-text-primary aucctus-bg-primary aucctus-border-primary border-b-2':
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
            'flex flex-1 items-center justify-center gap-2 rounded-t-lg px-4 py-3 transition-colors',
            {
              'aucctus-bg-secondary-hover aucctus-text-tertiary-hover':
                activeTab !== 'impact-sizing',
              'aucctus-text-primary aucctus-bg-primary aucctus-border-primary border-b-2':
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
        {activeTab === 'savings-method' && <SavingsMethodTab />}

        {activeTab === 'impact-sizing' && <ImpactSizingTab />}

        {activeTab === 'projections' && <ProjectionsTab />}
      </div>
    </div>
  );
};

export default CostSavingsProjections;
