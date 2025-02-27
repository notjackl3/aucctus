import { Badge, Header, Icon, Text } from '@components';
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

const defaultProps = {
  testDate: {
    container: 'inline-flex flex-col items-start justify-start gap-1',
    label: 'self-stretch text-sm font-medium aucctus-text-tertiary',
    value: 'text-base font-semibold aucctus-text-tertiary',
  },
};

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
    <div className='aucctus-border-secondary flex flex-row items-start justify-start gap-8 border-b px-8 pb-4'>
      <div className='flex max-w-lg flex-col items-start justify-start gap-2 from-white'>
        {/* Test Type */}
        <div className='w-64'>
          <Header.AssumptionTest test={type} stage={stage} lg />
        </div>

        {/* Test Description */}
        <Text.Collapsible
          title='Test Description'
          titleClassName='self-stretch text-base font-medium aucctus-text-tertiary'
          description={testDescription}
          descriptionClassName='text-xs font-semibold aucctus-text-tertiary'
          maxDescriptionHeight={45}
        />
      </div>

      <div className='flex flex-col gap-2'>
        {/* Test Status */}
        <div className='inline-flex flex-col items-start justify-start gap-1'>
          <div className={defaultProps.testDate.label}>Test Status</div>
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
        {/* Cost Estimate */}
        <div className='inline-flex flex-col items-start justify-center gap-1 self-stretch'>
          <div className='aucctus-text-tertiary self-stretch text-base font-medium'>
            Cost Estimate
          </div>
          <Badge.CostEstimate costEstimate={costEstimate} />
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        {/* Test Dates */}
        <div className='flex min-w-fit flex-row items-center justify-start gap-8'>
          <div className={defaultProps.testDate.container}>
            <div className={defaultProps.testDate.label}>Start Date</div>
            <div className={defaultProps.testDate.value}>{startDate}</div>
          </div>
          <div className={defaultProps.testDate.container}>
            <div className={defaultProps.testDate.label}>End Date</div>
            <div className={defaultProps.testDate.value}>{endDate}</div>
          </div>
          <div className={defaultProps.testDate.container}>
            <div className={defaultProps.testDate.label}>Run Time</div>
            <div className={defaultProps.testDate.value}>{runTime}</div>
          </div>
        </div>

        {/* Summary of Findings */}
        <div className='inline-flex w-[292px] flex-col items-start justify-start gap-1'>
          <div className='aucctus-text-tertiary self-stretch text-base font-medium'>
            Summary of Findings
          </div>
          <div className='inline-flex items-center justify-center gap-2.5 self-stretch'>
            <div className='aucctus-text-tertiary shrink grow basis-0 text-xs font-semibold'>
              {findingsSummary || '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionTestHeader;
