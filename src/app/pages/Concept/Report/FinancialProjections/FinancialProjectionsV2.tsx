import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import useStore from '@stores/store';
import { useFinancialProjectionV2 } from '@hooks/query/financialProjections.hook';
import { ConceptReportSkeletons } from '@components';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';

import RevenueProjections from './GenerateRevenue/RevenueProjections';
import CostSavingsProjections from './CostSavings/CostSavingsProjections';

const FinancialProjectionsV2: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { financialProjectionV2, isLoading: isFinancialProjectionLoading } =
    useFinancialProjectionV2(concept.uuid);

  // Use unified loading state
  const { isSectionPending, hasBlockingLoad } = useUnifiedLoading({
    currentRoute: AppPath.ConceptFinancialProjection,
    concept,
    additionalLoadingStates: [isFinancialProjectionLoading],
  });
  const shouldShowSkeletons = isSectionPending || hasBlockingLoad;

  const { setActiveFinancialProjection } = useStore(
    (state) => state.financialProjection,
  );

  useEffect(() => {
    if (financialProjectionV2) {
      setActiveFinancialProjection(financialProjectionV2);
    }
  }, [financialProjectionV2, setActiveFinancialProjection]);

  // Show skeleton loading state
  if (shouldShowSkeletons) {
    return <ConceptReportSkeletons.FinancialProjectionSkeleton />;
  }

  if (!financialProjectionV2) {
    return (
      <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
        No financial projection found for this concept.
      </div>
    );
  }

  // Use the financialProjectionType from the concept to determine which view to show
  if (concept.financialProjectionType === 'generate_revenue') {
    return <RevenueProjections financialProjection={financialProjectionV2} />;
  } else if (concept.financialProjectionType === 'cost_savings') {
    return (
      <CostSavingsProjections financialProjection={financialProjectionV2} />
    );
  }

  return <div>No projections found</div>;
};

export default FinancialProjectionsV2;
