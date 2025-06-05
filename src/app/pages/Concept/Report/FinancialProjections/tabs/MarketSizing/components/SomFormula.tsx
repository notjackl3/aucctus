import React, { useMemo } from 'react';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types';
import { calculateMarketMetrics, formatCurrency } from '../assumptionsUtils';

interface SomFormulaProps {
  assumptions: IMarketSizingAssumptionEntryV2[];
}

const SomFormula: React.FC<SomFormulaProps> = ({ assumptions }) => {
  // Calculate market metrics from assumptions
  const marketMetrics = useMemo(() => {
    return calculateMarketMetrics(assumptions);
  }, [assumptions]);

  // Format the SAM value for display
  const samFormatted = formatCurrency(marketMetrics.sam);

  // Format the penetration rate for display
  const penetrationRate = `${(marketMetrics.som / marketMetrics.sam) * 100}%`;

  // Calculate and format the SOM value
  const somFormatted = formatCurrency(marketMetrics.som);

  return (
    <div className='aucctus-bg-primary min-w-[240px] max-w-[300px] rounded-md p-3 shadow-md'>
      <h4 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
        SOM
      </h4>
      <div className='aucctus-text-sm aucctus-text-secondary mb-2'>
        <div className='mb-2 flex items-center justify-center gap-2'>
          <span className='font-medium'>SOM</span>
          <span>=</span>
          <span>SAM</span>
          <span>×</span>
          <span>Penetration Rate</span>
        </div>

        <div className='aucctus-text-tertiary flex items-center justify-center gap-2'>
          <span className='aucctus-text-brand-primary font-medium'>
            {somFormatted}
          </span>
          <span>=</span>
          <span>{samFormatted}</span>
          <span>×</span>
          <span>{penetrationRate}</span>
        </div>
      </div>
      <p className='aucctus-text-xs aucctus-text-tertiary text-center'>
        Serviceable Obtainable Market (SOM) is the portion of SAM that you can
        realistically capture based on your business constraints, competition,
        and resources.
      </p>
    </div>
  );
};

export default SomFormula;
