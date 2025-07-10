import React from 'react';
import { Icon } from '@components';

const RadarLegend: React.FC = () => {
  return (
    <div className='flex max-w-fit items-center gap-3 rounded-md px-3 py-2 backdrop-blur-sm'>
      <div className='aucctus-text-xs flex items-center gap-2'>
        <div
          className='aucctus-border-tertiary h-3 w-16 rounded-full border-2'
          style={{
            background:
              'linear-gradient(to right, #EF4444 0%, #FCD34D 50%, #10B981 100%)',
          }}
        ></div>
        <div className='aucctus-text-xs flex items-center gap-2'>
          <span className='aucctus-text-error-primary aucctus-text-xs-semibold'>
            Headwinds
          </span>
          <Icon
            variant='arrowright'
            className='aucctus-stroke-tertiary h-3 w-3'
          />
          <span className='aucctus-text-success-primary aucctus-text-xs-semibold'>
            Tailwinds
          </span>
        </div>
      </div>
    </div>
  );
};

export default RadarLegend;
