import { AssumptionType } from '@libs/api/types';
import { FunctionComponent } from 'react';
import Icon from '../Icon/Icon/Icon';

export interface IConceptAssumptionBadgeProps {
  type: AssumptionType;
}

const defaultIconProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

const AssumptionBadge: FunctionComponent<IConceptAssumptionBadgeProps> = ({
  type,
}) => {
  return (
    <div className={`flex items-center gap-2`}>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-[50%] bg-primary-100 ${ASSUMPTION_TYPE_MAP[type].style}`}
      >
        <Icon variant={ASSUMPTION_TYPE_MAP[type].icon} {...defaultIconProps} />
      </span>
      <span className='whitespace-nowrap text-center text-sm  font-medium capitalize leading-6 text-blue-900'>
        {type}
      </span>
    </div>
  );
};

const ASSUMPTION_TYPE_MAP: Record<
  AssumptionType,
  { style: string; icon: IconVariant }
> = {
  desirability: {
    style: 'bg-[#ece9fe] [&>svg>use]:stroke-desirability', //'purple',
    icon: 'thermometer',
  },
  viability: {
    style: 'bg-[#ccfbef] [&>svg>use]:stroke-viability', //'green',
    icon: 'building',
  },

  feasibility: {
    style: 'bg-[#cff9fe] [&>svg>use]:stroke-feasibility', // 'lightBlue',
    icon: 'filecode',
  },
  adaptability: {
    style: 'bg-[#d1e0ff] [&>svg>use]:stroke-adaptability', //'blue',
    icon: 'line-chart-up',
  },
};

export default AssumptionBadge;
