import React from 'react';
import { Icon } from '@components';
import { ICostDriverV2 } from '@libs/api/types/concept/financialProjectionV2';

interface CostDriversSectionProps {
  costDrivers?: ICostDriverV2[];
}

const CostDriversSection: React.FC<CostDriversSectionProps> = ({
  costDrivers,
}) => {
  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-6 shadow-sm'>
      <div className='mb-4 space-y-1'>
        <h3 className='aucctus-text-lg-medium aucctus-text-tertiary mb-4'>
          Key Cost Categories
        </h3>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {costDrivers?.map((cost, index) => (
          <div
            key={index}
            className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary rounded-lg border p-4'
          >
            <div className='mb-3 flex items-center justify-between'>
              <div>
                <h4 className='aucctus-text-sm-medium aucctus-text-primary'>
                  {cost.title}
                </h4>
                <p className='aucctus-text-xs aucctus-text-tertiary'>
                  {cost.description}
                </p>
              </div>
              <div className='aucctus-bg-brand-primary-alt rounded-md px-2 py-1'>
                <span className='aucctus-text-xs aucctus-text-brand-primary'>
                  {cost.costPercentageEstimate}%
                </span>
              </div>
            </div>

            <div className='aucctus-border-secondary mt-2 border-t pt-2'>
              <div className='flex items-start gap-2'>
                <Icon
                  variant='lightbulb'
                  className='aucctus-stroke-quaternary mt-0.5 h-5 w-5 flex-shrink-0'
                />
                <p className='aucctus-text-xs aucctus-text-tertiary'>
                  {cost.mitigationStatement}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostDriversSection;
