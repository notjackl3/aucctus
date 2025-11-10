import React from 'react';
import { Icon } from '@components';
import { getCategoryIcon } from '../../../../../Assumptions/utils/assumptionUtils';
import { getCategoryColors } from '../../../../../Assumptions/constants/categoryColors';
import { AssumptionCategory } from '@libs/api/types';
import ValidationBenchmarkCard from './ValidationBenchmarkCard';
import ValidationOptionsSection from './ValidationOptionsSection';
import { ITestAssumptionDetailed } from '../../../../types';

interface AssumptionValidationCardProps {
  assumption: ITestAssumptionDetailed;
  isUpdating: boolean;
  onValidationChange: (
    assumption: ITestAssumptionDetailed,
    newValidationStatus: 'validated' | 'invalidated' | 'untested',
  ) => void;
}

const AssumptionValidationCard: React.FC<AssumptionValidationCardProps> = ({
  assumption,
  isUpdating,
  onValidationChange,
}) => {
  const statement = assumption.statement || '';
  const category = assumption.category || '';
  const normalizedStatus =
    assumption.validationStatus === 'untested'
      ? 'unchanged'
      : assumption.validationStatus;

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

  // Generate validation options
  const getValidationOptions = () => {
    const options = [
      {
        type: 'validated',
        label: 'Validated',
        icon: (
          <Icon
            variant='check'
            className='aucctus-stroke-success-primary h-4 w-4'
          />
        ),
        isSelected: normalizedStatus === 'validated',
      },
      {
        type: 'invalidated',
        label: 'Invalidated',
        icon: (
          <Icon
            variant='closeX'
            className='aucctus-stroke-error-primary h-4 w-4'
          />
        ),
        isSelected: normalizedStatus === 'invalidated',
      },
      {
        type: 'unchanged',
        label: 'Unchanged',
        icon: (
          <Icon
            variant='help-circle'
            className='aucctus-stroke-tertiary h-4 w-4'
          />
        ),
        isSelected: normalizedStatus === 'unchanged',
      },
    ];
    return options;
  };

  const handleOptionSelect = (optionType: string) => {
    if (optionType === 'unchanged') {
      onValidationChange(assumption, 'untested');
      return;
    }

    onValidationChange(
      assumption,
      optionType as 'validated' | 'invalidated' | 'untested',
    );
  };

  const benchmarkText =
    assumption.benchmark ||
    `Validate through customer interviews with at least ${Math.round((assumption.importance || 0.5) * 100)}% positive responses.`;

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary overflow-hidden rounded-lg border'>
      {/* Horizontal layout: Left side (assumption) and Right side (validation) */}
      <div className='flex flex-col md:flex-row'>
        {/* Left side: Category icon, badge, and assumption statement */}
        <div className='aucctus-bg-secondary-subtle aucctus-border-secondary flex-1 border-r p-4'>
          <div className='mb-3 flex items-center gap-2'>
            {/* Category icon */}
            <div className='flex-shrink-0'>{renderCategoryIcon(category)}</div>

            {/* Category badge */}
            <span className='aucctus-bg-secondary aucctus-text-tertiary aucctus-border-secondary inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize'>
              {category}
            </span>
          </div>

          {/* Assumption statement */}
          <h5 className='aucctus-text-lg-bold aucctus-text-brand-primary'>
            {statement}
          </h5>
        </div>

        {/* Right side: Validation benchmark and result options */}
        <div className='flex-1 p-4'>
          <div className='space-y-4'>
            {/* Validation Benchmark Section */}
            <ValidationBenchmarkCard benchmark={benchmarkText} />

            {/* Validation Result Section */}
            <ValidationOptionsSection
              options={getValidationOptions()}
              isUpdating={isUpdating}
              onOptionSelect={handleOptionSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionValidationCard;
