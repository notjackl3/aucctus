import { AssumptionCategory } from '@libs/api/types';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import Icon from '../Icon/Icon/Icon';

export interface IConceptAssumptionBadgeProps {
  category: AssumptionCategory;
}

const defaultIconProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

const AssumptionCategoryBadge: FunctionComponent<
  IConceptAssumptionBadgeProps
> = ({ category }) => {
  return (
    <div className={`flex items-center gap-2`}>
      <span
        className={classNames(
          'flex h-8 w-8 items-center justify-center rounded-[50%] align-middle',
          ASSUMPTION_CATEGORY_MAP[category].style,
        )}
      >
        <Icon
          variant={ASSUMPTION_CATEGORY_MAP[category].icon}
          {...defaultIconProps}
        />
      </span>
      <span className='whitespace-nowrap text-center text-base font-semibold capitalize text-gray-600'>
        {category}
      </span>
    </div>
  );
};

const ASSUMPTION_CATEGORY_MAP: Record<
  AssumptionCategory,
  { style: string; icon: IconVariant }
> = {
  desirability: {
    style: 'bg-[#ece9fe] [&>svg>use]:stroke-desirability', //'purple',
    icon: 'heart',
  },
  viability: {
    style: 'bg-[#ccfbef] [&>svg>use]:stroke-viability', //'green',
    icon: 'line-chart-up',
  },

  feasibility: {
    style: 'bg-[#cff9fe] [&>svg>use]:stroke-feasibility', // 'lightBlue',
    icon: 'filecode',
  },
  adaptability: {
    style: 'bg-[#d1e0ff] [&>svg>use]:stroke-adaptability', //'blue',
    icon: 'expand-06',
  },
};

export default AssumptionCategoryBadge;
