import React from 'react';
import { Icon } from '@components';

interface ValidationBenchmarkCardProps {
  benchmark: string;
}

const ValidationBenchmarkCard: React.FC<ValidationBenchmarkCardProps> = ({
  benchmark,
}) => {
  return (
    <div className='aucctus-bg-brand-primary aucctus-border-secondary aucctus-border-brand-primary overflow-hidden rounded-md border border-l-4 shadow-sm'>
      <div className='flex items-start gap-2 p-3'>
        <div className='mt-0.5'>
          <div className='aucctus-bg-brand-secondary rounded-full p-1'>
            <Icon
              variant='target'
              className='aucctus-stroke-brand-primary h-3 w-3'
            />
          </div>
        </div>
        <div className='flex-1'>
          <div className='aucctus-text-xs-semibold aucctus-text-brand-primary mb-0.5'>
            VALIDATION BENCHMARK
          </div>
          <div className='aucctus-text-xs-regular aucctus-text-brand-tertiary'>
            {benchmark}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationBenchmarkCard;
