import React from 'react';
import { cn } from '@libs/utils/react';
import { IImpactSizingAssumptionEntryV2 } from '@libs/api/types/concept/financialProjectionV2';
import { Badge } from '@components';

export interface AssumptionItemProps {
  assumption: IImpactSizingAssumptionEntryV2;
  onChange: (uuid: string, value: number) => void;
}

export const AssumptionItem: React.FC<AssumptionItemProps> = ({
  assumption,
  onChange,
}) => {
  return (
    <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary rounded-lg border p-4'>
      <div className='mb-1 flex items-center justify-between'>
        <span className='aucctus-text-md-medium aucctus-text-primary'>
          {assumption.title}
        </span>
      </div>

      <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
        {assumption.unitDescription}
      </p>

      <div className='flex items-center gap-2'>
        <div className='relative flex-grow'>
          {assumption.unit === '$' && (
            <span className='aucctus-text-tertiary absolute left-3 top-1/2 -translate-y-1/2'>
              $
            </span>
          )}
          <input
            type='number'
            value={assumption.scalar}
            onChange={(e) =>
              onChange(assumption.uuid, parseFloat(e.target.value))
            }
            className={cn(
              'aucctus-border-secondary aucctus-text-sm aucctus-text-primary w-full rounded border px-2 py-1',
              { 'pl-7': assumption.unit === '$' },
            )}
            min={1}
            max={assumption.unit === '%' ? 100 : undefined}
            step={1}
          />
        </div>

        {assumption.unit === '%' && (
          <span className='aucctus-text-sm aucctus-text-tertiary'>%</span>
        )}
      </div>
      <div className='mt-3 flex flex-row gap-2'>
        {assumption.impactAssumptionSources.map((source) => (
          <Badge.FinancialProjectionSource
            key={source.uuid}
            source={source}
            badgeSize='small'
          />
        ))}
      </div>
    </div>
  );
};
