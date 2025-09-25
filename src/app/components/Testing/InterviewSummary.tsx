import React from 'react';
import { IProfileDistribution } from '@libs/api/types/concept/testing';

interface InterviewSummaryProps {
  interviewVolume: number;
  selectedCollateralsCount: number;
  maxCollaterals: number;
  distributionData?: IProfileDistribution[];
  isReady: boolean;
}

const InterviewSummary: React.FC<InterviewSummaryProps> = ({
  interviewVolume,
  selectedCollateralsCount,
  maxCollaterals,
  distributionData = [],
  isReady,
}) => {
  const activeInterviewers = distributionData.filter(
    (d) => d.weight > 0,
  ).length;
  const totalInterviewers = distributionData.length;

  return (
    <div className='aucctus-bg-secondary-subtle aucctus-border-secondary space-y-4 rounded-lg border p-4'>
      <h4 className='aucctus-text-sm-semibold aucctus-text-primary'>
        Interview Summary
      </h4>

      <div className='aucctus-text-sm grid grid-cols-2 gap-4'>
        <div>
          <p className='aucctus-text-secondary'>Volume</p>
          <p className='aucctus-text-primary aucctus-text-sm-semibold'>
            {interviewVolume} interview{interviewVolume !== 1 ? 's' : ''}
          </p>
        </div>

        <div>
          <p className='aucctus-text-secondary'>Materials</p>
          <p className='aucctus-text-primary aucctus-text-sm-semibold'>
            {selectedCollateralsCount}/{maxCollaterals} selected
          </p>
        </div>

        <div>
          <p className='aucctus-text-secondary'>Active Interviewers</p>
          <p className='aucctus-text-primary aucctus-text-sm-semibold'>
            {activeInterviewers}/{totalInterviewers}
          </p>
        </div>

        <div>
          <p className='aucctus-text-secondary'>Status</p>
          <p
            className={`aucctus-text-sm-semibold ${
              isReady
                ? 'aucctus-text-success-primary'
                : 'aucctus-text-warning-primary'
            }`}
          >
            {isReady ? 'Ready' : 'Pending'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewSummary;
