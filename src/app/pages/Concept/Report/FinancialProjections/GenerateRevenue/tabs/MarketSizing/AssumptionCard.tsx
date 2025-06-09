import React from 'react';
import { Badge } from '@components';
import { cn } from '@libs/utils/react';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types';
import {
  marketSizeStyles,
  type MarketSizeType,
} from './styles/marketSizeStyles';

interface AssumptionCardProps {
  assumption: IMarketSizingAssumptionEntryV2;
  handleAssumptionChange: (id: string, newValue: number) => void;
}

const AssumptionCard: React.FC<AssumptionCardProps> = ({
  assumption,
  handleAssumptionChange,
}) => {
  // Get style based on assumption group using the shared styles
  const assumptionGroup = (assumption.group?.toLowerCase() ||
    'tam') as MarketSizeType;
  const styles = marketSizeStyles[assumptionGroup];

  // Type Badge component
  const TypeBadge = () => {
    const typeLabel = assumptionGroup.toUpperCase();

    return (
      <div
        className={cn(
          'flex items-center self-center rounded-full px-3 py-1 text-xs font-medium',
          styles.accentColor,
          styles.badgeClass,
        )}
      >
        {typeLabel}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative rounded-lg p-4 transition-all',
        'aucctus-border-secondary aucctus-bg-primary border',
        styles.hoverShadowClass,
        'overflow-hidden',
      )}
    >
      {/* Left accent border */}
      <div
        className={`absolute bottom-0 left-0 top-0 w-1.5 rounded-l-lg ${styles.accentColor}`}
      ></div>

      <div className='flex flex-col gap-3 pl-2'>
        {/* Title and description area */}
        <div>
          <div className='mb-2'>
            <span className='aucctus-text-sm-semibold aucctus-text-primary'>
              {assumption.title}
            </span>
          </div>

          <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
            {assumption.description}
          </p>
        </div>

        {/* Input area - now on its own row */}
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
                handleAssumptionChange(
                  assumption.uuid,
                  parseFloat(e.target.value),
                )
              }
              className={cn(
                'aucctus-border-secondary aucctus-text-sm aucctus-text-primary w-full rounded border px-3 py-2',
                { 'pl-7': assumption.unit === '$' },
                `focus:${styles.borderClass} focus:outline-none focus:ring-2`,
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
      </div>

      {/* Footer with source badge on left and type badge on right */}
      <div className='mt-3 flex items-center justify-between pl-2'>
        <div className='flex flex-row gap-2'>
          {assumption.assumptionSources.map((source) => (
            <Badge.FinancialProjectionSource
              key={source.uuid}
              source={source}
              badgeSize='small'
            />
          ))}
        </div>
        <div>
          <TypeBadge />
        </div>
      </div>
    </div>
  );
};

export default AssumptionCard;
