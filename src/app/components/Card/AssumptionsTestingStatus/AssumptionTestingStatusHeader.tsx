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
        'text-nowrap text-xs font-medium text-slate-300',
        className,
      )}
    >
      {text}
    </div>
  );
};

export default AssumptionTestingStatusHeader;
