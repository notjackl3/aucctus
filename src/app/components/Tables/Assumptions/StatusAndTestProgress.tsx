import { Badge } from '@components';
import { AssumptionTestStatus } from '@libs/api/types';
import React from 'react';

interface StatusAndTestProgressProps {
  status: AssumptionTestStatus;
  testProgress: [AssumptionTestStatus];
}

const commonClass =
  'h-full flex flex-col items-start justify-start gap-2 self-stretch';

const StatusAndTestProgress: React.FC<StatusAndTestProgressProps> = ({
  status,
  testProgress = [],
}) => {
  return (
    <div className='flex h-full grow flex-col justify-start gap-4'>
      <div className={commonClass}>
        <div className='self-stretch text-xs font-medium text-slate-500'>
          Validation Status
        </div>
        <Badge.ValidationStatus status={status} />
      </div>

      <div className={commonClass}>
        <div className='self-stretch text-xs font-medium text-slate-500'>
          Testing Progress
        </div>
        <div className='flex max-w-[160px] flex-row items-start justify-start gap-2 self-stretch overflow-x-scroll'>
          {testProgress.map((status, i) => (
            <Badge.TestStatus key={`${status}-${i}`} status={status} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusAndTestProgress;
