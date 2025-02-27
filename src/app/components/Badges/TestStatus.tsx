import { Icon } from '@components';
import { type AssumptionTestStatus, type TestStatus } from '@libs/api/types';
import classNames from 'classnames';
import React from 'react';

interface TestStatusProps {
  status: AssumptionTestStatus | TestStatus;
}

const TestStatusBadge: React.FC<TestStatusProps> = ({ status }) => {
  const isBlank = status === 'notStarted' || status === 'inProgress';
  const { icon, style } = VALIDATED_STATUS_MAP[status];
  return (
    <span
      className={classNames(
        'aucctus-bg-primary flex h-[20px] w-[20px] items-center justify-center rounded-full align-middle',
        {
          border: isBlank,
          'aucctus-border-primary': isBlank,
        },
        style,
      )}
    >
      {icon ? <Icon variant={icon} height={12} width={12} /> : null}
    </span>
  );
};

const VALIDATED_STATUS_MAP: Record<
  AssumptionTestStatus | TestStatus,
  { icon?: IconVariant | undefined; style?: string }
> = {
  notStarted: {},
  inProgress: {
    icon: 'clock-fast-forward',
    style: 'bg-[#f8f9fc] [&>svg]:stroke-gray-500',
  },
  partiallyValidated: {
    icon: 'loading-02',
    style: 'bg-[#fcf7e9] [&>svg]:stroke-[#b55121]',
  },
  validated: { icon: 'check', style: 'bg-[#e9fbf2] [&>svg]:stroke-[#117246]' },
  completed: { icon: 'check', style: 'bg-[#e9fbf2] [&>svg]:stroke-[#117246]' },
  invalidated: {
    icon: 'closeX',
    style: 'bg-[#fde9e9] [&>svg]:stroke-[#b55121]',
  },
};

export default TestStatusBadge;
