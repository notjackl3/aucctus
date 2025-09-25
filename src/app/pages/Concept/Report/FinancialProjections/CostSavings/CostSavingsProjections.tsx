import React, { useEffect, useState, useMemo, useCallback } from 'react';
import TabView from '@components/Container/TabView';
import { TabElement } from '@components/Container/TabView/TabView';
import { Icon } from '@components';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import useStore from '@stores/store';
import { useSearchParams } from 'react-router-dom';
import { useConceptExecutiveSummaries } from '@hooks/query/concepts.hook';

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

  const [activeTab, setActiveTab] = useState<string>('savings-method');

  // Handle URL query parameter for tab selection
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (
      tabFromUrl &&
      ['savings-method', 'impact-sizing', 'projections'].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const costSavingsTabs = useMemo(() => {
    return [
      {
        label: (
          <div className='flex items-center gap-2'>
            <Icon
              variant='piggy-bank'
              className='aucctus-stroke-brand-primary h-4 w-4'
            />
            <span>Savings Method</span>
          </div>
        ),
        value: 'savings-method',
      },
      {
        label: (
          <div className='flex items-center gap-2'>
            <Icon
              variant='barchart'
              className='aucctus-stroke-brand-primary h-4 w-4'
            />
            <span>Impact Sizing</span>
          </div>
        ),
        value: 'impact-sizing',
      },
      {
        label: (
          <div className='flex items-center gap-2'>
            <Icon
              variant='trendup'
              className='aucctus-stroke-brand-primary h-4 w-4'
            />
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
    // All cost savings tabs use the same executive summary key
    return executiveSummaries?.financialMarketSizeCostSavings;
  };

  const renderTabContent = () => {
    const summary = getExecutiveSummaryForTab();

    const content = (() => {
      switch (activeTab) {
        case 'savings-method':
          return <SavingsMethodTab />;
        case 'impact-sizing':
          return <ImpactSizingTab />;
        case 'projections':
          return <ProjectionsTab />;
        default:
          return <SavingsMethodTab />;
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
        tabs={costSavingsTabs}
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

export default CostSavingsProjections;
