import { ConceptTestStage, TestType } from '@libs/api/types';
import utils from '@libs/utils';
import { TEST_TYPE_ICON_MAP } from '@libs/utils/assumptions';
import { cn } from '@libs/utils/react';
import React from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface AssumptionTestProps {
  test: TestType;
  stage: ConceptTestStage;
  lg?: boolean;
}

const AssumptionTestBadge: React.FC<AssumptionTestProps> = ({
  test,
  stage,
  lg = false,
}) => {
  return (
    <span
      className={cn(
        'aucctus-text-primary inline-flex items-center justify-center gap-1.5 text-center font-semibold leading-none',
        lg ? 'aucctus-text-lg' : 'aucctus-text-sm',
      )}
    >
      <DynamicIcon
        variant={TEST_TYPE_ICON_MAP[test]}
        className={cn({
          'stroke-blue-700': stage === 'validate',
          'stroke-pink-500': stage === 'scale',
          'stroke-green-700': stage === 'discover',
          'h-6 w-6': lg,
        })}
      />
      {utils.string.camelCaseToTitleCase(test)}
    </span>
  );
};

export default AssumptionTestBadge;
