import { cn } from '@libs/utils/react';
import React from 'react';

interface AssumptionOverviewProps {
  header: string;
  body?: React.ReactNode;
  bodyProps?: React.HTMLAttributes<HTMLDivElement>;
  footer: React.ReactNode;
}

const AssumptionOverview: React.FC<AssumptionOverviewProps> = ({
  header,
  body,
  bodyProps,
  footer,
}) => {
  return (
    <div
      className={cn(
        'inline-flex h-32 flex-col items-start justify-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-4',
      )}
    >
      <div className={cn('self-stretch text-sm font-medium text-slate-500')}>
        {header}
      </div>

      <div
        {...bodyProps}
        className={cn(
          'font-base self-stretch text-3xl text-indigo-900',
          bodyProps?.className,
        )}
      >
        {body ? body : '--'}
      </div>
      {footer && (
        <div
          className={cn('self-stretch text-sm font-semibold text-slate-500')}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default AssumptionOverview;
