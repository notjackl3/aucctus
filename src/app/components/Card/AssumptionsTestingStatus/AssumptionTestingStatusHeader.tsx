import classNames from 'classnames';
import React from 'react';

interface AssumptionsTestingStatusHeaderProps {
  text: string;
  className: string;
}

const AssumptionTestingStatusHeader: React.FC<
  AssumptionsTestingStatusHeaderProps
> = ({ text, className }) => {
  return (
    <div
      className={classNames(
        'aucctus-text-tertiary aucctus-text-xs text-nowrap',
        className,
      )}
    >
      {text}
    </div>
  );
};

export default AssumptionTestingStatusHeader;
