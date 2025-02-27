import { AssumptionCategory, IAssumptionTestStatus } from '@libs/api/types';
import { ASSUMPTIONS_CATEGORIES } from '@libs/utils/concepts';
import React from 'react';
import AssumptionTestingStatusHeader from './AssumptionTestingStatusHeader';
import CategoryRow from './CategoryRow';

const COL_WIDTH = 'w-[120px]';

interface AssumptionTestingStatusProps {
  overview: IAssumptionTestStatus;
}

const AssumptionTestingStatus: React.FC<AssumptionTestingStatusProps> = ({
  overview,
}) => {
  return (
    <div className='aucctus-border-secondary aucctus-bg-primary inline-flex h-auto min-w-fit flex-col items-start justify-start gap-7 rounded-lg border px-6 py-8'>
      {/* Header */}
      <div className='aucctus-bg-primary inline-flex items-center justify-between self-stretch'>
        <div className='aucctus-text-primary aucctus-text-xl-semibold'>
          Assumption Testing Status
        </div>
        {/* <Select.TestingStatus
          value='notStarted'
          onChange={() => null}
   
        /> */}
      </div>

      {/* Content */}
      <div className='aucctus-bg-primary inline-flex h-auto flex-col items-start justify-start gap-3'>
        {/* 'Table' Header */}
        <div className=' aucctus-bg-primary inline-flex min-w-fit items-center justify-start gap-6'>
          <AssumptionTestingStatusHeader
            text='Category'
            className={'w-[134px]'}
          />
          <AssumptionTestingStatusHeader
            text='Validation Status'
            className={'w-[164px]'}
          />
          <AssumptionTestingStatusHeader
            text='Test Progress'
            className={COL_WIDTH}
          />
          <AssumptionTestingStatusHeader
            text='Est. Test End Date'
            className={COL_WIDTH}
          />
        </div>
        {/* 'Table' Body */}
        {ASSUMPTIONS_CATEGORIES.map((item, i) => (
          <React.Fragment key={`${item}-${i}`}>
            <CategoryRow
              category={item as AssumptionCategory}
              status={overview[item].status}
              testProgress={overview[item].testProgress}
              estimatedEndDate={overview[item].estimatedEndDate}
            />
            {ASSUMPTIONS_CATEGORIES.length - 1 !== i && (
              <span className='aucctus-bg-quaternary h-[1px] w-full' />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AssumptionTestingStatus;
