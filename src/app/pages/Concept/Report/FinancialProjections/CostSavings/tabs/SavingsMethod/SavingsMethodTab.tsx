import React from 'react';
import {
  SavingsMethodCard,
  SavingsModelCard,
  TargetSavingsAreasSection,
  CostInterferencesSection,
} from '.';
import useStore from '@stores/store';
interface SavingsMethodTabProps {}

const SavingsMethodTab: React.FC<SavingsMethodTabProps> = () => {
  const financialProjection = useStore(
    (state) => state.financialProjection.activeFinancialProjection,
  );

  return (
    <div className='space-y-6'>
      {/* Savings Method and Savings Model */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <SavingsMethodCard
          savingMethodData={financialProjection?.savingMethod}
        />
        <SavingsModelCard savingsData={financialProjection?.savingsModel} />
      </div>

      <TargetSavingsAreasSection
        targetSavingsAreas={financialProjection?.targetSavingsAreas}
      />
      <CostInterferencesSection
        costInterferences={financialProjection?.costInterferences}
      />
    </div>
  );
};

export default SavingsMethodTab;
