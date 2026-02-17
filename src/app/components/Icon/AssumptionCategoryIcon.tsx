import { AssumptionCategory } from '@libs/api/types';
import { ASSUMPTION_CATEGORY_MAP } from '@libs/utils/assumptions';
import { resolveIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import React from 'react';

interface AssumptionCategoryIconProps {
  category: AssumptionCategory;
}

const AssumptionCategoryIcon: React.FC<AssumptionCategoryIconProps> = ({
  category,
}) => {
  const IconComponent = resolveIcon(ASSUMPTION_CATEGORY_MAP[category].icon);
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-[50%] align-middle',
        ASSUMPTION_CATEGORY_MAP[category].style,
      )}
    >
      <IconComponent size={16} stroke='#2B3674' />
    </span>
  );
};

export default AssumptionCategoryIcon;
