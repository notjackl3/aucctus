import React from 'react';
import { Icon, ComponentTooltip } from '@components';
import {
  IPricingV2,
  IPricingConsiderationV2,
} from '@libs/api/types/concept/financialProjectionV2';
import { formatNumber } from '@libs/utils/number';

interface PricingStrategyCardProps {
  pricingData?: IPricingV2;
}

const PricingStrategyCard: React.FC<PricingStrategyCardProps> = ({
  pricingData,
}) => {
  const price = pricingData?.price;
  const unit = (pricingData?.unit ?? 'unit')
    .replace(/per/gi, '/')
    .startsWith('/')
    ? (pricingData?.unit ?? 'unit').replace(/per/gi, '/')
    : `/${(pricingData?.unit ?? 'unit').replace(/per/gi, '/')}`;
  const currency = pricingData?.currency ?? 'USD';
  const reasoning = pricingData?.reasoning;

  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-6 shadow-sm'>
      <h3 className='aucctus-text-sm-medium aucctus-text-tertiary mb-2'>
        Pricing Strategy
      </h3>
      <div className='mb-4 flex items-center gap-1'>
        <span className='aucctus-text-lg-semibold aucctus-text-primary'>
          {currency === 'USD' ? '$' : currency}{' '}
          {price ? formatNumber(price) : ''}
        </span>
        <ComponentTooltip
          tip={
            <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded-lg border p-4 shadow-lg'>
              <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                Pricing Reasoning
              </h5>
              <p className='aucctus-text-xs aucctus-text-secondary leading-relaxed'>
                {reasoning || 'No pricing reasoning provided.'}
              </p>
            </div>
          }
        >
          <Icon
            variant='alert-circle'
            className='aucctus-stroke-tertiary mr-2 h-5 w-5 flex-shrink-0'
          />
        </ComponentTooltip>
        <span className='aucctus-text-secondary'>{unit}</span>
      </div>

      <h4 className='aucctus-text-xs aucctus-text-tertiary mb-2'>
        Additional Considerations
      </h4>
      {pricingData?.additionalConsiderations && (
        <div className='space-y-3'>
          {pricingData.additionalConsiderations.map(
            (consideration: IPricingConsiderationV2, index) => (
              <div
                key={index}
                className='aucctus-border-secondary flex items-center gap-2 rounded-md border p-3'
              >
                <div className='aucctus-bg-secondary aucctus-border-secondary flex items-center justify-center rounded-full border border-opacity-50'>
                  <Icon
                    variant={consideration.icon as any}
                    className='aucctus-stroke-brand-primary h-7 w-7 p-[0.3rem]'
                  />
                </div>
                <span className='aucctus-text-sm aucctus-text-secondary'>
                  {consideration.consideration}
                </span>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default PricingStrategyCard;
