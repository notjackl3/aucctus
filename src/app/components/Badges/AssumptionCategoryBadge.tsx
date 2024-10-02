import { Icon } from '@components';
import { AssumptionCategory } from '@libs/api/types';
import { FunctionComponent } from 'react';

export interface IConceptAssumptionBadgeProps {
  category: AssumptionCategory;
}

const AssumptionCategoryBadge: FunctionComponent<
  IConceptAssumptionBadgeProps
> = ({ category }) => {
  return (
    <div className={`flex items-center gap-2`}>
      <Icon.AssumptionCategory category={category} />
      <span className='whitespace-nowrap text-center text-base capitalize text-slate-600'>
        {category}
      </span>
    </div>
  );
};

export default AssumptionCategoryBadge;
