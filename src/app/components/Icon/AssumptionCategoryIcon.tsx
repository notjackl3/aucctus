import { AssumptionCategory } from '@libs/api/types';
import { ASSUMPTION_CATEGORY_MAP } from '@libs/utils/assumptions';
import { cn } from '@libs/utils/react';
import React from 'react';
import Icon from './Icon/Icon';

interface AssumptionCategoryIconProps {
  category: AssumptionCategory;
}

const defaultIconProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};

const AssumptionCategoryIcon: React.FC<AssumptionCategoryIconProps> = ({
  category,
}) => {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-[50%] align-middle',
        ASSUMPTION_CATEGORY_MAP[category].style,
      )}
    >
      <Icon
        variant={ASSUMPTION_CATEGORY_MAP[category].icon}
        {...defaultIconProps}
      />
    </span>
  );
};

export default AssumptionCategoryIcon;
