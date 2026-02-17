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
        <div data-section-id='savings_method'>
          <SavingsMethodCard
            savingMethodData={financialProjection?.savingMethod}
          />
        </div>
        <div data-section-id='savings'>
          <SavingsModelCard savingsData={financialProjection?.savingsModel} />
        </div>
      </div>

      <div data-section-id='target_savings_areas'>
        <TargetSavingsAreasSection
          targetSavingsAreas={financialProjection?.targetSavingsAreas}
        />
      </div>
      <div data-section-id='cost_interferences'>
        <CostInterferencesSection
          costInterferences={financialProjection?.costInterferences}
        />
      </div>
    </div>
  );
};

export default SavingsMethodTab;
