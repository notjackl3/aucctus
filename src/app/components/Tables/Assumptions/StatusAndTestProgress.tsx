import { Badge } from '@components';
import { AssumptionTestStatus } from '@libs/api/types';
import React from 'react';

interface StatusAndTestProgressProps {
  status: AssumptionTestStatus;
  testProgress: [AssumptionTestStatus];
}

const StatusAndTestProgress: React.FC<StatusAndTestProgressProps> = ({
  status,
  testProgress = [],
}) => {
  return (
    <div className='inline-flex flex-col items-start justify-start gap-[15px]'>
      <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
        <div className='self-stretch text-xs font-medium text-slate-500 '>
          Validation Status
        </div>
        <Badge.ValidationStatus status={status} />
      </div>
      <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
        <div className='self-stretch text-xs font-medium text-slate-500'>
          Testing Progress
        </div>
        <div className='flex flex-row items-start justify-start gap-2 self-stretch'>
          {testProgress.map((status, i) => (
            <Badge.TestStatus key={`${status}-${i}`} status={status} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusAndTestProgress;
