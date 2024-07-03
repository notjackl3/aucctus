import React from 'react';
import ConceptDetailCard from '../../Cards/ConceptDetailCard';
import Icon from '../../Icons/Icon/Icon';
import { IAssumption } from '../../../../libs/api/types';
import GeneralBadge from '../../Badges/GeneralBadge/GeneralBadge';

interface IKeyAssumptionsCardProps {
  assumptions: IAssumption[] | undefined;
  onViewClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const iconDefaultProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

const KeyAssumptionsCard: React.FC<IKeyAssumptionsCardProps> = ({ assumptions = [], onViewClick }) => {
  return (
    <ConceptDetailCard
      title='Key Assumptions'
      subtitle='List of assumptions that require validation'
      footerAction={
        <button className='btn btn-light' onClick={onViewClick} aria-label='View Assumptions'>
          <span>{<Icon variant='warning' {...iconDefaultProps} />}</span>
          View Key Assumptions
        </button>
      }
    >
      {/* Body */}
      <ul className='inline-flex h-full w-full snap-y flex-col items-center justify-start'>
        {assumptions.map((item, i) => (
          <li
            className='inline-flex w-full snap-center items-center justify-start border-b border-slate-200 odd:bg-neutral-50'
            key={`assumption-${i + 1}`}
          >
            <div className='flex h-16 items-center px-6 py-4'>
              <GeneralBadge variant={item.riskCategory} badgeText={item.riskCategory} />
            </div>
            <p className='text-base font-normal leading-normal text-indigo-900'>{item.name}</p>
          </li>
        ))}
      </ul>
    </ConceptDetailCard>
  );
};

export default KeyAssumptionsCard;
