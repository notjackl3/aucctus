import { Badge } from '@components';
import { AssumptionCategory, AssumptionTestStatus } from '@libs/api/types';
import utils from '@libs/utils';
import classNames from 'classnames';
import React from 'react';

interface CategoryRowProps {
  category: AssumptionCategory;
  validationStatus: AssumptionTestStatus;
  colWidth?: string;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  validationStatus,
  colWidth = 'w-[120px]',
}) => {
  return (
    <div className='inline-flex items-center justify-start gap-6'>
      <div
        className={classNames('flex items-start justify-start', 'w-[134px]')}
      >
        <Badge.AssumptionCategory category={category} />
      </div>
      <Badge.ValidationStatus status={validationStatus} />
      <div
        className={classNames(
          'flex items-center justify-start gap-2',
          colWidth,
        )}
      >
        <Badge.TestStatus status='notStarted' />
        <Badge.TestStatus status='inProgress' />
        <Badge.TestStatus status='partiallyValidated' />
        <Badge.TestStatus status='validated' />
      </div>
      <span
        className={classNames(
          'text-base font-semibold text-gray-600',
          colWidth,
        )}
      >
        {utils.time.dateFormatter(new Date('26 Jul 2024').toISOString())}
      </span>
    </div>
  );
};

export default CategoryRow;
