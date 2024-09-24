import { Badge, Icon } from '@components';
import { AssumptionTestStatus, TestType } from '@libs/api/types';
import utils from '@libs/utils';
import { TESTING_STATUS_STYLE_MAP } from '@libs/utils/concepts';
import classNames from 'classnames';
import React from 'react';

interface TestingProps {
  identifier: string;
  type: TestType;
  description: string;
  duration: string;
  status: AssumptionTestStatus;
  state: string;
}

const Testing: React.FC<TestingProps> = ({
  identifier,
  type,
  description,
  status,

  duration,
}) => {
  const validationStatusVisuals = TESTING_STATUS_STYLE_MAP[status];
  return (
    <div className='inline-flex min-h-48 min-w-[432px] flex-col items-start justify-center gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm'>
      <div className='inline-flex items-start justify-between self-stretch'>
        <div className='inline-flex flex-col items-start justify-start gap-2'>
          <div className='text-xs font-medium text-[#7586a9]'>
            ID: {identifier}
          </div>
          <div className='inline-flex items-center justify-start gap-1 rounded-lg bg-[#f4f7fe] p-2'>
            <Icon variant='star-01' />
            <div className='text-xs font-semibold text-[#4318ff]'>
              Recommended
            </div>
          </div>
        </div>

        {/* Start / Open Button */}
        <button className='btn btn-primary'>Start</button>
      </div>
      <div className='inline-flex items-center justify-start gap-3.5 self-stretch'>
        {/* Right Side */}
        <div className='inline-flex shrink grow basis-0 flex-col items-start justify-start gap-5'>
          <Badge.AssumptionTest test={type} />

          {/* Description */}
          <div className='flex w-52 flex-col items-start justify-start gap-1.5'>
            <span className='self-stretch text-xs font-medium text-[#7586a9]'>
              Test Description
            </span>
            <span className='self-stretch text-wrap text-xs font-semibold text-[#667085]'>
              {description}
            </span>
          </div>
        </div>

        {/* Left Side */}
        <div className='inline-flex h-full min-w-[160px] shrink grow basis-0 flex-col items-start justify-start gap-5'>
          <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
            <span className='self-stretch text-xs font-medium text-[#7586a9]'>
              Test Status
            </span>
            <span
              className={classNames(
                'flex  items-center justify-start gap-2 text-ellipsis text-nowrap align-middle text-sm font-semibold',
                validationStatusVisuals.text,
                validationStatusVisuals.svg,
              )}
            >
              <span>
                <Icon
                  variant={validationStatusVisuals.icon}
                  className={validationStatusVisuals.stroke}
                  height={20}
                  width={20}
                />
              </span>
              {utils.string.camelCaseToTitleCase(status)}
            </span>
          </div>

          <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
            <div className='self-stretch text-xs font-medium text-[#7586a9]'>
              Run Time
            </div>
            <div className='text-base font-semibold text-[#667085]'>
              {duration}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testing;
