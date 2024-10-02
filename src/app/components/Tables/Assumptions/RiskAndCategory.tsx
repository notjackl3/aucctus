import { Badge } from '@components';
import { AssumptionCategory, RiskCategory } from '@libs/api/types';
import utils from '@libs/utils';
import React from 'react';

interface RiskAndCategoryProps {
  category: AssumptionCategory;
  riskCategory: RiskCategory;
}

// Add a common class for repeated styles
const commonClass =
  'flex flex-col items-start justify-start gap-2 self-stretch';

const RiskAndCategory: React.FC<RiskAndCategoryProps> = ({
  category,
  riskCategory,
}) => {
  return (
    <div className='flex h-full flex-col items-start justify-start gap-4'>
      <div className={commonClass}>
        <div className='self-stretch text-xs font-medium text-slate-500'>
          Category
        </div>
        <Badge.AssumptionCategory category={category} />
      </div>
      <div className={commonClass}>
        <div className='self-stretch text-xs font-medium text-slate-500'>
          Risk Level
        </div>
        <Badge.RiskLevel
          category={riskCategory}
          text={utils.string.toTitleCase(riskCategory)}
        />
      </div>
    </div>
  );
};

export default RiskAndCategory;
