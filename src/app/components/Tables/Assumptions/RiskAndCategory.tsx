import { Badge } from '@components';
import { AssumptionCategory, RiskCategory } from '@libs/api/types';
import utils from '@libs/utils';
import React from 'react';

interface RiskAndCategoryProps {
  category: AssumptionCategory;
  riskCategory: RiskCategory;
}

const RiskAndCategory: React.FC<RiskAndCategoryProps> = ({
  category,
  riskCategory,
}) => {
  return (
    <div className='inline-flex flex-col items-start justify-start gap-[15px]'>
      <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
        <div className='self-stretch text-xs font-medium text-slate-500 '>
          Category
        </div>
        <Badge.AssumptionCategory category={category} />
      </div>
      <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
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
