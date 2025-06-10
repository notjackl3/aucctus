import React, { useMemo } from 'react';
import BottomUpCalculator from './BottomUpCalculator';
import useStore from '@stores/store';

interface ImpactSizingTabProps {}

const ImpactSizingTab: React.FC<ImpactSizingTabProps> = () => {
  const activeFinancialProjection = useStore(
    (state) => state.financialProjection.activeFinancialProjection,
  );

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
      <div className='aucctus-bg-primary aucctus-border-primary h-full overflow-hidden rounded-lg border'>
        <div className='h-full overflow-auto p-0'>
          <div className='p-6'>
            {impactSizing && <BottomUpCalculator impactSizing={impactSizing} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactSizingTab;
