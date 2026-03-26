import React, { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStore from '@stores/store';
import { useFinancialProjectionV2 } from '@hooks/query/financialProjections.hook';
import { ConceptReportSkeletons } from '@components';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';
import FinancialSidebar, {
  COST_SAVINGS_SECTIONS,
  REVENUE_SECTIONS,
} from '@components/ConceptReport/FinancialSidebar';

import RevenueProjections from './GenerateRevenue/RevenueProjections';
import CostSavingsProjections from './CostSavings/CostSavingsProjections';
import { useConceptReportContext } from '../ConceptReport/ConceptReportContext';

const FinancialProjectionsV2: React.FC = () => {
  const { concept } = useConceptReportContext();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Determine effective projection type from explicit type or data heuristic
  const effectiveType = useMemo((): 'revenue' | 'cost_savings' | null => {
    if (concept.financialProjectionType === 'cost_savings')
      return 'cost_savings';
    if (concept.financialProjectionType === 'generate_revenue')
      return 'revenue';
    if (!financialProjectionV2) return null;
    const hasCostSavingsData =
      !!financialProjectionV2.savingMethod ||
      !!financialProjectionV2.savingsModel ||
      financialProjectionV2.impactSizings.length > 0 ||
      financialProjectionV2.costInterferences.length > 0 ||
      financialProjectionV2.targetSavingsAreas.length > 0;
    if (hasCostSavingsData) return 'cost_savings';
    return 'revenue';
  }, [concept.financialProjectionType, financialProjectionV2]);

  const isCostSavingsType = effectiveType === 'cost_savings';
  const sidebarSections = isCostSavingsType
    ? COST_SAVINGS_SECTIONS
    : REVENUE_SECTIONS;
  const defaultTab = isCostSavingsType ? 'savings-method' : 'business-model';
  const activeSection = searchParams.get('tab') || defaultTab;

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
    if (isCostSavingsType) {
      return (
        <CostSavingsProjections financialProjection={financialProjectionV2} />
      );
    }
    return <RevenueProjections financialProjection={financialProjectionV2} />;
  };

  return (
    <div data-section-id='financial_projection' className='flex gap-4'>
      <FinancialSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sections={sidebarSections}
      />
      <div className='min-w-0 flex-1'>{renderProjectionContent()}</div>
    </div>
  );
};

export default FinancialProjectionsV2;
