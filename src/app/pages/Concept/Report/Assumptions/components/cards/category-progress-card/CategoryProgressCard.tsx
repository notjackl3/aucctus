import React from 'react';
import { cn } from '@libs/utils/react';
import { CategoryProgressCardProps } from './types';
import StatusBadge from '../../badges/StatusBadge';
import ProgressBar from './progress-bar/ProgressBar';
import CategoryIcon from './CategoryIcon';
import { getCategoryColors } from '../../../constants/categoryColors';
import { AssumptionStatusV2 } from '@libs/api/types';

const CategoryProgressCard: React.FC<CategoryProgressCardProps> = ({
  category,
  title,
  description,
  validationPercentage,
  isSelected = false,
  onClick,
  isInvalidated = false,
}) => {
  // Get category colors from centralized source
  const categoryColors = getCategoryColors(category);

  // Determine status based on validation percentage and category
  const getStatus = (): AssumptionStatusV2 => {
    if (isInvalidated) return 'invalidated';

    // Use validation percentage to determine status
    if (validationPercentage >= 70) return 'validated';
    if (validationPercentage >= 30) return 'partially_validated';
    return 'untested';
  };

  return (
    <div
      className={cn(
        'mb-5 cursor-pointer rounded-lg border p-4 transition-colors',
        {
          [`aucctus-bg-secondary border-l-4 ${categoryColors.borderColor}`]:
            isSelected,
          'aucctus-border-tertiary aucctus-bg-primary aucctus-bg-primary-hover':
            !isSelected,
        },
      )}
      onClick={onClick}
    >
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center'>
          <div className='mr-2'>
            <CategoryIcon category={category} />
          </div>
          <h4 className='aucctus-text-md-semibold aucctus-text-primary'>
            {title}
          </h4>
        </div>
        <StatusBadge status={getStatus()} />
      </div>

      <p className='aucctus-text-sm aucctus-text-tertiary mb-3'>
        {description}
      </p>

      <div className='flex items-center gap-4'>
        <div className='flex flex-1 items-center justify-end'>
          <ProgressBar
            category={category}
            percentage={validationPercentage}
            isInvalidated={isInvalidated}
            className='aucctus-border-tertiary h-6 border'
            width={128}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryProgressCard;
