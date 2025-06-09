import React from 'react';
import { Icon } from '@components';
import { ICostInterferenceV2 } from '@libs/api/types/concept/financialProjectionV2';

interface CostInterferencesSectionProps {
  costInterferences?: ICostInterferenceV2[];
}

const CostInterferencesSection: React.FC<CostInterferencesSectionProps> = ({
  costInterferences,
}) => {
  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-6 shadow-sm'>
      <div className='mb-4 space-y-1'>
        <h3 className='aucctus-text-sm-medium aucctus-text-tertiary mb-2'>
          Unintended Consequences
        </h3>
        <span className='flex flex-row items-center gap-1'>
          <Icon
            variant='decreasing'
            className='aucctus-stroke-brand-secondary mr-1 h-5 w-5 flex-shrink-0'
          />
          <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
            Possible Cost Interferences
          </h3>
        </span>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {costInterferences?.map((interference, index) => (
          <div
            key={index}
            className='aucctus-bg-secondary-extra-subtle aucctus-border-primary rounded-lg border p-4'
          >
            <div className='mb-3'>
              <div className='flex flex-row items-center gap-1'>
                <Icon
                  variant={interference.icon as any}
                  className='aucctus-stroke-brand-secondary mr-1 h-5 w-5 flex-shrink-0'
                />
                <div>
                  <h4 className='aucctus-text-sm-medium aucctus-text-primary'>
                    {interference.title}
                  </h4>
                  <p className='aucctus-text-xs aucctus-text-tertiary'>
                    {interference.interferenceInsight}
                  </p>
                </div>
              </div>
            </div>

            <div className='aucctus-border-secondary mt-2 border-t pt-2'>
              <div className='flex items-start gap-2'>
                <Icon
                  variant='lightbulb'
                  className='aucctus-stroke-quaternary mt-0.5 h-5 w-5 flex-shrink-0'
                />
                <p className='aucctus-text-xs aucctus-text-tertiary'>
                  {interference.mitigationStatement}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostInterferencesSection;
