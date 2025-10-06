import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@components';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
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

  const topDownTooltip = (
    <div className='aucctus-bg-primary aucctus-border-primary aucctus-text-secondary max-w-sm rounded-lg border p-3 shadow-lg'>
      <p className='aucctus-text-sm'>
        Start with the total market size (TAM) and narrow down to your specific
        opportunity (SAM and SOM). Adjust assumptions to see how they impact
        each market tier.
      </p>
      <p className='aucctus-text-sm-medium mt-2'>
        Click on the market areas to filter relevant assumptions.
      </p>
    </div>
  );

  const bottomUpTooltip = (
    <div className='aucctus-bg-primary aucctus-border-primary aucctus-text-secondary max-w-sm rounded-lg border p-3 shadow-lg'>
      <p className='aucctus-text-sm'>
        Start with key operational metrics like distribution points, units sold,
        and pricing to build your market size from the ground up.
      </p>
    </div>
  );

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
              <ComponentTooltip tip={topDownTooltip} preferredPosition='above'>
                <Icon
                  variant='help-circle'
                  className='aucctus-stroke-tertiary h-4 w-4'
                />
              </ComponentTooltip>
            </button>
            <button
              onClick={() => setActiveView('bottom-up')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 border-l px-4 py-2.5',
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
              <ComponentTooltip tip={bottomUpTooltip} preferredPosition='above'>
                <Icon
                  variant='help-circle'
                  className='aucctus-stroke-tertiary h-4 w-4'
                />
              </ComponentTooltip>
            </button>
          </div>
        )}

        <div className='h-full overflow-auto p-0'>
          <div className='p-6'>
            {!isCostSavingsPage && (
              <div
                style={{
                  display: activeView === 'top-down' ? 'block' : 'none',
                }}
              >
                <SimpleMarketSizeView marketSizing={topDownMarketSizing} />
              </div>
            )}

            {bottomUpMarketSizing && (
              <div
                style={{
                  display:
                    activeView === 'bottom-up' || isCostSavingsPage
                      ? 'block'
                      : 'none',
                }}
              >
                <BottomUpCalculator
                  marketSizing={bottomUpMarketSizing}
                  isCostSavingsPage={isCostSavingsPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSizingTab;
