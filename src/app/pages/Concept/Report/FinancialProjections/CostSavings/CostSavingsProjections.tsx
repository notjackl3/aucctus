import React, { useEffect } from 'react';
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
  const activeTab = searchParams.get('tab') || 'savings-method';
  const { executiveSummaries, isLoading: isExecutiveSummariesLoading } =
    useConceptExecutiveSummaries(activeConceptUuid || '');

  useEffect(() => {
    if (financialProjection) {
      setActiveFinancialProjection(financialProjection);
    }
  }, [financialProjection, setActiveFinancialProjection]);

  const renderContent = () => {
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
  };

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <ExecutiveSummaryBanner
        summary={executiveSummaries?.financialMarketSizeCostSavings}
        isLoading={isExecutiveSummariesLoading}
      />
      {renderContent()}
    </div>
  );
};

export default CostSavingsProjections;
