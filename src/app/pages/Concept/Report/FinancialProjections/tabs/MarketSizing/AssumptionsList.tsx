import React, { forwardRef } from 'react';
import { cn } from '@libs/utils/react';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types';
import AssumptionCard from './AssumptionCard';
import AssumptionsHeader from './AssumptionsHeader';
import { IMarketSizingV2 } from '@libs/api/types';

interface AssumptionsListProps {
  bodyClassName?: string;
  activeFilter?: 'tam' | 'sam' | 'som';
  isFilterActive: boolean;
  filteredAssumptions: IMarketSizingAssumptionEntryV2[];
  marketSizing?: IMarketSizingV2;
  resetToDefaults: () => void;
  handleAssumptionChange: (id: string, newValue: number) => void;
}

const AssumptionsList = forwardRef<HTMLDivElement, AssumptionsListProps>(
  (
    {
      bodyClassName,
      activeFilter,
      isFilterActive,
      filteredAssumptions,
      resetToDefaults,
      handleAssumptionChange,
    },
    ref,
  ) => {
    return (
      <div ref={ref}>
        <AssumptionsHeader
          activeFilter={activeFilter}
          isFilterActive={isFilterActive}
          resetToDefaults={resetToDefaults}
          bodyClassName={bodyClassName}
        />

        <div className={cn('mt-4 space-y-4 !pt-0', bodyClassName)}>
          {filteredAssumptions.map((assumption) => (
            <AssumptionCard
              key={assumption.uuid}
              assumption={assumption}
              handleAssumptionChange={handleAssumptionChange}
            />
          ))}
        </div>
      </div>
    );
  },
);

AssumptionsList.displayName = 'AssumptionsList';

export default AssumptionsList;
