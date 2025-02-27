import { Badge } from '@components';
import { AssumptionCategory, RiskCategory } from '@libs/api/types';
import utils from '@libs/utils';
import React from 'react';

interface RiskAndCategoryProps {
  category: AssumptionCategory;
  riskCategory: RiskCategory;
}

// Add a common class for repeated styles
const commonClassContainer =
  'flex flex-col items-start justify-start gap-2 self-stretch';
const commonClassSpan =
  'self-stretch text-sm font-medium aucctus-text-tertiary';

const RiskAndCategory: React.FC<RiskAndCategoryProps> = ({
  category,
  riskCategory,
}) => {
  return (
    <div className='flex h-full flex-col items-start justify-start gap-4'>
      <div className={commonClassContainer}>
        <span className={commonClassSpan}>Category</span>
        <Badge.AssumptionCategory category={category} />
      </div>
      <div className={commonClassContainer}>
        <span className={commonClassSpan}>Risk Level</span>
        <Badge.RiskLevel
          category={riskCategory}
          text={utils.string.toTitleCase(riskCategory)}
        />
      </div>
    </div>
  );
};

export default RiskAndCategory;
