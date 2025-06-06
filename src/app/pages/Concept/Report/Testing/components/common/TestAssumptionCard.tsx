import React from 'react';
import { Icon } from '@components';
import CertaintyMeter from '../../../Assumptions/components/badges/CertaintyMeter';
import ImportanceMeter from '../../../Assumptions/components/badges/ImportanceMeter';
import GenericStatusBadge from '../../../Assumptions/components/shared/GenericStatusBadge';
import { ASSUMPTION_STATUS_CONFIGS } from '../../../Assumptions/constants/statusConfigs';

interface TestAssumptionCardProps {
  category: string;
  statement: string;
  certainty: number;
  importance: number;
  benchmark: string;
}

const TestAssumptionCard: React.FC<TestAssumptionCardProps> = ({
  category,
  statement,
  certainty,
  importance,
  benchmark,
}) => {
  // Helper to get category icon
  const getCategoryIcon = (): React.ReactNode => {
    switch (category.toLowerCase()) {
      case 'desirability':
        return (
          <Icon variant='heart' className='aucctus-stroke-brown-500 h-5 w-5' />
        );
      case 'viability':
        return (
          <Icon
            variant='currency-dollar'
            className='aucctus-stroke-purple-500 h-5 w-5'
          />
        );
      case 'feasibility':
        return (
          <Icon variant='gear' className='aucctus-stroke-blue-500 h-5 w-5' />
        );
      case 'adaptability':
        return (
          <Icon
            variant='refresh'
            className='aucctus-stroke-orange-500 h-5 w-5'
          />
        );
      default:
        return (
          <Icon
            variant='clipboard'
            className='aucctus-stroke-tertiary h-5 w-5'
          />
        );
    }
  };

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-5 shadow-sm'>
      {/* Category and status badges */}
      <div className='mb-3 flex items-start justify-between'>
        <div className='flex items-center'>
          {getCategoryIcon()}
          <span className='aucctus-text-sm-medium ml-2 capitalize'>
            {category}
          </span>
        </div>

        <div className='flex items-center'>
          <GenericStatusBadge config={ASSUMPTION_STATUS_CONFIGS.untested} />
        </div>
      </div>

      {/* Assumption statement */}
      <p className='aucctus-text-md-semibold aucctus-text-primary mb-4'>
        {statement}
      </p>

      {/* Meters */}
      <div className='mt-3 flex flex-wrap gap-2'>
        <CertaintyMeter certainty={certainty} />
        <ImportanceMeter importance={importance} />
      </div>

      {/* Validation Benchmark */}
      <div className='aucctus-bg-brand-section-subtle mt-4 rounded-lg p-3'>
        <div className='flex items-start gap-2'>
          <div className='mt-0.5'>
            <Icon
              variant='target'
              className='aucctus-stroke-brand-primary h-4 w-4'
            />
          </div>
          <div>
            <p className='aucctus-text-xs-semibold aucctus-text-brand-primary mb-0.5'>
              Validation Benchmark
            </p>
            <p className='aucctus-text-sm-regular aucctus-text-brand-secondary'>
              {benchmark}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAssumptionCard;
