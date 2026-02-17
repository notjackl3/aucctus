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
        <div data-section-id='business_model'>
          <BusinessModelCard
            businessModelData={financialProjection?.businessModel}
          />
        </div>
        <div data-section-id='pricing'>
          <PricingStrategyCard
            pricingData={financialProjection?.pricingModel}
          />
        </div>
      </div>

      <div data-section-id='distribution_channels'>
        <DistributionChannelsSection
          distributionChannels={financialProjection?.distributionChannels}
        />
      </div>
      <div data-section-id='cost_drivers'>
        <CostDriversSection costDrivers={financialProjection?.costDrivers} />
      </div>
    </div>
  );
};

export default BusinessModelTab;
