import { Badge } from '@components';
import { TestingValidationStatus } from '@libs/api/types';
import React from 'react';

interface StatusAndTestProgressProps {
  status: TestingValidationStatus;
}

const StatusAndTestProgress: React.FC<StatusAndTestProgressProps> = ({
  status,
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
        {/* <Badge.RiskLevel level={riskLevel} text={utils.string.toTitleCase(riskLevel)} /> */}
      </div>
    </div>
  );
};

export default StatusAndTestProgress;
