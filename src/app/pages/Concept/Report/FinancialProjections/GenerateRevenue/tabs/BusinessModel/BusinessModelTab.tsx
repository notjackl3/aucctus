import React from 'react';
import {
  BusinessModelCard,
  PricingStrategyCard,
  DistributionChannelsSection,
  CostDriversSection,
} from './';
import useStore from '@stores/store';
interface BusinessModelTabProps {}

const BusinessModelTab: React.FC<BusinessModelTabProps> = () => {
  const financialProjection = useStore(
    (state) => state.financialProjection.activeFinancialProjection,
  );

  return (
    <div className='space-y-6'>
      {/* Business Model and Pricing Strategy */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <BusinessModelCard
          businessModelData={financialProjection?.businessModel}
        />
        <PricingStrategyCard pricingData={financialProjection?.pricingModel} />
      </div>

      <DistributionChannelsSection
        distributionChannels={financialProjection?.distributionChannels}
      />
      <CostDriversSection costDrivers={financialProjection?.costDrivers} />
    </div>
  );
};

export default BusinessModelTab;
