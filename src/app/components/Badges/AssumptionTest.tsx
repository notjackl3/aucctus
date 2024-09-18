import { Icon } from '@components';
import { AssumptionTest } from '@libs/api/types';
import utils from '@libs/utils';
import React from 'react';

interface AssumptionTestProps {
  test: AssumptionTest;
}

const AssumptionTestBadge: React.FC<AssumptionTestProps> = ({ test }) => {
  return (
    <div className='inline-flex items-center justify-start gap-2.5 text-ellipsis'>
      <Icon variant={TEST_ICON_MAP[test]} className='' />
      <div className='text-lg font-semibold text-[#2b3674]'>
        {utils.string.camelCaseToTitleCase(test)}
      </div>
    </div>
  );
};

const TEST_ICON_MAP: Record<AssumptionTest, IconVariant> = {
  scanningSurveys: 'list',
  immersiveDialogues: 'alert',
  'marketPulse-checks': 'alert',
  communityScans: 'alert',
  wizardOfOz: 'alert',
  marketResonance: 'alert',
  actionSignals: 'alert',
  productBlueprint: 'alert',
  feedbackLoops: 'alert',
  performanceTracking: 'alert',
  testDrives: 'alert',
  productRoadmapTesting: 'alert',
};

export default AssumptionTestBadge;
