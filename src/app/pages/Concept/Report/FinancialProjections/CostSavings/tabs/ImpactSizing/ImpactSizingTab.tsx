import React, { useMemo } from 'react';
import BottomUpCalculator from './BottomUpCalculator';
import useStore from '@stores/store';
import { useLocation } from 'react-router-dom';

interface ImpactSizingTabProps {}

const ImpactSizingTab: React.FC<ImpactSizingTabProps> = () => {
  const activeFinancialProjection = useStore(
    (state) => state.financialProjection.activeFinancialProjection,
  );
  const location = useLocation();
  const isCostSavingsPage = location.pathname.includes('/cost-savings');

  const impactSizing = useMemo(
    () =>
      activeFinancialProjection?.impactSizings &&
      activeFinancialProjection.impactSizings.length > 0
        ? activeFinancialProjection.impactSizings[0]
        : undefined,
    [activeFinancialProjection],
  );

  return (
    <div className='space-y-6'>
      <div className='aucctus-bg-primary h-full overflow-hidden rounded-lg shadow-md'>
        <div className='h-full overflow-auto p-0'>
          <div className='p-6'>
            {impactSizing && (
              <BottomUpCalculator
                impactSizing={impactSizing}
                isCostSavingsPage={isCostSavingsPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactSizingTab;
