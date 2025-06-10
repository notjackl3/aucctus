import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { useLocation } from 'react-router-dom';
import SimpleMarketSizeView from './SimpleMarketSizeView';
import BottomUpCalculator from './BottomUpCalculator';
import useStore from '@stores/store';

interface MarketSizingTabProps {}

const MarketSizingTab: React.FC<MarketSizingTabProps> = () => {
  const [activeView, setActiveView] = useState<'top-down' | 'bottom-up'>(
    'top-down',
  );
  const activeFinancialProjection = useStore(
    (state) => state.financialProjection.activeFinancialProjection,
  );
  const location = useLocation();
  const isCostSavingsPage = location.pathname.includes('/cost-savings');

  const topDownMarketSizing = useMemo(
    () =>
      activeFinancialProjection?.marketSizings.find(
        (marketSizing) => marketSizing.type === 'top_down',
      ),
    [activeFinancialProjection],
  );
  const bottomUpMarketSizing = useMemo(
    () =>
      activeFinancialProjection?.marketSizings.find(
        (marketSizing) => marketSizing.type === 'bottom_up',
      ),
    [activeFinancialProjection],
  );

  // For cost savings page, default to bottom-up and don't allow switching
  useEffect(() => {
    if (isCostSavingsPage) {
      setActiveView('bottom-up');
    }
  }, [isCostSavingsPage]);

  return (
    <div className='space-y-6'>
      <div className='aucctus-bg-primary aucctus-border-primary h-full overflow-hidden rounded-lg border'>
        {/* Only show toggle for regular financial projections, not for cost savings */}
        {!isCostSavingsPage && (
          <div className='aucctus-bg-secondary aucctus-border-primary flex border-b'>
            <button
              onClick={() => setActiveView('top-down')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 border-r px-4 py-2.5',
                activeView === 'top-down'
                  ? 'aucctus-text-brand-primary aucctus-bg-primary aucctus-border-primary border-b-2'
                  : 'aucctus-text-tertiary-hover aucctus-bg-primary-hover',
              )}
            >
              <Icon
                variant='arrowdown'
                className='aucctus-stroke-brand-primary h-4 w-4'
              />
              Top Down
            </button>
            <button
              onClick={() => setActiveView('bottom-up')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 px-4 py-2.5',
                activeView === 'bottom-up'
                  ? 'aucctus-text-brand-primary aucctus-bg-primary aucctus-border-primary border-b-2'
                  : 'aucctus-text-tertiary-hover aucctus-bg-primary-hover',
              )}
            >
              <Icon
                variant='arrowup'
                className='aucctus-stroke-brand-primary h-4 w-4'
              />
              Bottom Up
            </button>
          </div>
        )}

        <div className='h-full overflow-auto p-0'>
          <div className='p-6'>
            {activeView === 'top-down' && !isCostSavingsPage && (
              <SimpleMarketSizeView marketSizing={topDownMarketSizing} />
            )}

            {(activeView === 'bottom-up' || isCostSavingsPage) &&
              bottomUpMarketSizing && (
                <BottomUpCalculator
                  marketSizing={bottomUpMarketSizing}
                  isCostSavingsPage={isCostSavingsPage}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSizingTab;
