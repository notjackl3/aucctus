import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStore from '@stores/store';
import { useFinancialProjectionV2 } from '@hooks/query/financialProjections.hook';
import { ConceptReportSkeletons } from '@components';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';
import { IFinancialProjectionV2 } from '@libs/api/types';
import FinancialSidebar from '@components/ConceptReport/FinancialSidebar';

import RevenueProjections from './GenerateRevenue/RevenueProjections';
import CostSavingsProjections from './CostSavings/CostSavingsProjections';
import { useConceptReportContext } from '../ConceptReport/ConceptReportContext';

const FinancialProjectionsV2: React.FC = () => {
  const { concept } = useConceptReportContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('tab') || 'business-model';

  const { financialProjectionV2, isLoading: isFinancialProjectionLoading } =
    useFinancialProjectionV2(concept.uuid);

  const { isSectionPending, hasBlockingLoad } = useUnifiedLoading({
    currentRoute: AppPath.ConceptFinancialProjection,
    concept,
    additionalLoadingStates: [isFinancialProjectionLoading],
  });
  const shouldShowSkeletons = isSectionPending || hasBlockingLoad;

  const { setActiveFinancialProjection } = useStore(
    (state) => state.financialProjection,
  );

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

  useEffect(() => {
    if (financialProjectionV2) {
      setActiveFinancialProjection(financialProjectionV2);
    }
  }, [financialProjectionV2, setActiveFinancialProjection]);

  const handleSectionChange = useCallback(
    (section: string) => {
      setSearchParams((prev) => {
        prev.set('tab', section);
        return prev;
      });
    },
    [setSearchParams],
  );

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

  const renderProjectionContent = () => {
    if (concept.financialProjectionType === 'generate_revenue') {
      return <RevenueProjections financialProjection={financialProjectionV2} />;
    } else if (concept.financialProjectionType === 'cost_savings') {
      return (
        <CostSavingsProjections financialProjection={financialProjectionV2} />
      );
    } else if (isRevenueProjections(financialProjectionV2)) {
      return <RevenueProjections financialProjection={financialProjectionV2} />;
    } else if (isCostSavings(financialProjectionV2)) {
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

  return (
    <div data-section-id='financial_projection' className='flex gap-4'>
      <FinancialSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <div className='min-w-0 flex-1'>{renderProjectionContent()}</div>
    </div>
  );
};

export default FinancialProjectionsV2;
