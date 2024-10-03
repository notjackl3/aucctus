import { Icon } from '@components';
import { AssumptionCategory } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { FunctionComponent } from 'react';

export interface IConceptAssumptionBadgeProps {
  category: AssumptionCategory;
  textProps?: React.HTMLAttributes<HTMLSpanElement>;
}

const AssumptionCategoryBadge: FunctionComponent<
  IConceptAssumptionBadgeProps
> = ({ category, textProps }) => {
  return (
    <div className={`flex items-center gap-2`}>
      <Icon.AssumptionCategory category={category} />
      <span
        {...textProps}
        className={cn(
          'whitespace-nowrap text-center text-base capitalize text-slate-600',
          textProps?.className,
        )}
      >
        {category}
      </span>
    </div>
  );
};

export default AssumptionCategoryBadge;
