import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import useStore from '@stores/store';
import { useFinancialProjectionV2 } from '@hooks/query/financialProjections.hook';
import { ConceptReportSkeletons } from '@components';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';
import { IFinancialProjectionV2 } from '@libs/api/types';

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

  // Detect if the projection is revenue-based from the data
  const isRevenueProjections = React.useCallback(
    (projection: IFinancialProjectionV2) => {
      return (
        !!projection.businessModel ||
        projection.marketSizings.length > 0 ||
        projection.costDrivers.length > 0 ||
        projection.distributionChannels.length > 0 ||
        !!projection.pricingModel
      );
    },
    [],
  );

  // Detect if the projection is cost savings-based from the data
  const isCostSavings = React.useCallback(
    (projection: IFinancialProjectionV2) => {
      return (
        projection.savingMethod !== undefined ||
        projection.savingsModel !== undefined ||
        projection.impactSizings.length > 0 ||
        projection.costInterferences.length > 0 ||
        projection.targetSavingsAreas.length > 0
      );
    },
    [],
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
  // If that's not available, detect from the financial projection data itself
  if (concept.financialProjectionType === 'generate_revenue') {
    return <RevenueProjections financialProjection={financialProjectionV2} />;
  } else if (concept.financialProjectionType === 'cost_savings') {
    return (
      <CostSavingsProjections financialProjection={financialProjectionV2} />
    );
  } else if (isRevenueProjections(financialProjectionV2)) {
    // Fallback: detect revenue projections from data
    return <RevenueProjections financialProjection={financialProjectionV2} />;
  } else if (isCostSavings(financialProjectionV2)) {
    // Fallback: detect cost savings from data
    return (
      <CostSavingsProjections financialProjection={financialProjectionV2} />
    );
  }

  return (
    <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
      No projections found
    </div>
  );
};

export default FinancialProjectionsV2;
