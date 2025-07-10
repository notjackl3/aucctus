import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import useStore from '@stores/store';
import { useFinancialProjectionV2 } from '@hooks/query/financialProjections.hook';
import { Loading } from '@components';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';

import RevenueProjections from './GenerateRevenue/RevenueProjections';
import CostSavingsProjections from './CostSavings/CostSavingsProjections';
import { IFinancialProjectionV2 } from '@libs/api/types/concept/financialProjectionV2';

const FinancialProjectionsV2: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { financialProjectionV2, isLoading } = useFinancialProjectionV2(
    concept.uuid,
  );

  const { setActiveFinancialProjection } = useStore(
    (state) => state.financialProjection,
  );

  useEffect(() => {
    if (financialProjectionV2) {
      setActiveFinancialProjection(financialProjectionV2);
    }
  }, [financialProjectionV2, setActiveFinancialProjection]);

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

  if (isLoading) {
    return (
      <div className='flex h-full w-full flex-col gap-6'>
        <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
          <Loading />
        </div>
      </div>
    );
  }

  if (!financialProjectionV2) {
    return (
      <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
        No financial projection found for this concept.
      </div>
    );
  }

  if (isRevenueProjections(financialProjectionV2)) {
    return <RevenueProjections financialProjection={financialProjectionV2} />;
  } else if (isCostSavings(financialProjectionV2)) {
    return (
      <CostSavingsProjections financialProjection={financialProjectionV2} />
    );
  }

  return <div>No projections found</div>;
};

export default FinancialProjectionsV2;
