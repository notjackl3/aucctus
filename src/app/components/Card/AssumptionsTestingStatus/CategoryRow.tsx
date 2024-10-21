import { Badge } from '@components';
import {
  AssumptionCategory,
  IAssumptionTestStatusCategory,
} from '@libs/api/types';
import utils from '@libs/utils';
import classNames from 'classnames';
import React from 'react';

interface CategoryRowProps extends IAssumptionTestStatusCategory {
  category: AssumptionCategory;
  colWidth?: string;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  status,
  testProgress,
  estimatedEndDate,
  colWidth = 'w-[120px]',
}) => {
  return (
    <div className='inline-flex items-center justify-start gap-6'>
      <div
        className={classNames('flex items-start justify-start', 'w-[134px]')}
      >
        <Badge.AssumptionCategory category={category} />
      </div>
      <Badge.ValidationStatus status={status} />
      <div
        className={classNames(
          'flex items-center justify-start gap-2',
          colWidth,
        )}
      >
        {testProgress.map((item, i) => (
          <Badge.TestStatus key={`${item}-${i}`} status={item} />
        ))}
      </div>
      <span
        className={classNames(
          'text-base font-semibold text-gray-600',
          colWidth,
        )}
      >
        {estimatedEndDate
          ? utils.time.dateFormatter(new Date(estimatedEndDate).toISOString(), {
              dateOnly: true,
            })
          : '--'}
      </span>
    </div>
  );
};

export default CategoryRow;
