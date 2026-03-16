import React, { useEffect } from 'react';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import useStore from '@stores/store';
import { useSearchParams } from 'react-router-dom';
import { useConceptExecutiveSummaries } from '@hooks/query/concepts.hook';

import { BusinessModelTab } from './tabs/BusinessModel';
import { MarketSizingTab } from './tabs/MarketSizing';
import { ProjectionsTab } from './tabs/Projections';
import { IFinancialProjectionV2 } from '@libs/api/types/concept/financialProjectionV2';

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
  const activeTab = searchParams.get('tab') || 'business-model';
  const { executiveSummaries, isLoading: isExecutiveSummariesLoading } =
    useConceptExecutiveSummaries(activeConceptUuid || '');

  useEffect(() => {
    if (financialProjection) {
      setActiveFinancialProjection(financialProjection);
    }
  }, [financialProjection, setActiveFinancialProjection]);

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

  const renderContent = () => {
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
  };

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <ExecutiveSummaryBanner
        summary={getExecutiveSummaryForTab()}
        isLoading={isExecutiveSummariesLoading}
      />
      {renderContent()}
    </div>
  );
};

export default RevenueProjections;
