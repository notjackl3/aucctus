import React, { useEffect } from 'react';
import useStore from '@stores/store';

import RevenueProjections from './GenerateRevenue/RevenueProjections';
import CostSavingsProjections from './CostSavings/CostSavingsProjections';
import { IFinancialProjectionV2 } from '@libs/api/types/concept/financialProjectionV2';

interface FinancialProjectionsProps {
  financialProjection: IFinancialProjectionV2;
}

const FinancialProjections: React.FC<FinancialProjectionsProps> = ({
  financialProjection,
}) => {
  const { setActiveFinancialProjection } = useStore(
    (state) => state.financialProjection,
  );

  useEffect(() => {
    if (financialProjection) {
      setActiveFinancialProjection(financialProjection);
    }
  }, [financialProjection, setActiveFinancialProjection]);

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

  if (isRevenueProjections(financialProjection)) {
    return <RevenueProjections financialProjection={financialProjection} />;
  } else if (isCostSavings(financialProjection)) {
    return <CostSavingsProjections financialProjection={financialProjection} />;
  }

  return <div>No projections found</div>;
};

export default FinancialProjections;
