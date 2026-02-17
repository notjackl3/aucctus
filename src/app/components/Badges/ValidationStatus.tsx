import { AssumptionTestStatus } from '@libs/api/types';
import utils from '@libs/utils';
import { TESTING_STATUS_STYLE_MAP } from '@libs/utils/assumptions';
import classNames from 'classnames';
import React from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface ValidationStatusProps {
  width?: string;
  status: AssumptionTestStatus;
}

const ValidationStatus: React.FC<ValidationStatusProps> = ({
  status,
  width = 'w-[160px]',
}) => {
  const validationStatusVisuals = TESTING_STATUS_STYLE_MAP[status];

  return (
    <span
      className={classNames(
        'flex items-center justify-start gap-2 text-nowrap align-middle text-sm font-semibold',
        width,
        validationStatusVisuals.text || '',
        validationStatusVisuals.svg || '',
      )}
    >
      <span>
        <DynamicIcon
          variant={validationStatusVisuals.icon}
          className={validationStatusVisuals.stroke}
          height={20}
          width={20}
        />
      </span>
      {utils.string.camelCaseToTitleCase(status)}
    </span>
  );
};

export default ValidationStatus;
