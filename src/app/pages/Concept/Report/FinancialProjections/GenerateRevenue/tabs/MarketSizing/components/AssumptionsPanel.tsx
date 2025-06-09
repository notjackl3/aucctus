import React from 'react';
import { Icon } from '@components';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types/concept/financialProjectionV2';
import { AssumptionItem } from './AssumptionItem';

export interface AssumptionsPanelProps {
  assumptions: IMarketSizingAssumptionEntryV2[];
  assumptionsTitle: string;
  onAssumptionChange: (uuid: string, value: number) => void;
  resetToDefaults: () => void;
  assumptionsRef: React.RefObject<HTMLDivElement>;
}

export const AssumptionsPanel: React.FC<AssumptionsPanelProps> = ({
  assumptions,
  assumptionsTitle,
  onAssumptionChange,
  resetToDefaults,
  assumptionsRef,
}) => (
  <div ref={assumptionsRef}>
    <div className='aucctus-bg-primary sticky top-0 z-10 mb-4 flex items-center justify-between p-6'>
      <div>
        <span className='aucctus-text-xl-semibold aucctus-text-primary'>
          Assumptions
        </span>
        <p className='aucctus-text-xs aucctus-text-tertiary'>
          {assumptionsTitle}
        </p>
      </div>
      <button
        onClick={resetToDefaults}
        className='btn btn-light flex items-center gap-2 text-sm'
      >
        <Icon variant='refresh' className='aucctus-stroke-tertiary h-4 w-4' />
        Reset
      </button>
    </div>

    <div className='space-y-3 overflow-auto px-6 pb-6'>
      {assumptions.map((assumption) => (
        <AssumptionItem
          key={assumption.uuid}
          assumption={assumption}
          onChange={onAssumptionChange}
        />
      ))}
    </div>
  </div>
);
