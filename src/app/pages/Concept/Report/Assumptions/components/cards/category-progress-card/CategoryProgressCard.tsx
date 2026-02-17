import React from 'react';
import { cn } from '@libs/utils/react';
import { CategoryProgressCardProps } from './types';
import StatusBadge from '../../badges/StatusBadge';
import CategoryIcon from './CategoryIcon';
import { getCategoryColors } from '../../../constants/categoryColors';
import { AssumptionStatusV2 } from '@libs/api/types';
import { ComponentTooltip } from '@components';
import { AlertCircle, Check, X } from 'lucide-react';

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
    statusCounts ||
    ({
      validated: 0,
      partiallyValidated: 0,
      invalidated: 0,
      untested: 0,
    } as const);

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
          <h4
            className={cn('aucctus-text-lg-bold', {
              [categoryColors.textSelected]: isSelected,
              'aucctus-text-primary': !isSelected,
            })}
          >
            {title}
          </h4>
        </div>
        <StatusBadge status={getStatus()} />
      </div>

      <p className='aucctus-text-sm aucctus-text-tertiary mb-3'>
        {description}
      </p>

      {/* Status count badges */}
      <div className='flex flex-wrap gap-2'>
        {/* Validated badge with tooltip */}
        <ComponentTooltip
          tip={
            <div className='aucctus-bg-primary aucctus-border-secondary rounded border px-3 py-2 shadow-lg'>
              <p className='aucctus-text-primary aucctus-text-xs'>
                Validated assumptions
              </p>
            </div>
          }
        >
          <div className='flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700'>
            <Check className='h-3 w-3' style={{ stroke: 'rgb(21, 128, 61)' }} />
            {stats.validated}
          </div>
        </ComponentTooltip>

        {/* Invalidated badge with tooltip */}
        <ComponentTooltip
          tip={
            <div className='aucctus-bg-primary aucctus-border-secondary rounded border px-3 py-2 shadow-lg'>
              <p className='aucctus-text-primary aucctus-text-xs'>
                Invalidated assumptions
              </p>
            </div>
          }
        >
          <div className='flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700'>
            <X className='h-3 w-3' style={{ stroke: 'rgb(185, 28, 28)' }} />
            {stats.invalidated}
          </div>
        </ComponentTooltip>

        {/* Combined untested + partially validated badge with tooltip */}
        <ComponentTooltip
          tip={
            <div className='aucctus-bg-primary aucctus-border-secondary rounded border px-3 py-2 shadow-lg'>
              <p className='aucctus-text-primary aucctus-text-xs'>
                Partially validated or untested assumptions
              </p>
            </div>
          }
        >
          <div className='flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700'>
            <AlertCircle
              className='h-3 w-3'
              style={{ stroke: 'rgb(146, 64, 14)' }}
            />
            {stats.partiallyValidated + stats.untested}
          </div>
        </ComponentTooltip>
      </div>
    </div>
  );
};

export default CategoryProgressCard;
