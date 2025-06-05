import React, { forwardRef, useMemo } from 'react';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types';
import { calculateMarketMetrics } from './assumptionsUtils';
import MarketSizeSquare from './components/MarketSizeSquare';
import TamFormula from './components/TamFormula';
import SamFormula from './components/SamFormula';
import SomFormula from './components/SomFormula';

interface MarketSizeVisualizationProps {
  className?: string;
  activeFilter?: 'tam' | 'sam' | 'som';
  handleFilterToggle: (filter: 'tam' | 'sam' | 'som') => void;
  assumptions: IMarketSizingAssumptionEntryV2[];
}

const MarketSizeVisualization = forwardRef<
  HTMLDivElement,
  MarketSizeVisualizationProps
>(({ className, activeFilter, handleFilterToggle, assumptions }, ref) => {
  // Calculate market metrics directly from assumptions
  const marketMetrics = useMemo(() => {
    return calculateMarketMetrics(assumptions);
  }, [assumptions]);

  // Calculate percentage values for display
  const samPercentage = marketMetrics.tam
    ? (marketMetrics.sam / marketMetrics.tam) * 100
    : 0;
  const somPercentage = marketMetrics.sam
    ? (marketMetrics.som / marketMetrics.sam) * 100
    : 0;

  return (
    <div className={className} ref={ref}>
      <div>
        <h3 className='aucctus-text-xl-semibold aucctus-text-primary mb-1'>
          Market Size Visualization
        </h3>
        <p className='aucctus-text-xs aucctus-text-secondary mb-4'>
          Click on any area to filter related assumptions
        </p>
      </div>

      <div className='aucctus-bg-primary relative aspect-square w-full overflow-hidden rounded-lg'>
        {/* TAM - Largest square */}
        <MarketSizeSquare
          type='tam'
          value={marketMetrics.tam}
          activeFilter={activeFilter}
          handleFilterToggle={handleFilterToggle}
          tooltipContent={
            <TamFormula
              assumptions={assumptions}
              marketMetrics={marketMetrics}
            />
          }
        />

        {/* SAM - Medium square */}
        <MarketSizeSquare
          type='sam'
          value={marketMetrics.sam}
          activeFilter={activeFilter}
          handleFilterToggle={handleFilterToggle}
          percentage={samPercentage}
          parentType='TAM'
          tooltipContent={
            <SamFormula
              assumptions={assumptions}
              marketMetrics={marketMetrics}
            />
          }
        />

        {/* SOM - Smallest square */}
        <MarketSizeSquare
          type='som'
          value={marketMetrics.som}
          activeFilter={activeFilter}
          handleFilterToggle={handleFilterToggle}
          percentage={somPercentage}
          parentType='SAM'
          tooltipContent={<SomFormula assumptions={assumptions} />}
        />
      </div>
    </div>
  );
});

MarketSizeVisualization.displayName = 'MarketSizeVisualization';

export default MarketSizeVisualization;
