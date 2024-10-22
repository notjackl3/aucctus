import { Badge, Header, Icon } from '@components';
import {
  ConceptTestStage,
  ConceptTestStatus,
  HighLevelCharacteristics,
  TestType,
} from '@libs/api/types';
import utils from '@libs/utils';
import { TESTING_STATUS_STYLE_MAP } from '@libs/utils/assumptions';
import classNames from 'classnames';
import React from 'react';

interface HeaderProps {
  stage: ConceptTestStage;
  type: TestType;
  status: ConceptTestStatus;
  startDate: string;
  endDate: string;
  runTime: string;
  testDescription: string;
  findingsSummary?: string;
  costEstimate: HighLevelCharacteristics['costEstimate'];
}

const AssumptionTestHeader: React.FC<HeaderProps> = ({
  stage,
  type,
  status,
  startDate,
  endDate,
  runTime,
  testDescription,
  findingsSummary,
  costEstimate,
}) => {
  return (
    <div className=' inline-flex flex-col items-start justify-start gap-2 border-b border-gray-200 px-8 pb-4'>
      <div className='inline-flex items-start justify-start gap-6'>
        {/* Test Type */}
        <div className='w-64'>
          <Header.AssumptionTest test={type} stage={stage} lg />
        </div>

        {/* Test Status */}
        <div className='inline-flex w-40 flex-col items-start justify-start gap-1'>
          <div className='self-stretch text-xs font-normal text-slate-500'>
            Test Status
          </div>
          <span
            className={classNames(
              ' inline-flex items-center justify-start gap-1.5 self-stretch',
              TESTING_STATUS_STYLE_MAP[status].text,
            )}
          >
            <Icon
              variant={TESTING_STATUS_STYLE_MAP[status].icon}
              className={classNames(TESTING_STATUS_STYLE_MAP[status].stroke)}
            />
            {utils.string.camelCaseToTitleCase(status)}
          </span>
        </div>

        {/* Test Dates */}
        <div className='flex items-center justify-start gap-6'>
          <div className='inline-flex flex-col items-start justify-start gap-1'>
            <div className='self-stretch text-xs font-medium text-slate-500'>
              Start Date
            </div>
            <div className='self-stretch text-base font-semibold text-gray-500'>
              {startDate}
            </div>
          </div>
          <div className='inline-flex flex-col items-start justify-start gap-1'>
            <div className='self-stretch text-xs font-medium text-slate-500'>
              End Date
            </div>
            <div className='text-base font-semibold text-gray-500'>
              {endDate}
            </div>
          </div>
          <div className='inline-flex flex-col items-start justify-start gap-1'>
            <div className='self-stretch text-xs font-medium text-slate-500'>
              Run Time
            </div>
            <div className='text-base font-semibold text-gray-500'>
              {runTime}
            </div>
          </div>
        </div>
      </div>

      {/* Test Description */}
      <div className='inline-flex items-start justify-start gap-6'>
        <div className='inline-flex w-64 flex-col items-start justify-start gap-1 self-stretch'>
          <div className='self-stretch text-base font-medium text-slate-500'>
            Test Description
          </div>
          <div className='inline-flex items-center justify-center gap-2.5 self-stretch'>
            <div className='h-[45px] shrink grow basis-0 text-xs font-semibold text-gray-500'>
              {testDescription}
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className='inline-flex w-40 flex-col items-start justify-center gap-1 self-stretch'>
          <div className='self-stretch text-base font-medium text-slate-500'>
            Cost Estimate
          </div>
          <Badge.CostEstimate costEstimate={costEstimate} />
        </div>

        {/* Summary of Findings */}
        <div className='inline-flex w-[292px] flex-col items-start justify-start gap-1'>
          <div className='self-stretch text-base font-medium text-slate-500'>
            Summary of Findings
          </div>
          <div className='inline-flex items-center justify-center gap-2.5 self-stretch'>
            <div className='shrink grow basis-0 text-xs font-semibold text-gray-500'>
              {findingsSummary || '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionTestHeader;
