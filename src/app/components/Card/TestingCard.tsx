import { Button, Header, Icon } from '@components';
import {
  AssumptionTestStatus,
  ConceptTestStage,
  TestType,
} from '@libs/api/types';
import utils from '@libs/utils';
import { TESTING_STATUS_STYLE_MAP } from '@libs/utils/assumptions';
import { cn } from '@libs/utils/react';
import React from 'react';

interface TestingProps {
  stage: ConceptTestStage;
  identifier: string;
  type: TestType;
  description: string;
  duration: string;
  status: AssumptionTestStatus;
  handleStartTest: () => void;
  handleOpenTest: () => void;
}

const defaultProps = {
  headerFontSize: 'text-sm',
  headerFontColor: 'aucctus-text-secondary',
  headerFontWeight: 'font-semibold',
  valueFontSize: 'text-sm',
  valueFontColor: 'aucctus-text-tertiary',
  className: 'aucctus-bg-primary',
};

const Testing: React.FC<TestingProps> = ({
  identifier,
  type,
  stage,
  description,
  status,
  duration,
  handleStartTest,
  handleOpenTest,
}) => {
  const validationStatusVisuals = TESTING_STATUS_STYLE_MAP[status];

  const hasStarted = status !== 'notStarted';

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary flex h-fit min-h-36 w-full flex-col items-start justify-start gap-2 rounded-lg border p-4 shadow-sm'>
      <div className='inline-flex w-full items-center justify-between self-stretch'>
        <div className='inline-flex flex-col items-start justify-start gap-2'>
          <div className='aucctus-text-tertiary aucctus-text-xs-medium'>
            ID: {identifier}
          </div>

          {!hasStarted && (
            <span className='aucctus-bg-secondary inline-flex items-center justify-center gap-1.5 rounded-lg p-2 text-center text-xs font-semibold text-primary-600'>
              <Icon variant='star-01' className='stroke-primary-600' />
              Recommended
            </span>
          )}
        </div>

        {/* Start / Open Button */}
        <Button
          color={hasStarted ? 'light' : 'primary'}
          noBorder={hasStarted}
          size={hasStarted ? 'md' : undefined}
          onClick={() => {
            if (!hasStarted) {
              handleStartTest();
            } else {
              handleOpenTest();
            }
          }}
        >
          {hasStarted ? <Icon variant='link-external' /> : 'Start'}
        </Button>
      </div>
      <div className='inline-flex items-center justify-start gap-3.5 self-stretch'>
        {/* Right Side */}
        <div className='flex-flex-grow-1 inline-flex shrink grow  flex-col items-start justify-start gap-5'>
          <Header.AssumptionTest test={type} stage={stage} />
          {/* Description */}
          <div className='flex w-72 flex-col items-start justify-start gap-1.5'>
            <span
              className={cn(
                defaultProps.headerFontSize,
                defaultProps.headerFontColor,
                defaultProps.headerFontWeight,
              )}
            >
              Test Description
            </span>
            <span
              className={cn(
                defaultProps.valueFontSize,
                defaultProps.valueFontColor,
              )}
            >
              {description}
            </span>
          </div>
        </div>

        {/* Left Side */}
        <div className='inline-flex h-full shrink grow flex-col items-start justify-start gap-5'>
          <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
            <span
              className={cn(
                defaultProps.headerFontSize,
                defaultProps.headerFontColor,
                defaultProps.headerFontWeight,
              )}
            >
              Test Status
            </span>
            <span
              className={cn(
                'flex  items-center justify-start gap-2 text-ellipsis text-nowrap align-middle',
                defaultProps.valueFontSize,
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
            <div
              className={cn(
                'self-stretch',
                defaultProps.headerFontSize,
                defaultProps.headerFontColor,
                defaultProps.headerFontWeight,
              )}
            >
              Run Time
            </div>
            <div
              className={cn(
                defaultProps.valueFontSize,
                defaultProps.valueFontColor,
              )}
            >
              {duration}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testing;
