import React from 'react';
import { Icon } from '@components';
import { ICostDriverV2 } from '@libs/api/types/concept/financialProjectionV2';

interface CostDriver {
  name: string;
  percentage: number;
  description: string;
  mitigation: string;
}

interface CostDriversSectionProps {
  costDrivers?: ICostDriverV2[];
}

const defaultCostDrivers: CostDriver[] = [
  {
    name: 'Ingredients & Raw Materials',
    percentage: 42,
    description: 'Dairy products and packaging materials',
    mitigation:
      'Consider forward contracts with suppliers to lock in prices and invest in packaging optimization to reduce material usage.',
  },
  {
    name: 'Manufacturing',
    percentage: 25,
    description: 'Production line operations and processing',
    mitigation:
      'Focus on lean manufacturing principles and consider automation for repetitive tasks to increase production efficiency.',
  },
  {
    name: 'Distribution & Logistics',
    percentage: 18,
    description: 'Transportation and warehousing',
    mitigation:
      'Optimize transportation routes and consider consolidating shipments when possible to reduce logistics costs.',
  },
  {
    name: 'Marketing & Sales',
    percentage: 15,
    description: 'Trade promotions and retail partnerships',
    mitigation:
      'Track ROI on marketing spend closely and focus on high-performing channels and retailer relationships.',
  },
];

const CostDriversSection: React.FC<CostDriversSectionProps> = ({
  costDrivers,
}) => {
  // Transform backend data to our format, or use defaults
  const displayCostDrivers: CostDriver[] =
    costDrivers?.map((driver) => ({
      name: driver.title,
      percentage: driver.costPercentageEstimate,
      description: driver.description,
      mitigation: driver.mitigationStatement,
    })) ?? defaultCostDrivers;

  return (
    <div className='aucctus-bg-primary rounded-lg p-6 shadow-md'>
      <div className='mb-4 space-y-1'>
        <h3 className='aucctus-text-lg-medium aucctus-text-tertiary mb-4'>
          Key Cost Categories
        </h3>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {displayCostDrivers.map((cost, index) => (
          <div
            key={index}
            className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary rounded-lg border p-4'
          >
            <div className='mb-3 flex items-center justify-between'>
              <div>
                <h4 className='aucctus-text-sm-medium aucctus-text-primary'>
                  {cost.name}
                </h4>
                <p className='aucctus-text-xs aucctus-text-tertiary'>
                  {cost.description}
                </p>
              </div>
              <div className='aucctus-bg-brand-primary-alt rounded-md px-2 py-1'>
                <span className='aucctus-text-xs aucctus-text-brand-primary'>
                  {cost.percentage}%
                </span>
              </div>
            </div>

            <div className='aucctus-border-tertiary mt-2 border-t pt-2'>
              <div className='flex items-start gap-2'>
                <Icon
                  variant='alert-circle'
                  className='aucctus-stroke-tertiary mt-0.5 h-4 w-4 flex-shrink-0'
                />
                <p className='aucctus-text-xs aucctus-text-tertiary'>
                  {cost.mitigation}
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
