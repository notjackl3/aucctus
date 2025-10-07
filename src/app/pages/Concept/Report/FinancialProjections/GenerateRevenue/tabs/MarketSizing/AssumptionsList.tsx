import React, { forwardRef } from 'react';
import { cn } from '@libs/utils/react';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types';
import AssumptionCard from './AssumptionCard';
import AssumptionsHeader from './AssumptionsHeader';
import { IMarketSizingV2 } from '@libs/api/types';

interface AssumptionsListProps {
  bodyClassName?: string;
  filteredAssumptions: IMarketSizingAssumptionEntryV2[];
  marketSizing?: IMarketSizingV2;
  resetToDefaults: () => void;
  handleAssumptionChange: (id: string, newValue: number) => void;
}

const AssumptionsList = forwardRef<HTMLDivElement, AssumptionsListProps>(
  (
    {
      bodyClassName,
      filteredAssumptions,
      marketSizing,
      resetToDefaults,
      handleAssumptionChange,
    },
    ref,
  ) => {
    // Helper function to check if an assumption is modified
    const isAssumptionModified = (
      assumption: IMarketSizingAssumptionEntryV2,
    ): boolean => {
      if (!marketSizing?.assumptionEntries) return false;

      const originalAssumption = marketSizing.assumptionEntries.find(
        (orig) => orig.uuid === assumption.uuid,
      );
      return originalAssumption
        ? assumption.scalar !== originalAssumption.scalar
        : false;
    };

    return (
      <div ref={ref}>
        <AssumptionsHeader
          resetToDefaults={resetToDefaults}
          bodyClassName={bodyClassName}
        />

        <div className={cn('mt-4 space-y-4 !pt-0', bodyClassName)}>
          {filteredAssumptions.map((assumption) => (
            <AssumptionCard
              key={assumption.uuid}
              assumption={assumption}
              handleAssumptionChange={handleAssumptionChange}
              isModified={isAssumptionModified(assumption)}
            />
          ))}
        </div>
      </div>
    );
  },
);

AssumptionsList.displayName = 'AssumptionsList';

export default AssumptionsList;
