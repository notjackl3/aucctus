import React, { useEffect, useState, useMemo, useCallback } from 'react';
import TabView from '@components/Container/TabView';
import { TabElement } from '@components/Container/TabView/TabView';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import useStore from '@stores/store';
import { useSearchParams } from 'react-router-dom';
import { useConceptExecutiveSummaries } from '@hooks/query/concepts.hook';

import { BusinessModelTab } from './tabs/BusinessModel';
import { MarketSizingTab } from './tabs/MarketSizing';
import { ProjectionsTab } from './tabs/Projections';
import { IFinancialProjectionV2 } from '@libs/api/types/concept/financialProjectionV2';
import { Building, DollarSign, TrendingUp } from 'lucide-react';

interface RevenueProjectionsProps {
  financialProjection: IFinancialProjectionV2;
}

const RevenueProjections: React.FC<RevenueProjectionsProps> = ({
  financialProjection,
}) => {
  const { setActiveFinancialProjection } = useStore(
    (state) => state.financialProjection,
  );
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const [searchParams] = useSearchParams();
  const { executiveSummaries, isLoading: isExecutiveSummariesLoading } =
    useConceptExecutiveSummaries(activeConceptUuid || '');

  useEffect(() => {
    if (financialProjection) {
      setActiveFinancialProjection(financialProjection);
    }
  }, [financialProjection, setActiveFinancialProjection]);

  const [activeTab, setActiveTab] = useState<string>('business-model');

  // Handle URL query parameter for tab selection
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (
      tabFromUrl &&
      ['business-model', 'market-sizing', 'projections'].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const revenueProjectionTabs = useMemo(() => {
    return [
      {
        label: (
          <div className='flex items-center gap-2'>
            <Building className='aucctus-stroke-brand-primary h-4 w-4' />
            <span>Business Model</span>
          </div>
        ),
        value: 'business-model',
      },
      {
        label: (
          <div className='flex items-center gap-2'>
            <DollarSign className='aucctus-stroke-brand-primary h-4 w-4' />
            <span>Market Sizing</span>
          </div>
        ),
        value: 'market-sizing',
      },
      {
        label: (
          <div className='flex items-center gap-2'>
            <TrendingUp className='aucctus-stroke-brand-primary h-4 w-4' />
            <span>Projections</span>
          </div>
        ),
        value: 'projections',
      },
    ] as TabElement[];
  }, []);

  const onTabSelect = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab],
  );

  const getExecutiveSummaryForTab = () => {
    switch (activeTab) {
      case 'business-model':
        return executiveSummaries?.financialBusinessModel;
      case 'market-sizing':
        return executiveSummaries?.financialMarketSizeRevenue;
      case 'projections':
        return executiveSummaries?.financialMarketSizeRevenue;
      default:
        return executiveSummaries?.financialBusinessModel;
    }
  };

  const renderTabContent = () => {
    const summary = getExecutiveSummaryForTab();

    const content = (() => {
      switch (activeTab) {
        case 'business-model':
          return <BusinessModelTab />;
        case 'market-sizing':
          return <MarketSizingTab />;
        case 'projections':
          return <ProjectionsTab />;
        default:
          return <BusinessModelTab />;
      }
    })();

    return (
      <div className='flex flex-col gap-8 p-4'>
        <ExecutiveSummaryBanner
          summary={summary}
          isLoading={isExecutiveSummariesLoading}
        />
        {content}
      </div>
    );
  };

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <TabView
        tabs={revenueProjectionTabs}
        tabGroupClassName='pointer-events-auto flex flex-1'
        tabContainerClassName='flex flex-1 items-center justify-center'
        tabClassName='flex flex-1 aucctus-bg-primary-hover items-center justify-center'
        className='flex h-full w-full items-start justify-center'
        variant='button'
        onTabSelect={onTabSelect}
        activeTab={activeTab}
      >
        {renderTabContent()}
      </TabView>
    </div>
  );
};

export default RevenueProjections;
