import React from 'react';
import { cn } from '@libs/utils/react';
import { CategoryProgressCardProps } from './types';
import StatusBadge from '../../badges/StatusBadge';
import CategoryIcon from './CategoryIcon';
import { getCategoryColors } from '../../../constants/categoryColors';
import { AssumptionStatusV2 } from '@libs/api/types';
import { Icon } from '@components';

const CategoryProgressCard: React.FC<CategoryProgressCardProps> = ({
  category,
  title,
  description,
  validationStatus,
  isSelected = false,
  onClick,
  isInvalidated = false,
  isLast = false,
  statusCounts,
}) => {
  // Get category colors from centralized source
  const categoryColors = getCategoryColors(category);

  // Use validationStatus directly, with override for invalidated
  const getStatus = (): AssumptionStatusV2 => {
    if (isInvalidated) return 'invalidated';
    return validationStatus;
  };

  const stats =
    statusCounts || ({ validated: 0, invalidated: 0, untested: 0 } as const);

  return (
    <div
      className={cn('cursor-pointer border-r p-4 transition-colors', {
        [`${categoryColors.bgColor} border-l-4 ${categoryColors.borderColor}`]:
          isSelected,
        'aucctus-border-tertiary aucctus-bg-primary aucctus-bg-primary-hover':
          !isSelected,
        'border-b': !isLast,
      })}
      onClick={onClick}
    >
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center'>
          <div className='mr-2'>
            <CategoryIcon category={category} />
          </div>
          <h4 className='aucctus-text-lg-bold aucctus-text-primary'>{title}</h4>
        </div>
        <StatusBadge status={getStatus()} />
      </div>

      <p className='aucctus-text-sm aucctus-text-tertiary mb-3'>
        {description}
      </p>

      {/* Status count badges */}
      <div className='flex flex-wrap gap-2'>
        <div className='flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700'>
          <Icon
            variant='check'
            className='h-3 w-3'
            style={{ stroke: 'rgb(21, 128, 61)' }}
          />
          {stats.validated}
        </div>
        <div className='flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700'>
          <Icon
            variant='closeX'
            className='h-3 w-3'
            style={{ stroke: 'rgb(185, 28, 28)' }}
          />
          {stats.invalidated}
        </div>
        <div className='flex items-center gap-1 rounded border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700'>
          <Icon
            variant='clock'
            className='h-3 w-3'
            style={{ stroke: 'rgb(161, 98, 7)' }}
          />
          {stats.untested}
        </div>
      </div>
    </div>
  );
};

export default CategoryProgressCard;
