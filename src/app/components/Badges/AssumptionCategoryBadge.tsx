import { AssumptionCategory } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { FunctionComponent } from 'react';
import AssumptionCategoryIcon from '@components/Icon/AssumptionCategoryIcon';

export interface IConceptAssumptionBadgeProps {
  category: AssumptionCategory;
  textProps?: React.HTMLAttributes<HTMLSpanElement>;
}

const AssumptionCategoryBadge: FunctionComponent<
  IConceptAssumptionBadgeProps
> = ({ category, textProps }) => {
  return (
    <div className={`flex items-center gap-2`}>
      <AssumptionCategoryIcon category={category} />
      <span
        {...textProps}
        className={cn(
          'aucctus-text-tertiary whitespace-nowrap text-center text-base capitalize',
          textProps?.className,
        )}
      >
        {category}
      </span>
    </div>
  );
};

export default AssumptionCategoryBadge;
