import React from 'react';
import { Icon } from '@components';
import { IImpactSizingAssumptionEntryV2 } from '@libs/api/types/concept/financialProjectionV2';
import { AssumptionItem } from './AssumptionItem';

export interface AssumptionsPanelProps {
  assumptions: IImpactSizingAssumptionEntryV2[];
  originalAssumptions: IImpactSizingAssumptionEntryV2[];
  onAssumptionChange: (uuid: string, value: number) => void;
  resetToDefaults: () => void;
  assumptionsRef: React.RefObject<HTMLDivElement>;
}

export const AssumptionsPanel: React.FC<AssumptionsPanelProps> = ({
  assumptions,
  originalAssumptions,
  onAssumptionChange,
  resetToDefaults,
  assumptionsRef,
}) => {
  // Helper function to check if an assumption is modified
  const isAssumptionModified = (
    assumption: IImpactSizingAssumptionEntryV2,
  ): boolean => {
    const originalAssumption = originalAssumptions.find(
      (orig) => orig.uuid === assumption.uuid,
    );
    return originalAssumption
      ? assumption.scalar !== originalAssumption.scalar
      : false;
  };

  return (
    <div ref={assumptionsRef}>
      <div className='aucctus-bg-primary sticky top-0 z-10 mb-4 flex items-center justify-between p-6'>
        <div>
          <span className='aucctus-text-xl-semibold aucctus-text-primary'>
            Assumptions
          </span>
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
            isModified={isAssumptionModified(assumption)}
          />
        ))}
      </div>
    </div>
  );
};
