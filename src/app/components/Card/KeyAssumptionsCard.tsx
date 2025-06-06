// TODO: DEPRECATE - This component uses IAssumptionV1 format.
// Remove once all assumption displays migrate to V2 format.

import { Badge, Card, Icon } from '@components';
import { IAssumptionV1 } from '@libs/api/types';
import React from 'react';

interface IKeyAssumptionsCardProps {
  assumptions: IAssumptionV1[] | undefined;
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
            className='aucctus-border-secondary inline-flex w-full snap-center items-center justify-start gap-2 border-b px-6 py-4 odd:bg-primary-10'
            key={`assumption-${i + 1}`}
          >
            <div className='flex h-16 items-center'>
              <Badge.RiskLevel
                category={item.riskCategory}
                text={item.riskCategory}
              />
            </div>
            <p className='aucctus-text-md aucctus-text-brand-primary'>
              {item.name}
            </p>
          </li>
        ))}
      </ul>
    </Card.Detail>
  );
};

export default KeyAssumptionsCard;
