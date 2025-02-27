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
        'aucctus-border-secondary aucctus-bg-primary inline-flex h-32 min-w-fit flex-col items-start justify-start gap-3 rounded-lg border px-4 py-4',
      )}
    >
      <div
        className={cn(
          'aucctus-text-tertiary aucctus-text-sm self-stretch text-sm',
        )}
      >
        {header}
      </div>

      <div
        {...bodyProps}
        className={cn(
          'font-base aucctus-text-primary aucctus-text-lg self-stretch',
          bodyProps?.className,
        )}
      >
        {body ? body : '--'}
      </div>
      {footer && (
        <div
          className={cn(
            'aucctus-text-primary aucctus-text-sm-semibold self-stretch',
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default AssumptionOverview;
