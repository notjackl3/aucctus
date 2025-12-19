import React, { useMemo } from 'react';
import { Icon } from '@components';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
import { getCategoryIcon } from '../../../../../Assumptions/utils/assumptionUtils';
import { getCategoryColors } from '../../../../../Assumptions/constants/categoryColors';
import { AssumptionCategory } from '@libs/api/types';
import { ITestAssumptionDetailed } from '../../../../types';
import { cn } from '@libs/utils/react';

interface AssumptionValidationCardProps {
  assumption: ITestAssumptionDetailed;
  isUpdating: boolean;
  onValidationChange: (
    assumption: ITestAssumptionDetailed,
    newValidationStatus:
      | 'validated'
      | 'partially_validated'
      | 'invalidated'
      | 'untested',
  ) => void;
}

// 4-bar meter component
const MeterBars: React.FC<{ value: number; color: string }> = ({
  value,
  color,
}) => {
  const getFilledBars = () => {
    if (value >= 3) return 4;
    if (value >= 2) return 3;
    return 2;
  };

  const filledCount = getFilledBars();

  return (
    <div className='flex gap-0.5'>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn('h-3 w-1.5 rounded-sm', {
            [color]: i <= filledCount,
            'bg-gray-200': i > filledCount,
          })}
        />
      ))}
    </div>
  );
};

// Mini meter bars for tooltip display
const MiniMeterBars: React.FC<{ value: number; color: string }> = ({
  value,
  color,
}) => {
  const getFilledBars = () => {
    if (value >= 3) return 4;
    if (value >= 2) return 3;
    return 2;
  };

  const filledCount = getFilledBars();

  return (
    <div className='flex gap-0.5'>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn('h-2.5 w-1 rounded-sm', {
            [color]: i <= filledCount,
            'bg-gray-200': i > filledCount,
          })}
        />
      ))}
    </div>
  );
};

// Helper functions for tooltip colors
const getTooltipBarColor = (
  value: number,
  metricType: 'importance' | 'certainty',
) => {
  if (metricType === 'importance') {
    if (value >= 3) return 'bg-[#DB4D54]';
    if (value >= 2) return 'bg-[#FEC84B]';
    return 'bg-[#17B26A]';
  } else {
    if (value >= 3) return 'bg-[#17B26A]';
    if (value >= 2) return 'bg-[#FEC84B]';
    return 'bg-[#DB4D54]';
  }
};

const getTooltipTextColor = (
  value: number,
  metricType: 'importance' | 'certainty',
) => {
  if (metricType === 'importance') {
    if (value >= 3) return 'text-[#DB4D54]';
    if (value >= 2) return 'text-[#F79009]';
    return 'text-[#17B26A]';
  } else {
    if (value >= 3) return 'text-[#17B26A]';
    if (value >= 2) return 'text-[#F79009]';
    return 'text-[#DB4D54]';
  }
};

// Change indicator badge with tooltip
const ChangeBadge: React.FC<{
  direction: 'up' | 'down';
  beforeValue: number;
  afterValue: number;
  beforeLabel: string;
  afterLabel: string;
  type: 'importance' | 'certainty';
}> = ({
  direction,
  beforeValue,
  afterValue,
  beforeLabel,
  afterLabel,
  type,
}) => {
  const badgeContent =
    direction === 'up' ? (
      <span className='ml-1 inline-flex cursor-help items-center rounded-full bg-green-100 px-1 py-0.5'>
        <Icon variant='trending-up' className='h-3 w-3 stroke-green-700' />
      </span>
    ) : (
      <span className='ml-1 inline-flex cursor-help items-center rounded-full bg-red-100 px-1 py-0.5'>
        <Icon variant='trending-down' className='h-3 w-3 stroke-red-700' />
      </span>
    );

  const tooltipContent = (
    <div className='aucctus-bg-primary aucctus-border-secondary flex items-center gap-3 rounded-lg border p-3 shadow-lg'>
      {/* Before */}
      <div className='flex flex-col items-center gap-1'>
        <span className='aucctus-text-tertiary text-[10px] font-medium uppercase'>
          Before
        </span>
        <div className='flex items-center gap-1.5'>
          <MiniMeterBars
            value={beforeValue}
            color={getTooltipBarColor(beforeValue, type)}
          />
          <span
            className={`text-xs font-medium capitalize ${getTooltipTextColor(beforeValue, type)}`}
          >
            {beforeLabel}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <Icon variant='arrowright' className='aucctus-stroke-tertiary h-4 w-4' />

      {/* After */}
      <div className='flex flex-col items-center gap-1'>
        <span className='aucctus-text-tertiary text-[10px] font-medium uppercase'>
          After
        </span>
        <div className='flex items-center gap-1.5'>
          <MiniMeterBars
            value={afterValue}
            color={getTooltipBarColor(afterValue, type)}
          />
          <span
            className={`text-xs font-medium capitalize ${getTooltipTextColor(afterValue, type)}`}
          >
            {afterLabel}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <ComponentTooltip tip={tooltipContent}>{badgeContent}</ComponentTooltip>
  );
};

const AssumptionValidationCard: React.FC<AssumptionValidationCardProps> = ({
  assumption,
  isUpdating,
  onValidationChange,
}) => {
  const statement = assumption.statement || '';
  const category = assumption.category || '';

  // Derive labels from numeric values (0-1 range)
  const getLabel = (value: number): 'low' | 'medium' | 'high' => {
    if (value >= 0.67) return 'high';
    if (value >= 0.34) return 'medium';
    return 'low';
  };

  // Normalize validation status
  const normalizedStatus: 'validated' | 'invalidated' | 'no-change' = (() => {
    const status = assumption.validationStatus || '';

    const statusMap: Record<string, 'validated' | 'invalidated' | 'no-change'> =
      {
        validated: 'validated',
        invalidated: 'invalidated',
        partially_validated: 'no-change',
        partiallyValidated: 'no-change',
        untested: 'no-change',
      };

    return statusMap[status] || 'no-change';
  })();

  // Get numeric values with fallback
  const importanceNum = assumption.importance ?? 0.5;
  // Backend sends original/baseline certainty - we calculate displayed certainty based on validationStatus
  const originalCertainty = assumption.certainty ?? 0.5;

  // Calculate displayed certainty based on validationStatus
  const displayedCertainty = useMemo(() => {
    if (normalizedStatus === 'validated') {
      return Math.min(originalCertainty + 0.33, 1.0);
    } else if (normalizedStatus === 'invalidated') {
      return Math.max(originalCertainty - 0.33, 0.0);
    }
    // 'no-change' (untested/partially_validated) = original certainty
    return originalCertainty;
  }, [originalCertainty, normalizedStatus]);

  // Convert 0-1 values to 1-3 scale for meter bars
  const importanceValue = Math.ceil(importanceNum * 3);
  const certaintyValue = Math.ceil(displayedCertainty * 3);

  // Calculate original certainty value and label for tooltip
  const originalCertaintyValue = Math.ceil(originalCertainty * 3);
  const originalCertaintyLabel = getLabel(originalCertainty);

  // Derive labels from numeric values
  const importanceLabel = getLabel(importanceNum);
  const certaintyLabel = getLabel(displayedCertainty);

  // Helper to render category icon with proper colors
  const renderCategoryIcon = (category: string): React.ReactNode => {
    const iconVariant = getCategoryIcon(category);
    const categoryColors = getCategoryColors(category as AssumptionCategory);

    return (
      <Icon
        variant={iconVariant as any}
        className={`${categoryColors.stroke} h-5 w-5`}
      />
    );
  };

  // Get meter bar colors
  const getImportanceBarColor = () => {
    if (importanceLabel === 'high') return 'bg-[#DB4D54]';
    if (importanceLabel === 'medium') return 'bg-[#FEC84B]';
    return 'bg-[#17B26A]';
  };

  const getImportanceTextColor = () => {
    if (importanceLabel === 'high') return 'text-[#DB4D54]';
    if (importanceLabel === 'medium') return 'text-[#F79009]';
    return 'text-[#17B26A]';
  };

  const getCertaintyBarColor = () => {
    if (certaintyLabel === 'high') return 'bg-[#17B26A]';
    if (certaintyLabel === 'medium') return 'bg-[#FEC84B]';
    return 'bg-[#DB4D54]';
  };

  const getCertaintyTextColor = () => {
    if (certaintyLabel === 'high') return 'text-[#17B26A]';
    if (certaintyLabel === 'medium') return 'text-[#F79009]';
    return 'text-[#DB4D54]';
  };

  const handleValidationSelect = (
    result: 'validated' | 'invalidated' | 'no-change',
  ) => {
    // Map to backend values
    const statusMap: Record<string, 'validated' | 'invalidated' | 'untested'> =
      {
        validated: 'validated',
        invalidated: 'invalidated',
        'no-change': 'untested',
      };

    onValidationChange(assumption, statusMap[result]);
  };

  const benchmarkText =
    assumption.benchmark ||
    `Validate through customer interviews with at least ${Math.round((assumption.importance || 0.5) * 100)}% positive responses.`;

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-col lg:flex-row'>
        {/* Left side - The Assumption */}
        <div className='flex-1 p-5'>
          {/* Category and meters row */}
          <div className='mb-4 flex flex-wrap items-start justify-between gap-4'>
            <div className='flex items-center gap-2'>
              {renderCategoryIcon(category)}
              <span className='aucctus-text-sm-medium capitalize'>
                {category}
              </span>
            </div>

            {/* Importance and Certainty meters */}
            <div className='flex gap-4 text-xs'>
              <div className='flex items-center gap-1.5'>
                <span className='aucctus-text-tertiary'>Importance</span>
                <MeterBars
                  value={importanceValue}
                  color={getImportanceBarColor()}
                />
                <span
                  className={`font-medium capitalize ${getImportanceTextColor()}`}
                >
                  {importanceLabel}
                </span>
              </div>

              <div className='flex items-center gap-1.5'>
                <span className='aucctus-text-tertiary'>Certainty</span>
                <MeterBars
                  value={certaintyValue}
                  color={getCertaintyBarColor()}
                />
                <span
                  className={`font-medium capitalize ${getCertaintyTextColor()}`}
                >
                  {certaintyLabel}
                </span>
                {normalizedStatus !== 'no-change' &&
                  certaintyLabel !== originalCertaintyLabel && (
                    <ChangeBadge
                      direction={certaintyLabel === 'high' ? 'up' : 'down'}
                      beforeValue={originalCertaintyValue}
                      afterValue={certaintyValue}
                      beforeLabel={originalCertaintyLabel}
                      afterLabel={certaintyLabel}
                      type='certainty'
                    />
                  )}
              </div>
            </div>
          </div>

          {/* Assumption statement */}
          <h3 className='aucctus-text-lg-bold aucctus-text-brand-primary'>
            {statement}
          </h3>
        </div>

        {/* Right side - Validation Benchmark (Threshold) */}
        <div className='flex w-full flex-col justify-center border-l border-[#17B26A]/20 bg-[#ECFDF3] p-4 lg:w-72'>
          <div className='mb-2 flex items-center gap-2'>
            <div className='rounded-full bg-[#DCFAE6] p-1'>
              <Icon variant='target' className='h-3 w-3 stroke-[#17B26A]' />
            </div>
            <span className='text-xs font-medium text-[#079455]'>
              THRESHOLD
            </span>
          </div>
          <div className='text-xs text-[#067647]'>{benchmarkText}</div>
        </div>
      </div>

      {/* Validation Status Section */}
      <div className='aucctus-bg-primary border-t p-4'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <p className='aucctus-text-xs-medium aucctus-text-tertiary uppercase tracking-wide'>
            Validation Status
          </p>
          <div className='flex gap-2'>
            <button
              onClick={() => handleValidationSelect('validated')}
              disabled={isUpdating}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                {
                  'bg-green-600 text-white hover:bg-green-700':
                    normalizedStatus === 'validated',
                  'border border-green-200 text-green-700 hover:bg-green-50':
                    normalizedStatus !== 'validated',
                  'cursor-not-allowed opacity-50': isUpdating,
                },
              )}
            >
              <Icon
                variant='check'
                className={cn('h-3.5 w-3.5', {
                  'stroke-white': normalizedStatus === 'validated',
                  'stroke-green-700': normalizedStatus !== 'validated',
                })}
              />
              Validated
            </button>

            <button
              onClick={() => handleValidationSelect('invalidated')}
              disabled={isUpdating}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                {
                  'bg-red-600 text-white hover:bg-red-700':
                    normalizedStatus === 'invalidated',
                  'border border-red-200 text-red-700 hover:bg-red-50':
                    normalizedStatus !== 'invalidated',
                  'cursor-not-allowed opacity-50': isUpdating,
                },
              )}
            >
              <Icon
                variant='closeX'
                className={cn('h-3.5 w-3.5', {
                  'stroke-white': normalizedStatus === 'invalidated',
                  'stroke-red-700': normalizedStatus !== 'invalidated',
                })}
              />
              Invalidated
            </button>

            <button
              onClick={() => handleValidationSelect('no-change')}
              disabled={isUpdating}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                {
                  'bg-gray-600 text-white hover:bg-gray-700':
                    normalizedStatus === 'no-change',
                  'border border-gray-200 text-gray-700 hover:bg-gray-50':
                    normalizedStatus !== 'no-change',
                  'cursor-not-allowed opacity-50': isUpdating,
                },
              )}
            >
              <Icon
                variant='circle-empty'
                className={cn('h-3.5 w-3.5', {
                  'stroke-white': normalizedStatus === 'no-change',
                  'stroke-gray-700': normalizedStatus !== 'no-change',
                })}
              />
              No Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionValidationCard;
