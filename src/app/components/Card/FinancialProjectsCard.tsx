import React from 'react';

import { Card, Legend } from '@components';
import { IFinancialProjection } from '../../../libs/api/types';
import MarketChart from '../Charts/MarketChart';
import { LineChart } from 'lucide-react';
interface IFinancialProjectsCardProps {
  projection: IFinancialProjection | undefined;
  onViewClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const FinancialProjectsCard: React.FC<IFinancialProjectsCardProps> = ({
  projection,
  onViewClick,
}) => {
  /**
   * Calculates and returns the market size metrics based on the overview and financial projection data.
   *
   * @returns The market size metrics object containing TAM, SAM, and SOM.
   */

  return (
    <Card.Detail
      title='Financial Projection'
      subtitle='Market size estimate based on initial hypothesis'
      headerClassName='min-h-[92px]'
      contentClassName='h-[360px]'
      cardClassName=''
      footerAction={
        <button
          className='btn btn-light'
          onClick={onViewClick}
          aria-label='View Financial Projection'
        >
          <span>{<LineChart size={16} stroke='#626BA3' />}</span>
          View Projections
        </button>
      }
    >
      <div className='inline-flex h-full w-full flex-col items-center justify-between p-6'>
        {projection ? (
          <>
            <MarketChart
              className={'h-44 w-44'}
              tam={projection.tam}
              sam={projection.sam}
              som={projection.som}
            />

            <Legend.MarketLegend
              tam={projection.tam}
              sam={projection.sam}
              som={projection.som}
            />
          </>
        ) : (
          'No financial projection data available'
        )}
      </div>
    </Card.Detail>
  );
};

export default FinancialProjectsCard;
