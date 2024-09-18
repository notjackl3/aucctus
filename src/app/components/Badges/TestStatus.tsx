import { Icon } from '@components';
import classNames from 'classnames';
import React from 'react';

type TestingValidationStatus =
  | 'notStarted'
  | 'inProgress'
  | 'partiallyValidated'
  | 'validated';
interface ValidatedStatusProps {
  status: TestingValidationStatus;
}

const ValidatedStatus: React.FC<ValidatedStatusProps> = ({ status }) => {
  const isBlank = status === 'notStarted' || status === 'inProgress';
  const { icon, style } = VALIDATED_STATUS_MAP[status];
  return (
    <span
      className={classNames(
        'flex h-[20px] w-[20px] items-center justify-center rounded-full align-middle',
        {
          border: isBlank,
          'border-gray-300': isBlank,
        },
        style,
      )}
    >
      {icon ? <Icon variant={icon} height={12} width={12} /> : null}
    </span>
  );
};

const VALIDATED_STATUS_MAP: Record<
  TestingValidationStatus,
  { icon?: IconVariant | undefined; style?: string }
> = {
  notStarted: {},
  inProgress: {},
  partiallyValidated: {
    icon: 'loading-02',
    style: 'bg-[#fcf7e9] [&>svg]:stroke-[#b55121]',
  },
  validated: { icon: 'check', style: 'bg-[#e9fbf2] [&>svg]:stroke-[#117246]' },
};

export default ValidatedStatus;
