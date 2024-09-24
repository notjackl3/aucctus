import { Badge, Card, Icon } from '@components';
import { IAssumption } from '@libs/api/types';
import React from 'react';

interface IKeyAssumptionsCardProps {
  assumptions: IAssumption[] | undefined;
  onViewClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

const KeyAssumptionsCard: React.FC<IKeyAssumptionsCardProps> = ({
  assumptions = [],
  onViewClick,
}) => {
  return (
    <Card.Detail
      title='Key Assumptions'
      subtitle='List of assumptions that require validation'
      headerClassName='min-h-[92px]'
      contentClassName='h-[360px]'
      footerAction={
        <button
          className='btn btn-light'
          onClick={onViewClick}
          aria-label='View Assumptions'
        >
          <span>{<Icon variant='warning' {...iconDefaultProps} />}</span>
          View Key Assumptions
        </button>
      }
    >
      {/* Body */}
      <ul className='inline-flex w-full snap-y snap-mandatory flex-col items-center justify-start overflow-y-auto'>
        {assumptions.map((item, i) => (
          <li
            className='inline-flex w-full snap-center items-center justify-start gap-2 border-b border-slate-200 px-6 py-4 odd:bg-neutral-50'
            key={`assumption-${i + 1}`}
          >
            <div className='flex h-16 items-center'>
              <Badge.RiskLevel
                category={item.riskCategory}
                text={item.riskCategory}
              />
            </div>
            <p className='text-base font-normal text-indigo-900'>{item.name}</p>
          </li>
        ))}
      </ul>
    </Card.Detail>
  );
};

export default KeyAssumptionsCard;
